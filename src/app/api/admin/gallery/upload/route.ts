import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { writeFile } from "fs/promises";
import path from "path";
import { getAdminSession } from "@/lib/auth-check";
import { writeAuditLog } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const category = formData.get("category") as string || null;
    const alt = formData.get("alt") as string || "";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const relativePath = `uploads/${filename}`;
    const absolutePath = path.join(process.cwd(), "public", relativePath);

    // Save to disk
    await writeFile(absolutePath, buffer);

    // Save to DB
    const image = await prisma.galleryImage.create({
      data: {
        url: `/${relativePath}`,
        alt,
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
