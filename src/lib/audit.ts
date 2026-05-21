import { prisma } from "@/lib/db";

export async function writeAuditLog({
  userId,
  action,
  entity,
  entityId,
  changes
}: {
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  changes?: Record<string, any>;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        changes: changes || {},
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
