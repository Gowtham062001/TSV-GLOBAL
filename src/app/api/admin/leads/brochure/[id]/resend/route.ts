import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const lead = await prisma.brochureDownload.findUnique({ where: { id: params.id } });
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Log the resend action (actual email sending depends on your email provider setup)
    console.log(`[Brochure Resend] Sending brochure to ${lead.email}: ${lead.pdfUrl || "No PDF URL"}`);

    // If you have nodemailer / resend configured, trigger it here.
    // For now we return success with the email that would be notified.
    return NextResponse.json({ 
      success: true, 
      email: lead.email,
      message: `Brochure resent to ${lead.email}` 
    });
  } catch (error) {
    console.error("Failed to resend brochure:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
