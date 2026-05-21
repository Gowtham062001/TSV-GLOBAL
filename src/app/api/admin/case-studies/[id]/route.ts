import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth-check";
import { writeAuditLog } from "@/lib/audit";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();

    // Find case study by ID or Slug
    const targetCs = await prisma.caseStudy.findFirst({
      where: {
        OR: [
          { id: params.id },
          { slug: params.id }
        ]
      }
    });

    if (!targetCs) {
      return NextResponse.json({ error: "Case study not found" }, { status: 404 });
    }

    // Clean slug if provided
    let cleanSlug = targetCs.slug;
    if (data.slug) {
      cleanSlug = data.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    const cs = await prisma.caseStudy.update({
      where: { id: targetCs.id },
      data: {
        title: data.title,
        slug: cleanSlug,
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
        isVisible: data.isVisible !== undefined ? data.isVisible : undefined,
        seoData: data.seoData,
      },
    });

    // Audit Log
    const session = await getAdminSession();
    if (session?.user) {
      await writeAuditLog({
        userId: (session.user as any).id,
        action: "UPDATE",
        entity: "CaseStudy",
        entityId: cs.id,
        changes: { title: cs.title }
      });
    }

    revalidatePath("/case-studies");
    revalidatePath(`/case-studies/${cs.slug}`);

    return NextResponse.json(cs);
  } catch (error) {
    console.error("Failed to update case study:", error);
    return NextResponse.json({ error: "Failed to update case study" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Find case study by ID or Slug
    const targetCs = await prisma.caseStudy.findFirst({
      where: {
        OR: [
          { id: params.id },
          { slug: params.id }
        ]
      }
    });

    if (!targetCs) {
      return NextResponse.json({ error: "Case study not found" }, { status: 404 });
    }

    await prisma.caseStudy.delete({
      where: { id: targetCs.id },
    });

    // Audit Log
    const session = await getAdminSession();
    if (session?.user) {
      await writeAuditLog({
        userId: (session.user as any).id,
        action: "DELETE",
        entity: "CaseStudy",
        entityId: targetCs.id,
      });
    }

    revalidatePath("/case-studies");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete case study:", error);
    return NextResponse.json({ error: "Failed to delete case study" }, { status: 500 });
  }
}
