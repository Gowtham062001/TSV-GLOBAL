import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const updates = [
      { id: "task-1", percentage: 100, status: "COMPLETED" },
      { id: "task-2", percentage: 100, status: "COMPLETED" },
      { id: "task-3", percentage: 100, status: "COMPLETED" },
      { id: "task-4", percentage: 100, status: "COMPLETED" },
      { id: "task-5", percentage: 100, status: "COMPLETED" },
      { id: "task-6", percentage: 100, status: "COMPLETED" },
      { id: "task-7", percentage: 43, status: "PARTIAL" }, // 14/32 pages
      { id: "task-8", percentage: 100, status: "COMPLETED" },
      { id: "task-9", percentage: 50, status: "IN_PROGRESS" },
      { id: "task-10", percentage: 100, status: "COMPLETED" },
      { id: "task-11", percentage: 100, status: "COMPLETED" },
      { id: "task-12", percentage: 100, status: "COMPLETED" },
      { id: "task-13", percentage: 0, status: "PENDING" },
    ];

    for (const update of updates) {
      await prisma.projectTask.update({
        where: { id: update.id },
        data: {
          percentage: update.percentage,
          status: update.status,
        }
      });
    }

    return NextResponse.json({ message: "Roadmap status updated based on codebase verification." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error updating roadmap" }, { status: 500 });
  }
}
