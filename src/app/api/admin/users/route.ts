import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { sendMail, buildWelcomeEmail } from "@/lib/mailer";
import path from "path";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if ((session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const users = await prisma.adminUser.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        isActive: true,
        lastLogin: true,
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if ((session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await prisma.adminUser.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password.trim(), 10);

    const user = await prisma.adminUser.create({
      data: {
        name,
        email,
        passwordHash,
        role: role || "EDITOR",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLogin: true,
        avatar: true,
      },
    });

    // ── Send Welcome Email ────────────────────────────────────────────────────
    const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const loginUrl = `${siteUrl}/admin/login`;
    const logoPath = path.join(process.cwd(), "public", "assets", "img", "logo.png");

    try {
      const html = buildWelcomeEmail({
        name,
        email,
        password,   // plaintext — only sent once at account creation
        role: role || "EDITOR",
        loginUrl,
      });

      await sendMail({
        to: email,
        subject: "🎉 Welcome to TSV Global Admin Panel — Your Login Credentials",
        html,
        attachments: [
          {
            filename: "logo.png",
            path: logoPath,
            cid: "tsvlogo",   // matches cid:tsvlogo in the email template
          },
        ],
      });

      console.log(`[Users API] Welcome email sent to ${email}`);
    } catch (mailError) {
      // Don't fail the whole request if mail fails — just log it
      console.error("[Users API] Failed to send welcome email:", mailError);
    }
    // ─────────────────────────────────────────────────────────────────────────
    
    // Audit Log
    await writeAuditLog({
      userId: (session.user as any).id,
      action: "CREATE",
      entity: "AdminUser",
      entityId: user.id,
      changes: { email: user.email, role: user.role }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[Users API] Failed to create user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if ((session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, name, email, role, isActive, password } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    // Only include fields that were actually provided
    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (role !== undefined) data.role = role;
    if (isActive !== undefined) data.isActive = isActive;

    // Only hash and update password if a non-empty value was sent
    if (password && password.trim() !== "") {
      data.passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    const user = await prisma.adminUser.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLogin: true,
        avatar: true,
      },
    });

    // Audit Log
    await writeAuditLog({
      userId: (session.user as any).id,
      action: "UPDATE",
      entity: "AdminUser",
      entityId: user.id,
      changes: { email: user.email, role: user.role, isActive: user.isActive }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[PUT /api/admin/users] Error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if ((session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    // Don't allow deleting yourself
    if (id === (session.user as any).id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    await prisma.adminUser.delete({
      where: { id },
    });

    // Audit Log
    await writeAuditLog({
      userId: (session.user as any).id,
      action: "DELETE",
      entity: "AdminUser",
      entityId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
