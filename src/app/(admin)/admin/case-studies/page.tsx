export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { CaseStudiesListClient } from "./CaseStudiesListClient";

export default async function AdminCaseStudiesPage() {
  const cases = await prisma.caseStudy.findMany({
    orderBy: { createdAt: "desc" },
  });
  return (
    <div className="admin-shell space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="admin-page-title">Case Studies</h1>
          <p className="admin-page-subtitle">Manage project case studies</p>
        </div>
        <Link 
          href="/admin/case-studies/new" 
          className="flex items-center gap-2 px-4 py-2 bg-[#0f1523] text-white rounded-lg text-[13px] font-medium hover:bg-black transition-all"
        >
          <Plus size={16} />
          <span>+ New Case Study</span>
        </Link>
      </div>

      <CaseStudiesListClient initialCases={cases} />
    </div>
  );
}
