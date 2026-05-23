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

// CANONICAL SOURCE: /public/assets/img/
const SOURCE_DIR = path.join(process.cwd(), 'public', 'assets', 'img');
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.svg', '.webp', '.gif'];

// Map old/wrong path prefixes → canonical prefix
const PATH_MAPPINGS: Array<[string, string]> = [
  ['/archive/html/assets/img', '/assets/img'],
  ['/assets/images/',          '/assets/img/'],
  ['assets/img/',              '/assets/img/'],
  ['/public/assets/img',       '/assets/img'],
  ['/uploads/',                '/assets/img/uploads/'],
];

function normalizeImagePath(rawPath: string): string {
  if (!rawPath) return '';
  if (rawPath.startsWith('/assets/img/')) return rawPath; // already correct

  for (const [old, next] of PATH_MAPPINGS) {
    if (rawPath.startsWith(old)) {
      return rawPath.replace(old, next);
    }
  }

  if (!rawPath.startsWith('/')) return '/assets/img/' + rawPath;
  return rawPath;
}

async function main() {
  console.log('🚀 Starting Image Migration...');
  console.log(`📂 Scanning: ${SOURCE_DIR}\n`);

  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`❌ Source directory not found: ${SOURCE_DIR}`);
    process.exit(1);
  }

  // ── STEP 1: Fix existing DB records with wrong paths ─────────────────────
  console.log('🔧 Step 1: Fixing non-canonical DB paths...');
  const allDbImages = await prisma.galleryImage.findMany();
  let fixedCount = 0;

  for (const img of allDbImages) {
    const corrected = normalizeImagePath(img.url);
    if (corrected !== img.url) {
      await prisma.galleryImage.update({
        where: { id: img.id },
        data:  { url: corrected }
      });
      console.log(`  Fixed: ${img.url} → ${corrected}`);
      fixedCount++;
    }
  }
  console.log(`  ✅ Fixed ${fixedCount} records\n`);

  // ── STEP 2: Scan filesystem and create missing DB records ─────────────────
  console.log('📷 Step 2: Syncing disk images to DB...');
  const allFiles: string[] = [];

  function walkDir(dir: string) {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);
    for (const item of items) {
      if (item === '__MACOSX' || item === '.DS_Store' || item.startsWith('.')) continue;
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else {
        const ext = path.extname(item).toLowerCase();
        if (ALLOWED_EXTENSIONS.includes(ext)) {
          allFiles.push(fullPath);
        }
      }
    }
  }

  walkDir(SOURCE_DIR);
  console.log(`  Found ${allFiles.length} images on disk`);

  // Get all current DB URLs for fast lookup
  const currentDbImages = await prisma.galleryImage.findMany();
  const dbUrls = new Set(currentDbImages.map(i => i.url));

  let createdCount = 0;
  let skippedCount = 0;
  let orderIndex = currentDbImages.length;

  for (const filePath of allFiles) {
    const relativePath = path.relative(SOURCE_DIR, filePath);
    // Normalize path separators (Windows safety)
    const url = `/assets/img/${relativePath.replace(/\\/g, '/')}`;

    if (dbUrls.has(url)) {
      skippedCount++;
      continue;
    }

    // Derive category from folder structure
    const parts = relativePath.split(path.sep);
    let category = 'general';
    if (parts.length > 1) {
      const firstFolder = parts[0].toLowerCase();
      if (firstFolder === 'services' && parts[1]) {
        category = `services-${parts[1].toLowerCase().replace(/[\s_]+/g, '-')}`;
      } else if (firstFolder === 'members' && parts[1]?.toLowerCase() === 'partners') {
        category = 'partners';
      } else if (firstFolder === 'banner') {
        category = 'banners';
      } else if (firstFolder === 'gallery') {
        category = 'gallery';
      } else {
        category = firstFolder.replace(/[\s_]+/g, '-');
      }
    }

    const fileName = path.basename(filePath, path.extname(filePath));
    const alt = fileName.replace(/[-_]/g, ' ').trim();

    await prisma.galleryImage.create({
      data: {
        url,
        alt,
        caption:   '',
        category,
        order:     orderIndex++,
        createdAt: new Date()
      }
    });
    createdCount++;
    dbUrls.add(url); // prevent duplicates in this run
  }

  console.log(`  ✅ Created ${createdCount} new records, skipped ${skippedCount} existing\n`);

  // ── STEP 3: Detect DB records pointing to missing files ───────────────────
  console.log('🔍 Step 3: Checking for missing files...');
  const finalDbImages = await prisma.galleryImage.findMany();
  const missingFiles: string[] = [];

  for (const img of finalDbImages) {
    const diskPath = path.join(
      process.cwd(), 'public',
      img.url.startsWith('/') ? img.url.slice(1) : img.url
    );
    if (!fs.existsSync(diskPath)) {
      missingFiles.push(img.url);
    }
  }

  if (missingFiles.length > 0) {
    console.log(`  ⚠️  ${missingFiles.length} DB records point to missing files:`);
    missingFiles.slice(0, 20).forEach(f => console.log(`     MISSING: ${f}`));
    if (missingFiles.length > 20) console.log(`     ... and ${missingFiles.length - 20} more`);
  } else {
    console.log('  ✅ All DB records have matching files on disk');
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n=== MIGRATION COMPLETE ===');
  console.log(`Images on disk:      ${allFiles.length}`);
  console.log(`DB records total:    ${finalDbImages.length}`);
  console.log(`DB paths fixed:      ${fixedCount}`);
  console.log(`DB records added:    ${createdCount}`);
  console.log(`DB records skipped:  ${skippedCount}`);
  console.log(`Missing files:       ${missingFiles.length}`);
  console.log('==========================\n');
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
