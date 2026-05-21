import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Clean filename and add timestamp to avoid collisions
    const timestamp = Date.now();
    const safeFilename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const relativePath = `/uploads/brochures/${safeFilename}`;
    const absolutePath = path.join(process.cwd(), "public", relativePath);

    // Save to disk
    await writeFile(absolutePath, buffer);

    // Update SiteSetting in DB
    await prisma.siteSetting.upsert({
      where: { key: "corporate_brochure" },
      update: {
        value: { url: relativePath, filename: file.name },
        group: "ASSETS"
      },
      create: {
        key: "corporate_brochure",
        value: { url: relativePath, filename: file.name },
        group: "ASSETS"
      }
    });

    return NextResponse.json({ 
      success: true, 
      url: relativePath, 
      filename: file.name 
    });
  } catch (error) {
    console.error("Brochure upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
