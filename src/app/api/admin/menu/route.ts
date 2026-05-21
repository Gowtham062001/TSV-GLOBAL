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
    const currentIds = currentItems.map(i => i.id);

    // 2. Identify incoming real IDs
    const incomingIds = items
      .filter(item => item.id && !item.id.startsWith('temp-'))
      .map(item => item.id);

    // 3. Delete items not in the new array
    const idsToDelete = currentIds.filter(id => !incomingIds.includes(id));
    if (idsToDelete.length > 0) {
      await prisma.menuItem.deleteMany({
        where: { id: { in: idsToDelete } }
      });
    }

    // 4. Upsert items (handling parents correctly)
    // We do this in a way that respects the order and parentId provided by the client
    // Since we might have new items that other items depend on as parents, 
    // we should ideally upsert them in an order that respects hierarchy or just use a two-pass approach.
    
    // First pass: Upsert all items without setting parentId yet (to ensure IDs exist)
    const idMap: Record<string, string> = {};
    
    for (const item of items) {
      const isNew = !item.id || item.id.startsWith('temp-');
      const saved = await prisma.menuItem.upsert({
        where: { id: isNew ? 'none' : item.id },
        update: {
          label: item.label,
          url: item.url,
          order: item.order,
          icon: item.icon,
          target: item.target || '_self',
          isActive: item.isActive !== undefined ? item.isActive : true,
        },
        create: {
          label: item.label,
          url: item.url,
          order: item.order,
          icon: item.icon,
          target: item.target || '_self',
          isActive: item.isActive !== undefined ? item.isActive : true,
        },
      });
      if (isNew) idMap[item.id] = saved.id;
    }

    // Second pass: Update parentIds
    for (const item of items) {
      const dbId = idMap[item.id] || item.id;
      let dbParentId = item.parentId;
      if (dbParentId && idMap[dbParentId]) {
        dbParentId = idMap[dbParentId];
      }

      await prisma.menuItem.update({
        where: { id: dbId },
        data: { parentId: dbParentId }
      });
    }

    revalidatePath("/", "layout");

    return NextResponse.json({ message: "Menu updated successfully" });
  } catch (error: any) {
    console.error("Menu Update Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update menu" }, { status: 500 });
  }
}
