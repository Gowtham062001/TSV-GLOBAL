import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const count = await prisma.notification.count({ where: { isRead: false } });
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Failed to count notifications:", error);
    return NextResponse.json({ count: 0 });
  }
}
