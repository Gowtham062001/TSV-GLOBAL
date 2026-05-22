import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const leadId = params.id;
    const body = await request.json().catch(() => ({}));
    const lead = await prisma.contactSubmission.update({
      where: { id: leadId },
      data: { isRead: body.isRead !== undefined ? body.isRead : true },
    });
    return NextResponse.json(lead);
  } catch (error) {
    console.error("Failed to update contact lead:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.contactSubmission.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete contact lead:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
