"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SeoPreview } from "@/components/admin/SeoPreview";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { MediaSelector } from "@/components/admin/MediaSelector";
import { useToast } from "@/components/shared/Toast";
import { Layout, Globe, Trash2, Plus, ArrowLeft, Save, Loader2, Eye, Star } from "lucide-react";

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  content: string | Record<string, unknown>;
  excerpt: string | null;
  coverImage: string | null;
  category: string | null;
  status: string;
  isFeatured?: boolean;
  author?: string | null;
  readTime?: number | null;
  tags?: string | null;
  seoData?: any;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function BlogEditorClient({ post }: { post?: BlogPost }) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [formData, setFormData] = useState<BlogPost>(post || {
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    coverImage: "",
    category: "Industry Insights",
    status: "DRAFT",
    isFeatured: false,
    author: "",
    tags: "",
    seoData: { metaTitle: "", metaDescription: "", canonicalUrl: "", faq: [] }
  });
  const [isSaving, setIsSaving] = useState(false);
  const [categoriesList, setCategoriesList] = useState<{ id: string; name: string; slug: string }[]>([]);

  // Load categories list from API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch("/api/admin/blog/categories");
        if (res.ok) {
          const data = await res.json();
          setCategoriesList(data);
          // If category is not set, default to first category
          if (!formData.category && data.length > 0) {
            setFormData((prev) => ({ ...prev, category: data[0].name }));
          }
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    loadCategories();
  }, []);

  // Auto-generate slug from title (only for new posts)
  useEffect(() => {
    if (!post?.id && formData.title) {
      setFormData((prev) => ({ ...prev, slug: slugify(prev.title) }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.title]);

  const faqSchema = React.useMemo(() => {
    if (!formData.seoData?.faq || formData.seoData.faq.length === 0) return null;

    const questions = formData.seoData.faq
      .filter((q: any) => q.question && q.answer)
      .map((item: any) => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.answer
        }
      }));

    if (questions.length === 0) return null;

    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": questions
    }, null, 2);
  }, [formData.seoData?.faq]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        seoData: {
          ...formData.seoData,
          faqSchema: faqSchema
        }
      };

      const url = post?.id ? `/api/admin/blog/${post.id}` : "/api/admin/blog";
      const method = post?.id ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        success(post?.id ? "Blog post updated!" : "Blog post created!");
        router.push("/admin/blog");
        router.refresh();
      } else {
        toastError("Failed to save post.");
      }
    } catch (error) {
      console.error(error);
      toastError("Failed to save post.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-10 pb-32 animate-in fade-in duration-1000">
      {/* Editor Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-10 rounded-[10px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-50/30 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110"></div>
        <div className="flex items-center gap-6 relative z-10">
          <Link href="/admin/blog" className="w-14 h-14 bg-slate-50 text-slate-400 hover:text-[#c1000a] hover:bg-red-50 rounded-2xl flex items-center justify-center transition-all border border-slate-100 shadow-sm">
            <ArrowLeft size={22} />
          </Link>
          <div>
            <div className="flex items-center gap-4 mb-1">
              <h2 className="text-[15px] font-bold text-slate-900 tracking-tight font-outfit">{post?.id ? "Update Insight" : "Draft Insight"}</h2>
              <span className={`px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] rounded-full border ${
                formData.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
              }`}>
                {formData.status}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.25em] font-outfit">{formData.title || "Untitled Editorial"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-3 px-4 py-2 bg-[#0f1523] text-white rounded-lg text-[13px] font-medium hover:bg-slate-800 disabled:opacity-50 transition-all shadow-sm active:scale-95"
          >
            {isSaving ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            {isSaving ? "Syncing..." : "Sync Insight"}
          </button>
        </div>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl mb-12 flex w-fit border border-slate-200/50 shadow-inner">
          <TabsTrigger value="content" className="px-10 py-3.5 rounded-xl flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#c1000a] data-[state=active]:shadow-lg transition-all font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400 font-outfit">
            <Layout size={16} /> Editorial Content
          </TabsTrigger>
          <TabsTrigger value="seo" className="px-10 py-3.5 rounded-xl flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#c1000a] data-[state=active]:shadow-lg transition-all font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400 font-outfit">
            <Globe size={16} /> SEO & Indexing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-6 rounded-[10px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-12">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] px-1 font-outfit">Article Headline</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50/50 border border-slate-100 rounded-lg focus:border-[#0f1523] outline-none transition-all text-[13px] text-slate-900 font-medium"
                    placeholder="Enter a catchy title..."
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] px-1 font-outfit">Dynamic Content Body</label>
                  <div className="rounded-lg overflow-hidden border border-slate-100 bg-slate-50/30">
                    <RichTextEditor 
                      content={typeof formData.content === 'string' ? formData.content : JSON.stringify(formData.content)} 
                      onChange={(html) => setFormData({ ...formData, content: html })} 
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] px-1 font-outfit">Editorial Excerpt</label>
                  <textarea 
                    rows={4}
                    value={formData.excerpt || ""}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50/50 border border-slate-100 rounded-lg focus:border-[#0f1523] outline-none text-[13px] text-slate-600 font-medium leading-relaxed transition-all resize-none"
                    placeholder="A brief summary for the blog listing page..."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Classification Card */}
              <div className="bg-white p-6 rounded-[10px] border border-slate-100 shadow-sm space-y-6">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] border-b border-slate-50 pb-4">Classification</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-red-500/10 focus:border-[#c1000a] outline-none text-xs font-bold text-slate-700 transition-all appearance-none"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="PUBLISHED">Published</option>
                      <option value="SCHEDULED">Scheduled</option>
                    </select>
                  </div>
                   <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Category</label>
                    <select
                      value={formData.category || ""}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-red-500/10 focus:border-[#c1000a] outline-none text-xs font-bold text-slate-700 transition-all appearance-none"
                    >
                      <option value="">Select a category</option>
                      {categoriesList.map((cat) => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Slug (URL)</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-red-500/10 focus:border-[#c1000a] outline-none font-mono text-[10px] text-[#c1000a] font-bold transition-all"
                      placeholder="auto-generated-from-title"
                    />
                    <p className="text-[9px] text-slate-400 px-1">tsvglobal.com/blog/{formData.slug || "…"}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Author Name</label>
                    <input
                      type="text"
                      value={formData.author || ""}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-red-500/10 focus:border-[#c1000a] outline-none text-xs font-medium text-slate-700 transition-all"
                      placeholder="TSV Editorial Team"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Tags (comma separated)</label>
                    <input
                      type="text"
                      value={formData.tags || ""}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-red-500/10 focus:border-[#c1000a] outline-none text-xs font-medium text-slate-700 transition-all"
                      placeholder="logistics, freight, india"
                    />
                  </div>
                  {/* Featured Toggle */}
                  <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Star size={14} className="text-amber-400" />
                      <label className="text-xs font-bold text-slate-700">Featured Post</label>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isFeatured: !formData.isFeatured })}
                      className={`w-10 h-5 rounded-full relative transition-all ${formData.isFeatured ? "bg-amber-400" : "bg-slate-200"}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${formData.isFeatured ? "left-5" : "left-0.5"}`} />
                    </button>
                  </div>
                  {/* Live Preview Link */}
                  {post?.id && formData.status === "PUBLISHED" && formData.slug && (
                    <a
                      href={`/blog/${formData.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 w-full px-4 py-3 bg-green-50 text-green-700 border border-green-100 rounded-xl text-xs font-bold hover:bg-green-100 transition-all"
                    >
                      <Eye size={14} />
                      View Live Post
                    </a>
                  )}
                </div>
              </div>

              {/* Cover Image */}
              <div className="bg-white p-8 rounded-[10px] border border-slate-100 shadow-sm">
                <MediaSelector
                  value={formData.coverImage || ""}
                  onChange={(url) => setFormData({ ...formData, coverImage: url })}
                  label="Cover Image"
                />
              </div>
            </div>

          </div>
        </TabsContent>

        <TabsContent value="seo" className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-6 rounded-[10px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-12">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight font-outfit">Search Engine Optimization</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.25em] mt-1">Configure global indexing metadata</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] px-1 font-outfit">Meta Title</label>
                      <input 
                        type="text" 
                        value={formData.seoData?.metaTitle || ""}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          seoData: { ...formData.seoData, metaTitle: e.target.value } 
                        })}
                        className="w-full px-8 py-5 bg-slate-50/50 border border-slate-100 rounded-lg focus:ring-4 focus:ring-red-500/5 focus:border-[#c1000a] focus:bg-white outline-none transition-all text-sm font-bold text-slate-700" 
                        placeholder="Optimized headline..." 
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] px-1 font-outfit">Canonical URL</label>
                      <input 
                        type="text" 
                        value={formData.seoData?.canonicalUrl || ""}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          seoData: { ...formData.seoData, canonicalUrl: e.target.value } 
                        })}
                        className="w-full px-8 py-5 bg-slate-50/50 border border-slate-100 rounded-lg focus:ring-4 focus:ring-red-500/5 focus:border-[#c1000a] focus:bg-white outline-none transition-all text-[11px] font-mono text-slate-500" 
                        placeholder="https://tsvglobal.com/blog/..." 
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] px-1 font-outfit">Meta Description</label>
                    <textarea 
                      rows={6} 
                      value={formData.seoData?.metaDescription || ""}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        seoData: { ...formData.seoData, metaDescription: e.target.value } 
                      })}
                      className="w-full px-8 py-5 bg-slate-50/50 border border-slate-100 rounded-lg focus:ring-4 focus:ring-red-500/5 focus:border-[#c1000a] focus:bg-white outline-none transition-all text-sm font-bold text-slate-600 leading-relaxed resize-none" 
                      placeholder="Article summary for search (160 characters)..." 
                    />
                  </div>
                </div>

                <div className="pt-12 border-t border-slate-50 space-y-8">
                   <div className="flex items-center justify-between">
                     <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] font-outfit">Article Specific FAQs</h4>
                     <button 
                       onClick={() => setFormData({ 
                         ...formData, 
                         seoData: { ...formData.seoData, faq: [...(formData.seoData?.faq || []), { question: "", answer: "" }] } 
                       })}
                       className="text-[#c1000a] text-[10px] font-bold uppercase tracking-[0.25em] hover:text-red-700 flex items-center gap-2 font-outfit"
                     >
                       <Plus size={16} /> Add FAQ Node
                     </button>
                   </div>
                   
                   <div className="space-y-6">
                     {formData.seoData?.faq?.map((item: any, idx: number) => (
                       <div key={idx} className="bg-slate-50/50 p-8 rounded-[10px] border border-slate-100 relative group transition-all hover:bg-white hover:shadow-xl hover:shadow-red-900/5">
                         <button 
                           onClick={() => setFormData({ 
                             ...formData, 
                             seoData: { ...formData.seoData, faq: formData.seoData.faq.filter((_: any, i: number) => i !== idx) } 
                           })}
                           className="absolute top-4 right-4 p-2 text-slate-300 hover:text-[#c1000a] transition-colors opacity-0 group-hover:opacity-100"
                         >
                           <Trash2 size={20} />
                         </button>
                         <div className="space-y-4">
                           <input 
                             type="text"
                             value={item.question}
                             onChange={(e) => {
                               const newFaq = [...formData.seoData.faq];
                               newFaq[idx].question = e.target.value;
                               setFormData({ ...formData, seoData: { ...formData.seoData, faq: newFaq } });
                             }}
                             className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 outline-none focus:border-[#c1000a] shadow-sm"
                             placeholder="Search Question"
                           />
                           <textarea 
                             value={item.answer}
                             onChange={(e) => {
                               const newFaq = [...formData.seoData.faq];
                               newFaq[idx].answer = e.target.value;
                               setFormData({ ...formData, seoData: { ...formData.seoData, faq: newFaq } });
                             }}
                             className="w-full bg-white border border-slate-100 rounded-2xl px-6 py-4 text-sm text-slate-600 outline-none focus:border-[#c1000a] min-h-[100px] shadow-sm resize-none"
                             placeholder="Search Answer"
                           />
                         </div>
                       </div>
                     ))}
                     {(!formData.seoData?.faq || formData.seoData.faq.length === 0) && (
                       <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-[10px] text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em] font-outfit">
                         No Structured FAQ Data
                       </div>
                     )}
                   </div>
                </div>
              </div>
            </div>

            <div className="space-y-10">
              <div className="bg-white p-10 rounded-[10px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-10 font-outfit px-1">Engine Preview</h3>
                <SeoPreview 
                  title={String(formData.seoData?.metaTitle || formData.title || "Insight Detail")} 
                  description={String(formData.seoData?.metaDescription || formData.excerpt || "")} 
                  url={`https://tsvglobal.com/blog/${formData.slug}`}
                  image={formData.coverImage || undefined}
                />
              </div>

              <div className="bg-slate-900 text-white p-6 rounded-[10px] shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#c1000a]/20 to-transparent opacity-50"></div>
                <div className="relative z-10 space-y-8">
                  <h3 className="text-xl font-extrabold tracking-tight uppercase tracking-[0.1em] font-outfit">Core Engine</h3>
                  <div className="pt-6 border-t border-white/5 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-[#c1000a] rounded-full shadow-[0_0_10px_rgba(193,0,10,0.5)]"></div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-relaxed font-outfit">Dynamic Indexing Active</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
