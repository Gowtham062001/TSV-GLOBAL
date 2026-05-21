"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit3, Save, X, ExternalLink, ArrowRight } from "lucide-react";
interface Redirect {
  id: string;
  from: string;
  to: string;
  type: number;
  isActive: boolean;
}
export default function RedirectsPage() {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newRedirect, setNewRedirect] = useState<Partial<Redirect>>({ from: "", to: "", type: 301, isActive: true });
  const [isAdding, setIsAdding] = useState(false);
  useEffect(() => {
    fetchRedirects();
  }, []);
  const fetchRedirects = async () => {
    try {
      const res = await fetch("/api/admin/redirects");
      const data = await res.json();
      setRedirects(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleCreate = async () => {
    try {
      const res = await fetch("/api/admin/redirects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRedirect),
      });
      if (res.ok) {
        fetchRedirects();
        setNewRedirect({ from: "", to: "", type: 301, isActive: true });
        setIsAdding(false);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleUpdate = async (redirect: Redirect) => {
    try {
      const res = await fetch("/api/admin/redirects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(redirect),
      });
      if (res.ok) {
        setEditingId(null);
        fetchRedirects();
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this redirect?")) return;
    try {
      const res = await fetch(`/api/admin/redirects?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchRedirects();
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Redirects Manager</h2>
          <p className="text-sm text-gray-500">Manage 301 and 302 URL redirects</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-[#c1000a] text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors flex items-center gap-2 shadow-lg"
        >
          <Plus size={20} /> Add Redirect
        </button>
      </div>
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Source Path</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Type</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Target URL</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isAdding && (
              <tr className="bg-blue-50/30">
                <td className="px-6 py-4">
                  <input 
                    type="text" 
                    value={newRedirect.from}
                    onChange={(e) => setNewRedirect({...newRedirect, from: e.target.value})}
                    placeholder="/old-path"
                    className="w-full px-3 py-1.5 border rounded-lg text-sm"
                  />
                </td>
                <td className="px-6 py-4 text-center">
                  <select 
                    value={newRedirect.type}
                    onChange={(e) => setNewRedirect({...newRedirect, type: parseInt(e.target.value)})}
                    className="px-2 py-1.5 border rounded-lg text-sm bg-white"
                  >
                    <option value={301}>301</option>
                    <option value={302}>302</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <input 
                    type="text" 
                    value={newRedirect.to}
                    onChange={(e) => setNewRedirect({...newRedirect, to: e.target.value})}
                    placeholder="/new-path or https://..."
                    className="w-full px-3 py-1.5 border rounded-lg text-sm"
                  />
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-[10px] font-bold text-blue-600 uppercase">New</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={handleCreate} className="p-2 text-green-600 hover:bg-green-100 rounded-lg">
                      <Save size={18} />
                    </button>
                    <button onClick={() => setIsAdding(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg">
                      <X size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            )}
            {redirects.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4 font-mono text-sm text-gray-600">
                  {editingId === r.id ? (
                    <input 
                      type="text" 
                      value={r.from}
                      onChange={(e) => setRedirects(redirects.map(rd => rd.id === r.id ? {...rd, from: e.target.value} : rd))}
                      className="w-full px-3 py-1 border rounded-lg"
                    />
                  ) : (
                    r.from
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  {editingId === r.id ? (
                    <select 
                      value={r.type}
                      onChange={(e) => setRedirects(redirects.map(rd => rd.id === r.id ? {...rd, type: parseInt(e.target.value)} : rd))}
                      className="px-2 py-1 border rounded-lg bg-white"
                    >
                      <option value={301}>301</option>
                      <option value={302}>302</option>
                    </select>
                  ) : (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.type === 301 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {r.type}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === r.id ? (
                    <input 
                      type="text" 
                      value={r.to}
                      onChange={(e) => setRedirects(redirects.map(rd => rd.id === r.id ? {...rd, to: e.target.value} : rd))}
                      className="w-full px-3 py-1 border rounded-lg"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-gray-900 font-medium">
                      <ArrowRight size={14} className="text-gray-300" /> {r.to}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <button 
                    onClick={() => handleUpdate({...r, isActive: !r.isActive})}
                    className={`w-10 h-5 rounded-full relative transition-colors ${r.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${r.isActive ? 'left-5.5' : 'left-0.5'}`} style={{left: r.isActive ? '22px' : '2px'}}></div>
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {editingId === r.id ? (
                      <button onClick={() => handleUpdate(r)} className="p-2 text-green-600 hover:bg-green-100 rounded-lg">
                        <Save size={18} />
                      </button>
                    ) : (
                      <button onClick={() => setEditingId(r.id)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit3 size={18} />
                      </button>
                    )}
                    <button onClick={() => handleDelete(r.id)} className="p-2 text-gray-400 hover:text-[#c1000a] hover:bg-red-50 rounded-lg">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!isLoading && redirects.length === 0 && !isAdding && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                  No redirects configured yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
