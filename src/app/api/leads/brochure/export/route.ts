import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  try {
    const leads = await prisma.brochureDownload.findMany({
      orderBy: { createdAt: "desc" },
    });

    const csvHeader = "Name,Email,Phone,Company,Brochure,Date\n";
    const csvRows = leads.map((lead) => {
      const name = `"${lead.name.replace(/"/g, '""')}"`;
      const email = `"${lead.email.replace(/"/g, '""')}"`;
      const phone = `"${(lead.phone || "").replace(/"/g, '""')}"`;
      const company = `"${(lead.company || "").replace(/"/g, '""')}"`;
      const brochure = `"${lead.brochureTitle.replace(/"/g, '""')}"`;
      const date = `"${new Date(lead.createdAt).toLocaleString().replace(/"/g, '""')}"`;
      
      return `${name},${email},${phone},${company},${brochure},${date}`;
    }).join("\n");

    const csvContent = csvHeader + csvRows;

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="brochure-downloads.csv"',
      },
    });
  } catch (error) {
    return new Response("Export failed", { status: 500 });
  }
}
