import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const img = await prisma.galleryImage.findUnique({ where: { id: params.id } });
    if (!img) return NextResponse.json({ usages: [] });

    // Raw query to find sections whose content JSON contains the URL as a substring
    const query = `
      SELECT id, type, label, "pageId"
      FROM "PageSection"
      WHERE content::text LIKE $1
    `;
    const usages = await prisma.$queryRawUnsafe(query, `%${img.url}%`);

    return NextResponse.json({ usages });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
