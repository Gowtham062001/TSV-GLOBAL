import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const email = "media@tsvhomes.in";
    const plainPassword = "TSVGlobal0415";

    const passwordHash = await bcrypt.hash(plainPassword.trim(), 10);

    // See if the user exists
    let admin = await prisma.adminUser.findFirst({
      where: { role: "SUPER_ADMIN" }
    });

    if (admin) {
      // Update existing super admin
      await prisma.adminUser.update({
        where: { id: admin.id },
        data: {
          email,
          passwordHash,
          isActive: true
        }
      });
      return NextResponse.json({ message: "Super Admin credentials updated successfully." });
    } else {
      // Create new super admin
      await prisma.adminUser.create({
        data: {
          name: "Super Admin",
          email,
          passwordHash,
          role: "SUPER_ADMIN",
          isActive: true
        }
      });
      return NextResponse.json({ message: "Super Admin created successfully." });
    }
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
