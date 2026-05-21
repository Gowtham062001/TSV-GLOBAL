import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstname, lastname, email, phone, message } = body;

    const submission = await prisma.contactSubmission.create({
      data: {
        name: `${firstname} ${lastname}`,
        email,
        phone,
        message,
        subject: "General Inquiry (from Contact Form)",
      },
    });

    // Trigger webhooks for the new lead
    const { triggerWebhook } = await import("@/lib/webhooks");
    await triggerWebhook("new_lead", submission);

    // Send notification email
    try {
      const { sendLeadNotification } = await import("@/lib/email");
      await sendLeadNotification({
        type: "Contact Form",
        name: `${firstname} ${lastname}`,
        email,
        phone,
        subject: "General Inquiry (from Contact Form)",
        message,
      });
    } catch (emailError) {
      console.error("Failed to send lead notification email:", emailError);
    }

    return NextResponse.json({ success: true, id: submission.id });

  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
