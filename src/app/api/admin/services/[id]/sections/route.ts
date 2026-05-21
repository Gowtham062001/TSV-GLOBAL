import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { sections } = await req.json();

    if (!Array.isArray(sections)) {
      return NextResponse.json({ message: "Invalid sections data" }, { status: 400 });
    }

    // Delete existing sections for this service
    await prisma.serviceSection.deleteMany({
      where: { serviceId: params.id },
    });

    // Create new sections with updated order and content
    if (sections.length > 0) {
      await prisma.serviceSection.createMany({
        data: sections.map((s, idx) => ({
          serviceId: params.id,
          type: s.type,
          label: s.label,
          content: s.content || {},
          isVisible: s.isVisible !== undefined ? s.isVisible : true,
          order: idx,
        })),
      });
    }

    // Revalidate relevant pages
    const service = await prisma.service.findUnique({ where: { id: params.id } });
    if (service) {
      revalidatePath(`/services/${service.slug}`);
    }
    revalidatePath("/services");

    return NextResponse.json({ message: "Sections updated successfully" });
  } catch (error: any) {
    console.error("Error updating service sections:", error);
    return NextResponse.json({ message: error.message || "Internal server error" }, { status: 500 });
  }
}
