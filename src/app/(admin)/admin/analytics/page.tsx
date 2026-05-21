"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend 
} from "recharts";
import { Users, Eye, TrendingUp, Globe, ArrowUpRight, BarChart3, PieChart as PieChartIcon } from "lucide-react";

interface AnalyticsData {
  sessionData: any[];
  topPages: any[];
  trafficSources: any[];
  activeUsers: number;
}

const COLORS = ['#c1000a', '#1a1a2e', '#4b5563', '#94a3b8', '#e2e8f0'];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics");
      const result = await res.json();
      if (res.ok) {
        setData(result);
      } else {
        setError(result.error || "Failed to load data");
      }
    } catch (err) {
      setError("Failed to fetch analytics");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-gray-100 rounded-[2rem]"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-gray-100 rounded-[2rem]"></div>
          <div className="h-96 bg-gray-100 rounded-[2rem]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-20 text-center bg-red-50 rounded-[3rem] border border-red-100">
        <div className="w-16 h-16 bg-red-100 text-[#c1000a] rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Globe size={32} />
        </div>
        <h3 className="text-xl font-black text-[#1a1a2e] mb-2">Analytics Connection Error</h3>
        <p className="text-gray-500 max-w-md mx-auto">{error}</p>
        <button 
          onClick={fetchAnalytics}
          className="mt-6 px-8 py-3 bg-[#c1000a] text-white rounded-xl font-bold hover:bg-red-700 transition-all"
        >
          Try Reconnect
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-[#1a1a2e]">Traffic Intelligence</h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Google Analytics 4 Live Insights</p>
        </div>
        <div className="bg-green-50 px-6 py-3 rounded-2xl border border-green-100 flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
          <div>
            <div className="text-[10px] text-green-600 font-black uppercase tracking-tighter">Live Users</div>
            <div className="text-xl font-black text-[#1a1a2e]">{data?.activeUsers || 0}</div>
          </div>
        </div>
      </div>

      {/* Sessions Chart */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="font-black text-[#1a1a2e] flex items-center gap-2">
              <TrendingUp size={20} className="text-[#c1000a]" /> Traffic Over Time
            </h3>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Sessions (Last 30 Days)</p>
          </div>
        </div>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.sessionData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}}
                tickFormatter={(str) => {
                  if (!str) return "";
                  return str.substring(4, 6) + "/" + str.substring(6, 8);
                }}
              />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
              <Tooltip 
                contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
              />
              <Line 
                type="monotone" 
                dataKey="sessions" 
                stroke="#c1000a" 
                strokeWidth={4} 
                dot={{ r: 4, fill: '#c1000a', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 8, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Top Pages */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-black text-[#1a1a2e] flex items-center gap-2">
                <BarChart3 size={20} className="text-[#c1000a]" /> Most Visited Pages
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Top 5 by Page Views</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.topPages} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="path" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 700, fill: '#1a1a2e'}} 
                  width={120}
                />
                <Tooltip 
                   cursor={{fill: 'transparent'}}
                   contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                />
                <Bar dataKey="views" fill="#1a1a2e" radius={[0, 10, 10, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-black text-[#1a1a2e] flex items-center gap-2">
                <PieChartIcon size={20} className="text-[#c1000a]" /> Traffic Channels
              </h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Acquisition by Source</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.trafficSources}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data?.trafficSources.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{fontSize: 10, fontWeight: 700}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
