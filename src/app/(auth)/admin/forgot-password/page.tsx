"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/shared/Toast";

export default function ForgotPasswordPage() {
  const { success, error: toastError } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        success(data.message);
        setIsSent(true);
      } else {
        toastError(data.error || "Something went wrong");
      }
    } catch (error) {
      toastError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e] p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden p-10 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-8">
          <Link href="/admin/login">
            <Image 
              src="/img/logo.png" 
              alt="TSV Global Solutions" 
              width={200} 
              height={60} 
              className="mb-6 object-contain"
            />
          </Link>
          <h1 className="text-2xl font-bold text-[#1a1a2e]">Forgot Password?</h1>
          <p className="text-gray-400 text-sm mt-2 text-center">Enter your email address and we'll send you a link to reset your password.</p>
        </div>



        {!isSent ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#c1000a] focus:bg-white outline-none transition-all text-gray-800"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-[#c1000a] text-white py-4 rounded-2xl font-bold hover:bg-red-700 disabled:opacity-50 transition-all shadow-xl shadow-red-900/10 flex items-center justify-center gap-2 mt-4 active:scale-[0.98]"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>
        ) : (
          <div className="text-center mt-4">
             <Link 
              href="/admin/login"
              className="inline-flex items-center gap-2 text-[#c1000a] font-bold hover:underline"
            >
              Back to Login
            </Link>
          </div>
        )}

        <div className="mt-8 text-center pt-8 border-t border-gray-100">
          <Link 
            href="/admin/login"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#c1000a] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
