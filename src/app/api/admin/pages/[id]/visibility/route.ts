import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth-check";
import { writeAuditLog } from "@/lib/audit";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { isVisible } = await request.json();

    if (typeof isVisible !== "boolean") {
      return NextResponse.json({ error: "isVisible must be a boolean" }, { status: 400 });
    }

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
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const page = await prisma.page.update({
      where: { id: targetPage.id },
      data: { isVisible },
    });

    // Audit Log
    const session = await getAdminSession();
    if (session?.user) {
      await writeAuditLog({
        userId: (session.user as any).id,
        action: "UPDATE",
        entity: "Page",
        entityId: page.id,
        changes: { isVisible }
      });
    }

    if (page.slug === "home") {
      revalidatePath("/");
    } else {
      revalidatePath(`/${page.slug}`);
    }
    revalidatePath("/", "layout");

    return NextResponse.json({ success: true, isVisible: page.isVisible });
  } catch (error) {
    console.error("Failed to update page visibility:", error);
    return NextResponse.json({ error: "Failed to update page visibility" }, { status: 500 });
  }
}
