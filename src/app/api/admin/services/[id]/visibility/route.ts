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

    const service = await prisma.service.update({
      where: { id: params.id },
      data: { isVisible },
    });

    // Audit Log
    const session = await getAdminSession();
    if (session?.user) {
      await writeAuditLog({
        userId: (session.user as any).id,
        action: "UPDATE",
        entity: "Service",
        entityId: service.id,
        changes: { isVisible }
      });
    }

    revalidatePath("/services");
    revalidatePath(`/services/${service.slug}`);
    revalidatePath("/", "layout");

    return NextResponse.json({ success: true, isVisible: service.isVisible });
  } catch (error) {
    console.error("Failed to update service visibility:", error);
    return NextResponse.json({ error: "Failed to update service visibility" }, { status: 500 });
  }
}
