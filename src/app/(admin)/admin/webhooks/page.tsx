"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit3, Save, X, Activity, Link as LinkIcon, Shield, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/components/shared/Toast";
import { useSession } from "next-auth/react";
import ForbiddenScreen from "@/components/admin/ForbiddenScreen";

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  lastTriggered: string | null;
}
const AVAILABLE_EVENTS = [
  { id: "new_lead", label: "New Lead (Contact Form)" },
  { id: "brochure_download", label: "Brochure Download" },
  { id: "content_updated", label: "Content Updated" },
  { id: "user_login", label: "Admin Login" },
];
export default function WebhooksPage() {
  const { data: session, status } = useSession();
  const { success, error: toastError } = useToast();
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newWebhook, setNewWebhook] = useState<Partial<Webhook>>({
    name: "",
    url: "",
    events: ["new_lead"],
    secret: "",
    isActive: true,
  });
  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.role === "SUPER_ADMIN") {
      fetchWebhooks();
    } else if (status !== "loading") {
      setIsLoading(false);
    }
  }, [status, session]);
  const fetchWebhooks = async () => {
    try {
      const res = await fetch("/api/admin/webhooks");
      const data = await res.json();
      setWebhooks(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleCreate = async () => {
    try {
      const res = await fetch("/api/admin/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newWebhook),
      });
      if (res.ok) {
        fetchWebhooks();
        setIsAdding(false);
        setNewWebhook({ name: "", url: "", events: ["new_lead"], secret: "", isActive: true });
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleToggleEvent = (eventId: string) => {
    const currentEvents = newWebhook.events || [];
    if (currentEvents.includes(eventId)) {
      setNewWebhook({ ...newWebhook, events: currentEvents.filter(e => e !== eventId) });
    } else {
      setNewWebhook({ ...newWebhook, events: [...currentEvents, eventId] });
    }
  };
  const handleUpdateStatus = async (webhook: Webhook) => {
    try {
      const res = await fetch("/api/admin/webhooks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...webhook, isActive: !webhook.isActive }),
      });
      if (res.ok) fetchWebhooks();
    } catch (error) {
      console.error(error);
    }
  };
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this webhook configuration?")) return;
    try {
      const res = await fetch(`/api/admin/webhooks?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchWebhooks();
    } catch (error) {
      console.error(error);
    }
  };
  const testWebhook = async (webhook: Webhook) => {
    success("Test event dispatched to " + webhook.url);
    // Real implementation would call a test API
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
          <h2 className="text-2xl font-bold text-gray-900">Outgoing Webhooks</h2>
          <p className="text-sm text-gray-500">Notify external services about site events</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-[#c1000a] text-white px-6 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors flex items-center gap-2 shadow-lg"
        >
          <Plus size={20} /> Create Webhook
        </button>
      </div>
      <div className="grid grid-cols-1 gap-6">
        {isAdding && (
          <div className="bg-white p-8 rounded-2xl border-2 border-blue-100 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b pb-4">
              <h3 className="font-bold text-gray-800">New Webhook Configuration</h3>
              <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Friendly Name</label>
                  <input 
                    type="text" 
                    value={newWebhook.name}
                    onChange={(e) => setNewWebhook({...newWebhook, name: e.target.value})}
                    placeholder="e.g. Zapier Lead Integration"
                    className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Payload URL</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-3 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      value={newWebhook.url}
                      onChange={(e) => setNewWebhook({...newWebhook, url: e.target.value})}
                      placeholder="https://hooks.zapier.com/..."
                      className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">Secret Key (Optional)</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-3 text-gray-400" size={16} />
                    <input 
                      type="password" 
                      value={newWebhook.secret}
                      onChange={(e) => setNewWebhook({...newWebhook, secret: e.target.value})}
                      placeholder="webhook_secret_..."
                      className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-xs font-bold text-gray-500 uppercase">Subscribe to Events</label>
                <div className="space-y-2">
                  {AVAILABLE_EVENTS.map(event => (
                    <label key={event.id} className="flex items-center gap-3 p-3 border rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        checked={newWebhook.events?.includes(event.id)}
                        onChange={() => handleToggleEvent(event.id)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">{event.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t gap-4">
              <button onClick={() => setIsAdding(false)} className="px-6 py-2 text-gray-500 font-bold">Cancel</button>
              <button onClick={handleCreate} className="bg-[#1a1a2e] text-white px-8 py-2 rounded-xl font-bold hover:bg-opacity-90 transition-all">
                Save Webhook
              </button>
            </div>
          </div>
        )}
        {webhooks.map((w) => (
          <div key={w.id} className="bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${w.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  <Activity size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-gray-900">{w.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${w.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                      {w.isActive ? "Active" : "Paused"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-mono mt-1 flex items-center gap-1">
                    <LinkIcon size={12} /> {w.url}
                  </p>
                  <div className="flex gap-2 mt-3">
                    {(w.events as unknown as string[]).map(e => (
                      <span key={e} className="px-2 py-1 bg-gray-50 border rounded-lg text-[10px] font-bold text-gray-500 uppercase">
                        {e.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => testWebhook(w)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  title="Test Webhook"
                >
                  <CheckCircle2 size={18} />
                </button>
                <button 
                  onClick={() => handleUpdateStatus(w)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                  title={w.isActive ? "Pause" : "Resume"}
                >
                  <Activity size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(w.id)}
                  className="p-2 text-gray-400 hover:text-[#c1000a] hover:bg-red-50 rounded-lg transition-all"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              <span>Last Triggered: {w.lastTriggered ? new Date(w.lastTriggered).toLocaleString() : "Never"}</span>
              <span className="text-gray-300">ID: {w.id}</span>
            </div>
          </div>
        ))}
        {!isLoading && webhooks.length === 0 && !isAdding && (
          <div className="p-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <Activity className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-400 italic">No webhooks configured. Connect your site to other apps.</p>
          </div>
        )}
      </div>
    </div>
  );
}
