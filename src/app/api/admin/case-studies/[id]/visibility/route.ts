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

    const cs = await prisma.caseStudy.update({
      where: { id: params.id },
      data: { isVisible },
    });

    // Audit Log
    const session = await getAdminSession();
    if (session?.user) {
      await writeAuditLog({
        userId: (session.user as any).id,
        action: "UPDATE",
        entity: "CaseStudy",
        entityId: cs.id,
        changes: { isVisible }
      });
    }

    revalidatePath("/case-studies");
    revalidatePath(`/case-studies/${cs.slug}`);
    revalidatePath("/");

    return NextResponse.json({ success: true, isVisible: cs.isVisible });
  } catch (error) {
    console.error("Failed to update case study visibility:", error);
    return NextResponse.json({ error: "Failed to update case study visibility" }, { status: 500 });
  }
}
