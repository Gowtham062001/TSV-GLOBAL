import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const leadId = params.id;
    const lead = await prisma.contactSubmission.update({
      where: { id: leadId },
      data: { isRead: true },
    });
    return NextResponse.json(lead);
  } catch (error) {
    console.error("Failed to mark lead as read:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
