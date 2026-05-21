export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import React from "react";
import { format } from "date-fns";
import { Clock, Activity } from "lucide-react";
export default async function AdminAuditLogPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: true
    }
  });
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Audit Logs</h2>
          <p className="text-sm text-gray-500">Track all administrative actions and security events</p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2 font-bold text-gray-800">
            <Activity size={18} className="text-blue-600" />
            Recent Activity
          </div>
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Showing Last 50 Events</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-400 font-medium uppercase tracking-tighter text-[10px]">
                <th className="px-6 py-4">Event</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Resource</th>
                <th className="px-6 py-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-[4px] text-[10px] font-bold uppercase tracking-wider ${
                      log.action.includes('CREATE') ? 'bg-green-100 text-green-700' :
                      log.action.includes('DELETE') ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold">
                        {log.user.email.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-700">{log.user.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-[10px]">
                    {log.entity}: {log.entityId}
                  </td>
                  <td className="px-6 py-4 text-gray-400 flex items-center gap-1">
                    <Clock size={14} />
                    {format(log.createdAt, "MMM d, h:mm a")}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-gray-400 italic">No audit logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
