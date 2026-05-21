import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isSuperAdmin } from "@/lib/auth-check";

export async function POST(request: Request) {
  try {
    const { ids, action } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "ids must be a non-empty array" }, { status: 400 });
    }

    if (action === "archive") {
      await prisma.galleryImage.updateMany({
        where: { id: { in: ids } },
        data: { 
          status: "ARCHIVED",
          isArchived: true,
          archivedAt: new Date()
        },
      });
    } else if (action === "restore") {
      await prisma.galleryImage.updateMany({
        where: { id: { in: ids } },
        data: { 
          status: "ACTIVE",
          isArchived: false,
          archivedAt: null
        },
      });
    } else if (action === "delete") {
      const superAdmin = await isSuperAdmin();
      if (!superAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

      await prisma.galleryImage.deleteMany({
        where: { id: { in: ids } },
      });
    } else {
      return NextResponse.json({ error: "Invalid action. Must be 'archive', 'restore', or 'delete'" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
