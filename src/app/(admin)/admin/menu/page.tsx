export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import React from "react";
import { MenuBuilderClient } from "./MenuBuilderClient";
export default async function AdminMenuPage() {
  const [menuItems, pages, blogs] = await Promise.all([
    prisma.menuItem.findMany({
      orderBy: { order: "asc" },
    }),
    prisma.page.findMany({
      select: { id: true, title: true, slug: true },
      orderBy: { title: "asc" }
    }),
    prisma.blogPost.findMany({
      select: { id: true, title: true, slug: true },
      orderBy: { title: "asc" }
    })
  ]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex justify-between items-center bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-50/30 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-outfit">Navigation Engine</h2>
          <div className="flex items-center gap-3 mt-1">
            <div className="w-2 h-2 bg-[#c1000a] rounded-full animate-pulse shadow-[0_0_8px_rgba(193,0,10,0.4)]"></div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.25em] font-outfit">Global Architecture Control</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 relative z-10">
           <div className="text-right">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-outfit">Hierarchy Status</p>
              <p className="text-xs font-bold text-slate-700 font-outfit">Synchronized</p>
           </div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-left-4 duration-700">
        <MenuBuilderClient 
          initialItems={menuItems} 
          availablePages={pages.map(p => ({ label: p.title, url: `/${p.slug}` }))}
          availableBlogs={blogs.map(b => ({ label: b.title, url: `/blog/${b.slug}` }))}
        />
      </div>
    </div>
  );
}
