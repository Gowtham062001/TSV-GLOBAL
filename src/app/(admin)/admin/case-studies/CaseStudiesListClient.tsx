"use client";

import React, { useState } from "react";
import { Edit, Trash2, Layers, Eye, EyeOff } from "lucide-react";
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
}

export function CaseStudiesListClient({ initialCases }: { initialCases: any[] }) {
  const { success, error: toastError } = useToast();
  const router = useRouter();
  const [cases, setCases] = useState<CaseStudy[]>(initialCases);

  const toggleVisibility = async (id: string, currentVisible: boolean) => {
    try {
      const res = await fetch(`/api/admin/case-studies/${id}/visibility`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: !currentVisible }),
      });

      if (res.ok) {
        setCases(prev =>
          prev.map(c => (c.id === id ? { ...c, isVisible: !currentVisible } : c))
        );
        success("Case study visibility toggled successfully.");
        router.refresh();
      } else {
        toastError("Failed to update case study visibility.");
      }
    } catch (error) {
      console.error(error);
      toastError("An error occurred while updating visibility.");
    }
  };

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
    <div className="bg-white rounded-[10px] border border-[#f0f2f8] overflow-x-auto">
      <table className="w-full text-left admin-table">
        <thead>
          <tr>
            <th>TITLE</th>
            <th>CATEGORY</th>
            <th>STATUS</th>
            <th>VISIBILITY</th>
            <th>DATE</th>
            <th className="text-right">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((cs) => (
            <tr key={cs.id} className="hover:bg-[#f8f9fb] transition-all group">
              <td>
                <div className="flex items-center gap-[14px]">
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(193,0,10,0.08)',
                    border: '1px solid rgba(193,0,10,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Layers color="#c1000a" style={{width:'15px', height:'15px', opacity:0.65}} />
                  </div>
                  <div>
                    <div style={{fontSize: '15px', fontWeight: 600, color: '#0f1523', fontFamily: 'var(--font-admin)'}}>{cs.title}</div>
                    <div className="slug" style={{fontSize: '11px', color: '#8a9ab5'}}>⊘ /{cs.slug}</div>
                  </div>
                </div>
              </td>
              <td>
                <div style={{fontSize: '15px', color: '#0f1523'}}>{cs.client}</div>
                <div style={{fontSize: '11px', color: '#8a9ab5'}}>{cs.industry}</div>
              </td>
              <td>
                {cs.status === 'PUBLISHED' ? (
                  <span style={{
                    fontSize: '11px', fontWeight: 600, color: '#059669',
                    background: 'rgba(16,185,129,0.08)', padding: '4px 10px',
                    borderRadius: '20px'
                  }}>
                    • {cs.status}
                  </span>
                ) : (
                  <span style={{
                    fontSize: '11px', fontWeight: 600, color: '#d97706',
                    background: 'rgba(245,158,11,0.08)', padding: '4px 10px',
                    borderRadius: '20px'
                  }}>
                    • {cs.status}
                  </span>
                )}
              </td>
              <td>
                <button
                  onClick={() => toggleVisibility(cs.id, cs.isVisible)}
                  className={`p-2 rounded-xl transition-all ${
                    cs.isVisible 
                      ? 'text-green-500 hover:bg-green-50' 
                      : 'text-slate-300 hover:bg-slate-100'
                  }`}
                  title={cs.isVisible ? "Visible on page" : "Hidden from page"}
                >
                  {cs.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </td>
              <td className="admin-list-meta">
                {format(new Date(cs.createdAt), "MMM d, yyyy")}
              </td>
              <td className="text-right">
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <Link href={`/admin/case-studies/${cs.slug || cs.id}`} style={{
                    width: '32px', height: '32px', border: '1px solid #f0f2f8', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }} className="hover:bg-[#f0f2f8]">
                    <Edit size={14} style={{opacity: 0.5}} color="#0f1523" />
                  </Link>
                  <button 
                    onClick={() => deleteCaseStudy(cs.id)}
                    style={{
                      width: '32px', height: '32px', border: '1px solid #f0f2f8', borderRadius: '8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }} className="hover:bg-red-50 hover:border-red-100">
                    <Trash2 size={14} style={{opacity: 0.5}} color="#c1000a" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {cases.length === 0 && (
            <tr>
              <td colSpan={6} className="p-10 text-center text-[#8a9ab5] text-[13px]">
                No project narratives detected.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
