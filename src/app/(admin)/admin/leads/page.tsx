"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Download, Mail, Phone, CheckCircle, Clock, Trash2, Send, RefreshCw } from "lucide-react";
import { useToast } from "@/components/shared/Toast";

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
  pdfUrl?: string | null;
}

const iconBtnStyle: React.CSSProperties = {
  width: 30, height: 30,
  border: '1px solid #f0f2f8',
  background: '#fff',
  borderRadius: 7,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  textDecoration: 'none',
  color: '#4a5568',
  flexShrink: 0,
  padding: 0,
};

function LeadsClientContent() {
  const searchParams = useSearchParams();
  const { success, error: toastError } = useToast();
  const [contactLeads, setContactLeads] = useState<Lead[]>([]);
  const [brochureLeads, setBrochureLeads] = useState<BrochureLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get("type") || "contact");
  const [resending, setResending] = useState<string | null>(null);

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

  const handleMarkRead = async (id: string, currentIsRead: boolean) => {
    try {
      const response = await fetch(`/api/admin/leads/contact/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: !currentIsRead }),
      });
      if (response.ok) {
        setContactLeads(prev => prev.map(l => l.id === id ? { ...l, isRead: !currentIsRead } : l));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleReply = async (lead: Lead) => {
    // Auto-mark as read when replying
    if (!lead.isRead) {
      await handleMarkRead(lead.id, false);
    }
    const subject = encodeURIComponent(`Re: ${lead.subject || "Your Inquiry"}`);
    const body = encodeURIComponent(`Dear ${lead.name},\n\n`);
    window.location.href = `mailto:${lead.email}?subject=${subject}&body=${body}`;
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm("Delete this inquiry? Cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/leads/contact/${id}`, { method: "DELETE" });
      if (res.ok) {
        setContactLeads(prev => prev.filter(l => l.id !== id));
        success("Inquiry deleted.");
      } else {
        toastError("Failed to delete inquiry.");
      }
    } catch {
      toastError("Network error.");
    }
  };

  const handleDeleteBrochure = async (id: string) => {
    if (!confirm("Delete this record? Cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/leads/brochure/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBrochureLeads(prev => prev.filter(l => l.id !== id));
        success("Record deleted.");
      } else {
        toastError("Failed to delete record.");
      }
    } catch {
      toastError("Network error.");
    }
  };

  const handleResend = async (lead: BrochureLead) => {
    setResending(lead.id);
    try {
      const res = await fetch(`/api/admin/leads/brochure/${lead.id}/resend`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        success(`Brochure resent to ${data.email}`);
      } else {
        toastError("Failed to resend brochure.");
      }
    } catch {
      toastError("Network error.");
    } finally {
      setResending(null);
    }
  };

  return (
    <div className="admin-shell space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="admin-page-title">Leads</h1>
          <p className="admin-page-subtitle">Inquiries and brochure downloads</p>
        </div>
        <button
          onClick={() => {
            const exportUrl = activeTab === "contact"
              ? "/api/admin/leads/contact/export"
              : "/api/admin/leads/brochure/export";
            window.location.href = exportUrl;
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#0f1523] text-white rounded-lg text-[13px] font-medium hover:bg-black transition-all"
        >
          <Download size={16} />
          <span>Export CSV</span>
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
          <div className="space-y-2">
            {contactLeads.map((lead) => (
              <div
                key={lead.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                  padding: '14px 20px',
                  background: lead.isRead ? '#fff' : '#fef9f9',
                  border: `1px solid ${lead.isRead ? '#f0f2f8' : 'rgba(193,0,10,0.12)'}`,
                  borderRadius: 10,
                  transition: 'border-color 0.15s'
                }}
              >
                {/* Left: icon */}
                <div style={{
                  width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                  background: 'rgba(193,0,10,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Mail size={16} color="#c1000a" />
                </div>

                {/* Middle: info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 14, fontWeight: lead.isRead ? 500 : 700, color: '#0f1523' }}>
                      {lead.name}
                    </span>
                    {!lead.isRead && (
                      <span style={{
                        fontSize: 9, fontWeight: 700, background: '#c1000a', color: '#fff',
                        padding: '2px 6px', borderRadius: 20, letterSpacing: '0.5px'
                      }}>NEW</span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: '#8a9ab5', marginBottom: 4, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Mail size={10} /> {lead.email}
                    </span>
                    {lead.phone && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Phone size={10} /> {lead.phone}
                      </span>
                    )}
                  </div>
                  {lead.subject && (
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0f1523', marginBottom: 2 }}>
                      {lead.subject}
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: '#4a5568', maxWidth: 500 }} className="line-clamp-2">
                    {lead.message}
                  </div>
                </div>

                {/* Right: date + actions */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, color: '#8a9ab5' }}>
                    {format(new Date(lead.createdAt), "MMM d, yyyy")}
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {/* Mark read/unread toggle */}
                    <button
                      onClick={() => handleMarkRead(lead.id, lead.isRead)}
                      style={iconBtnStyle}
                      title={lead.isRead ? "Mark as unread" : "Mark as read"}
                    >
                      {lead.isRead
                        ? <Clock size={13} style={{ opacity: 0.5 }} />
                        : <CheckCircle size={13} color="#059669" />
                      }
                    </button>
                    {/* Reply */}
                    <button
                      onClick={() => handleReply(lead)}
                      style={iconBtnStyle}
                      title="Reply via email"
                    >
                      <Send size={13} style={{ opacity: 0.6 }} color="#2563eb" />
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteContact(lead.id)}
                      style={iconBtnStyle}
                      title="Delete inquiry"
                    >
                      <Trash2 size={13} color="#c1000a" style={{ opacity: 0.7 }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {contactLeads.length === 0 && !isLoading && (
              <div className="p-10 text-center text-[#8a9ab5] text-[13px] border border-[#f0f2f8] rounded-[10px] bg-white">
                No inquiries recorded.
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="brochure">
          <div className="space-y-2">
            {brochureLeads.map((lead) => (
              <div
                key={lead.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 20px',
                  background: '#fff',
                  border: '1px solid #f0f2f8',
                  borderRadius: 10,
                  transition: 'border-color 0.15s'
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(193,0,10,0.12)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#f0f2f8')}
              >
                {/* Icon */}
                <div style={{
                  width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                  background: 'rgba(59,130,246,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Download size={16} color="#2563eb" />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#0f1523', margin: '0 0 2px' }}>
                    {lead.name}
                  </p>
                  <p style={{ fontSize: 11, color: '#8a9ab5', margin: 0 }}>
                    {lead.email}{lead.company ? ` · ${lead.company}` : ""}
                  </p>
                </div>

                {/* Brochure title */}
                <span style={{
                  fontSize: 11, fontWeight: 600, color: '#2563eb',
                  background: 'rgba(59,130,246,0.08)',
                  padding: '3px 8px', borderRadius: 20, flexShrink: 0
                }}>
                  {lead.brochureTitle}
                </span>

                {/* Date */}
                <span className="admin-list-meta" style={{ fontSize: 12, color: '#8a9ab5', flexShrink: 0 }}>
                  {format(new Date(lead.createdAt), "MMM d, yyyy")}
                </span>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => handleResend(lead)}
                    disabled={resending === lead.id}
                    style={iconBtnStyle}
                    title="Resend brochure"
                  >
                    <RefreshCw size={13} color="#2563eb" style={{ opacity: resending === lead.id ? 0.3 : 0.8 }} />
                  </button>
                  <button
                    onClick={() => handleDeleteBrochure(lead.id)}
                    style={iconBtnStyle}
                    title="Delete record"
                  >
                    <Trash2 size={13} color="#c1000a" style={{ opacity: 0.7 }} />
                  </button>
                </div>
              </div>
            ))}
            {brochureLeads.length === 0 && !isLoading && (
              <div className="p-10 text-center text-[#8a9ab5] text-[13px] border border-[#f0f2f8] rounded-[10px] bg-white">
                No downloads recorded.
              </div>
            )}
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
