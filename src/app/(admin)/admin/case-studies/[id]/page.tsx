export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import CaseStudyEditorClient from "./CaseStudyEditorClient";
export default async function AdminEditCaseStudy({ params }: { params: { id: string } }) {
  const cs = await prisma.caseStudy.findFirst({
    where: {
      OR: [
        { id: params.id },
        { slug: params.id }
      ]
    },
  });
  if (!cs) {
    notFound();
  }
  return <CaseStudyEditorClient cs={cs} />;
}
