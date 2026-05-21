import { NextResponse } from "next/server";
import { getAdminSession } from "./auth-check";
import { prisma } from "./db";
import { hasPermission, Permission, Role } from "./permissions";

export async function requirePermission(permission: Permission) {
  const session = await getAdminSession();
  
  if (!session || !(session.user as any)?.id) {
    return { authorized: false, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const userId = (session.user as any).id;
  const userRole = (session.user as any).role as Role;

  // We can optimize by first checking role defaults before hitting the DB if possible,
  // but to support custom user overrides safely, we should fetch the user's custom permissions.
  // We'll fetch just the permissions field.
  const user = await prisma.adminUser.findUnique({
    where: { id: userId },
    select: { permissions: true, role: true }
  });

  if (!user) {
    return { authorized: false, error: NextResponse.json({ error: "User not found" }, { status: 401 }) };
  }

  const authorized = hasPermission(user.role as Role, user.permissions as Record<string, boolean> | null, permission);

  if (!authorized) {
    return { authorized: false, error: NextResponse.json({ error: "Forbidden: Missing required permission" }, { status: 403 }) };
  }

  return { authorized: true };
}

// Helper for UI components (Server Components)
export async function checkPermission(permission: Permission): Promise<boolean> {
  const session = await getAdminSession();
  if (!session || !(session.user as any)?.id) return false;

  const userId = (session.user as any).id;
  const user = await prisma.adminUser.findUnique({
    where: { id: userId },
    select: { permissions: true, role: true }
  });

  if (!user) return false;

  return hasPermission(user.role as Role, user.permissions as Record<string, boolean> | null, permission);
}
