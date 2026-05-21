import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth-check";
import { writeAuditLog } from "@/lib/audit";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();

    // Find page by ID or Slug
    const targetPage = await prisma.page.findFirst({
      where: {
        OR: [
          { id: params.id },
          { slug: params.id }
        ]
      }
    });

    if (!targetPage) {
      return NextResponse.json({ message: "Page not found" }, { status: 404 });
    }

    // Clean slug if it is provided
    let cleanSlug = targetPage.slug;
    if (data.slug) {
      cleanSlug = data.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    const page = await prisma.page.update({
      where: { id: targetPage.id },
      data: {
        title: data.title,
        slug: cleanSlug,
        seoData: data.seoData,
        status: data.status,
        isVisible: data.isVisible !== undefined ? data.isVisible : undefined,
      },
    });

    // Audit Log
    const session = await getAdminSession();
    if (session?.user) {
      await writeAuditLog({
        userId: (session.user as any).id,
        action: "UPDATE",
        entity: "Page",
        entityId: page.id,
        changes: { title: page.title }
      });
    }

    if (page.slug === "home") {
      revalidatePath("/");
    } else {
      revalidatePath(`/${page.slug}`);
    }
    return NextResponse.json(page);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error updating page" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    // Find page by ID or Slug
    const targetPage = await prisma.page.findFirst({
      where: {
        OR: [
          { id: params.id },
          { slug: params.id }
        ]
      }
    });

    if (!targetPage) {
      return NextResponse.json({ message: "Page not found" }, { status: 404 });
    }

    // Safely delete page sections first to avoid foreign key violations in case the DB cascade is missing
    await prisma.pageSection.deleteMany({
      where: { pageId: targetPage.id },
    });

    await prisma.page.delete({
      where: { id: targetPage.id },
    });

    // Audit Log
    const session = await getAdminSession();
    if (session?.user) {
      await writeAuditLog({
        userId: (session.user as any).id,
        action: "DELETE",
        entity: "Page",
        entityId: targetPage.id,
      });
    }

    return NextResponse.json({ message: "Page deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error deleting page" }, { status: 500 });
  }
}
