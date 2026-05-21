import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await req.json();
    const task = await prisma.projectTask.update({
      where: { id: params.id },
      data: {
        title: data.title,
        description: data.description,
        version: data.version,
        category: data.category,
        percentage: parseInt(data.percentage),
        status: data.status,
        order: parseInt(data.order),
      },
    });
    return NextResponse.json(task);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error updating task" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.projectTask.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: "Task deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error deleting task" }, { status: 500 });
  }
}
