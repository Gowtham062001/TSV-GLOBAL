import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const leads = await prisma.brochureDownload.findMany({
      orderBy: { createdAt: "desc" },
    });

    const headers = ["Name", "Email", "Phone", "Company", "Brochure", "Date"];
    const rows = leads.map(l => [
      l.name,
      l.email,
      l.phone || "",
      l.company || "",
      l.brochureTitle,
      l.createdAt.toISOString()
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="brochure-leads.csv"',
      },
    });
  } catch (error) {
    console.error("Export Error:", error);
    return NextResponse.json({ error: "Failed to export leads" }, { status: 500 });
  }
}
