export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import PagesListClient from "./PagesListClient";

export default async function PagesListPage() {
  const pages = await prisma.page.findMany({
    include: {
      _count: {
        select: { sections: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const serializedPages = pages.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return <PagesListClient initialPages={serializedPages} />;
}
