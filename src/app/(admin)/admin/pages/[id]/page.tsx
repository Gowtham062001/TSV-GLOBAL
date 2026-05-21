export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import PageEditorClient from "./PageEditorClient";
export default async function AdminPageEditor({ params }: { params: { id: string } }) {
  const page = await prisma.page.findFirst({
    where: {
      OR: [
        { id: params.id },
        { slug: params.id }
      ]
    },
    include: {
      sections: {
        orderBy: { order: "asc" },
      },
    },
  });
  if (!page) {
    notFound();
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <PageEditorClient page={page as any} />;
}
