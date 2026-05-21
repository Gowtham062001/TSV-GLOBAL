export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import ServiceEditorClient from "./ServiceEditorClient";

export default async function EditServicePage({ params }: { params: { id: string } }) {
  const service = await prisma.service.findFirst({
    where: {
      OR: [
        { id: params.id },
        { slug: params.id }
      ]
    },
    include: {
      sections: {
        orderBy: { order: "asc" }
      }
    }
  });

  if (!service) {
    notFound();
  }

  // Convert Date objects to strings for Client Component if necessary, 
  // though Next.js handles simple Date objects fine now.
  return <ServiceEditorClient service={service as any} />;
}
