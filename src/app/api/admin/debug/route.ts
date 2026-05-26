import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
export async function GET() {
  const sections = await prisma.serviceSection.findMany({ where: { type: { contains: "header" } } });
  return NextResponse.json(sections);
}

