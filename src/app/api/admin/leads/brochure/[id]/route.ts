import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.brochureDownload.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete brochure lead:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
