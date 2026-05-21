"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FileDown, X, CheckCircle2 } from "lucide-react";

const brochureSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone is required"),
  company: z.string().optional(),
});

type BrochureFormData = z.infer<typeof brochureSchema>;

export const BrochureForm = ({ brochureTitle = "Corporate Brochure", onClose }: { brochureTitle?: string, onClose?: () => void }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<BrochureFormData>({
    resolver: zodResolver(brochureSchema)
  });

  const onSubmit = async (data: BrochureFormData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/leads/brochure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, brochureTitle }),
      });
      
      if (res.ok) {
        const result = await res.json();
        setIsSuccess(true);
        
        // Automated Download & Preview Pipeline
        if (result.pdfUrl) {
          // 1. Trigger Download
          const link = document.createElement('a');
          link.href = result.pdfUrl;
          link.setAttribute('download', result.filename || 'TSV-Global-Brochure');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // 2. Open Preview in new tab
          window.open(result.pdfUrl, "_blank");
        }
      }
    } catch (error) {
      console.error("Brochure acquisition error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-16 px-8 animate-in fade-in zoom-in-95 duration-700">
        <div className="w-24 h-24 bg-green-50 text-green-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-green-100 shadow-sm shadow-green-200/50">
          <CheckCircle2 size={48} strokeWidth={2.5} />
        </div>
        <h3 className="text-3xl font-black text-[#0f172a] mb-3 tracking-tight">Transmission Complete</h3>
        <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mb-10">Your asset is being synchronized</p>
        
        <div className="space-y-4">
          <p className="text-xs text-gray-400 leading-relaxed font-medium">
            Your download has started automatically and a preview tab has been opened. <br />
            If the transmission failed, use the manual override below.
          </p>
          
          <button 
            onClick={() => window.location.reload()}
            className="text-[10px] font-black text-[#e63946] uppercase tracking-widest hover:underline"
          >
            New Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {onClose && (
        <button onClick={onClose} className="absolute -top-12 -right-4 text-white hover:text-gray-300">
          <X size={24} />
        </button>
      )}
      
      <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-red-50 text-[#c1000a] rounded-2xl flex items-center justify-center">
            <FileDown size={24} />
          </div>
          <div>
            <h3 className="font-bold text-xl text-gray-900">Download Brochure</h3>
            <p className="text-xs text-gray-400">Please fill details to acquire the corporate asset</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <input 
                {...register("name")}
                placeholder="Full Name"
                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all ${errors.name ? 'border-red-500' : 'border-gray-100'}`}
              />
              {errors.name && <p className="text-[10px] text-red-500 font-bold uppercase ml-2">{errors.name.message}</p>}
            </div>
            <div className="space-y-1">
              <input 
                {...register("email")}
                placeholder="Email Address"
                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all ${errors.email ? 'border-red-500' : 'border-gray-100'}`}
              />
              {errors.email && <p className="text-[10px] text-red-500 font-bold uppercase ml-2">{errors.email.message}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <input 
                {...register("phone")}
                placeholder="Phone Number"
                className={`w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all ${errors.phone ? 'border-red-500' : 'border-gray-100'}`}
              />
              {errors.phone && <p className="text-[10px] text-red-500 font-bold uppercase ml-2">{errors.phone.message}</p>}
            </div>
            <div className="space-y-1">
              <input 
                {...register("company")}
                placeholder="Company Name (Optional)"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-[#1a1a2e] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#c1000a] transition-all duration-300 mt-4 shadow-lg shadow-blue-900/10"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <i className="fa-regular fa-spinner-third animate-spin"></i> Processing...
              </span>
            ) : (
              <>
                <FileDown size={18} /> Get Brochure Now
              </>
            )}
          </button>
          
          <p className="text-[10px] text-center text-gray-400 mt-4 uppercase tracking-widest font-bold">
            🔒 Your data is safe with us
          </p>
        </form>
      </div>
    </div>
  );
};
