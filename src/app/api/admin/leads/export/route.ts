export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "contact";

    let csvContent = "";
    
    if (type === "contact") {
      const leads = await prisma.contactSubmission.findMany({
        orderBy: { createdAt: "desc" },
      });
      
      csvContent = "ID,Name,Email,Phone,Subject,Message,Date\n";
      leads.forEach(l => {
        csvContent += `"${l.id}","${l.name}","${l.email}","${l.phone || ""}","${l.subject || ""}","${l.message.replace(/"/g, '""')}","${l.createdAt.toISOString()}"\n`;
      });
    } else {
      const leads = await prisma.brochureDownload.findMany({
        orderBy: { createdAt: "desc" },
      });
      
      csvContent = "ID,Name,Email,Phone,Company,Brochure,Date\n";
      leads.forEach(l => {
        csvContent += `"${l.id}","${l.name}","${l.email}","${l.phone || ""}","${l.company || ""}","${l.brochureTitle}","${l.createdAt.toISOString()}"\n`;
      });
    }

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="tsv-leads-${type}-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to export CSV" }, { status: 500 });
  }
}
