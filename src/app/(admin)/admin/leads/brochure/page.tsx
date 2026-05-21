"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Download, Mail, Building, Clock, ChevronLeft, FileText } from "lucide-react";
import Link from "next/link";

interface BrochureLead {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  brochureTitle: string;
  createdAt: string;
}

export default function BrochureLeadsPage() {
  const [leads, setLeads] = useState<BrochureLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/admin/leads/brochure");
      if (res.ok) setLeads(await res.json());
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    window.location.href = "/api/admin/leads/brochure/export";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/admin/leads" className="p-2 hover:bg-gray-50 rounded-xl transition-all text-gray-400 hover:text-gray-600">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h2 className="text-xl font-black text-[#1a1a2e]">Brochure Downloads</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Track document requests</p>
          </div>
        </div>
        <button 
          onClick={handleExport}
          className="bg-[#c1000a] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-red-700 transition-all flex items-center gap-2 shadow-lg shadow-red-900/10"
        >
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100">
                <th className="px-8 py-5">User Profile</th>
                <th className="px-8 py-5">Company Info</th>
                <th className="px-8 py-5">Asset Requested</th>
                <th className="px-8 py-5">Timestamp</th>
                <th className="px-8 py-5 text-right">Engagement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-100">
                        {lead.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-[#1a1a2e]">{lead.name}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1">
                          <Mail size={10} /> {lead.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-gray-600 font-medium">
                      <Building size={16} className="text-gray-300" /> {lead.company || "—"}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-red-400" />
                      <span className="px-3 py-1 bg-red-50 text-[#c1000a] rounded-full text-[10px] font-black uppercase tracking-wider border border-red-100">
                        {lead.brochureTitle}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-gray-400 font-medium text-xs">
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} /> {format(new Date(lead.createdAt), "MMM d, yyyy")}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                     <button className="text-gray-300 hover:text-[#c1000a] p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all bg-white border border-gray-100 shadow-sm">
                       <Mail size={18} />
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isLoading && leads.length === 0 && (
          <div className="p-32 text-center text-gray-400 italic font-medium bg-gray-50/50">
            <Download size={48} className="mx-auto mb-4 text-gray-200" />
            No brochure downloads recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}
