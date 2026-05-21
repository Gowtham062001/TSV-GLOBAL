"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Key, Save, X, Copy, Check, Eye, EyeOff, ShieldCheck, Calendar, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import ForbiddenScreen from "@/components/admin/ForbiddenScreen";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}
export default function ApiKeysPage() {
  const { data: session, status } = useSession();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [newKey, setNewKey] = useState<Partial<ApiKey>>({
    name: "",
    permissions: ["read"],
  });
  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.role === "SUPER_ADMIN") {
      fetchKeys();
    } else if (status !== "loading") {
      setIsLoading(false);
    }
  }, [status, session]);
  const fetchKeys = async () => {
    try {
      const res = await fetch("/api/admin/api-keys");
      const data = await res.json();
      setKeys(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleCreate = async () => {
    try {
      const res = await fetch("/api/admin/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newKey),
      });
      if (res.ok) {
        fetchKeys();
        setIsAdding(false);
        setNewKey({ name: "", permissions: ["read"] });
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Revoke this API key? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/api-keys?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchKeys();
    } catch (error) {
      console.error(error);
    }
  };
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  const toggleVisibility = (id: string) => {
    setVisibleKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };
  if (status === "loading") {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-[#0f1523]" size={24} />
      </div>
    );
  }

  if (session?.user && (session.user as any).role !== "SUPER_ADMIN") {
    return <ForbiddenScreen />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">API Access Keys</h2>
          <p className="text-sm text-gray-500">Secure keys for external data access</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-[#c1000a] text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors flex items-center gap-2 shadow-lg"
        >
          <Plus size={20} /> Generate New Key
        </button>
      </div>
      <div className="grid grid-cols-1 gap-6">
        {isAdding && (
          <div className="bg-white p-8 rounded-2xl border-2 border-blue-100 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Key size={18} className="text-blue-600" /> Key Configuration
              </h3>
              <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Key Name / Description</label>
                  <input 
                    type="text" 
                    value={newKey.name}
                    onChange={(e) => setNewKey({...newKey, name: e.target.value})}
                    placeholder="e.g. Mobile App API"
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Expiration Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 text-gray-400" size={16} />
                    <input 
                      type="date" 
                      onChange={(e) => setNewKey({...newKey, expiresAt: e.target.value})}
                      className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-xs font-bold text-gray-500 uppercase">Permissions</label>
                <div className="grid grid-cols-2 gap-3">
                  {["read", "write", "delete", "admin"].map(perm => (
                    <label key={perm} className="flex items-center gap-3 p-3 border rounded-xl hover:bg-gray-50 cursor-pointer transition-colors capitalize">
                      <input 
                        type="checkbox" 
                        checked={newKey.permissions?.includes(perm)}
                        onChange={() => {
                          const perms = newKey.permissions || [];
                          const next = perms.includes(perm) ? perms.filter(p => p !== perm) : [...perms, perm];
                          setNewKey({...newKey, permissions: next});
                        }}
                        className="w-4 h-4 rounded text-blue-600"
                      />
                      <span className="text-sm font-medium">{perm}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t gap-4">
              <button onClick={() => setIsAdding(false)} className="px-6 py-2 text-gray-500 font-bold">Cancel</button>
              <button onClick={handleCreate} className="bg-[#1a1a2e] text-white px-8 py-2 rounded-xl font-bold hover:bg-opacity-90 transition-all">
                Generate Key
              </button>
            </div>
          </div>
        )}
        {keys.map((k) => (
          <div key={k.id} className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-gray-900">{k.name}</h3>
                  {k.expiresAt && new Date(k.expiresAt) < new Date() ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-700">Expired</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-100 text-green-700">Active</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-4 bg-gray-50 p-3 rounded-xl border border-gray-100 group-hover:border-blue-200 transition-colors">
                  <div className="flex-1 font-mono text-sm overflow-hidden truncate text-gray-600">
                    {visibleKeys[k.id] ? k.key : k.key.substring(0, 12) + "••••••••••••••••"}
                  </div>
                  <div className="flex items-center gap-1 border-l pl-2 ml-2">
                    <button 
                      onClick={() => toggleVisibility(k.id)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 rounded-md"
                    >
                      {visibleKeys[k.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button 
                      onClick={() => copyToClipboard(k.key, k.id)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 rounded-md relative"
                    >
                      {copiedId === k.id ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-6 mt-4">
                  <div className="flex gap-1.5">
                    {k.permissions.map(p => (
                      <span key={p} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-bold uppercase border border-blue-100">
                        {p}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1"><ShieldCheck size={12} /> Created {new Date(k.createdAt).toLocaleDateString()}</span>
                    {k.expiresAt && <span className="flex items-center gap-1"><Calendar size={12} /> Expires {new Date(k.expiresAt).toLocaleDateString()}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleDelete(k.id)}
                  className="p-2 text-gray-400 hover:text-[#c1000a] hover:bg-red-50 rounded-lg transition-all"
                  title="Revoke Key"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {!isLoading && keys.length === 0 && !isAdding && (
          <div className="p-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <Key className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-400 italic">No API keys generated. Securely connect your data to other apps.</p>
          </div>
        )}
      </div>
    </div>
  );
}
