export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import React from "react";
import { ServicesListClient } from "./ServicesListClient";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="admin-shell space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="admin-page-title">Services</h1>
          <p className="admin-page-subtitle">Manage service pages</p>
        </div>
        <Link 
          href="/admin/services/new" 
          className="flex items-center gap-2 px-4 py-2 bg-[#0f1523] text-white rounded-lg text-[13px] font-medium hover:bg-black transition-all"
        >
          <Plus size={16} />
          <span>+ New Service</span>
        </Link>
      </div>

      <ServicesListClient initialServices={services as any} />
    </div>
  );
}
