"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, Zap, BarChart3, TrendingUp, Users, MousePointerClick, Activity, ExternalLink, Loader2 } from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
  PieChart, Pie, Cell, Legend
} from 'recharts';

interface AnalyticsClientProps {
  ga4Id: string | null;
  gtmId: string | null;
}

export default function AnalyticsClient({ ga4Id, gtmId }: AnalyticsClientProps) {
  const isGA4Configured = !!ga4Id && ga4Id.startsWith("G-");
  const isGTMConfigured = !!gtmId && (gtmId.startsWith("GTM-") || gtmId.startsWith("GT-"));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    kpi: { totalSessions: string, activeUsers: string, avgEngagementTime: number, eventCount: string };
    sessionsData: any[];
    topPagesData: any[];
    trafficSourceData: any[];
  } | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/admin/analytics');
        if (!res.ok) {
          throw new Error('Failed to fetch analytics data');
        }
        const json = await res.json();
        if (json.error) {
          throw new Error(json.error);
        }
        setData(json.data);
      } catch (err: any) {
        setError(err.message || 'Unknown error occurred while fetching GA4 data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#c1000a]" />
        <p className="text-sm font-medium uppercase tracking-widest">Syncing with Google Analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-[10px] p-6 flex gap-3 items-start">
        <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={24} />
        <div>
          <h4 className="text-lg font-bold text-red-900">Google Analytics Connection Failed</h4>
          <p className="text-sm text-red-700 mt-2 leading-relaxed">
            {error}
          </p>
          <p className="text-xs text-red-600 mt-4 font-medium uppercase tracking-wider">
            Check your Google Cloud Service Account credentials and GA4 Property ID.
          </p>
        </div>
      </div>
    );
  }

  const { kpi, sessionsData, topPagesData, trafficSourceData } = data || {};

  // Format engagement time (e.g. 105 seconds -> "1m 45s")
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* Live Data Connection Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-[10px] p-4 flex gap-3 items-start">
        <Zap className="text-emerald-600 shrink-0 mt-0.5" size={18} />
        <div>
          <h4 className="text-sm font-bold text-emerald-900">Live Data Synchronized</h4>
          <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
            Successfully connected to Google Analytics Data API. Displaying real-time traffic data for the last 30 days.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-[10px] border border-[#f0f2f8] p-6 shadow-sm group hover:border-[#c1000a]/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-[#8a9ab5] uppercase tracking-wider">Total Sessions</h3>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Activity size={16} />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#0f1523]">{parseInt(kpi?.totalSessions || '0').toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-[10px] border border-[#f0f2f8] p-6 shadow-sm group hover:border-[#c1000a]/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-[#8a9ab5] uppercase tracking-wider">Active Users</h3>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#0f1523]">{parseInt(kpi?.activeUsers || '0').toLocaleString()}</p>
        </div>

        <div className="bg-white rounded-[10px] border border-[#f0f2f8] p-6 shadow-sm group hover:border-[#c1000a]/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-[#8a9ab5] uppercase tracking-wider">Avg. Engagement</h3>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <BarChart3 size={16} />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#0f1523]">{formatTime(kpi?.avgEngagementTime || 0)}</p>
        </div>

        <div className="bg-white rounded-[10px] border border-[#f0f2f8] p-6 shadow-sm group hover:border-[#c1000a]/30 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[11px] font-bold text-[#8a9ab5] uppercase tracking-wider">Event Count</h3>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MousePointerClick size={16} />
            </div>
          </div>
          <p className="text-3xl font-bold text-[#0f1523]">{parseInt(kpi?.eventCount || '0').toLocaleString()}</p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-[10px] border border-[#f0f2f8] p-6 shadow-sm">
          <h3 className="text-sm font-bold text-[#0f1523] mb-6">Traffic Overview (Last 30 Days)</h3>
          <div className="h-[300px] w-full">
            {sessionsData && sessionsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sessionsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c1000a" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#c1000a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f2f8" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8a9ab5' }} dy={10} minTickGap={30} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8a9ab5' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                    itemStyle={{ color: '#0f1523', fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="sessions" stroke="#c1000a" strokeWidth={3} fillOpacity={1} fill="url(#colorSessions)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">No session data available yet.</div>
            )}
          </div>
        </div>

        {/* Traffic Sources Pie Chart */}
        <div className="bg-white rounded-[10px] border border-[#f0f2f8] p-6 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-[#0f1523] mb-2">Traffic Sources</h3>
          <div className="flex-1 min-h-[300px]">
            {trafficSourceData && trafficSourceData.length > 0 ? (
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
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">No traffic data available.</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Pages Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-[10px] border border-[#f0f2f8] p-6 shadow-sm">
          <h3 className="text-sm font-bold text-[#0f1523] mb-6">Top Pages by Views</h3>
          <div className="h-[300px] w-full">
            {topPagesData && topPagesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topPagesData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f2f8" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#8a9ab5' }} />
                  <YAxis dataKey="path" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#0f1523', fontWeight: 500 }} width={120} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  />
                  <Bar dataKey="views" fill="#0f1523" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">No page view data available.</div>
            )}
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

