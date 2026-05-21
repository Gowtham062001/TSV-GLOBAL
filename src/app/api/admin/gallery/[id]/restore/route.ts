import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const restored = await prisma.galleryImage.update({
      where: { id: params.id },
      data: { 
        status: "ACTIVE",
        isArchived: false,
        archivedAt: null
      },
    });
    return NextResponse.json(restored);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
