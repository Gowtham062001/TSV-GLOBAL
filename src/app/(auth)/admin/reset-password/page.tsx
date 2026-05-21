"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/components/shared/Toast";
import { Suspense } from "react";

function ResetPasswordContent() {
  const { success, error: toastError } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      toastError("Invalid or missing reset token.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toastError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (res.ok) {
        success("Password reset successful! Redirecting to login...");
        setIsSuccess(true);
        setTimeout(() => router.push("/admin/login"), 3000);
      } else {
        toastError(data.error || "Failed to reset password.");
      }
    } catch (error) {
      toastError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden p-10 animate-in fade-in zoom-in duration-500">
      <div className="flex flex-col items-center mb-8">
        <Image 
          src="/img/logo.png" 
          alt="TSV Global Solutions" 
          width={200} 
          height={60} 
          className="mb-6 object-contain"
        />
        <h1 className="text-2xl font-bold text-[#1a1a2e]">Set New Password</h1>
        <p className="text-gray-400 text-sm mt-2">Enter your new secure password below.</p>
      </div>

      {token && !isSuccess && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#c1000a] focus:bg-white outline-none transition-all text-gray-800"
                placeholder="Minimum 8 characters"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#c1000a] focus:bg-white outline-none transition-all text-gray-800"
                placeholder="Repeat new password"
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
              "Update Password"
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e] p-6">
      <Suspense fallback={
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 flex items-center justify-center">
          <Loader2 className="animate-spin text-[#c1000a]" size={32} />
        </div>
      }>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
