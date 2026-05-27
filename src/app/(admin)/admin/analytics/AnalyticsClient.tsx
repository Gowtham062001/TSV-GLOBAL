"use client";

import React from "react";
import {
  BarChart3,
  ExternalLink,
  Settings,
  Globe,
  TrendingUp,
  Users,
  Eye,
  Activity,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Info,
  Zap,
} from "lucide-react";

interface AnalyticsClientProps {
  ga4Id: string | null;
  gtmId: string | null;
}

// Build GA4 console deep-link URLs
function ga4Url(path: string) {
  return `https://analytics.google.com/analytics/web/#/${path}`;
}

export default function AnalyticsClient({ ga4Id, gtmId }: AnalyticsClientProps) {
  const isGA4Configured = !!ga4Id && ga4Id.startsWith("G-");
  // Google Tag containers use either "GTM-" (classic) or "GT-" (newer format)
  const isGTMConfigured = !!gtmId && (gtmId.startsWith("GTM-") || gtmId.startsWith("GT-"));

  const quickLinks = [
    {
      label: "Traffic Overview",
      desc: "Sessions, users & pageviews — last 30 days",
      icon: <TrendingUp size={18} />,
      url: ga4Url("p475892583/reports/reportinghub"),
      badge: null,
    },
    {
      label: "Realtime",
      desc: "Active users on tsvglobal.com right now",
      icon: <Activity size={18} />,
      url: ga4Url("p475892583/reports/realtime"),
      badge: "Live",
    },
    {
      label: "Top Pages",
      desc: "Most viewed pages by sessions",
      icon: <Eye size={18} />,
      url: ga4Url("p475892583/reports/explorer?params=_u..nav%3Dmaui"),
      badge: null,
    },
    {
      label: "Audience",
      desc: "Demographics, devices & locations",
      icon: <Users size={18} />,
      url: ga4Url("p475892583/reports/user-demographics-overview"),
      badge: null,
    },
    {
      label: "Acquisition",
      desc: "Organic, direct, referral & social sources",
      icon: <Globe size={18} />,
      url: ga4Url("p475892583/reports/acquisition-overview"),
      badge: null,
    },
    {
      label: "Full Dashboard",
      desc: "Open complete Google Analytics 4 console",
      icon: <BarChart3 size={18} />,
      url: "https://analytics.google.com/analytics/web/",
      badge: null,
    },
  ];

  // ── Not configured at all ──────────────────────────────────────────────────
  if (!isGA4Configured && !isGTMConfigured) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-[#1a1a2e]">Analytics</h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
            Google Analytics 4 Integration
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-4 items-start">
          <AlertCircle className="text-amber-600 mt-0.5 flex-shrink-0" size={22} />
          <div>
            <h3 className="font-bold text-amber-800 text-sm mb-1">Analytics Not Configured</h3>
            <p className="text-amber-700 text-sm">
              Add your GA4 Measurement ID in Settings → Integrations to enable analytics tracking.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6">
          <h3 className="font-bold text-[#1a1a2e] text-sm flex items-center gap-2">
            <Settings size={16} className="text-[#c1000a]" />
            Setup Steps
          </h3>
          <ol className="space-y-4">
            {[
              { step: "1", title: "Create a GA4 Property", desc: "Go to analytics.google.com → Admin → Create Property → Web → add tsvglobal.com" },
              { step: "2", title: "Copy the Measurement ID", desc: 'After creating, copy the ID starting with "G-" from the data stream settings.' },
              { step: "3", title: "Paste in Settings", desc: "Admin → Settings → Integrations → GA4 Measurement ID → Save." },
              { step: "4", title: "Verify tracking", desc: "Visit your live site and check Realtime in GA4 — you'll appear as an active user within 30 seconds." },
            ].map((item) => (
              <li key={item.step} className="flex gap-4 items-start">
                <span className="w-7 h-7 rounded-full bg-[#1a1a2e] text-white text-xs font-black flex items-center justify-center flex-shrink-0">
                  {item.step}
                </span>
                <div>
                  <p className="font-bold text-[#1a1a2e] text-sm">{item.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="flex gap-3 pt-2">
            <a href="/admin/settings" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#c1000a] text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-all">
              <Settings size={15} /> Go to Settings
            </a>
            <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-[#1a1a2e] text-sm font-bold rounded-xl hover:bg-gray-200 transition-all">
              <ExternalLink size={15} /> Open Google Analytics
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Configured ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#1a1a2e]">Analytics</h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
            Google Analytics 4 — TSV Global Solutions
          </p>
        </div>
        <a
          href="https://analytics.google.com/analytics/web/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a1a2e] text-white text-sm font-bold rounded-xl hover:bg-black transition-all whitespace-nowrap"
        >
          <ExternalLink size={15} />
          Open GA4 Console
        </a>
      </div>

      {/* Property Info Card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Stream Name", value: "TSV Global Solutions" },
          { label: "Stream URL", value: "tsvglobal.com" },
          { label: "Measurement ID", value: ga4Id || "—" },
          { label: "GTM Container ID", value: gtmId || "—" },
        ].map((item) => (
          <div key={item.label}>
            <p className="text-[10px] font-bold text-[#8a9ab5] uppercase tracking-widest mb-1">{item.label}</p>
            <p className="text-sm font-bold text-[#1a1a2e] font-mono truncate">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Status Badges */}
      <div className="flex flex-wrap gap-3">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold ${isGA4Configured ? "bg-green-50 border-green-200 text-green-700" : "bg-amber-50 border-amber-200 text-amber-700"}`}>
          {isGA4Configured ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
          GA4: {ga4Id || "Not configured"}
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold ${isGTMConfigured ? "bg-green-50 border-green-200 text-green-700" : "bg-gray-50 border-gray-200 text-gray-400"}`}>
          {isGTMConfigured ? <CheckCircle2 size={15} /> : <Info size={15} />}
          GTM: {isGTMConfigured ? gtmId : "Not configured"}
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border bg-blue-50 border-blue-200 text-blue-700 text-sm font-bold">
          <Zap size={15} />
          Tracking Active on tsvglobal.com
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex gap-3 items-start">
        <Info className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
        <p className="text-sm text-blue-700">
          Your GA4 tag <strong>{ga4Id}</strong> is injected on every public page of tsvglobal.com.
          All visitor data is collected securely in Google Analytics. Click any report below to
          open it directly in your GA4 dashboard.
        </p>
      </div>

      {/* Quick Report Links */}
      <div>
        <h3 className="font-black text-[#1a1a2e] text-sm mb-4 flex items-center gap-2">
          <BarChart3 size={16} className="text-[#c1000a]" />
          Quick Access Reports
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white border border-gray-100 rounded-2xl p-5 hover:border-[#c1000a] hover:shadow-md transition-all flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-red-50 flex items-center justify-center text-[#8a9ab5] group-hover:text-[#c1000a] transition-colors flex-shrink-0">
                {link.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-[#1a1a2e] text-sm">{link.label}</p>
                  <div className="flex items-center gap-1.5">
                    {link.badge && (
                      <span className="text-[9px] font-black bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                        {link.badge}
                      </span>
                    )}
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-[#c1000a] transition-colors flex-shrink-0" />
                  </div>
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">{link.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Open GA4 CTA */}
      <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0f1523] rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="font-black text-white text-lg">View Full Analytics Dashboard</h3>
          <p className="text-gray-400 text-sm mt-1">
            Session trends, funnel reports, custom events, conversions — all in your GA4 console.
          </p>
        </div>
        <a
          href="https://analytics.google.com/analytics/web/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#c1000a] text-white font-bold rounded-xl hover:bg-red-700 transition-all whitespace-nowrap flex-shrink-0"
        >
          <ExternalLink size={16} />
          Open GA4 Dashboard
        </a>
      </div>

      {/* GTM optional note */}
      {!isGTMConfigured && (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex gap-3 items-start">
          <Info className="text-gray-400 flex-shrink-0 mt-0.5" size={16} />
          <p className="text-sm text-gray-500">
            <strong className="text-gray-700">Optional:</strong> Add a GTM Container ID
            (GTM-XXXXXXX) in Settings → Integrations for advanced tag management and custom event
            tracking via Google Tag Manager.
          </p>
        </div>
      )}
    </div>
  );
}
