import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { items } = await req.json();

    // Perform a transaction to update all items at once
    // We use upsert to create new items if they don't have an ID or don't exist
    await prisma.$transaction(
      items.map((item: any) => 
        prisma.menuItem.upsert({
          where: { id: item.id || 'new-id' },
          update: {
            label: item.label,
            url: item.url,
            order: item.order,
            parentId: item.parentId,
            target: item.target,
            isActive: item.isActive,
          },
          create: {
            label: item.label,
            url: item.url,
            order: item.order,
            parentId: item.parentId,
            target: item.target,
            isActive: item.isActive,
          },
        })
      )
    );

    return NextResponse.json({ message: "Menu synchronized successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to synchronize menu" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, ...data } = await req.json();
    const updated = await prisma.menuItem.update({
      where: { id },
      data,
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.menuItem.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
