import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const leads = await prisma.brochureDownload.findMany({
      orderBy: { createdAt: "desc" },
    });

    const headers = ["Name", "Email", "Phone", "Company", "Brochure", "Date"];
    const rows = leads.map((l: { name: string; email: string; phone?: string | null; company?: string | null; brochureTitle: string; createdAt: Date }) => [
      l.name,
      l.email,
      l.phone || "",
      l.company || "",
      l.brochureTitle,
      l.createdAt.toISOString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r: (string | null | undefined)[]) => r.map((v: string | null | undefined) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="brochure-leads.csv"',
      },
    });
  } catch (error) {
    console.error("Brochure Export Error:", error);
    return NextResponse.json({ error: "Failed to export" }, { status: 500 });
  }
}
