import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const title = data.title || "Untitled Page";
    const rawSlug = data.slug && data.slug.trim() !== "" ? data.slug : title;
    const cleanSlug = rawSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const page = await prisma.page.create({
      data: {
        id: cleanSlug,
        title,
        slug: cleanSlug,
        status: "DRAFT",
      },
    });

    return NextResponse.json(page);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error creating page" }, { status: 500 });
  }
}
