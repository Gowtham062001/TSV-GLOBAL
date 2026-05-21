import { writeFile, mkdir } from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const key = formData.get("key") as string;

    if (!file || !key) {
      return NextResponse.json({ error: "Missing file or key" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = file.name.replace(/\s+/g, "-").toLowerCase();
    const uploadDir = path.join(process.cwd(), "public", "assets", "img", "icons", "admin");
    
    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });
    
    const absolutePath = path.join(uploadDir, filename);
    const publicPath = `/assets/img/icons/admin/${filename}`;

    await writeFile(absolutePath, buffer);

    // Update SiteSetting
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value: publicPath as any },
      create: { key, value: publicPath as any, group: "ICONS" },
    });

    return NextResponse.json({ success: true, url: publicPath });
  } catch (error) {
    console.error("[Icon Upload API] Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
