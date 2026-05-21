import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const isLocal = connectionString?.includes('localhost') || connectionString?.includes('127.0.0.1');
const pool = new Pool({
  connectionString,
  ssl: isLocal ? undefined : { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const SOURCE_DIR = '/Users/apple/Documents/tsv/Archive/html- Version/assets/img';
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.svg', '.webp', '.gif'];

async function main() {
  console.log('🚀 Starting Image Migration...');

  let scannedCount = 0;
  let createdCount = 0;
  let skippedCount = 0;
  let sectionWithImagesCount = 0;

  // STEP 1 — Scan filesystem
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`Error: Source directory not found: ${SOURCE_DIR}`);
    process.exit(1);
  }

  const allFiles: string[] = [];
  function walkDir(dir: string) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        walkDir(filePath);
      } else {
        const ext = path.extname(file).toLowerCase();
        if (ALLOWED_EXTENSIONS.includes(ext)) {
          allFiles.push(filePath);
        }
      }
    }
  }

  walkDir(SOURCE_DIR);
  scannedCount = allFiles.length;

  let orderIndex = 0;
  for (const filePath of allFiles) {
    const relativePath = path.relative(SOURCE_DIR, filePath);
    const url = `/assets/img/${relativePath}`;
    
    // Category mapping logic
    const parts = relativePath.split(path.sep);
    let category = 'general';
    
    if (parts.length > 1) {
      const firstFolder = parts[0].toLowerCase();
      if (firstFolder === 'services') {
        const secondFolder = parts[1].toLowerCase();
        if (secondFolder === 'odc cargo' && parts[2] && !ALLOWED_EXTENSIONS.includes(path.extname(parts[2]).toLowerCase())) {
          category = `case-study-${parts[2].toLowerCase().replace(/\s+/g, '-')}`;
        } else {
          category = `services-${secondFolder.replace(/\s+/g, '-')}`;
        }
      } else if (firstFolder === 'members' && parts[1]?.toLowerCase() === 'partners') {
        category = 'partners';
      } else if (firstFolder === 'banner') {
        category = 'banners';
      } else {
        category = firstFolder.replace(/\s+/g, '-');
      }
    }

    // Alt text mapping logic: [filename without extension, spaces for dashes]
    const fileName = path.basename(filePath, path.extname(filePath));
    const alt = fileName.replace(/-/g, ' ').replace(/_/g, ' ');

    // Upsert record
    const existing = await prisma.galleryImage.findFirst({
      where: { url }
    });

    if (existing) {
      skippedCount++;
    } else {
      await prisma.galleryImage.create({
        data: {
          url,
          alt,
          caption: "",
          category,
          order: orderIndex++,
          createdAt: new Date()
        }
      });
      createdCount++;
    }
  }

  // STEP 2 — Update PageSection content JSON (scan and verify)
  const sections = await prisma.pageSection.findMany();
  
  function hasImagePath(obj: any): boolean {
    if (typeof obj === 'string') {
      return obj.startsWith('/assets/img/') || obj.startsWith('assets/img/');
    } else if (Array.isArray(obj)) {
      return obj.some(hasImagePath);
    } else if (obj !== null && typeof obj === 'object') {
      return Object.values(obj).some(hasImagePath);
    }
    return false;
  }

  for (const section of sections) {
    if (hasImagePath(section.content)) {
      sectionWithImagesCount++;
      // No changes needed as per instructions, already correct paths.
    }
  }

  // STEP 3 — Print summary report
  console.log('\n--- Migration Report ---');
  console.log(`Images scanned: ${scannedCount}`);
  console.log(`DB records created: ${createdCount}`);
  console.log(`DB records skipped (already exist): ${skippedCount}`);
  console.log(`PageSection records with image fields: ${sectionWithImagesCount}`);
  console.log('------------------------\n');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
