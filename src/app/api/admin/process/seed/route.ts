import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const tasks = [
      { title: "Fix JS loading (ClientInit + Scripts)", category: "TASK", percentage: 100, status: "COMPLETED", version: "1.0", order: 1 },
      { title: "Fix CSS imports in layout.tsx", category: "TASK", percentage: 100, status: "COMPLETED", version: "1.0", order: 2 },
      { title: "Header component (Desktop/Mobile/Sticky)", category: "SECTION", percentage: 100, status: "COMPLETED", version: "1.0", order: 3 },
      { title: "Footer component", category: "SECTION", percentage: 100, status: "COMPLETED", version: "1.0", order: 4 },
      { title: "WhatsApp + Call pulse buttons", category: "REQUIREMENT", percentage: 100, status: "COMPLETED", version: "1.0", order: 5 },
      { title: "BrochureDownloadModal integration", category: "REQUIREMENT", percentage: 100, status: "COMPLETED", version: "1.0", order: 6 },
      { title: "Convert all 32 pages one by one", category: "SECTION", percentage: 40, status: "PARTIAL", version: "1.0", order: 7 },
      { title: "Services mega menu in header", category: "SECTION", percentage: 100, status: "COMPLETED", version: "1.0", order: 8 },
      { title: "Seed all page content to DB", category: "TASK", percentage: 50, status: "IN_PROGRESS", version: "1.0", order: 9 },
      { title: "Redesign admin panel UI", category: "SECTION", percentage: 100, status: "COMPLETED", version: "1.0", order: 10 },
      { title: "Admin CRUD operations validation", category: "TASK", percentage: 100, status: "COMPLETED", version: "1.0", order: 11 },
      { title: "Media Selector Integration", category: "REQUIREMENT", percentage: 100, status: "COMPLETED", version: "1.0", order: 12 },
      { title: "Final visual check & parity audit", category: "TASK", percentage: 0, status: "PENDING", version: "1.0", order: 13 },
      
      // Future Version 2.0 placeholder
      { title: "Advanced Bug Tracker System", category: "REQUIREMENT", percentage: 0, status: "PENDING", version: "2.0", order: 14 },
      { title: "User Analytics Dashboard V2", category: "SECTION", percentage: 0, status: "PENDING", version: "2.0", order: 15 },
    ];

    for (const task of tasks) {
      await prisma.projectTask.upsert({
        where: { id: `task-${task.order}` },
        update: task,
        create: {
          id: `task-${task.order}`,
          ...task
        }
      });
    }

    return NextResponse.json({ message: "Process Roadmap Seeded" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error seeding roadmap" }, { status: 500 });
  }
}
