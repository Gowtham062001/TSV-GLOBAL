import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const items = await prisma.menuItem.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch menu items" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { items, isMenuBarVisible } = await req.json();

    // Update global visibility setting if provided
    if (typeof isMenuBarVisible === 'boolean') {
      await prisma.siteSetting.upsert({
        where: { key: "isMenuBarVisible" },
        update: { value: isMenuBarVisible },
        create: { key: "isMenuBarVisible", value: isMenuBarVisible, group: "GENERAL" },
      });
    }

    if (items && !Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    // 1. Get all current item IDs from DB to identify deletions
    const currentItems = await prisma.menuItem.findMany({ select: { id: true } });
    const currentIds = currentItems.map((i: { id: string }) => i.id);

    // 2. Identify incoming real IDs
    const incomingIds = items
      .filter((item: any) => item.id && !item.id.startsWith('temp-'))
      .map((item: any) => item.id);

    // 3. Delete items not in the new array
    const idsToDelete = currentIds.filter((id: string) => !incomingIds.includes(id));
    if (idsToDelete.length > 0) {
      await prisma.menuItem.deleteMany({
        where: { id: { in: idsToDelete } }
      });
    }

    // 4. Separate new and existing items
    const newItems = items.filter((item: any) => !item.id || item.id.startsWith('temp-'));
    
    // First pass: Create all new items in parallel (without parentId set yet to avoid foreign key checks on non-existent records)
    const idMap: Record<string, string> = {};
    if (newItems.length > 0) {
      const createdItems = await Promise.all(
        newItems.map((item: any) =>
          prisma.menuItem.create({
            data: {
              label: item.label,
              url: item.url,
              order: item.order,
              icon: item.icon,
              target: item.target || '_self',
              isActive: item.isActive !== undefined ? item.isActive : true,
            },
          })
        )
      );
      newItems.forEach((item: any, index: number) => {
        idMap[item.id] = createdItems[index].id;
      });
    }

    // Second pass: Update all items in parallel (updates fields + sets correct parentId)
    await Promise.all(
      items.map((item: any) => {
        const dbId = idMap[item.id] || item.id;
        let dbParentId = item.parentId;
        if (dbParentId && idMap[dbParentId]) {
          dbParentId = idMap[dbParentId];
        }

        return prisma.menuItem.update({
          where: { id: dbId },
          data: {
            label: item.label,
            url: item.url,
            order: item.order,
            icon: item.icon,
            target: item.target || '_self',
            isActive: item.isActive !== undefined ? item.isActive : true,
            parentId: dbParentId,
          },
        });
      })
    );

    revalidatePath("/", "layout");

    return NextResponse.json({ message: "Menu updated successfully" });
  } catch (error: any) {
    console.error("Menu Update Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update menu" }, { status: 500 });
  }
}
