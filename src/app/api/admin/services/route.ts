import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const title = data.title || "Untitled Service";
    const rawSlug = data.slug && data.slug.trim() !== "" ? data.slug : title;
    const cleanSlug = rawSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const service = await prisma.service.create({
      data: {
        id: cleanSlug,
        title: data.title,
        slug: cleanSlug,
        description: data.description,
        icon: data.icon,
        image: data.image,
        status: data.status,
        seoData: data.seoData,
      },
    });
    return NextResponse.json(service);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error creating service" }, { status: 500 });
  }
}
