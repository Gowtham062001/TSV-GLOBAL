import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";

export async function POST() {
  try {
    const seedPath = path.join(process.cwd(), "prisma/seed/menus.json");
    if (!fs.existsSync(seedPath)) {
      return NextResponse.json({ error: "Seed file not found" }, { status: 404 });
    }

    const menuData = JSON.parse(fs.readFileSync(seedPath, "utf-8"));

    // Cleanup existing
    await prisma.menuItem.deleteMany({});

    async function seedMenuItems(items: any[], parentId: string | null = null) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const created = await prisma.menuItem.create({
          data: {
            label: item.title,
            url: item.link,
            icon: item.icon || null,
            order: i,
            parentId: parentId,
            isActive: true,
            target: "_self"
          }
        });
        if (item.items && item.items.length > 0) {
          await seedMenuItems(item.items, created.id);
        }
      }
    }

    await seedMenuItems(menuData);
    
    revalidatePath("/");
    revalidatePath("/(public)", "layout");

    return NextResponse.json({ message: "Menu restored from seed data" });
  } catch (error: any) {
    console.error("Menu Seed Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
