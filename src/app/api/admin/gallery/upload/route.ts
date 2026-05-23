import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getAdminSession } from "@/lib/auth-check";
import { writeAuditLog } from "@/lib/audit";

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
    const ext = path.extname(file.name).toLowerCase();
    const safeName = path.basename(file.name, path.extname(file.name))
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 40);
    const filename = `${Date.now()}-${safeName}${ext}`;

    // CANONICAL upload path: /assets/img/uploads/[category]/
    const uploadDir = path.join(process.cwd(), "public", "assets", "img", "uploads", category);
    const absolutePath = path.join(uploadDir, filename);

    // URL path stored in DB (no /public prefix — Next.js serves /public as /)
    const urlPath = `/assets/img/uploads/${category}/${filename}`;

    // Create directory if it doesn't exist
    await mkdir(uploadDir, { recursive: true });

    // Save to disk
    await writeFile(absolutePath, buffer);

    // Save to DB
    const image = await prisma.galleryImage.create({
      data: {
        url: urlPath,
        alt: alt || safeName.replace(/-/g, " "),
        category,
        caption: alt,
        order: 0,
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
