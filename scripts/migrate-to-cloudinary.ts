import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";
import { v2 as cloudinary } from "cloudinary";
import * as dotenv from "dotenv";

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

const SOURCE_DIR = path.join(process.cwd(), "public", "assets", "img");
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".svg", ".webp", ".gif"];

// Walk directory helper
function walkDir(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    if (item === "__MACOSX" || item === ".DS_Store" || item.startsWith(".")) continue;
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath, fileList);
    } else {
      const ext = path.extname(item).toLowerCase();
      if (ALLOWED_EXTENSIONS.includes(ext)) {
        fileList.push(fullPath);
      }
    }
  }
  return fileList;
}

// Upload file helper
async function uploadFile(filePath: string, category: string, safeName: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
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

// Multimatch replace helper (replaces absolute & relative variations of local image path)
function replacePathInString(text: string, localPath: string, cloudinaryUrl: string): string {
  // Strip starting slash to get relative path
  const relativePath = localPath.startsWith("/") ? localPath.slice(1) : localPath;
  const rawPath = localPath;

  // We want to replace occurrences in JSON string formats:
  // e.g. "/assets/img/logo.png", "assets/img/logo.png", "https://tsvglobal.vercel.app/assets/img/logo.png"
  
  let result = text;
  
  // 1. Replace absolute URLs (with domain if any)
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

  // 2. Replace raw paths
  result = result.split(rawPath).join(cloudinaryUrl);
  result = result.split(relativePath).join(cloudinaryUrl);
  result = result.split(`/${relativePath}`).join(cloudinaryUrl);

  return result;
}

async function main() {
  console.log("🚀 Starting database-wide Cloudinary Image Migration...");
  console.log(`📂 Scanning: ${SOURCE_DIR}\n`);

  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`❌ Source directory not found: ${SOURCE_DIR}`);
    process.exit(1);
  }

  const allFiles = walkDir(SOURCE_DIR);
  console.log(`  Found ${allFiles.length} images on local disk.`);

  // Mapping to track: localUrlPath -> cloudinaryUrl
  const migrationMap = new Map<string, string>();
  
  // ── STEP 1: Upload files and populate migrationMap ─────────────────────────
  console.log("\n☁️  Step 1: Uploading local images to Cloudinary...");
  let uploadCount = 0;
  
  for (const filePath of allFiles) {
    const relativePath = path.relative(SOURCE_DIR, filePath);
    // Canonical local path URL stored in DB (e.g. /assets/img/logo.png)
    const localUrlPath = `/assets/img/${relativePath.replace(/\\/g, "/")}`;

    // Derive category
    const parts = relativePath.split(path.sep);
    let category = "general";
    if (parts.length > 1) {
      const firstFolder = parts[0].toLowerCase();
      if (firstFolder === "services" && parts[1]) {
        category = `services-${parts[1].toLowerCase().replace(/[\s_]+/g, "-")}`;
      } else if (firstFolder === "members" && parts[1]?.toLowerCase() === "partners") {
        category = "partners";
      } else if (firstFolder === "banner") {
        category = "banners";
      } else if (firstFolder === "gallery") {
        category = "gallery";
      } else {
        category = firstFolder.replace(/[\s_]+/g, "-");
      }
    }

    const fileName = path.basename(filePath, path.extname(filePath));
    const safeName = fileName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");

    try {
      console.log(`   Uploading (${uploadCount + 1}/${allFiles.length}): ${localUrlPath}`);
      const secureUrl = await uploadFile(filePath, category, safeName);
      migrationMap.set(localUrlPath, secureUrl);
      uploadCount++;
    } catch (err) {
      console.error(`   ❌ Failed to upload ${localUrlPath}:`, err);
    }
  }

  console.log(`  ✅ Uploaded ${uploadCount} images successfully.`);
  console.log(`  Migration map size: ${migrationMap.size} paths mapped.`);

  if (migrationMap.size === 0) {
    console.log("  ⚠️ No images mapped. Exiting migration.");
    return;
  }

  // ── STEP 2: Update GalleryImage table ──────────────────────────────────────
  console.log("\n🖼️  Step 2: Updating GalleryImage table...");
  const galleryImages = await prisma.galleryImage.findMany();
  let galleryUpdated = 0;
  for (const img of galleryImages) {
    if (img.url.includes("cloudinary")) continue; // Skip already migrated
    const cloudUrl = migrationMap.get(img.url) || migrationMap.get(`/${img.url}`);
    if (cloudUrl) {
      await prisma.galleryImage.update({
        where: { id: img.id },
        data: { url: cloudUrl }
      });
      galleryUpdated++;
    }
  }
  console.log(`  ✅ Updated ${galleryUpdated} GalleryImage records.`);

  // ── STEP 3: Update Page SEO & Sections ─────────────────────────────────────
  console.log("\n📄 Step 3: Updating Page SEO & PageSections...");
  
  // Page SEO ogImage
  const pages = await prisma.page.findMany();
  let pagesUpdated = 0;
  for (const p of pages) {
    if (p.seoData) {
      let seoStr = JSON.stringify(p.seoData);
      let changed = false;
      for (const [localPath, cloudUrl] of migrationMap.entries()) {
        const nextSeoStr = replacePathInString(seoStr, localPath, cloudUrl);
        if (nextSeoStr !== seoStr) {
          seoStr = nextSeoStr;
          changed = true;
        }
      }
      if (changed) {
        await prisma.page.update({
          where: { id: p.id },
          data: { seoData: JSON.parse(seoStr) }
        });
        pagesUpdated++;
      }
    }
  }
  console.log(`  ✅ Updated ${pagesUpdated} Page SEO records.`);

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
  console.log(`  ✅ Updated ${pageSecUpdated} PageSection records.`);

  // ── STEP 4: Update Services & ServiceSections ─────────────────────────────
  console.log("\n🛠️  Step 4: Updating Services & ServiceSections...");
  
  // Services Images & Icons
  const services = await prisma.service.findMany();
  let servicesUpdated = 0;
  for (const s of services) {
    let image = s.image;
    let icon = s.icon;
    let changed = false;
    
    if (image && migrationMap.has(image)) {
      image = migrationMap.get(image) || image;
      changed = true;
    }
    if (icon && migrationMap.has(icon)) {
      icon = migrationMap.get(icon) || icon;
      changed = true;
    }
    
    if (changed) {
      await prisma.service.update({
        where: { id: s.id },
        data: { image, icon }
      });
      servicesUpdated++;
    }
  }
  console.log(`  ✅ Updated ${servicesUpdated} Service records.`);

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
  console.log(`  ✅ Updated ${serviceSecUpdated} ServiceSection records.`);

  // ── STEP 5: Update CaseStudies & CaseStudySections ─────────────────────────
  console.log("\n💼 Step 5: Updating CaseStudies & CaseStudySections...");
  
  // Case Studies
  const caseStudies = await prisma.caseStudy.findMany();
  let csUpdated = 0;
  for (const cs of caseStudies) {
    if (cs.images) {
      let imagesStr = JSON.stringify(cs.images);
      let changed = false;
      for (const [localPath, cloudUrl] of migrationMap.entries()) {
        const nextImagesStr = replacePathInString(imagesStr, localPath, cloudUrl);
        if (nextImagesStr !== imagesStr) {
          imagesStr = nextImagesStr;
          changed = true;
        }
      }
      if (changed) {
        await prisma.caseStudy.update({
          where: { id: cs.id },
          data: { images: JSON.parse(imagesStr) }
        });
        csUpdated++;
      }
    }
  }
  console.log(`  ✅ Updated ${csUpdated} CaseStudy records.`);

  // CaseStudySections Content
  const csSections = await prisma.caseStudySection.findMany();
  let csSecUpdated = 0;
  for (const sec of csSections) {
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
        await prisma.caseStudySection.update({
          where: { id: sec.id },
          data: { content: JSON.parse(contentStr) }
        });
        csSecUpdated++;
      }
    }
  }
  console.log(`  ✅ Updated ${csSecUpdated} CaseStudySection records.`);

  // ── STEP 6: Update Blog Posts & Site Settings ──────────────────────────────
  console.log("\n📰 Step 6: Updating Blog Posts & Site Settings...");
  
  // Blog Posts
  const blogPosts = await prisma.blogPost.findMany();
  let blogUpdated = 0;
  for (const post of blogPosts) {
    let coverImage = post.coverImage;
    let contentStr = post.content ? JSON.stringify(post.content) : "null";
    let changed = false;

    if (coverImage && migrationMap.has(coverImage)) {
      coverImage = migrationMap.get(coverImage) || coverImage;
      changed = true;
    }

    if (post.content) {
      for (const [localPath, cloudUrl] of migrationMap.entries()) {
        const nextContentStr = replacePathInString(contentStr, localPath, cloudUrl);
        if (nextContentStr !== contentStr) {
          contentStr = nextContentStr;
          changed = true;
        }
      }
    }

    if (changed) {
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { 
          coverImage, 
          content: contentStr !== "null" ? JSON.parse(contentStr) : undefined 
        }
      });
      blogUpdated++;
    }
  }
  console.log(`  ✅ Updated ${blogUpdated} BlogPost records.`);

  // Site Settings
  const settings = await prisma.siteSetting.findMany();
  let settingsUpdated = 0;
  for (const s of settings) {
    let value = s.value;
    let changed = false;
    
    // Check if value matches mapped path or is string containing it (like logo path)
    for (const [localPath, cloudUrl] of migrationMap.entries()) {
      const nextValue = replacePathInString(value, localPath, cloudUrl);
      if (nextValue !== value) {
        value = nextValue;
        changed = true;
      }
    }
    
    if (changed) {
      await prisma.siteSetting.update({
        where: { id: s.id },
        data: { value }
      });
      settingsUpdated++;
    }
  }
  console.log(`  ✅ Updated ${settingsUpdated} SiteSetting records.`);

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log("\n=== MIGRATION COMPLETE ===");
  console.log(`Local files processed:     ${allFiles.length}`);
  console.log(`Successfully uploaded:    ${uploadCount}`);
  console.log(`GalleryImage table updates: ${galleryUpdated}`);
  console.log(`Page SEO updates:           ${pagesUpdated}`);
  console.log(`PageSection updates:        ${pageSecUpdated}`);
  console.log(`Service updates:            ${servicesUpdated}`);
  console.log(`ServiceSection updates:     ${serviceSecUpdated}`);
  console.log(`CaseStudy updates:          ${csUpdated}`);
  console.log(`CaseStudySection updates:   ${csSecUpdated}`);
  console.log(`BlogPost updates:           ${blogUpdated}`);
  console.log(`SiteSetting updates:        ${settingsUpdated}`);
  console.log("==========================\n");
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
