"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

import { 
  LayoutDashboard, 
  Layout, 
  Briefcase, 
  FolderOpen, 
  Edit3, 
  Image as ImageIcon, 
  Menu, 
  Mail, 
  Download, 
  Users, 
  BarChart3, 
  Settings,
  ChevronRight,
  User,
  LogOut,
  PanelLeft,
  GitBranch,
  FileText
} from "lucide-react";
import "../globals.css";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { type: "label", label: "CONTENT" },
  { label: "Pages", href: "/admin/pages", icon: Layout },
  { label: "Services", href: "/admin/services", icon: Briefcase },
  { label: "Case Studies", href: "/admin/case-studies", icon: FolderOpen },
  { label: "Blog Posts", href: "/admin/blog", icon: Edit3 },
  { label: "Gallery", href: "/admin/gallery", icon: ImageIcon },
  { label: "Menu Manager", href: "/admin/menu", icon: Menu, roles: ["SUPER_ADMIN", "ADMIN"] },
  { type: "label", label: "LEADS" },
  { label: "Contact Submissions", href: "/admin/leads?type=contact", icon: Mail },
  { label: "Brochure Downloads", href: "/admin/leads?type=brochure", icon: FileText },
  { label: "Brochure Manager", href: "/admin/brochure", icon: Download },
  { type: "label", label: "SYSTEM", roles: ["SUPER_ADMIN", "ADMIN"] },
  { label: "Users", href: "/admin/users", icon: Users, roles: ["SUPER_ADMIN"] },
  { label: "Permissions", href: "/admin/settings/permissions", icon: Settings, roles: ["SUPER_ADMIN"] },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3, roles: ["SUPER_ADMIN", "ADMIN"] },
  { type: "label", label: "PROJECT MANAGEMENT" },
  { label: "Dev Process", href: "/admin/process", icon: GitBranch },
  { label: "Settings", href: "/admin/settings", icon: Settings, roles: ["SUPER_ADMIN", "ADMIN"] },
];

import { AuthProvider } from "@/components/admin/AuthProvider";
import { ProfileDropdown } from "@/components/admin/ProfileDropdown";
import { NotificationBell } from "@/components/admin/NotificationBell";
import { ToastProvider } from "@/components/shared/Toast";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "EDITOR";

  const getBreadcrumbs = () => {
    if (!pathname) return [];
    const parts = pathname.split("/").filter(Boolean);
    return parts.map((part, index) => {
      const href = "/" + parts.slice(0, index + 1).join("/");
      const label = part.charAt(0).toUpperCase() + part.slice(1).replace("-", " ");
      return { label, href, isLast: index === parts.length - 1 };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/60 shadow-[4px_0_24px_rgba(0,0,0,0.015)]">
      {/* Logo Area */}
      <div className="h-[90px] flex items-center px-10 border-b border-slate-100 shrink-0 bg-white">
        <Link href="/admin/dashboard" className="flex items-center gap-3 group">
          <img src="/assets/img/logo.png" alt="TSV Global" className="h-10 w-auto transition-all duration-700 group-hover:scale-105" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-10 px-6 space-y-1 custom-scrollbar">
        {navItems.filter(item => !item.roles || item.roles.includes(userRole)).map((item, index) => {
          if (item.type === "label") {
            return (
              <div key={index} className="px-4 pt-8 pb-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em]">
                {item.label}
              </div>
            );
          }

          const isActive = pathname ? (pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href))) : false;
          const Icon = item.icon as any;

          return (
            <Link 
              key={index}
              href={item.href!}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[11px] font-bold tracking-tight transition-all duration-300 group relative overflow-hidden ${
                isActive 
                  ? "bg-[#0f172a] text-white shadow-xl shadow-slate-900/10" 
                  : "text-slate-700 hover:text-[#c1000a] hover:bg-slate-50"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-0 w-1 h-full bg-[#c1000a]"></div>
              )}
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? "text-white" : "text-slate-400 group-hover:text-[#c1000a] transition-all duration-300"} />
              <span className="relative z-10">{item.label}</span>
              {isActive && <ChevronRight size={14} className="ml-auto text-white/40" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer Status */}
      <div className="p-8 border-t border-slate-100 bg-slate-50/30">
        <div className="flex items-center gap-3.5 px-4">
          <div className="relative">
            <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
            <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20"></div>
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Secure Console Active</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden lg:flex fixed left-0 top-0 h-full transition-all duration-500 z-50 flex-col overflow-hidden ${isSidebarOpen ? "w-[280px]" : "w-0 shadow-none border-none"}`}
      >
        <div className="w-[280px] h-full">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60] animate-in fade-in duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside 
        className={`lg:hidden fixed left-0 top-0 h-full w-[280px] z-[70] transition-transform duration-500 transform ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-500 ${isSidebarOpen ? "lg:pl-[280px]" : "lg:pl-0"}`}>
        {/* Top Header Bar */}
        <header className="h-[90px] bg-white/80 backdrop-blur-xl border-b border-slate-200/50 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-40">
          <div className="flex items-center gap-4 lg:gap-6">
            <button 
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setIsMobileOpen(!isMobileOpen);
                } else {
                  setIsSidebarOpen(!isSidebarOpen);
                }
              }}
              className="w-10 h-10 flex items-center justify-center bg-white text-slate-600 rounded-xl hover:bg-[#c1000a] hover:text-white transition-all shadow-sm border border-slate-200/60 active:scale-95"
            >
              <PanelLeft size={18} strokeWidth={2.5} />
            </button>
            
            <nav className="hidden sm:flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.2em] font-outfit">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <span className="text-slate-300">/</span>}
                  <Link 
                    href={crumb.href}
                    className={crumb.isLast ? "text-slate-900" : "text-slate-400 hover:text-[#c1000a] transition-colors"}
                  >
                    {crumb.label}
                  </Link>
                </React.Fragment>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4 lg:gap-8">
            <NotificationBell />
            
            <div className="hidden sm:block h-8 w-[1px] bg-slate-100"></div>

            <ProfileDropdown />
          </div>
        </header>

        {/* Page Title Banner */}
        <div className="px-6 lg:px-10 py-10 bg-gradient-to-r from-white to-slate-50/50 border-b border-slate-200/50">
           <div className="flex items-center justify-between">
             <div>
               <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mb-1 font-outfit">
                 {breadcrumbs[breadcrumbs.length - 1]?.label || "Dashboard"}
               </h2>
               <div className="flex items-center gap-2">
                 <span className="w-1.5 h-1.5 bg-[#c1000a] rounded-full"></span>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.25em] font-outfit">
                   TSV Global &bull; Control Center
                 </p>
               </div>
             </div>
             <div className="hidden md:flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-[#c1000a]">
                  <LayoutDashboard size={20} />
                </div>
                <div className="pr-4 font-outfit">
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Environment</p>
                   <p className="text-xs font-bold text-slate-700">Production Live</p>
                </div>
             </div>
           </div>
        </div>

        {/* Content Container */}
        <main className="p-6 lg:p-10 flex-1 max-w-[1600px] mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="/lib/font-awesome-pro/css/fontawesome.min.css" />
      </head>
      <body className="bg-[#f1f5f9] text-slate-800 antialiased relative font-inter">
        <AuthProvider>
          <ToastProvider>

            <AdminLayoutContent>
              {children}
            </AdminLayoutContent>
          </ToastProvider>
        </AuthProvider>

        <style dangerouslySetInnerHTML={{ __html: `
          * {
            font-family: 'Inter', sans-serif !important;
          }
          h1, h2, h3, h4, h5, h6, .font-outfit, [class*="font-outfit"] {
            font-family: 'Outfit', sans-serif !important;
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(15, 23, 42, 0.05);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(15, 23, 42, 0.1);
          }
          
          #brochure-sticky-btn, .pulse-btn {
            display: none !important;
          }

          input, select, textarea {
            font-size: 14px !important;
          }

          @media (max-width: 768px) {
            .menu-manager-layout {
              flex-direction: column !important;
            }
            .menu-tree-panel,
            .menu-add-panel {
              width: 100% !important;
              max-width: 100% !important;
              border-right: none !important;
              border-bottom: 1px solid #f0f2f8 !important;
            }
            .admin-list-item {
              padding: 12px 14px !important;
              gap: 10px !important;
            }
            .admin-list-title {
              font-size: 13px !important;
            }
            .admin-list-meta {
              font-size: 10px !important;
            }
            .admin-list-actions {
              flex-shrink: 0 !important;
              gap: 6px !important;
            }
            .admin-icon-btn {
              width: 30px !important;
              height: 30px !important;
            }
            .menu-add-form {
              padding: 16px !important;
            }
            .menu-add-form input,
            .menu-add-form select {
              height: 40px !important;
              font-size: 13px !important;
            }
          }

          @media (max-width: 480px) {
            .admin-list-meta {
              display: none !important;
            }
            .admin-icon-btn {
              width: 36px !important;
              height: 36px !important;
            }
          }
        `}} />
      </body>
    </html>
  );
}
