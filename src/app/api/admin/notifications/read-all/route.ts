import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH() {
  try {
    await prisma.notification.updateMany({ data: { isRead: true } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
