"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Info, Zap, BarChart3, TrendingUp, Users, MousePointerClick, Activity, ExternalLink } from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
  PieChart, Pie, Cell, Legend
} from 'recharts';

interface AnalyticsClientProps {
  ga4Id: string | null;
  gtmId: string | null;
}

// Simulated data for charts (since no Service Account is configured)
const sessionsData = [
  { date: 'May 01', sessions: 420 },
  { date: 'May 05', sessions: 480 },
  { date: 'May 10', sessions: 650 },
  { date: 'May 15', sessions: 580 },
  { date: 'May 20', sessions: 890 },
  { date: 'May 25', sessions: 1100 },
  { date: 'May 27', sessions: 950 },
];

const topPagesData = [
  { path: '/', views: 2450 },
  { path: '/services', views: 1840 },
  { path: '/case-studies', views: 1250 },
  { path: '/contact', views: 980 },
  { path: '/about', views: 760 },
];

const trafficSourceData = [
  { name: 'Organic Search', value: 4500, color: '#0f1523' },
  { name: 'Direct', value: 2100, color: '#c1000a' },
  { name: 'Referral', value: 1200, color: '#64748b' },
  { name: 'Social', value: 800, color: '#94a3b8' },
];

export default function AnalyticsClient({ ga4Id, gtmId }: AnalyticsClientProps) {
  const isGA4Configured = !!ga4Id && ga4Id.startsWith("G-");
  const isGTMConfigured = !!gtmId && (gtmId.startsWith("GTM-") || gtmId.startsWith("GT-"));

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* Missing Service Account Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-[10px] p-4 flex gap-3 items-start">
        <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
        <div>
          <h4 className="text-sm font-bold text-amber-900">Google Cloud Service Account Required for Live Data</h4>
          <p className="text-xs text-amber-700 mt-1 leading-relaxed">
            Your tracking IDs ({ga4Id || "none"}, {gtmId || "none"}) are active and collecting data on the live site. However, to display real-time charts within this admin panel, you must configure a Google Cloud Service Account and grant it Viewer access to your GA4 property. Currently displaying simulated data to demonstrate the UI.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-[10px] border border-[#f0f2f8] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-[#8a9ab5] uppercase tracking-wider">Total Sessions</h3>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Activity size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#0f1523]">8,452</p>
          <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 mt-2">
            <TrendingUp size={14} /> <span>+12.5% this month</span>
          </div>
        </div>

        <div className="bg-white rounded-[10px] border border-[#f0f2f8] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-[#8a9ab5] uppercase tracking-wider">Active Users</h3>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#0f1523]">5,120</p>
          <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 mt-2">
            <TrendingUp size={14} /> <span>+8.2% this month</span>
          </div>
        </div>

        <div className="bg-white rounded-[10px] border border-[#f0f2f8] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-[#8a9ab5] uppercase tracking-wider">Avg. Engagement Time</h3>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <BarChart3 size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#0f1523]">1m 45s</p>
          <div className="flex items-center gap-1 text-xs font-medium text-amber-600 mt-2">
            <TrendingUp size={14} className="rotate-180" /> <span>-2s this month</span>
          </div>
        </div>

        <div className="bg-white rounded-[10px] border border-[#f0f2f8] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-[#8a9ab5] uppercase tracking-wider">Event Count</h3>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MousePointerClick size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#0f1523]">24,892</p>
          <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 mt-2">
            <TrendingUp size={14} /> <span>+18.4% this month</span>
          </div>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-[10px] border border-[#f0f2f8] p-6 shadow-sm">
          <h3 className="text-sm font-bold text-[#0f1523] mb-6">Traffic Overview (Last 30 Days)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sessionsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c1000a" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#c1000a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f2f8" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8a9ab5' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8a9ab5' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  itemStyle={{ color: '#0f1523', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="sessions" stroke="#c1000a" strokeWidth={3} fillOpacity={1} fill="url(#colorSessions)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic Sources Pie Chart */}
        <div className="bg-white rounded-[10px] border border-[#f0f2f8] p-6 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-[#0f1523] mb-2">Traffic Sources</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={trafficSourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {trafficSourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  itemStyle={{ fontWeight: 600 }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-xs font-medium text-[#0f1523] ml-1">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Pages Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-[10px] border border-[#f0f2f8] p-6 shadow-sm">
          <h3 className="text-sm font-bold text-[#0f1523] mb-6">Top Pages by Views</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topPagesData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f2f8" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8a9ab5' }} />
                <YAxis dataKey="path" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#0f1523', fontWeight: 500 }} width={100} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                />
                <Bar dataKey="views" fill="#0f1523" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-[10px] border border-[#f0f2f8] p-6 shadow-sm">
            <h3 className="text-sm font-bold text-[#0f1523] mb-4">Property Identity</h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-[#8a9ab5] uppercase tracking-wider mb-1">Measurement ID</p>
                <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                  <code className="text-xs font-bold text-slate-800">{ga4Id || "Not Configured"}</code>
                  {isGA4Configured ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Info size={16} className="text-amber-500" />}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#8a9ab5] uppercase tracking-wider mb-1">GTM Container</p>
                <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                  <code className="text-xs font-bold text-slate-800">{gtmId || "Not Configured"}</code>
                  {isGTMConfigured ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Info size={16} className="text-amber-500" />}
                </div>
              </div>
            </div>
            
            <a 
              href="https://analytics.google.com/analytics/web/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 w-full flex items-center justify-center gap-2 bg-[#0f1523] text-white px-4 py-2.5 rounded-lg text-[13px] font-medium hover:bg-slate-800 transition-all"
            >
              Open Full GA4 Console <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}
