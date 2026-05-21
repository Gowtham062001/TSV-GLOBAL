import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import fs from "fs";
import path from "path";
import "dotenv/config";

const connectionString = `${process.env.DATABASE_URL}`;
const isLocal = connectionString.includes("localhost") || connectionString.includes("127.0.0.1");
const pool = new Pool({
  connectionString,
  ssl: isLocal ? undefined : { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const IMG_ROOT = path.join(process.cwd(), "public", "assets", "img");

async function syncFolder(dir: string, category: string | null = null) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Ignore internal system folders
      if (item === "__MACOSX" || item === ".git") continue;
      
      // Use directory name as category
      await syncFolder(fullPath, item);
    } else {
      // Only process images
      const ext = path.extname(item).toLowerCase();
      if (![".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif"].includes(ext)) continue;
      if (item === ".DS_Store") continue;

      const relativeUrl = `/assets/img/${path.relative(IMG_ROOT, fullPath)}`;
      
      // Check if exists
      const existing = await prisma.galleryImage.findFirst({
        where: { url: relativeUrl }
      });

      if (!existing) {
        console.log(`Adding image: ${relativeUrl} (${category || "Root"})`);
        await prisma.galleryImage.create({
          data: {
            url: relativeUrl,
            alt: item.split('.')[0].replace(/-/g, ' ').replace(/_/g, ' '),
            category: category,
            caption: item,
            order: 0
          }
        });
      }
    }
  }
}

async function main() {
  console.log("🚀 Starting Gallery Sync...");
  if (!fs.existsSync(IMG_ROOT)) {
    console.error("Image root directory not found!");
    return;
  }
  await syncFolder(IMG_ROOT);
  console.log("✅ Sync complete!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
