import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendMail } from "@/lib/mailer";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // We return success even if user not found for security (prevent email enumeration)
    // But we only trigger the email logic if user exists
    if (!user) {
      return NextResponse.json({ message: "If an account exists with this email, you will receive a reset link shortly." });
    }

    // Create a secure random token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    // Save token to DB
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${siteUrl}/admin/reset-password?token=${token}`;

    // Send email
    await sendMail({
      to: user.email,
      subject: "Reset Your TSV Global Admin Password",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 30px;">
             <img src="https://tsvglobal.com/img/logo.png" alt="TSV Global" style="height: 50px;" />
          </div>
          <h2 style="color: #1e293b; text-align: center;">Password Reset Request</h2>
          <p style="color: #64748b; line-height: 1.6;">Hello ${user.name},</p>
          <p style="color: #64748b; line-height: 1.6;">We received a request to reset your password for the TSV Global Admin Panel. Click the button below to set a new password. This link will expire in 1 hour.</p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${resetUrl}" style="background-color: #c1000a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #94a3b8; font-size: 12px; line-height: 1.6; text-align: center;">If you didn't request this, you can safely ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
          <p style="color: #cbd5e1; font-size: 11px; text-align: center;">© ${new Date().getFullYear()} TSV Global Solutions Pvt. Ltd.</p>
        </div>
      `
    });

    return NextResponse.json({ message: "If an account exists with this email, you will receive a reset link shortly." });
  } catch (error) {
    console.error("[FORGOT_PASSWORD_ERROR]", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
