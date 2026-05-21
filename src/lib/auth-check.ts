import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function getAdminSession() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return null;
  }

  return session;
}

export async function isAdmin() {
  const session = await getAdminSession();
  return !!session;
}

export async function canEdit() {
  const session = await getAdminSession();
  if (!session) return false;
  
  const role = (session.user as { role?: string }).role;
  return role === "SUPER_ADMIN" || role === "EDITOR";
}

export async function isSuperAdmin() {
  const session = await getAdminSession();
  if (!session) return false;
  
  const role = ((session.user as { role?: string }).role || "").replace(/[- ]/g, "_").toUpperCase();
  return role === "SUPER_ADMIN";
}
