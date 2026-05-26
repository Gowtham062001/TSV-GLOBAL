import { NextRequest, NextResponse } from "next/server";
import { writeFile, copyFile, access, constants } from "fs/promises";
import path from "path";
import { getAdminSession } from "@/lib/auth-check";
import { writeAuditLog } from "@/lib/audit";

const LOGO_PATHS = [
  path.join(process.cwd(), "public", "img", "logo.png"),
  path.join(process.cwd(), "public", "assets", "img", "logo.png")
];

const DEFAULT_LOGO_BACKUP = path.join(process.cwd(), "public", "img", "logo-default-backup.png");

// Ensure backup exists before modifying
async function ensureBackup() {
  try {
    await access(DEFAULT_LOGO_BACKUP, constants.F_OK);
  } catch {
    try {
      await copyFile(LOGO_PATHS[0], DEFAULT_LOGO_BACKUP);
    } catch (e) {
      console.warn("Could not create backup of default logo", e);
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    await ensureBackup();

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Overwrite all logo paths
    let successCount = 0;
    for (const logoPath of LOGO_PATHS) {
      try {
        await writeFile(logoPath, buffer);
        successCount++;
      } catch (e) {
        console.error(`Failed to write logo to ${logoPath}:`, e);
      }
    }

    if (successCount === 0) {
      return NextResponse.json({ error: "Failed to write logo files to server" }, { status: 500 });
    }

    await writeAuditLog({
      userId: (session.user as any).id,
      action: "UPDATE",
      entity: "Settings",
      entityId: "logo",
      changes: { action: "Updated primary logo" }
    });

    return NextResponse.json({ success: true, timestamp: Date.now() });
  } catch (error: any) {
    console.error("Logo upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      await access(DEFAULT_LOGO_BACKUP, constants.F_OK);
      // Restore from backup
      for (const logoPath of LOGO_PATHS) {
        try {
          await copyFile(DEFAULT_LOGO_BACKUP, logoPath);
        } catch (e) {
          console.error(`Failed to restore logo to ${logoPath}:`, e);
        }
      }

      await writeAuditLog({
        userId: (session.user as any).id,
        action: "DELETE",
        entity: "Settings",
        entityId: "logo",
        changes: { action: "Restored default logo" }
      });

      return NextResponse.json({ success: true, timestamp: Date.now() });
    } catch (e) {
      return NextResponse.json({ error: "No default backup found to restore." }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Logo restore error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
