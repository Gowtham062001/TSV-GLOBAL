"use client";

import React, { useState, useEffect } from "react";
import { Edit, Trash2, Eye, Search, List, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useToast } from "@/components/shared/Toast";
import { useRouter } from "next/navigation";

interface CaseStudy {
  id: string;
  title: string;
  slug: string;
  client: string | null;
  industry: string | null;
  status: string;
  isVisible: boolean;
  createdAt: Date | string;
  images: any;
}

export function CaseStudiesListClient({ initialCases }: { initialCases: any[] }) {
  const { success, error: toastError } = useToast();
  const router = useRouter();
  const [cases, setCases] = useState<CaseStudy[]>(initialCases);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  useEffect(() => {
    const saved = localStorage.getItem("case_studies_view_mode") as "list" | "grid";
    if (saved === "list" || saved === "grid") {
      setViewMode(saved);
    }
  }, []);

  const handleViewModeChange = (mode: "list" | "grid") => {
    setViewMode(mode);
    localStorage.setItem("case_studies_view_mode", mode);
  };

  const filtered = cases.filter(cs => 
    cs.title.toLowerCase().includes(search.toLowerCase()) ||
    cs.slug.toLowerCase().includes(search.toLowerCase()) ||
    (cs.client || "").toLowerCase().includes(search.toLowerCase()) ||
    (cs.industry || "").toLowerCase().includes(search.toLowerCase())
  );

  const deleteCaseStudy = async (id: string) => {
    if (!confirm("Are you sure you want to delete this case study?")) return;

    try {
      const res = await fetch(`/api/admin/case-studies/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setCases(prev => prev.filter(c => c.id !== id));
        success("Case study deleted successfully.");
        router.refresh();
      } else {
        toastError("Failed to delete case study.");
      }
    } catch (error) {
      console.error(error);
      toastError("An error occurred while deleting the case study.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Search & Layout Toggle Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-grow">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a9ab5]" />
          <input
            type="text"
            placeholder="Search case studies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#cbd5e1] rounded-lg outline-none focus:border-[#0f1523] text-[13px]"
          />
        </div>
        <div className="flex border border-[#cbd5e1] rounded-lg p-0.5 bg-white shrink-0">
          <button
            onClick={() => handleViewModeChange('list')}
            className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-[#0f1523] text-white' : 'text-[#8a9ab5] hover:text-[#0f1523]'}`}
            title="List View"
          >
            <List size={16} />
          </button>
          <button
            onClick={() => handleViewModeChange('grid')}
            className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-[#0f1523] text-white' : 'text-[#8a9ab5] hover:text-[#0f1523]'}`}
            title="Grid View"
          >
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      {viewMode === "list" ? (
        <div className="space-y-2">
          {filtered.map((cs) => {
            const thumbSrc = Array.isArray(cs.images) && cs.images.length > 0
              ? (typeof cs.images[0] === 'string' ? cs.images[0] : cs.images[0]?.url)
              : '/assets/img/logo.png';

            return (
              <div
                key={cs.id}
                className="group admin-list-row"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 20px',
                  background: '#fff',
                  border: '2px solid #cbd5e1',
                  borderRadius: 10,
                  transition: 'border-color 0.15s'
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#0f1523')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#cbd5e1')}
              >
                {/* Thumbnail */}
                <div className="admin-list-thumb" style={{
                  width: 40, height: 40, borderRadius: 8, overflow: 'hidden',
                  flexShrink: 0, background: '#f0f2f8', border: '1px solid #e2e8f0'
                }}>
                  <img
                    src={thumbSrc || '/assets/img/logo.png'}
                    alt={cs.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={e => { (e.target as HTMLImageElement).src = '/assets/img/logo.png'; }}
                  />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: 14, fontWeight: 600, color: '#0f1523',
                    margin: '0 0 3px', overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                  }}>
                    {cs.title}
                  </p>
                  <p style={{ fontSize: 11, color: '#8a9ab5', margin: 0, fontFamily: 'monospace' }}>
                    /case-studies/{cs.slug}
                  </p>
                </div>

                {/* Client / Industry badge */}
                {(cs.client || cs.industry) && (
                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    {cs.client && (
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#0f1523' }}>{cs.client}</div>
                    )}
                    {cs.industry && (
                      <div style={{ fontSize: 10, color: '#8a9ab5' }}>{cs.industry}</div>
                    )}
                  </div>
                )}

                {/* Status */}
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '3px 9px',
                  borderRadius: 20, flexShrink: 0,
                  background: cs.status === 'PUBLISHED' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                  color: cs.status === 'PUBLISHED' ? '#059669' : '#d97706',
                  textTransform: 'uppercase'
                }}>
                  {cs.status}
                </span>

                {/* Date */}
                <span className="admin-list-meta" suppressHydrationWarning style={{
                  fontSize: 12, color: '#8a9ab5', flexShrink: 0, minWidth: 80, textAlign: 'right'
                }}>
                  {format(new Date(cs.createdAt), "MMM d, yyyy")}
                </span>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <a
                    href={`/case-studies/${cs.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ width: 32, height: 32, border: '1px solid #f0f2f8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', background: '#fff' }}
                    className="hover:bg-[#f0f2f8]"
                    title="View live page"
                  >
                    <Eye size={14} style={{ opacity: 0.5 }} color="#0f1523" />
                  </a>
                  <Link
                    href={`/admin/case-studies/${cs.slug || cs.id}`}
                    style={{ width: 32, height: 32, border: '1px solid #f0f2f8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    className="hover:bg-[#f0f2f8]"
                    title="Edit"
                  >
                    <Edit size={14} style={{ opacity: 0.5 }} color="#0f1523" />
                  </Link>
                  <button
                    onClick={() => deleteCaseStudy(cs.id)}
                    style={{ width: 32, height: 32, border: '1px solid #f0f2f8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', cursor: 'pointer' }}
                    className="hover:bg-red-50 hover:border-red-100"
                    title="Delete"
                  >
                    <Trash2 size={14} style={{ opacity: 0.5 }} color="#c1000a" />
                  </button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="p-10 text-center text-[#8a9ab5] text-[13px] border border-[#f0f2f8] rounded-[10px] bg-white">
              No case studies found.
            </div>
          )}
        </div>
      ) : (
        <div className="admin-grid-layout">
          {filtered.map((cs) => {
            const thumbSrc = Array.isArray(cs.images) && cs.images.length > 0
              ? (typeof cs.images[0] === 'string' ? cs.images[0] : cs.images[0]?.url)
              : '/assets/img/logo.png';

            return (
              <div
                key={cs.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  background: '#fff',
                  border: '2px solid #cbd5e1',
                  borderRadius: 10,
                  overflow: 'hidden',
                  transition: 'border-color 0.15s'
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#0f1523')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#cbd5e1')}
              >
                {/* Thumbnail Container */}
                <div style={{ position: 'relative', width: '100%', height: 140, background: '#f0f2f8', overflow: 'hidden' }}>
                  <img
                     src={thumbSrc || '/assets/img/logo.png'}
                     alt={cs.title}
                     style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                     onError={e => { (e.target as HTMLImageElement).src = '/assets/img/logo.png'; }}
                  />
                  {cs.industry && (
                    <span style={{
                      position: 'absolute', top: 8, right: 8,
                      fontSize: 9, fontWeight: 700, padding: '2px 6px',
                      borderRadius: 20, background: '#0f1523',
                      color: '#fff', textTransform: 'uppercase',
                      letterSpacing: '0.4px'
                    }}>
                      {cs.industry}
                    </span>
                  )}
                </div>

                {/* Details Body */}
                <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1, minHeight: 64 }}>
                    <p style={{
                      fontSize: 14, fontWeight: 600, color: '#0f1523',
                      margin: '0 0 4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4'
                    }}>
                      {cs.title}
                    </p>
                    <p style={{ fontSize: 11, color: '#8a9ab5', margin: '0 0 6px', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      /case-studies/{cs.slug}
                    </p>
                    {cs.client && (
                      <div style={{ fontSize: 11, color: '#0f1523', fontWeight: 500 }}>
                        Client: <span className="font-bold">{cs.client}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#f0f2f8]">
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: '2px 8px',
                      borderRadius: 20,
                      background: cs.status === 'PUBLISHED' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                      color: cs.status === 'PUBLISHED' ? '#059669' : '#d97706',
                      textTransform: 'uppercase'
                    }}>
                      {cs.status}
                    </span>
                    <span suppressHydrationWarning style={{ fontSize: 11, color: '#8a9ab5' }}>
                      {format(new Date(cs.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div style={{ display: 'flex', gap: 6, padding: '10px 16px', background: '#fcfdfe', borderTop: '1px solid #f0f2f8' }}>
                  <a
                    href={`/case-studies/${cs.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ flex: 1, height: 30, border: '1px solid #f0f2f8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', background: '#fff', gap: 4 }}
                    className="hover:bg-[#f0f2f8]"
                    title="View live page"
                  >
                    <Eye size={12} style={{ opacity: 0.5 }} color="#0f1523" />
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#0f1523' }}>View</span>
                  </a>
                  <Link
                    href={`/admin/case-studies/${cs.slug || cs.id}`}
                    style={{ flex: 1, height: 30, border: '1px solid #f0f2f8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                    className="hover:bg-[#f0f2f8]"
                    title="Edit"
                  >
                    <Edit size={12} style={{ opacity: 0.5 }} color="#0f1523" />
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#0f1523' }}>Edit</span>
                  </Link>
                  <button
                    onClick={() => deleteCaseStudy(cs.id)}
                    style={{ width: 30, height: 30, border: '1px solid #f0f2f8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', cursor: 'pointer' }}
                    className="hover:bg-red-50 hover:border-red-100 shrink-0"
                    title="Delete"
                  >
                    <Trash2 size={12} style={{ opacity: 0.5 }} color="#c1000a" />
                  </button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full p-10 text-center text-[#8a9ab5] text-[13px] border border-[#f0f2f8] rounded-[10px] bg-white">
              No case studies found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
