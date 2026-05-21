import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import slugify from "slugify";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const slug = data.slug || slugify(data.title, { lower: true });

    const cs = await prisma.caseStudy.create({
      data: {
        title: data.title,
        slug,
        client: data.client,
        industry: data.industry,
        mode: data.mode,
        route: data.route,
        metrics: data.metrics,
        challenge: data.challenge,
        solution: data.solution,
        result: data.result,
        images: data.images,
        status: data.status,
        isVisible: data.isVisible !== undefined ? data.isVisible : true,
        seoData: data.seoData,
      },
    });

    return NextResponse.json(cs);
  } catch (error) {
    console.error("Failed to create case study:", error);
    return NextResponse.json({ error: "Failed to create case study" }, { status: 500 });
  }
}
