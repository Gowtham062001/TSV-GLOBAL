"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Download, Mail, Phone, Building, FileText, CheckCircle, Clock } from "lucide-react";

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

interface BrochureLead {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  brochureTitle: string;
  createdAt: string;
}

function LeadsClientContent() {
  const searchParams = useSearchParams();
  const [contactLeads, setContactLeads] = useState<Lead[]>([]);
  const [brochureLeads, setBrochureLeads] = useState<BrochureLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get("type") || "contact");

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const [res1, res2] = await Promise.all([
        fetch("/api/admin/leads/contact"),
        fetch("/api/admin/leads/brochure"),
      ]);
      if (res1.ok) setContactLeads(await res1.json());
      if (res2.ok) setBrochureLeads(await res2.json());
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/leads/contact/${id}`, {
        method: "PATCH",
      });
      if (response.ok) {
        setContactLeads(prev => prev.map(l => l.id === id ? { ...l, isRead: true } : l));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleExport = (type: string) => {
    window.open(`/api/admin/leads/export?type=${type}`, "_blank");
  };

  return (
    <div className="admin-shell space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="admin-page-title">Leads</h1>
          <p className="admin-page-subtitle">Inquiries and brochure downloads</p>
        </div>
        <button 
          onClick={() => handleExport(activeTab)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0f1523] text-white rounded-lg text-[13px] font-medium hover:bg-black transition-all"
        >
          <Download size={16} />
          <span>Export Leads</span>
        </button>
      </div>

      <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
        <TabsList className="flex gap-2 mb-6 bg-transparent h-auto p-0">
          <TabsTrigger 
            value="contact" 
            className="px-4 py-2 text-[13px] font-medium data-[state=active]:bg-white data-[state=active]:text-[#0f1523] data-[state=active]:border-[#f0f2f8] border border-transparent rounded-[8px] text-[#8a9ab5] data-[state=active]:shadow-sm transition-all"
          >
            Inquiries ({contactLeads.length})
          </TabsTrigger>
          <TabsTrigger 
            value="brochure" 
            className="px-4 py-2 text-[13px] font-medium data-[state=active]:bg-white data-[state=active]:text-[#0f1523] data-[state=active]:border-[#f0f2f8] border border-transparent rounded-[8px] text-[#8a9ab5] data-[state=active]:shadow-sm transition-all"
          >
            Brochure Downloads ({brochureLeads.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contact">
          <div className="bg-white rounded-[12px] border border-[#f0f2f8] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="admin-table w-full">
                <thead>
                  <tr>
                    <th>Details</th>
                    <th>Inquiry</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th className="w-[100px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contactLeads.map((lead) => (
                    <tr key={lead.id} className={`hover:bg-[#f8f9fb] transition-colors ${!lead.isRead ? "bg-red-50/10 font-medium" : ""}`}>
                      <td>
                        <div style={{fontSize: '13px', fontWeight: 600, color: '#0f1523'}}>{lead.name}</div>
                        <div className="flex flex-col gap-0.5 mt-1 text-[11px] text-[#8a9ab5]">
                          <span className="flex items-center gap-1"><Mail size={12} /> {lead.email}</span>
                          {lead.phone && <span className="flex items-center gap-1"><Phone size={12} /> {lead.phone}</span>}
                        </div>
                      </td>
                      <td>
                        <div style={{fontSize: '13px', fontWeight: 600, color: '#0f1523'}}>{lead.subject || "No Subject"}</div>
                        <div style={{fontSize: '12px', color: '#4a5568', marginTop: '4px', maxWidth: '400px'}} className="line-clamp-2" title={lead.message}>
                          {lead.message}
                        </div>
                      </td>
                      <td>
                        {lead.isRead ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-[11px] font-semibold">
                            <CheckCircle size={12} /> Read
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-[11px] font-semibold">
                            <Clock size={12} /> New
                          </span>
                        )}
                      </td>
                      <td className="admin-list-meta">
                        {format(new Date(lead.createdAt), "MMM d, yyyy")}
                      </td>
                      <td>
                        {!lead.isRead && (
                          <button
                            onClick={() => handleMarkRead(lead.id)}
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-all"
                            title="Mark as Read"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {contactLeads.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan={5} className="p-10 text-center text-[#8a9ab5] text-[13px]">No inquiries recorded.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="brochure">
          <div className="bg-white rounded-[12px] border border-[#f0f2f8] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="admin-table w-full">
                <thead>
                  <tr>
                    <th>User Details</th>
                    <th>Company</th>
                    <th>Document</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {brochureLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-[#f8f9fb] transition-colors">
                      <td>
                        <div style={{fontSize: '13px', fontWeight: 600, color: '#0f1523'}}>{lead.name}</div>
                        <div style={{fontSize: '11px', color: '#8a9ab5'}}>{lead.email}</div>
                      </td>
                      <td style={{fontSize: '13px', color: '#4a5568'}}>
                        {lead.company || "—"}
                      </td>
                      <td style={{fontSize: '13px', color: '#4a5568'}}>
                        {lead.brochureTitle}
                      </td>
                      <td className="admin-list-meta">
                        {format(new Date(lead.createdAt), "MMM d, yyyy")}
                      </td>
                    </tr>
                  ))}
                  {brochureLeads.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan={4} className="p-10 text-center text-[#8a9ab5] text-[13px]">No downloads recorded.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function LeadsPage() {
  return (
    <React.Suspense fallback={<div className="p-10 text-center text-[#8a9ab5] text-[13px]">Loading Leads...</div>}>
      <LeadsClientContent />
    </React.Suspense>
  );
}
