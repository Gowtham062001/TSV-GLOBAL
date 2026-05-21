import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "corporate_brochure" }
    });

    if (!setting) {
      return NextResponse.json({ url: null });
    }

    const value = setting.value as any;
    return NextResponse.json({ 
      url: value.url, 
      filename: value.filename 
    });
  } catch (error) {
    console.error("Failed to fetch brochure setting:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "corporate_brochure" }
    });

    if (!setting) {
      return NextResponse.json({ error: "No brochure found" }, { status: 404 });
    }

    const value = setting.value as any;
    if (value && value.url) {
      try {
        const absolutePath = path.join(process.cwd(), "public", value.url);
        await unlink(absolutePath);
      } catch (err) {
        console.error("Failed to delete physical file:", err);
      }
    }

    await prisma.siteSetting.delete({
      where: { key: "corporate_brochure" }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Brochure delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
