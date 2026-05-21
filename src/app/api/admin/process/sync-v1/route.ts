import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Update all existing tasks to V1.0
    await prisma.projectTask.updateMany({
      data: { version: "1.0" }
    });

    const tasks = [
      { id: "task-1", title: "Fix JS loading (ClientInit + Scripts)", category: "TASK", percentage: 100, status: "COMPLETED", version: "1.0", order: 1 },
      { id: "task-2", title: "Fix CSS imports in layout.tsx", category: "TASK", percentage: 100, status: "COMPLETED", version: "1.0", order: 2 },
      { id: "task-3", title: "Header component (Desktop/Mobile/Sticky)", category: "SECTION", percentage: 100, status: "COMPLETED", version: "1.0", order: 3 },
      { id: "task-4", title: "Footer component", category: "SECTION", percentage: 100, status: "COMPLETED", version: "1.0", order: 4 },
      { id: "task-5", title: "WhatsApp + Call pulse buttons", category: "REQUIREMENT", percentage: 100, status: "COMPLETED", version: "1.0", order: 5 },
      { id: "task-6", title: "BrochureDownloadModal integration", category: "REQUIREMENT", percentage: 100, status: "COMPLETED", version: "1.0", order: 6 },
      { id: "task-7", title: "Convert all 32 pages one by one", category: "SECTION", percentage: 43, status: "PARTIAL", version: "1.0", order: 7 },
      { id: "task-8", title: "Services mega menu in header", category: "SECTION", percentage: 100, status: "COMPLETED", version: "1.0", order: 8 },
      { id: "task-9", title: "Seed all page content to DB", category: "TASK", percentage: 50, status: "IN_PROGRESS", version: "1.0", order: 9 },
      { id: "task-10", title: "Redesign admin panel UI", category: "SECTION", percentage: 100, status: "COMPLETED", version: "1.0", order: 10 },
      { id: "task-11", title: "Admin CRUD operations validation", category: "TASK", percentage: 100, status: "COMPLETED", version: "1.0", order: 11 },
      { id: "task-12", title: "Media Selector Integration", category: "REQUIREMENT", percentage: 100, status: "COMPLETED", version: "1.0", order: 12 },
      { id: "task-13", title: "Final visual check & parity audit", category: "TASK", percentage: 0, status: "PENDING", version: "1.0", order: 13 },
      { id: "task-14", title: "Bug Tracker System (V1 Implementation)", category: "REQUIREMENT", percentage: 100, status: "COMPLETED", version: "1.0", order: 14 },
    ];

    for (const task of tasks) {
      await prisma.projectTask.upsert({
        where: { id: task.id },
        update: task,
        create: task
      });
    }

    return NextResponse.json({ message: "All tasks synchronized to V1.0" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error updating roadmap" }, { status: 500 });
  }
}
