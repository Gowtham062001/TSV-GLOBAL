import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const sections = await prisma.caseStudySection.findMany({
      where: { caseStudyId: params.id },
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ sections });
  } catch (error: any) {
    console.error("Error fetching case study sections:", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { sections } = await req.json();

    if (!Array.isArray(sections)) {
      return NextResponse.json({ message: "Invalid sections data" }, { status: 400 });
    }

    // Delete existing sections for this case study
    await prisma.caseStudySection.deleteMany({
      where: { caseStudyId: params.id },
    });

    // Re-create sections with updated order, content, and visibility
    if (sections.length > 0) {
      await prisma.caseStudySection.createMany({
        data: sections.map((s, idx) => ({
          caseStudyId: params.id,
          type: s.type,
          label: s.label,
          content: s.content || {},
          isVisible: s.isVisible !== undefined ? s.isVisible : true,
          order: idx,
        })),
      });
    }

    // Revalidate public page
    const caseStudy = await prisma.caseStudy.findUnique({ where: { id: params.id } });
    if (caseStudy) {
      revalidatePath(`/case-studies/${caseStudy.slug}`);
    }
    revalidatePath("/case-studies");
    revalidatePath("/", "layout");

    return NextResponse.json({ message: "Sections updated successfully" });
  } catch (error: any) {
    console.error("Error updating case study sections:", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}
