import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const redirects = await prisma.redirect.findMany({
      orderBy: { from: "asc" },
    });
    return NextResponse.json(redirects);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch redirects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const redirect = await prisma.redirect.create({
      data: {
        from: body.from,
        to: body.to,
        type: parseInt(body.type) || 301,
        isActive: body.isActive ?? true,
      },
    });
    return NextResponse.json(redirect);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create redirect" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const redirect = await prisma.redirect.update({
      where: { id: body.id },
      data: {
        from: body.from,
        to: body.to,
        type: parseInt(body.type) || 301,
        isActive: body.isActive,
      },
    });
    return NextResponse.json(redirect);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update redirect" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    
    await prisma.redirect.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete redirect" }, { status: 500 });
  }
}
