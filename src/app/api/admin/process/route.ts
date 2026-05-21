import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

const baselineTasks = [
  { title: "Fix JS loading (ClientInit + Scripts)", category: "TASK", percentage: 100, status: "COMPLETED", version: "1.0", order: 1 },
  { title: "Fix CSS imports in layout.tsx", category: "TASK", percentage: 100, status: "COMPLETED", version: "1.0", order: 2 },
  { title: "Header component (Desktop/Mobile/Sticky)", category: "SECTION", percentage: 100, status: "COMPLETED", version: "1.0", order: 3 },
  { title: "Footer component", category: "SECTION", percentage: 100, status: "COMPLETED", version: "1.0", order: 4 },
  { title: "WhatsApp + Call pulse buttons", category: "REQUIREMENT", percentage: 100, status: "COMPLETED", version: "1.0", order: 5 },
  { title: "BrochureDownloadModal integration", category: "REQUIREMENT", percentage: 100, status: "COMPLETED", version: "1.0", order: 6 },
  { title: "Convert all 32 pages one by one", category: "SECTION", percentage: 43, status: "PARTIAL", version: "1.0", order: 7 },
  { title: "Services mega menu in header", category: "SECTION", percentage: 100, status: "COMPLETED", version: "1.0", order: 8 },
  { title: "Seed all page content to DB", category: "TASK", percentage: 50, status: "IN_PROGRESS", version: "1.0", order: 9 },
  { title: "Redesign admin panel UI", category: "SECTION", percentage: 100, status: "COMPLETED", version: "1.0", order: 10 },
  { title: "Admin CRUD operations validation", category: "TASK", percentage: 100, status: "COMPLETED", version: "1.0", order: 11 },
  { title: "Media Selector Integration", category: "REQUIREMENT", percentage: 100, status: "COMPLETED", version: "1.0", order: 12 },
  { title: "Final visual check & parity audit", category: "TASK", percentage: 0, status: "PENDING", version: "1.0", order: 13 },
];

export async function GET() {
  try {
    let tasks = await prisma.projectTask.findMany({
      orderBy: { order: "asc" },
    });

    // Auto-seed if empty
    if (tasks.length === 0) {
      for (const task of baselineTasks) {
        await prisma.projectTask.create({
          data: {
            ...task,
            id: `task-${task.order}`
          }
        });
      }
      tasks = await prisma.projectTask.findMany({
        orderBy: { order: "asc" },
      });
    }

    return NextResponse.json(tasks);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error fetching tasks" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const task = await prisma.projectTask.create({
      data: {
        title: data.title,
        description: data.description,
        version: data.version || "1.0",
        category: data.category || "TASK",
        percentage: parseInt(data.percentage) || 0,
        status: data.status || "PENDING",
        order: parseInt(data.order) || 0,
      },
    });
    return NextResponse.json(task);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error creating task" }, { status: 500 });
  }
}
