"use client";

import React, { useState } from "react";
import { useToast } from "@/components/shared/Toast";
import { Edit3, User, Shield, X, Check, Minus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Permission, ROLE_PERMISSIONS, Role } from "@/lib/permissions";

const ALL_PERMISSIONS: { key: Permission, label: string }[] = [
  { key: "manage_users", label: "Manage Users" },
  { key: "manage_roles", label: "Manage Roles & Permissions" },
  { key: "manage_settings", label: "Manage Global Settings" },
  { key: "manage_menu", label: "Manage Site Menu" },
  { key: "publish_content", label: "Publish Content" },
  { key: "edit_content", label: "Edit Content" },
  { key: "delete_content", label: "Delete Content" },
  { key: "view_analytics", label: "View Analytics" },
];

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: Record<string, boolean> | null;
  isActive: boolean;
}

export function PermissionsClient({ users: initialUsers }: { users: AdminUser[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editedRole, setEditedRole] = useState<Role>("EDITOR");
  const [editedPerms, setEditedPerms] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const { success, error } = useToast();
  const router = useRouter();

  const handleEdit = (u: AdminUser) => {
    setEditingUser(u);
    setEditedRole(u.role as Role || "EDITOR");
    setEditedPerms(u.permissions || {});
  };

  const handlePermChange = (key: string, value: boolean | null) => {
    setEditedPerms(prev => {
      const next = { ...prev };
      if (value === null) {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}/permissions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: editedRole,
          permissions: Object.keys(editedPerms).length > 0 ? editedPerms : null
        })
      });
      
      if (res.ok) {
        const updated = await res.json();
        setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
        success("Permissions updated successfully.");
        setEditingUser(null);
        router.refresh();
      } else {
        const err = await res.json();
        error(err.error || "Failed to update permissions.");
      }
    } catch (err) {
      console.error(err);
      error("An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-[#f0f2f8] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-[#f0f2f8] text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Overrides</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const overrideCount = u.permissions ? Object.keys(u.permissions).length : 0;
              return (
                <tr key={u.id} className="border-b border-[#f0f2f8] hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <User size={18} />
                      </div>
                      <div>
                        <div className="text-[14px] font-bold text-slate-800">{u.name}</div>
                        <div className="text-[12px] text-slate-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                      <Shield size={12} />
                      {u.role.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {overrideCount > 0 ? (
                      <span className="text-[12px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md">
                        {overrideCount} custom rule{overrideCount > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-[12px] text-slate-400 font-medium">Default</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleEdit(u)}
                      className="w-8 h-8 inline-flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-900 transition-all"
                    >
                      <Edit3 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-[16px] font-bold text-slate-900">Edit Access: {editingUser.name}</h3>
                <p className="text-[12px] text-slate-500">{editingUser.email}</p>
              </div>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-8 custom-scrollbar">
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Base Role</label>
                <div className="grid grid-cols-3 gap-3">
                  {["SUPER_ADMIN", "ADMIN", "EDITOR"].map(role => (
                    <button
                      key={role}
                      onClick={() => setEditedRole(role as Role)}
                      className={`py-3 px-4 rounded-xl border text-[13px] font-bold flex flex-col items-center gap-1 transition-all ${
                        editedRole === role 
                          ? "border-[#0f1523] bg-[#0f1523] text-white shadow-md" 
                          : "border-slate-200 text-slate-600 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <Shield size={16} className={editedRole === role ? "text-white" : "text-slate-400"} />
                      {role.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Granular Permissions</label>
                  <p className="text-[11px] text-slate-400 font-medium">Overrides base role</p>
                </div>
                
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {ALL_PERMISSIONS.map(p => {
                    const hasDefault = ROLE_PERMISSIONS[editedRole].includes(p.key);
                    const override = editedPerms[p.key];
                    const isAllowed = override === true || (override === undefined && hasDefault);
                    
                    return (
                      <div key={p.key} className="p-4 flex items-center justify-between bg-white hover:bg-slate-50/50 transition-colors">
                        <div>
                          <div className="text-[13px] font-bold text-slate-800">{p.label}</div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Default: <span className={hasDefault ? "text-emerald-600 font-medium" : "text-red-500 font-medium"}>
                              {hasDefault ? "Allowed" : "Denied"}
                            </span>
                          </div>
                        </div>
                        <div className="flex bg-slate-100 p-1 rounded-lg gap-1">
                          <button
                            onClick={() => handlePermChange(p.key, null)}
                            className={`px-3 py-1.5 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                              override === undefined 
                                ? "bg-white text-slate-700 shadow-sm" 
                                : "text-slate-500 hover:text-slate-700"
                            }`}
                          >
                            <Minus size={12} /> Default
                          </button>
                          <button
                            onClick={() => handlePermChange(p.key, true)}
                            className={`px-3 py-1.5 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                              override === true 
                                ? "bg-emerald-50 text-emerald-700 shadow-sm" 
                                : "text-slate-500 hover:text-emerald-600"
                            }`}
                          >
                            <Check size={12} /> Allow
                          </button>
                          <button
                            onClick={() => handlePermChange(p.key, false)}
                            className={`px-3 py-1.5 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                              override === false 
                                ? "bg-red-50 text-red-700 shadow-sm" 
                                : "text-slate-500 hover:text-red-600"
                            }`}
                          >
                            <X size={12} /> Deny
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setEditingUser(null)}
                className="px-5 py-2.5 rounded-lg text-[13px] font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 rounded-lg text-[13px] font-bold bg-[#0f1523] text-white hover:bg-black transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
