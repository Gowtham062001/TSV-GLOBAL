"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { User, Mail, Lock, Camera, Save, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { MediaSelector } from "@/components/admin/MediaSelector";
import { useToast } from "@/components/shared/Toast";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const { success, error: toastError } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    avatar: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/admin/profile");
      const data = await res.json();
      if (res.ok) {
        setFormData((prev) => ({
          ...prev,
          name: data.name || "",
          email: data.email || "",
          avatar: data.avatar || "",
        }));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toastError("New passwords do not match");
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          avatar: formData.avatar,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        success("Profile updated successfully!");
        // Update next-auth session
        await update({
          ...session,
          user: {
            ...session?.user,
            name: data.name,
            email: data.email,
            image: data.avatar,
          },
        });
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      } else {
        toastError(data.error || "Failed to update profile");
      }
    } catch (error) {
      toastError("An error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-[#c1000a]" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
        <p className="text-sm text-gray-500">Manage your personal information and security settings</p>
      </div>



      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Avatar Upload */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
            <h3 className="font-bold text-gray-800 border-b pb-4">Profile Photo</h3>
            
            <div className="flex flex-col items-center gap-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-3xl bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden border-2 border-dashed border-gray-200 group-hover:border-[#c1000a] transition-all">
                  {formData.avatar ? (
                    <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={48} />
                  )}
                </div>
              </div>
              
              <MediaSelector 
                value={formData.avatar}
                onChange={(url) => setFormData({ ...formData, avatar: url })}
                label="Change Avatar"
              />
              <p className="text-[10px] text-gray-400 text-center font-medium uppercase tracking-widest leading-relaxed">
                Recommended: Square image<br />Min 400x400px
              </p>
            </div>
          </div>
        </div>

        {/* Right: Info Forms */}
        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleSave} className="space-y-8">
            <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <User className="text-[#c1000a]" size={20} />
                Personal Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#c1000a]/10 focus:border-[#c1000a] outline-none transition-all"
                      placeholder="Your Name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#c1000a]/10 focus:border-[#c1000a] outline-none transition-all"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border shadow-sm space-y-6">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Lock className="text-[#c1000a]" size={20} />
                Security Settings
              </h3>

              <p className="text-sm text-gray-500 italic">Leave password fields blank if you don't want to change it.</p>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="password" 
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#c1000a]/10 focus:border-[#c1000a] outline-none transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">New Password</label>
                    <input 
                      type="password" 
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#c1000a]/10 focus:border-[#c1000a] outline-none transition-all"
                      placeholder="Minimum 8 characters"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Confirm New Password</label>
                    <input 
                      type="password" 
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#c1000a]/10 focus:border-[#c1000a] outline-none transition-all"
                      placeholder="Repeat new password"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button 
                type="submit"
                disabled={isSaving}
                className="bg-[#c1000a] text-white px-10 py-3 rounded-2xl font-bold hover:bg-red-700 disabled:opacity-50 transition-all shadow-xl shadow-red-900/10 flex items-center gap-2 active:scale-95"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
