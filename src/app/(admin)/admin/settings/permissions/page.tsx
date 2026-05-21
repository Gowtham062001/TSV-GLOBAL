import { prisma } from "@/lib/db";
import { isSuperAdmin } from "@/lib/auth-check";
import { notFound } from "next/navigation";
import { PermissionsClient } from "./PermissionsClient";

export const dynamic = "force-dynamic";

export default async function PermissionsPage() {
  const superAdmin = await isSuperAdmin();
  if (!superAdmin) {
    notFound();
  }

  const users = await prisma.adminUser.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      permissions: true,
      isActive: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="admin-shell space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="admin-page-title">Role & Permissions</h1>
          <p className="admin-page-subtitle">Manage user roles and specific access overrides</p>
        </div>
      </div>
      
      <PermissionsClient users={users as any} />
    </div>
  );
}
