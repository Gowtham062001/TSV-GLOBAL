import React from "react";
import Link from "next/link";

export interface MetricItem {
  label: string;
  value: string;
}

export interface CaseStudyMetricsProps {
  metrics: MetricItem[];
}

export default function CaseStudyMetrics({ metrics }: CaseStudyMetricsProps) {
  return (
    <div className="bg-[#1a1a2e] rounded-2xl p-10 text-white shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-150"></div>
      
      <h4 className="text-xl font-black flex items-center gap-4 mb-8 pb-5 border-b border-white/15 relative z-10 text-white">
        <i className="fa-solid fa-chart-column text-[#c1000a]"></i>
        Key Metrics
      </h4>
      
      <div className="space-y-6 relative z-10">
        {metrics.length > 0 ? (
          metrics.map((metric, index) => (
            <div key={index} className="flex justify-between items-center pb-5 border-b border-white/10 last:border-0 last:pb-0">
              <span className="text-white text-[14px] font-semibold">{metric.label}</span>
              <span className="text-xl font-black text-[#c1000a]">{metric.value}</span>
            </div>
          ))
        ) : (
          <div className="text-white/40 text-sm italic">No metrics available.</div>
        )}
      </div>

      <Link 
        href="/contact" 
        className="mt-10 flex items-center justify-center gap-3 w-full bg-[#c1000a] hover:bg-white hover:text-[#1a1a2e] text-white py-4.5 rounded-xl font-extrabold text-base transition-all duration-300 shadow-xl shadow-red-600/20 relative z-10"
      >
        <i className="fa-regular fa-paper-plane"></i> Discuss Requirement
      </Link>
      
      <Link 
        href="/case-studies" 
        className="mt-5 flex items-center justify-center gap-2 w-full text-white/50 hover:text-white text-[13px] font-bold transition-colors relative z-10"
      >
        <i className="fa-regular fa-arrow-left"></i> Back to All Case Studies
      </Link>
    </div>
  );
}
