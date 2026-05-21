export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { 
  FileText, 
  Briefcase, 
  Edit3, 
  FolderOpen, 
  TrendingUp, 
  Mail, 
  Download,
  PlusCircle,
  ArrowUpRight,
  Eye,
  CheckCircle2,
  Clock
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function DashboardPage() {
  // Fetch stats
  const [pageCount, serviceCount, blogCount, caseStudyCount, leadsToday, recentContacts, recentBrochures] = await Promise.all([
    prisma.page.count(),
    prisma.service.count(),
    prisma.blogPost.count(),
    prisma.caseStudy.count(),
    prisma.contactSubmission.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.contactSubmission.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
    prisma.brochureDownload.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);
  const stats = [
    { label: "Total Pages", value: pageCount, icon: FileText, color: "blue" },
    { label: "Services", value: serviceCount, icon: Briefcase, color: "purple" },
    { label: "Blog Posts", value: blogCount, icon: Edit3, color: "amber" },
    { label: "Case Studies", value: caseStudyCount, icon: FolderOpen, color: "green" },
    { label: "Leads Today", value: leadsToday, icon: TrendingUp, color: "red" },
  ];
  return (
    <div className="admin-shell space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle">Overview & quick actions</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Link href="/admin/blog/new" className="flex items-center gap-2 px-4 py-2 bg-white border border-[#f0f2f8] rounded-[8px] text-[13px] font-medium text-[#0f1523] hover:bg-[#f8f9fb] transition-all">
          <PlusCircle size={16} color="#c1000a" /> New Blog Post
        </Link>
        <Link href="/admin/services/new" className="flex items-center gap-2 px-4 py-2 bg-white border border-[#f0f2f8] rounded-[8px] text-[13px] font-medium text-[#0f1523] hover:bg-[#f8f9fb] transition-all">
          <PlusCircle size={16} color="#c1000a" /> New Service
        </Link>
        <Link href="/admin/leads" className="flex items-center gap-2 px-4 py-2 bg-[#0f1523] text-white rounded-[8px] text-[13px] font-medium hover:bg-black transition-all">
          <Eye size={16} /> View All Leads
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-[10px] border border-[#f0f2f8] flex flex-col justify-between">
            <div className="flex items-center gap-3 mb-2">
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(193,0,10,0.08)',
                border: '1px solid rgba(193,0,10,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <stat.icon size={15} color="#c1000a" style={{opacity: 0.7}} />
              </div>
              <p style={{fontSize: '11px', color: '#8a9ab5', textTransform: 'uppercase', letterSpacing: '0.5px'}}>{stat.label}</p>
            </div>
            <p style={{fontSize: '24px', fontWeight: 700, color: '#0f1523'}}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Inquiries */}
        <div className="bg-white rounded-[10px] border border-[#f0f2f8] overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[#f0f2f8] flex items-center justify-between">
            <div>
              <h3 style={{fontSize: '15px', fontWeight: 600, color: '#0f1523'}}>Recent Inquiries</h3>
            </div>
            <Link href="/admin/leads?type=contact" style={{fontSize: '13px', color: '#c1000a', fontWeight: 500}} className="hover:underline">
              View All
            </Link>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left admin-table">
              <thead>
                <tr>
                  <th>SENDER</th>
                  <th>SUBJECT</th>
                  <th>STATUS</th>
                  <th>DATE</th>
                </tr>
              </thead>
              <tbody>
                {recentContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-[#f8f9fb] transition-colors">
                    <td>
                      <div style={{fontSize: '13px', fontWeight: 500, color: '#0f1523'}}>{contact.name}</div>
                      <div style={{fontSize: '11px', color: '#8a9ab5'}}>{contact.email}</div>
                    </td>
                    <td style={{fontSize: '13px', color: '#4a5568'}}>
                      <span className="truncate max-w-[150px] inline-block">{contact.subject || "General Inquiry"}</span>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '11px', fontWeight: 600, color: '#d97706',
                        background: 'rgba(245,158,11,0.08)', padding: '4px 10px',
                        borderRadius: '20px'
                      }}>
                        • PENDING
                      </span>
                    </td>
                    <td className="admin-list-meta">
                      {format(new Date(contact.createdAt), "MMM d, h:mm a")}
                    </td>
                  </tr>
                ))}
                {recentContacts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-[#8a9ab5] text-[13px]">No inquiries found yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Downloads */}
        <div className="bg-white rounded-[10px] border border-[#f0f2f8] overflow-hidden flex flex-col">
          <div className="p-5 border-b border-[#f0f2f8] flex items-center justify-between">
            <div>
              <h3 style={{fontSize: '15px', fontWeight: 600, color: '#0f1523'}}>Recent Downloads</h3>
            </div>
            <Link href="/admin/leads?type=brochure" style={{fontSize: '13px', color: '#c1000a', fontWeight: 500}} className="hover:underline">
              View All
            </Link>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left admin-table">
              <thead>
                <tr>
                  <th>USER</th>
                  <th>DOCUMENT</th>
                  <th>STATUS</th>
                  <th>DATE</th>
                </tr>
              </thead>
              <tbody>
                {recentBrochures.map((item) => (
                  <tr key={item.id} className="hover:bg-[#f8f9fb] transition-colors">
                    <td>
                      <div style={{fontSize: '13px', fontWeight: 500, color: '#0f1523'}}>{item.name}</div>
                      <div style={{fontSize: '11px', color: '#8a9ab5'}}>{item.email}</div>
                    </td>
                    <td>
                      <span style={{fontSize: '13px', color: '#4a5568', fontWeight: 500}}>
                        {item.brochureTitle}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '11px', fontWeight: 600, color: '#059669',
                        background: 'rgba(16,185,129,0.08)', padding: '4px 10px',
                        borderRadius: '20px'
                      }}>
                        • DELIVERED
                      </span>
                    </td>
                    <td className="admin-list-meta">
                      {format(new Date(item.createdAt), "MMM d, h:mm a")}
                    </td>
                  </tr>
                ))}
                {recentBrochures.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-10 text-center text-[#8a9ab5] text-[13px]">No downloads recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
