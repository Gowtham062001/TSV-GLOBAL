import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";
import { v2 as cloudinary } from "cloudinary";
import * as dotenv from "dotenv";
import sharp from "sharp";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const connectionString = process.env.DATABASE_URL;
const isLocal = connectionString?.includes("localhost") || connectionString?.includes("127.0.0.1");
const pool = new Pool({
  connectionString,
  ssl: isLocal ? undefined : { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Multimatch replace helper
function replacePathInString(text: string, localPath: string, cloudinaryUrl: string): string {
  const relativePath = localPath.startsWith("/") ? localPath.slice(1) : localPath;
  const rawPath = localPath;
  
  let result = text;
  
  const escapedDomainPaths = [
    `https://tsvglobal.vercel.app/${relativePath}`,
    `https://tsvglobal.vercel.app${rawPath}`,
    `http://tsvglobal.vercel.app/${relativePath}`,
    `http://tsvglobal.vercel.app${rawPath}`,
    `https://tsvglobal.com/${relativePath}`,
    `https://tsvglobal.com${rawPath}`,
  ];

  for (const domainPath of escapedDomainPaths) {
    result = result.split(domainPath).join(cloudinaryUrl);
  }

  result = result.split(rawPath).join(cloudinaryUrl);
  result = result.split(relativePath).join(cloudinaryUrl);
  result = result.split(`/${relativePath}`).join(cloudinaryUrl);

  return result;
}

async function uploadBuffer(buffer: Buffer, category: string, safeName: string): Promise<string> {
  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: `tsvglobal/gallery/${category}`,
        public_id: `${Date.now()}-${safeName}`,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  }) as any;
  return result.secure_url;
}

async function main() {
  console.log("Starting final migration for remaining/failed images...");
  const migrationMap = new Map<string, string>();

  // ── 1. Process OIL & GAS images (Sanitizing folder names) ─────────────────
  const oilGasDir = path.join(process.cwd(), "public", "assets", "img", "services", "OIL& GAS");
  if (fs.existsSync(oilGasDir)) {
    const files = fs.readdirSync(oilGasDir);
    for (const file of files) {
      if (file === ".DS_Store") continue;
      const filePath = path.join(oilGasDir, file);
      const localUrlPath = `/assets/img/services/OIL& GAS/${file}`;
      
      const safeName = file.toLowerCase().replace(/\.[^/.]+$/, "").replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
      
      try {
        console.log(`Uploading sanitized Oil & Gas image: ${file}`);
        const buffer = fs.readFileSync(filePath);
        // Sanitize category name (remove special characters like &)
        const category = "services-oil-gas"; 
        const secureUrl = await uploadBuffer(buffer, category, safeName);
        migrationMap.set(localUrlPath, secureUrl);
        // Also map space-encoded URLs
        migrationMap.set(`/assets/img/services/OIL%26%20GAS/${file}`, secureUrl);
        migrationMap.set(`/assets/img/services/OIL&%20GAS/${file}`, secureUrl);
        migrationMap.set(`/assets/img/services/OIL%26GAS/${file}`, secureUrl);
      } catch (err) {
        console.error(`Failed to upload ${file}:`, err);
      }
    }
  }

  // ── 2. Process Large Image (wca-conference/IMG_20260312_134246_798.webp) ──
  const largeFilePath = path.join(process.cwd(), "public", "assets", "img", "wca-conference", "IMG_20260312_134246_798.webp");
  const localLargeUrl = "/assets/img/wca-conference/IMG_20260312_134246_798.webp";

  if (fs.existsSync(largeFilePath)) {
    try {
      console.log(`Compressing large image: ${largeFilePath}`);
      // Resize and compress using sharp to stay under Cloudinary free limit (10MB)
      const compressedBuffer = await sharp(largeFilePath)
        .resize(1920, undefined, { fit: "inside", withoutEnlargement: true }) // limit width to 1920px
        .webp({ quality: 80 }) // convert to webp quality 80
        .toBuffer();

      console.log(`Uploading compressed large image to Cloudinary...`);
      const secureUrl = await uploadBuffer(compressedBuffer, "wca-conference", "img-20260312-134246-798");
      migrationMap.set(localLargeUrl, secureUrl);
    } catch (err) {
      console.error("Failed to compress/upload large image:", err);
    }
  }

  if (migrationMap.size === 0) {
    console.log("No remaining images to migrate.");
    return;
  }

  // ── 3. Database Updates ───────────────────────────────────────────────────
  console.log("\nUpdating database records with new Cloudinary URLs...");
  
  // GalleryImage
  const galleryImages = await prisma.galleryImage.findMany();
  let galleryUpdated = 0;
  for (const img of galleryImages) {
    const cloudUrl = migrationMap.get(img.url);
    if (cloudUrl) {
      await prisma.galleryImage.update({
        where: { id: img.id },
        data: { url: cloudUrl }
      });
      galleryUpdated++;
    }
  }
  console.log(`Updated ${galleryUpdated} GalleryImage records.`);

  // PageSections Content
  const pageSections = await prisma.pageSection.findMany();
  let pageSecUpdated = 0;
  for (const sec of pageSections) {
    if (sec.content) {
      let contentStr = JSON.stringify(sec.content);
      let changed = false;
      for (const [localPath, cloudUrl] of migrationMap.entries()) {
        const nextContentStr = replacePathInString(contentStr, localPath, cloudUrl);
        if (nextContentStr !== contentStr) {
          contentStr = nextContentStr;
          changed = true;
        }
      }
      if (changed) {
        await prisma.pageSection.update({
          where: { id: sec.id },
          data: { content: JSON.parse(contentStr) }
        });
        pageSecUpdated++;
      }
    }
  }
  console.log(`Updated ${pageSecUpdated} PageSection records.`);

  // ServiceSections Content
  const serviceSections = await prisma.serviceSection.findMany();
  let serviceSecUpdated = 0;
  for (const sec of serviceSections) {
    if (sec.content) {
      let contentStr = JSON.stringify(sec.content);
      let changed = false;
      for (const [localPath, cloudUrl] of migrationMap.entries()) {
        const nextContentStr = replacePathInString(contentStr, localPath, cloudUrl);
        if (nextContentStr !== contentStr) {
          contentStr = nextContentStr;
          changed = true;
        }
      }
      if (changed) {
        await prisma.serviceSection.update({
          where: { id: sec.id },
          data: { content: JSON.parse(contentStr) }
        });
        serviceSecUpdated++;
      }
    }
  }
  console.log(`Updated ${serviceSecUpdated} ServiceSection records.`);

  console.log("\n=== REMAINING MIGRATION COMPLETE ===");
  for (const [local, cloud] of migrationMap.entries()) {
    console.log(`Mapped: ${local} -> ${cloud}`);
  }
  console.log("=====================================\n");
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
