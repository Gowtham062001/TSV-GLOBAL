import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, company, brochureTitle } = body;

    const lead = await prisma.brochureDownload.create({
      data: {
        name,
        email,
        phone,
        company,
        brochureTitle: brochureTitle || "Main Corporate Brochure",
      },
    });

    // Trigger webhooks
    const { triggerWebhook } = await import("@/lib/webhooks");
    await triggerWebhook("brochure_download", lead);

    // Send notification email
    try {
      const { sendLeadNotification } = await import("@/lib/email");
      await sendLeadNotification({
        type: "Brochure Download",
        name,
        email,
        phone,
        company,
        subject: `Brochure Request: ${brochureTitle || "Main Corporate Brochure"}`,
      });
    } catch (emailError) {
      console.error("Failed to send lead notification email:", emailError);
    }

    // Return the URL to the PDF
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "corporate_brochure" }
    });
    
    let pdfUrl = "/assets/brochure/tsv-brochure.pdf";
    if (setting) {
      const val = setting.value as any;
      if (val && val.url) {
        pdfUrl = val.url;
      } else if (typeof val === 'string') {
        pdfUrl = val;
      }
    }

    return NextResponse.json({ success: true, pdfUrl });
  } catch (error) {
    console.error("Brochure lead error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
