import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  try {
    const leads = await prisma.contactSubmission.findMany({
      orderBy: { createdAt: "desc" },
    });

    const csvHeader = "Name,Email,Phone,Subject,Message,Date,Status\n";
    const csvRows = leads.map((lead) => {
      const name = `"${lead.name.replace(/"/g, '""')}"`;
      const email = `"${lead.email.replace(/"/g, '""')}"`;
      const phone = `"${(lead.phone || "").replace(/"/g, '""')}"`;
      const subject = `"${(lead.subject || "").replace(/"/g, '""')}"`;
      const message = `"${lead.message.replace(/"/g, '""')}"`;
      const date = `"${new Date(lead.createdAt).toLocaleString().replace(/"/g, '""')}"`;
      const status = lead.isRead ? "Read" : "Unread";
      
      return `${name},${email},${phone},${subject},${message},${date},${status}`;
    }).join("\n");

    const csvContent = csvHeader + csvRows;

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="contact-leads.csv"',
      },
    });
  } catch (error) {
    return new Response("Export failed", { status: 500 });
  }
}
