"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { LogIn, Lock, Mail, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/shared/Toast";

export default function AdminLoginPage() {
  const { error: toastError } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toastError("Invalid email or password. Please try again.");
      } else {
        router.push("/admin/dashboard");
      }
    } catch {
      toastError("An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a2e] p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden p-10 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-10">
          <Image 
            src="/img/logo.png" 
            alt="TSV Global Solutions" 
            width={240} 
            height={80} 
            className="mb-6 object-contain"
          />
          <h1 className="text-2xl font-bold text-[#1a1a2e]">Admin Control Center</h1>
          <p className="text-gray-400 text-sm mt-2">Sign in to manage your digital ecosystem</p>
        </div>



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

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Password</label>
              <Link 
                href="/admin/forgot-password"
                className="text-xs font-bold text-[#c1000a] hover:underline uppercase tracking-widest"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#c1000a] focus:bg-white outline-none transition-all text-gray-800"
                placeholder="••••••••"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>


          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#c1000a] text-white py-4 rounded-2xl font-bold hover:bg-red-700 disabled:opacity-50 transition-all shadow-xl shadow-red-900/10 flex items-center justify-center gap-2 mt-8 group"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                Sign In to Dashboard
              </>
            )}
          </button>
        </form>

        <div className="mt-12 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest border-t pt-8">
          Protected by Enterprise-Grade Encryption
        </div>
      </div>
    </div>
  );
}
