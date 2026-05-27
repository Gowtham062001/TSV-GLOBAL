"use client";

import React, { useState } from "react";
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
} from "lucide-react";

interface AnalyticsClientProps {
  ga4Id: string | null;
  gtmId: string | null;
}

export default function AnalyticsClient({ ga4Id, gtmId }: AnalyticsClientProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "realtime" | "behavior">("overview");

  const isGA4Configured = !!ga4Id && ga4Id.startsWith("G-");
  const isGTMConfigured = !!gtmId && gtmId.startsWith("GTM-");

  const ga4ReportUrl = ga4Id
    ? `https://analytics.google.com/analytics/web/#/p${ga4Id.replace("G-", "")}/reports/`
    : "https://analytics.google.com/";

  const quickLinks = [
    {
      label: "Traffic Overview",
      desc: "Sessions, users, pageviews for last 30 days",
      icon: <TrendingUp size={18} />,
      url: ga4Id
        ? `https://analytics.google.com/analytics/web/#/p${ga4Id.replace("G-", "")}/reports/reportinghub?params=_u..nav%3Dmaui`
        : "https://analytics.google.com/",
    },
    {
      label: "Realtime Users",
      desc: "Active users on site right now",
      icon: <Activity size={18} />,
      url: ga4Id
        ? `https://analytics.google.com/analytics/web/#/p${ga4Id.replace("G-", "")}/reports/realtime`
        : "https://analytics.google.com/",
    },
    {
      label: "Top Pages",
      desc: "Most viewed pages and sessions",
      icon: <Eye size={18} />,
      url: ga4Id
        ? `https://analytics.google.com/analytics/web/#/p${ga4Id.replace("G-", "")}/reports/explorer?params=_u..nav%3Dmaui%26_r.explorerCard..dimensions%3D%5B%7B%22type%22%3A%22SIMPLE%22%2C%22dimensionName%22%3A%22pagePath%22%7D%5D`
        : "https://analytics.google.com/",
    },
    {
      label: "Audience",
      desc: "Demographics, device, and location data",
      icon: <Users size={18} />,
      url: ga4Id
        ? `https://analytics.google.com/analytics/web/#/p${ga4Id.replace("G-", "")}/reports/user-demographics-overview`
        : "https://analytics.google.com/",
    },
    {
      label: "Traffic Sources",
      desc: "Organic, direct, referral, social breakdown",
      icon: <Globe size={18} />,
      url: ga4Id
        ? `https://analytics.google.com/analytics/web/#/p${ga4Id.replace("G-", "")}/reports/acquisition-overview`
        : "https://analytics.google.com/",
    },
    {
      label: "Full Dashboard",
      desc: "Open the complete Google Analytics 4 console",
      icon: <BarChart3 size={18} />,
      url: ga4ReportUrl,
    },
  ];

  // Not configured at all
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
              You need to add your GA4 Measurement ID and/or GTM Container ID in Settings to enable
              analytics tracking and see data here.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6">
          <h3 className="font-bold text-[#1a1a2e] text-sm flex items-center gap-2">
            <Settings size={16} className="text-[#c1000a]" />
            How to Set Up Google Analytics 4
          </h3>

          <ol className="space-y-4">
            {[
              {
                step: "1",
                title: "Create a GA4 Property",
                desc: 'Go to analytics.google.com → Admin → Create Property → select "Web" and add your domain tsvglobal.com',
              },
              {
                step: "2",
                title: "Copy your Measurement ID",
                desc: 'After creating, you\'ll see a Measurement ID starting with "G-" (e.g. G-XXXXXXXXXX). Copy it.',
              },
              {
                step: "3",
                title: "Paste it in Settings",
                desc: 'Go to Admin → Settings → Integrations tab → GA4 Measurement ID field → paste and click Save Settings.',
              },
              {
                step: "4",
                title: "Verify it's working",
                desc: "Visit your live website and check the Realtime report in GA4 — you should see yourself as an active user within 30 seconds.",
              },
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
            <a
              href="/admin/settings#integrations"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#c1000a] text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-all"
            >
              <Settings size={15} />
              Go to Settings
            </a>
            <a
              href="https://analytics.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-[#1a1a2e] text-sm font-bold rounded-xl hover:bg-gray-200 transition-all"
            >
              <ExternalLink size={15} />
              Open Google Analytics
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Configured — show status + quick links + embedded report
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#1a1a2e]">Analytics</h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
            Google Analytics 4 Live Dashboard
          </p>
        </div>
        <a
          href={ga4ReportUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a1a2e] text-white text-sm font-bold rounded-xl hover:bg-black transition-all whitespace-nowrap"
        >
          <ExternalLink size={15} />
          Open Full GA4 Console
        </a>
      </div>

      {/* Status Badges */}
      <div className="flex flex-wrap gap-3">
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold ${
            isGA4Configured
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-amber-50 border-amber-200 text-amber-700"
          }`}
        >
          {isGA4Configured ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
          GA4: {ga4Id || "Not configured"}
        </div>
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold ${
            isGTMConfigured
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-gray-50 border-gray-200 text-gray-500"
          }`}
        >
          {isGTMConfigured ? <CheckCircle2 size={15} /> : <Info size={15} />}
          GTM: {gtmId || "Not configured"}
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex gap-3 items-start">
        <Info className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
        <div className="text-sm text-blue-700">
          <strong>How this works:</strong> Your GA4 tag ({ga4Id}) is injected on every public page
          of tsvglobal.com. All visitor data is collected in Google&apos;s secure servers. Click any
          report below to open it directly in your Google Analytics 4 dashboard.
        </div>
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
                  <ChevronRight
                    size={14}
                    className="text-gray-300 group-hover:text-[#c1000a] transition-colors flex-shrink-0"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-0.5">{link.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Embedded GA4 via iframe */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-[#1a1a2e] text-sm flex items-center gap-2">
            <TrendingUp size={15} className="text-[#c1000a]" />
            Embedded Analytics Console
          </h3>
          <a
            href={ga4ReportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#c1000a] font-bold hover:underline flex items-center gap-1"
          >
            Open Full Screen <ExternalLink size={11} />
          </a>
        </div>
        <div className="relative bg-gray-50" style={{ height: "600px" }}>
          <iframe
            src={ga4ReportUrl}
            className="w-full h-full border-0"
            title="Google Analytics 4 Dashboard"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
          />
          {/* Overlay fallback — GA4 may block embedding due to X-Frame-Options */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/95 pointer-events-none">
            <div className="text-center px-8 max-w-md pointer-events-auto">
              <div className="w-16 h-16 rounded-2xl bg-[#1a1a2e] text-white flex items-center justify-center mx-auto mb-5">
                <BarChart3 size={28} />
              </div>
              <h4 className="font-black text-[#1a1a2e] text-lg mb-2">
                Open Google Analytics Directly
              </h4>
              <p className="text-gray-500 text-sm mb-6">
                Google Analytics prevents embedding for security reasons. Click the button below to
                open your full live dashboard in a new tab.
              </p>
              <a
                href={ga4ReportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#c1000a] text-white font-bold rounded-xl hover:bg-red-700 transition-all"
              >
                <ExternalLink size={16} />
                Open GA4 Dashboard
              </a>
              <p className="text-[11px] text-gray-400 mt-4">
                Property ID: {ga4Id}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* GTM Note */}
      {!isGTMConfigured && (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex gap-3 items-start">
          <Info className="text-gray-400 flex-shrink-0 mt-0.5" size={16} />
          <div className="text-sm text-gray-500">
            <strong className="text-gray-700">Optional:</strong> You can also add a GTM Container
            ID (GTM-XXXXXXX) in Settings → Integrations to manage tracking tags via Google Tag
            Manager for more advanced event tracking.
          </div>
        </div>
      )}
    </div>
  );
}
