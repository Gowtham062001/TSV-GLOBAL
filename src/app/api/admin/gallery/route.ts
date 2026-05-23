import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status   = searchParams.get("status") || "ACTIVE";
    const category = searchParams.get("category") || "";
    const search   = searchParams.get("search") || "";
    const page     = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit    = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") || "100")));

    const where: any = { status };

    if (category && category !== "all") {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { alt:      { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
        { url:      { contains: search, mode: "insensitive" } },
        { caption:  { contains: search, mode: "insensitive" } },
      ];
    }

    const [images, total] = await Promise.all([
      prisma.galleryImage.findMany({
        where,
        orderBy: [
          { category: "asc" },
          { order:    "asc" },
          { createdAt: "desc" },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.galleryImage.count({ where }),
    ]);

    // Get all unique categories with counts (for sidebar filters)
    const categories = await prisma.galleryImage.groupBy({
      by: ["category"],
      where: { status },
      _count: { id: true },
      orderBy: { category: "asc" },
    });

    return NextResponse.json({
      images,
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
      categories: categories.map(c => ({
        name:  c.category || "general",
        count: c._count.id,
      })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error fetching gallery" }, { status: 500 });
  }
}
