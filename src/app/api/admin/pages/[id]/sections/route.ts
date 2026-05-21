import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { sections } = await request.json();

    if (!Array.isArray(sections)) {
      return NextResponse.json({ error: "Invalid sections data" }, { status: 400 });
    }

    // Resolve the page ID using OR (id or slug)
    const targetPage = await prisma.page.findFirst({
      where: {
        OR: [
          { id: params.id },
          { slug: params.id }
        ]
      }
    });

    if (!targetPage) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    // 1. Delete all existing sections for this page
    await prisma.pageSection.deleteMany({
      where: { pageId: targetPage.id }
    });

    // 2. Create the sections with correct order and parameters
    if (sections.length > 0) {
      await prisma.pageSection.createMany({
        data: sections.map((s: any, idx: number) => ({
          pageId: targetPage.id,
          type: s.type,
          label: s.label,
          content: s.content || {},
          isVisible: s.isVisible !== undefined ? s.isVisible : true,
          order: idx,
        })),
      });
    }

    // 3. Revalidate affected page
    if (targetPage.slug === "home") {
      revalidatePath("/");
    } else {
      revalidatePath(`/${targetPage.slug}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update sections:", error);
    return NextResponse.json({ error: "Failed to update sections" }, { status: 500 });
  }
}
