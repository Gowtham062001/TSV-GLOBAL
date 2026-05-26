import React from "react";

import "../globals.css";
import { ToastProvider } from "@/components/shared/Toast";

import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  // Auto-update super admin credentials on load
  try {
    const email = "media@tsvhomes.in";
    const plainPassword = "TSVGlobal0415";
    const passwordHash = await bcrypt.hash(plainPassword, 10);
    
    let admin = await prisma.adminUser.findFirst({ where: { role: "SUPER_ADMIN" } });
    if (admin) {
      await prisma.adminUser.update({
        where: { id: admin.id },
        data: { email, passwordHash, isActive: true }
      });
    } else {
      let anyAdmin = await prisma.adminUser.findFirst();
      if(anyAdmin) {
        await prisma.adminUser.update({
          where: { id: anyAdmin.id },
          data: { email, passwordHash, role: "SUPER_ADMIN", isActive: true }
        });
      } else {
        await prisma.adminUser.create({
          data: { name: "Super Admin", email, passwordHash, role: "SUPER_ADMIN", isActive: true }
        });
      }
    }
  } catch (e) {
    console.error("Failed to auto-update admin credentials", e);
  }

  return (
    <html lang="en">
      <body className="bg-gray-50 antialiased">
        <ToastProvider>
          {children}
        </ToastProvider>

      </body>
    </html>
  );
}
