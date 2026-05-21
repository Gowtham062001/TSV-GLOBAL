import { prisma } from "@/lib/db";

export async function logAudit(
  userId: string,
  action: string,
  entity: string,
  entityId: string,
  changes?: Record<string, unknown> | null
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        changes: changes as any,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
