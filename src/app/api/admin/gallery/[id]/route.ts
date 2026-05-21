import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isSuperAdmin } from "@/lib/auth-check";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json();
    const updated = await prisma.galleryImage.update({
      where: { id: params.id },
      data: {
        alt: data.alt,
        category: data.category,
      },
    });
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode");

    if (mode === "permanent") {
      const superAdmin = await isSuperAdmin();
      if (!superAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      
      await prisma.galleryImage.delete({
        where: { id: params.id },
      });
    } else {
      await prisma.galleryImage.update({
        where: { id: params.id },
        data: { 
          status: "ARCHIVED",
          isArchived: true,
          archivedAt: new Date()
        },
      });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
