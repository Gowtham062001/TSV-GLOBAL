import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const leads = await prisma.brochureDownload.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(leads);
  } catch (error) {
    console.error("Failed to fetch brochure leads:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
