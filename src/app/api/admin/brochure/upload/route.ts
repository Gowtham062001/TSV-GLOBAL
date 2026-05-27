import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Clean filename
    const safeName = file.name
      .toLowerCase()
      .replace(/\.[^/.]+$/, "") // Remove extension
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 40);

    // Upload to Cloudinary using a Promise
    const uploadResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "tsvglobal/brochures",
          public_id: `${Date.now()}-${safeName}`,
          resource_type: "auto", // allow PDFs and documents
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    }) as any;

    const urlPath = uploadResponse.secure_url;

    // Update SiteSetting in DB
    await prisma.siteSetting.upsert({
      where: { key: "corporate_brochure" },
      update: {
        value: { url: urlPath, filename: file.name },
        group: "ASSETS"
      },
      create: {
        key: "corporate_brochure",
        value: { url: urlPath, filename: file.name },
        group: "ASSETS"
      }
    });

    return NextResponse.json({ 
      success: true, 
      url: urlPath, 
      filename: file.name 
    });
  } catch (error) {
    console.error("Brochure upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

