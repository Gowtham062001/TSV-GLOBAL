import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const DEFAULT_ROLE_PERMISSIONS: Record<string, Record<string, boolean>> = {
  EDITOR: {
    "pages.edit": true,
    "pages.delete": false,
    "pages.publish": false,
    "services.edit": true,
    "services.delete": false,
    "blog.edit": true,
    "blog.delete": false,
    "blog.publish": false,
    "case_studies.edit": true,
    "case_studies.delete": false,
    "media.upload": true,
    "media.archive": false,
    "media.delete": false,
    "leads.view": true,
    "leads.export": false,
    "leads.delete": false,
    "settings.view": false,
    "settings.edit": false,
    "users.manage": false,
    "audit_logs.view": false,
  },
  ADMIN: {
    "pages.edit": true,
    "pages.delete": true,
    "pages.publish": true,
    "services.edit": true,
    "services.delete": true,
    "blog.edit": true,
    "blog.delete": true,
    "blog.publish": true,
    "case_studies.edit": true,
    "case_studies.delete": true,
    "media.upload": true,
    "media.archive": true,
    "media.delete": true,
    "leads.view": true,
    "leads.export": true,
    "leads.delete": true,
    "settings.view": true,
    "settings.edit": true,
    "users.manage": false,
    "audit_logs.view": true,
  },
};

export async function GET() {
  try {
    const result: Record<string, Record<string, boolean>> = {};

    for (const role of ["EDITOR", "ADMIN"]) {
      const setting = await prisma.siteSetting.findFirst({
        where: { key: `role_permissions_${role.toLowerCase()}` },
      });
      if (setting?.value) {
        try {
          result[role] = JSON.parse(setting.value);
        } catch {
          result[role] = DEFAULT_ROLE_PERMISSIONS[role];
        }
      } else {
        result[role] = DEFAULT_ROLE_PERMISSIONS[role];
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch role permissions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { role, permissions } = await request.json();
    if (!role || !permissions) {
      return NextResponse.json({ error: "Missing role or permissions" }, { status: 400 });
    }

    const key = `role_permissions_${role.toLowerCase()}`;
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value: JSON.stringify(permissions) },
      create: { key, value: JSON.stringify(permissions), group: "PERMISSIONS" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save role permissions:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
