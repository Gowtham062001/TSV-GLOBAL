"use client";

import React from "react";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ForbiddenScreen() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white border border-[#f0f2f8] rounded-2xl shadow-sm max-w-2xl mx-auto my-12 animate-in fade-in duration-300">
      <div className="w-16 h-16 bg-red-50 text-[#c1000a] rounded-full flex items-center justify-center mb-6 border border-red-100">
        <ShieldAlert size={32} />
      </div>
      <h1 className="text-2xl font-extrabold text-[#0f1523] tracking-tight mb-2">
        Access Denied (403)
      </h1>
      <p className="text-[13px] text-slate-500 max-w-md mb-8 leading-relaxed">
        You do not have the required permissions to access this administrative module. 
        This section is restricted to Super Administrators only.
      </p>
      <div className="flex gap-4">
        <Link
          href="/admin"
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0f1523] text-white rounded-lg text-[13px] font-semibold hover:bg-black transition-all shadow-md"
        >
          <ArrowLeft size={15} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
