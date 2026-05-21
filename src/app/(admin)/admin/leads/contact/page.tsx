"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Download, Mail, Phone, FileText, CheckCircle, Clock, ChevronLeft } from "lucide-react";
import Link from "next/link";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function ContactLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/admin/leads/contact");
      if (res.ok) setLeads(await res.json());
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    window.location.href = "/api/admin/leads/contact/export";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/admin/leads" className="p-2 hover:bg-gray-50 rounded-xl transition-all text-gray-400 hover:text-gray-600">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h2 className="text-xl font-black text-[#1a1a2e]">Contact Inquiries</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Manage visitor messages</p>
          </div>
        </div>
        <button 
          onClick={handleExport}
          className="bg-[#c1000a] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-red-700 transition-all flex items-center gap-2 shadow-lg shadow-red-900/10"
        >
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {leads.map((lead) => (
          <div key={lead.id} className={`bg-white p-6 rounded-[2rem] border shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6 ${!lead.isRead ? 'border-l-4 border-l-[#c1000a]' : 'border-gray-100'}`}>
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center font-black text-[#1a1a2e] border border-gray-100">
                    {lead.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1a1a2e]">{lead.name}</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1 mt-0.5"><Clock size={12} /> {format(new Date(lead.createdAt), "MMM d, yyyy · h:mm a")}</p>
                  </div>
                </div>
                {!lead.isRead && (
                  <span className="px-3 py-1 bg-red-50 text-[#c1000a] text-[10px] font-black rounded-full uppercase tracking-wider border border-red-100">New Message</span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Mail size={16} className="text-gray-400" /> <span className="truncate">{lead.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Phone size={16} className="text-gray-400" /> {lead.phone || "—"}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <FileText size={16} className="text-gray-400" /> <span className="truncate">{lead.subject || "General Inquiry"}</span>
                </div>
              </div>
              <div className="p-5 bg-white rounded-2xl text-sm text-gray-600 leading-relaxed border border-gray-100 italic">
                "{lead.message}"
              </div>
            </div>
            <div className="flex md:flex-col justify-center items-center gap-2 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 border-gray-100">
               <button className="p-4 text-gray-300 hover:text-green-500 hover:bg-green-50 rounded-2xl transition-all" title="Mark as Read">
                 <CheckCircle size={24} />
               </button>
            </div>
          </div>
        ))}
        {!isLoading && leads.length === 0 && (
          <div className="p-20 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
            <Mail className="mx-auto text-gray-200 mb-4" size={48} />
            <p className="text-gray-400 italic font-medium">No contact inquiries found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
