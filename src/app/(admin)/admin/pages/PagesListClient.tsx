"use client";

import React, { useState } from "react";
import { 
  FileText, 
  Search, 
  Plus, 
  ExternalLink, 
  Edit3, 
  Globe,
  Clock,
  Layout,
  X,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/shared/Toast";

interface PageWithCount {
  id: string;
  title: string;
  slug: string;
  updatedAt: Date | string;
  status: string;
  isVisible: boolean;
  _count: {
    sections: number;
  };
}

export default function PagesListClient({ initialPages }: { initialPages: PageWithCount[] }) {
  const { success: toastSuccess, error: toastError } = useToast();
  const [pages, setPages] = useState<PageWithCount[]>(initialPages);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const filteredPages = pages.filter(page => 
    page.title.toLowerCase().includes(search.toLowerCase()) || 
    page.slug.toLowerCase().includes(search.toLowerCase())
  );

  const toggleVisibility = async (id: string, currentVisible: boolean) => {
    try {
      const res = await fetch(`/api/admin/pages/${id}/visibility`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: !currentVisible }),
      });

      if (res.ok) {
        setPages(prev =>
          prev.map(p => (p.id === id ? { ...p, isVisible: !currentVisible } : p))
        );
        toastSuccess("Page visibility toggled successfully.");
        router.refresh();
      } else {
        toastError("Failed to update page visibility.");
      }
    } catch (error) {
      console.error(error);
      toastError("An error occurred while updating visibility.");
    }
  };

  const handleDeletePage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this page? This will permanently delete all associated sections.")) return;
    try {
      const res = await fetch(`/api/admin/pages/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPages(prev => prev.filter(p => p.id !== id));
        toastSuccess("Page deleted successfully.");
        router.refresh();
      } else {
        toastError("Failed to delete page.");
      }
    } catch (err) {
      console.error(err);
      toastError("Error deleting page");
    }
  };

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle, slug: newSlug }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/admin/pages/${data.slug || data.id}`);
        router.refresh();
      } else {
        toastError("Failed to create page. Slug might already exist.");
      }
    } catch (err) {
      console.error(err);
      toastError("Error creating page");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="admin-shell space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="admin-page-title">Pages</h1>
          <p className="admin-page-subtitle">Manage website content</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0f1523] text-white rounded-lg text-[13px] font-medium hover:bg-black transition-all"
        >
          <Plus size={16} />
          <span>+ New Page</span>
        </button>
      </div>

      <div className="space-y-3">
        {filteredPages.map((page) => (
          <div key={page.id} style={{
            background: '#ffffff',
            border: '1px solid #f0f2f8',
            borderRadius: '10px',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            position: 'relative'
          }} className="group admin-list-row">
            
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(193,0,10,0.08)',
              border: '1px solid rgba(193,0,10,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <FileText color="#c1000a" style={{width: '15px', height: '15px', opacity: 0.7}} />
            </div>

            <div className="flex-1 min-w-0 flex items-center gap-4">
              <div>
                <div style={{fontSize: '15px', fontWeight: 600, color: '#0f1523', fontFamily: 'var(--font-admin)'}}>
                  {page.title}
                </div>
                <div className="slug" style={{fontSize: '11px', color: '#8a9ab5'}}>
                  ⊘ /{page.slug}
                </div>
              </div>
            </div>

            <div>
              {page.status === 'PUBLISHED' ? (
                <span style={{
                  fontSize: '11px', fontWeight: 600, color: '#059669',
                  background: 'rgba(16,185,129,0.08)', padding: '4px 10px',
                  borderRadius: '20px'
                }}>
                  • {page.status}
                </span>
              ) : (
                <span style={{
                  fontSize: '11px', fontWeight: 600, color: '#d97706',
                  background: 'rgba(245,158,11,0.08)', padding: '4px 10px',
                  borderRadius: '20px'
                }}>
                  • {page.status}
                </span>
              )}
            </div>

            <div>
              <span style={{
                fontSize: '11px', fontWeight: 600, color: '#059669',
                background: 'rgba(16,185,129,0.08)', padding: '4px 10px',
                borderRadius: '20px'
              }}>
                • {page._count.sections} SECTIONS
              </span>
            </div>

            <div>
              <button
                onClick={() => toggleVisibility(page.id, page.isVisible)}
                className={`p-2 rounded-xl transition-all ${
                  page.isVisible 
                    ? 'text-green-500 hover:bg-green-50' 
                    : 'text-slate-300 hover:bg-slate-100'
                }`}
                title={page.isVisible ? "Visible on page" : "Hidden from page"}
              >
                {page.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Link 
                href={`/${page.slug}`} 
                target="_blank"
                style={{
                  width: '32px', height: '32px', border: '1px solid #f0f2f8', borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                className="hover:bg-[#f0f2f8] transition-colors"
              >
                <ExternalLink style={{width: '14px', height: '14px', opacity: 0.5}} color="#0f1523" />
              </Link>
              <Link 
                href={`/admin/pages/${page.slug || page.id}`} 
                style={{
                  width: '32px', height: '32px', border: '1px solid #f0f2f8', borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                className="hover:bg-[#f0f2f8] transition-colors"
              >
                <Edit3 style={{width: '14px', height: '14px', opacity: 0.5}} color="#0f1523" />
              </Link>
              <button 
                onClick={() => handleDeletePage(page.id)}
                style={{
                  width: '32px', height: '32px', border: '1px solid #f0f2f8', borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                className="hover:bg-red-50 hover:border-red-100 transition-colors text-red-600"
                title="Delete Page"
              >
                <Trash2 style={{width: '14px', height: '14px', opacity: 0.5}} color="#c1000a" />
              </button>
            </div>
          </div>
        ))}
        {filteredPages.length === 0 && (
          <div className="p-10 text-center text-[#8a9ab5] text-[13px] border border-[#f0f2f8] rounded-[10px] bg-white">
            No pages found.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <h3 className="text-[15px] font-bold text-[#0f1523]">New Page</h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleCreatePage} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Title</label>
                <input 
                  autoFocus
                  required
                  type="text" 
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                    if (!newSlug) setNewSlug(e.target.value.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, ""));
                  }}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#0f1523] text-[13px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Slug</label>
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden focus-within:border-[#0f1523]">
                  <span className="px-3 text-slate-400 font-mono text-[13px] bg-slate-50 border-r border-slate-200">/</span>
                  <input 
                    required
                    type="text" 
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                    className="w-full px-3 py-2 outline-none text-[13px] font-mono text-slate-700"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-[13px] font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button 
                  disabled={isCreating}
                  className="px-4 py-2 bg-[#0f1523] text-white text-[13px] font-medium rounded-lg hover:bg-black transition-all disabled:opacity-50"
                >
                  {isCreating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
