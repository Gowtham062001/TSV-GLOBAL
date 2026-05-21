import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import fs from "fs";
import path from "path";

async function walkDir(dir: string, callback: (path: string) => Promise<void>) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== "__MACOSX") {
        await walkDir(fullPath, callback);
      }
    } else {
      const ext = path.extname(file).toLowerCase();
      if ([".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif"].includes(ext)) {
        await callback(fullPath);
      }
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("🚀 Starting legacy media sync via API...");
    const ROOT_DIR = path.join(process.cwd(), "public", "assets", "img");
    
    if (!fs.existsSync(ROOT_DIR)) {
      return NextResponse.json({ error: "Legacy directory not found" }, { status: 404 });
    }

    const imagesFound: any[] = [];

    await walkDir(ROOT_DIR, async (filePath) => {
      const relativePath = path.relative(path.join(process.cwd(), "public"), filePath);
      const url = "/" + relativePath.split(path.sep).join("/");
      
      const parentDir = path.basename(path.dirname(filePath));
      const category = parentDir === "img" ? "General" : parentDir;

      imagesFound.push({
        url,
        category,
        alt: path.basename(filePath, path.extname(filePath)).replace(/-/g, " "),
      });
    });

    let createdCount = 0;
    let skippedCount = 0;

    for (const img of imagesFound) {
      const exists = await prisma.galleryImage.findFirst({
        where: { url: img.url }
      });

      if (!exists) {
        await prisma.galleryImage.create({
          data: {
            url: img.url,
            category: img.category,
            alt: img.alt,
            caption: img.alt,
            order: 0,
          }
        });
        createdCount++;
      } else {
        skippedCount++;
      }
    }

    return NextResponse.json({
      message: "Sync complete",
      totalFound: imagesFound.length,
      created: createdCount,
      skipped: skippedCount
    });
  } catch (error: any) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
