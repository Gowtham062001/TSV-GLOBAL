"use client";

import React from "react";
import { Globe, Share2, Search } from "lucide-react";

interface SeoPreviewProps {
  title: string;
  description: string;
  url: string;
  image?: string;
}

export const SeoPreview = ({ title, description, url, image }: SeoPreviewProps) => {
  const getHostname = (u: string) => {
    try {
      return new URL(u).hostname;
    } catch {
      return "tsvglobal.com";
    }
  };

  return (
    <div className="space-y-10">
      {/* Google Preview */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
          <Search size={14} className="text-[#e63946]" /> Google Search Interface
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm max-w-[650px] font-sans">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 text-[10px]">
              <Globe size={14} />
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] text-[#202124] leading-tight">TSV Global Solutions</span>
              <span className="text-[12px] text-[#5f6368] leading-tight truncate max-w-[300px]">
                {url || "https://tsvglobal.com/..."}
              </span>
            </div>
          </div>
          <h3 className="text-[20px] text-[#1a0dab] hover:underline cursor-pointer font-normal mb-1 leading-tight">
            {title || "Untitled Strategic Logistics Solution"}
          </h3>
          <p className="text-[14px] text-[#4d5156] line-clamp-2 leading-normal">
            {description || "Discover how TSV Global Solutions transforms supply chains with strategic logistics, freight forwarding, and innovative mode optimizations worldwide."}
          </p>
        </div>
      </div>

      {/* Social Preview */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">
          <Share2 size={14} className="text-blue-500" /> Social Engagement Preview
        </div>
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm max-w-[500px]">
          {image ? (
            <img src={image} alt="OG Preview" className="w-full h-[260px] object-cover" />
          ) : (
            <div className="w-full h-[260px] bg-gray-50 flex flex-col items-center justify-center text-gray-200 gap-2">
              <Globe size={48} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">No Image Selected</span>
            </div>
          )}
          <div className="p-4 bg-gray-50/50 border-t border-gray-50">
            <div className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-1">{getHostname(url)}</div>
            <h4 className="text-[16px] font-bold text-[#0f172a] mb-1 truncate">{title || "Strategic Logistics"}</h4>
            <p className="text-[12px] text-gray-500 line-clamp-2 leading-relaxed">{description || "Global supply chain excellence by TSV."}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
