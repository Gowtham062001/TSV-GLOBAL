"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { User, LogOut, Settings, UserCircle, ChevronDown } from "lucide-react";
import Link from "next/link";

export function ProfileDropdown() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dbUser, setDbUser] = useState<any>(null);

  useEffect(() => {
    async function fetchLatest() {
      try {
        const res = await fetch("/api/admin/profile");
        if (res.ok) {
          const data = await res.json();
          setDbUser(data);
        }
      } catch (e) {
        console.error(e);
      }
    }
    if (session) fetchLatest();
  }, [session]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session) return null;

  const user = (session?.user as any) || {};
  const displayName = dbUser?.name || user?.name || "Administrator";
  const displayEmail = dbUser?.email || user?.email;
  const displayRole = dbUser?.role || user?.role || "Admin";
  const displayImage = dbUser?.avatar || user?.image;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-4 group cursor-pointer outline-none font-inter"
      >
        <div className="text-right hidden sm:block">
          <p className="text-sm font-extrabold text-slate-900 group-hover:text-[#c1000a] transition-colors font-outfit tracking-tight">
            {displayName}
          </p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] font-outfit">
            {displayRole}
          </p>
        </div>
        
        <div className={`w-12 h-12 rounded-[1rem] flex items-center justify-center transition-all duration-500 shadow-sm border-2 ${
          isOpen ? "bg-[#c1000a] text-white border-[#c1000a] scale-110 shadow-red-900/10" : "bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100 group-hover:border-[#c1000a]/20"
        }`}>
          {displayImage ? (
            <img src={displayImage} alt={displayName} className="w-full h-full object-cover rounded-[0.85rem]" />
          ) : (
            <User size={22} />
          )}
        </div>
        <ChevronDown size={14} className={`text-slate-300 transition-transform duration-500 ${isOpen ? "rotate-180 text-[#c1000a]" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-4 w-72 bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 py-3 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="px-6 py-4 border-b border-slate-50 mb-3 bg-slate-50/50">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-1 font-outfit">Identity Synchronized</p>
            <p className="text-sm font-bold text-slate-900 truncate tracking-tight font-outfit">{displayEmail}</p>
          </div>

          <div className="px-3 space-y-1">
            <Link 
              href="/admin/settings/profile"
              className="flex items-center gap-4 px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-600 hover:bg-red-50 hover:text-[#c1000a] rounded-xl transition-all font-outfit"
              onClick={() => setIsOpen(false)}
            >
              <UserCircle size={18} />
              <span>Update Profile</span>
            </Link>

            <Link 
              href="/admin/settings"
              className="flex items-center gap-4 px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-600 hover:bg-red-50 hover:text-[#c1000a] rounded-xl transition-all font-outfit"
              onClick={() => setIsOpen(false)}
            >
              <Settings size={18} />
              <span>Account Settings</span>
            </Link>
          </div>

          <div className="h-[1px] bg-slate-50 my-3 mx-4"></div>

          <div className="px-3">
            <button 
              onClick={async () => {
                setIsOpen(false);
                await signOut({ redirect: true, callbackUrl: "/admin/login" });
                // Fallback redirect if signOut doesn't trigger it
                window.location.href = "/admin/login";
              }}
              className="w-full flex items-center gap-4 px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-xl transition-all text-left font-outfit"
            >
              <LogOut size={18} />
              <span>Sign Out Protocol</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
