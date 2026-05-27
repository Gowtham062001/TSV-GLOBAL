import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth-check";
import { writeAuditLog } from "@/lib/audit";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Allowed image MIME types
const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/webp",
  "image/svg+xml", "image/gif"
];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const category = (formData.get("category") as string || "uploads").toLowerCase();
    const alt = formData.get("alt") as string || "";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Allowed: jpg, png, webp, svg, gif` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate safe filename with timestamp
    const safeName = file.name
      .toLowerCase()
      .replace(/\.[^/.]+$/, "") // Remove extension
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 40);

    // Upload to Cloudinary using a Promise to handle the stream
    const uploadResponse = await new Promise((resolve, reject) => {
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

    const urlPath = uploadResponse.secure_url;

    // Save to DB
    const image = await prisma.galleryImage.create({
      data: {
        url: urlPath,
        alt: alt || safeName.replace(/-/g, " "),
        category,
        caption: alt,
        order: 0,
        fileSize: file.size,
        mimeType: file.type,
      },
    });

    // Audit Log
    const session = await getAdminSession();
    if (session?.user) {
      await writeAuditLog({
        userId: (session.user as any).id,
        action: "UPLOAD",
        entity: "GalleryImage",
        entityId: image.id,
        changes: { url: image.url, category: image.category }
      });
    }

    return NextResponse.json(image);
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

