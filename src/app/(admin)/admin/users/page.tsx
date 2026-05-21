"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Shield, 
  User as UserIcon, 
  Mail, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  ShieldAlert, 
  ShieldCheck, 
  UserPlus, 
  Send 
} from "lucide-react";
import { useToast } from "@/components/shared/Toast";
import { useSession } from "next-auth/react";
import ForbiddenScreen from "@/components/admin/ForbiddenScreen";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  avatar?: string;
  lastLogin: string | null;
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const { success, error: toastError } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [isTesting, setIsTesting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "EDITOR",
    isActive: true
  });

  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.role === "SUPER_ADMIN") {
      fetchUsers();
    } else if (status !== "loading") {
      setIsLoading(false);
    }
  }, [status, session]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) setUsers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingUser ? "PUT" : "POST";
    const body = editingUser ? { ...formData, id: editingUser.id } : formData;

    try {
      const res = await fetch("/api/admin/users", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingUser(null);
        setFormData({ name: "", email: "", password: "", role: "EDITOR", isActive: true });
        success(editingUser ? "User updated successfully" : "User invited successfully");
        fetchUsers();
      } else {
        const errData = await res.json();
        toastError(errData.error || "Operation failed");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "", // Don't show password
      role: user.role,
      isActive: user.isActive
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        success("User deleted successfully");
        fetchUsers();
      } else {
        const errData = await res.json();
        toastError(errData.error || "Delete failed");
      }
    } catch (error) {
      toastError("Failed to delete user");
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...user, isActive: !user.isActive }),
      });
      if (res.ok) {
        success(`User ${user.isActive ? "deactivated" : "activated"} successfully`);
        fetchUsers();
      } else {
        toastError("Failed to update user status");
      }
    } catch (error) {
      toastError("Network error occurred");
    }
  };

  const handleTestEmail = async () => {
    const password = prompt("Enter a password to show in the test email preview (optional):");
    
    setIsTesting(true);
    try {
      const res = await fetch("/api/admin/test-welcome-email", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (res.ok) {
        success(`Test email sent to media@tsvhomes.in ${password ? "with your provided password" : "(using default password)"}`);
      } else {
        toastError(data.error || data.detail || "Failed to send test email");
      }
    } catch (e) {
      toastError("Network error. Check connection.");
    } finally {
      setIsTesting(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "ALL" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

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
    <div className="admin-shell space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="admin-page-title">Users</h1>
          <p className="admin-page-subtitle">Manage administrative access and roles</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleTestEmail}
            disabled={isTesting}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#f0f2f8] text-[#0f1523] rounded-lg text-[13px] font-medium hover:bg-[#f8f9fb] transition-all disabled:opacity-50"
          >
            {isTesting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {isTesting ? "Sending..." : "Test Email"}
          </button>
          <button 
            onClick={() => {
              setEditingUser(null);
              setFormData({ name: "", email: "", password: "", role: "EDITOR", isActive: true });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#0f1523] text-white rounded-lg text-[13px] font-medium hover:bg-black transition-all"
          >
            <UserPlus size={16} />
            <span>Invite User</span>
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <input 
          type="text" 
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 bg-white border border-[#f0f2f8] rounded-lg outline-none focus:border-[#0f1523] text-[13px]"
        />
        <select 
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="w-40 px-4 py-2 bg-white border border-[#f0f2f8] rounded-lg outline-none focus:border-[#0f1523] text-[13px]"
        >
          <option value="ALL">All Roles</option>
          <option value="SUPER_ADMIN">Super Admins</option>
          <option value="ADMIN">Admins</option>
          <option value="EDITOR">Editors</option>
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-[#0f1523]" size={24} />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((u) => (
            <div key={u.id} style={{
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
                border: '1px solid rgba(193,0,10,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {u.avatar ? (
                  <img src={u.avatar} alt={u.name} style={{width:'100%', height:'100%', borderRadius:'50%', objectFit:'cover'}} />
                ) : (
                  <UserIcon style={{width: '15px', height: '15px', opacity: 0.65}} color="#c1000a" />
                )}
              </div>

              <div className="flex-1 min-w-0 flex items-center gap-4">
                <div>
                  <div style={{fontSize: '15px', fontWeight: 600, color: '#0f1523', fontFamily: 'var(--font-admin)'}}>
                    {u.name}
                  </div>
                  <div className="slug" style={{fontSize: '11px', color: '#8a9ab5'}}>
                    {u.email}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span style={{
                  fontSize: '11px', fontWeight: 600, 
                  color: u.role === 'ADMIN' ? '#7c3aed' : '#2563eb',
                  background: u.role === 'ADMIN' ? 'rgba(124,58,237,0.08)' : 'rgba(37,99,235,0.08)', 
                  padding: '4px 10px', borderRadius: '20px'
                }}>
                  {u.role}
                </span>

                <span style={{
                  fontSize: '11px', fontWeight: 600, 
                  color: u.isActive ? '#059669' : '#dc2626',
                  background: u.isActive ? 'rgba(16,185,129,0.08)' : 'rgba(220,38,38,0.08)', 
                  padding: '4px 10px', borderRadius: '20px'
                }}>
                  {u.isActive ? "ACTIVE" : "DISABLED"}
                </span>
              </div>

              <div className="flex items-center gap-2 border-l border-[#f0f2f8] pl-4 ml-2">
                <button 
                  onClick={() => handleToggleStatus(u)}
                  style={{
                    width: '32px', height: '32px', border: '1px solid #f0f2f8', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                  className="hover:bg-[#f0f2f8] transition-colors"
                  title={u.isActive ? "Deactivate User" : "Activate User"}
                >
                  {u.isActive ? <ShieldAlert style={{width: '14px', height: '14px', opacity: 0.5}} color="#0f1523" /> : <ShieldCheck style={{width: '14px', height: '14px', opacity: 0.5}} color="#0f1523" />}
                </button>
                <button 
                  onClick={() => handleEdit(u)}
                  style={{
                    width: '32px', height: '32px', border: '1px solid #f0f2f8', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                  className="hover:bg-[#f0f2f8] transition-colors"
                >
                  <Edit style={{width: '14px', height: '14px', opacity: 0.5}} color="#0f1523" />
                </button>
                <button 
                  onClick={() => handleDelete(u.id)}
                  style={{
                    width: '32px', height: '32px', border: '1px solid #f0f2f8', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                  className="hover:bg-red-50 hover:border-red-100 transition-colors"
                >
                  <Trash2 style={{width: '14px', height: '14px', opacity: 0.5}} color="#c1000a" />
                </button>
              </div>
            </div>
          ))}
          {!isLoading && filteredUsers.length === 0 && (
            <div className="p-10 text-center text-[#8a9ab5] text-[13px] border border-[#f0f2f8] rounded-[10px] bg-white">
              No users found.
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <h3 className="text-[15px] font-bold text-[#0f1523]">{editingUser ? "Edit User Profile" : "Invite New Member"}</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <XCircle size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                <input 
                  type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#0f1523] text-[13px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email</label>
                <input 
                  type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#0f1523] text-[13px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{editingUser ? "New Password (Optional)" : "Password"}</label>
                <input 
                  type="password" required={!editingUser} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#0f1523] text-[13px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Role</label>
                <select 
                  value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#0f1523] text-[13px]"
                >
                  <option value="SUPER_ADMIN">Super Administrator</option>
                  <option value="ADMIN">Administrator</option>
                  <option value="EDITOR">Editor</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="rounded border-slate-300"
                />
                <span className="text-[13px] font-medium text-slate-700">Account is Active</span>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-[13px] font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-all">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#0f1523] text-white text-[13px] font-medium rounded-lg hover:bg-black transition-all">{editingUser ? "Save Profile" : "Create User"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
