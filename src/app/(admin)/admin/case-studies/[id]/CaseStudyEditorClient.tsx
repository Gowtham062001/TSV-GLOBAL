"use client";

import React, { useState } from "react";
import Link from "next/link";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Save, ChevronLeft, Building2, Target, CheckCircle2, Truck, MapPin, BarChart3, Plus, Trash2, Globe, ExternalLink, Box, Layout, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { MediaSelector } from "@/components/admin/MediaSelector";
import { useToast } from "@/components/shared/Toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SeoPreview } from "@/components/admin/SeoPreview";

interface Metric {
  label: string;
  value: string;
}

interface CaseStudy {
  id?: string;
  title: string;
  slug: string;
  client: string | null;
  industry: string | null;
  mode: string | null;
  route: string | null;
  challenge: string | null;
  solution: string | null;
  result: string | null;
  metrics: any; // Metric[] stored as Json
  images: any;
  status: string;
  seoData?: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    faq?: { question: string; answer: string }[];
  };
}

export default function CaseStudyEditorClient({ cs }: { cs?: CaseStudy }) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  
  const initialImages: string[] = Array.isArray(cs?.images) ? cs.images : [];
  const initialMetrics: Metric[] = Array.isArray(cs?.metrics) ? cs.metrics : [];

  const [formData, setFormData] = useState<any>(cs ? {
    ...cs,
    images: initialImages,
    metrics: initialMetrics,
    isVisible: cs.isVisible !== undefined ? cs.isVisible : true,
    seoData: cs.seoData || { metaTitle: "", metaDescription: "", canonicalUrl: "", faq: [] }
  } : {
    title: "",
    slug: "",
    client: "",
    industry: "",
    mode: "",
    route: "",
    challenge: "",
    solution: "",
    result: "",
    metrics: [],
    images: [],
    tags: "",
    status: "DRAFT",
    isVisible: true,
    seoData: { metaTitle: "", metaDescription: "", canonicalUrl: "", faq: [] }
  });

  const [isSaving, setIsSaving] = useState(false);

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

  const handleAddMetric = () => {
    const newMetrics = [...(formData.metrics || []), { label: "", value: "" }];
    setFormData({ ...formData, metrics: newMetrics });
  };

  const handleUpdateMetric = (index: number, field: keyof Metric, value: string) => {
    const newMetrics = [...formData.metrics];
    newMetrics[index] = { ...newMetrics[index], [field]: value };
    setFormData({ ...formData, metrics: newMetrics });
  };

  const handleRemoveMetric = (index: number) => {
    const newMetrics = formData.metrics.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, metrics: newMetrics });
  };

  const handleAddImage = (url: string) => {
    if (!formData.images.includes(url)) {
      setFormData({ ...formData, images: [...formData.images, url] });
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = formData.images.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const url = cs?.id ? `/api/admin/case-studies/${cs.id}` : "/api/admin/case-studies";
      const method = cs?.id ? "PUT" : "POST";
      
      const payload = {
        ...formData,
        seoData: {
          ...formData.seoData,
          faqSchema: faqSchema
        }
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        success("Case study synchronized successfully!");
        router.push("/admin/case-studies");
        router.refresh();
      } else {
        toastError("Failed to save case study.");
      }
    } catch (error) {
      console.error(error);
      toastError("Failed to save case study.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100 gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/case-studies" className="w-10 h-10 bg-gray-50 text-gray-400 hover:text-[#e63946] hover:bg-red-50 rounded-xl flex items-center justify-center transition-all">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h2 className="text-xl font-bold text-gray-900 leading-tight">{cs?.id ? "Edit Case Study" : "New Case Study"}</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              {String(formData.title || "Untitled Project")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          {cs?.id && (
            <Link 
              href={`/case-studies/${formData.slug}`} 
              target="_blank" 
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all border border-gray-200"
            >
              <ExternalLink size={16} /> Preview
            </Link>
          )}
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 md:flex-none bg-[#e63946] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-red-700 disabled:opacity-50 transition-all shadow-lg shadow-red-900/10 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} /> Save Case Study
              </>
            )}
          </button>
        </div>
      </div>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="bg-gray-100/50 p-1 rounded-xl mb-6 flex w-fit border border-gray-100">
          <TabsTrigger value="content" className="px-6 py-2 rounded-lg flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#e63946] data-[state=active]:shadow-sm transition-all font-bold text-sm text-gray-400">
            <Layout size={16} /> Basic Info & SEO
          </TabsTrigger>
          <TabsTrigger value="details" className="px-6 py-2 rounded-lg flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#e63946] data-[state=active]:shadow-sm transition-all font-bold text-sm text-gray-400">
            <Layout size={16} /> Case Study Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Content */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Project Title</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => {
                      setFormData({ ...formData, title: e.target.value });
                      if (!cs?.id) setFormData((prev: any) => ({ ...prev, slug: e.target.value.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "") }));
                    }}
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#e63946]/10 focus:border-[#e63946] focus:bg-white outline-none text-lg font-bold transition-all"
                    placeholder="Industrial Machinery Export..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                      <Building2 size={14} /> Client Name
                    </label>
                    <input 
                      type="text" 
                      value={formData.client || ""}
                      onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-[#e63946] outline-none text-sm transition-all"
                      placeholder="Macro Dynamics Ltd"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Industry</label>
                    <input 
                      type="text" 
                      value={formData.industry || ""}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-[#e63946] outline-none text-sm transition-all"
                      placeholder="Renewable Energy"
                    />
                  </div>
                </div>
              </div>

              {/* SEO Content */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-800 uppercase tracking-widest border-b border-gray-50 pb-4">
                  <Globe size={18} className="text-[#e63946]" /> SEO Configuration
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Meta Title</label>
                      <input 
                        type="text" 
                        value={formData.seoData?.metaTitle || ""}
                        onChange={(e) => setFormData({ ...formData, seoData: { ...formData.seoData, metaTitle: e.target.value } })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-[#e63946] outline-none text-sm transition-all"
                        placeholder="Optimized Title for Search"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Canonical URL</label>
                      <input 
                        type="text" 
                        value={formData.seoData?.canonicalUrl || ""}
                        onChange={(e) => setFormData({ ...formData, seoData: { ...formData.seoData, canonicalUrl: e.target.value } })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-[#e63946] outline-none text-sm transition-all font-mono"
                        placeholder="https://tsvglobal.com/case-studies/..."
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Meta Description</label>
                    <textarea 
                      value={formData.seoData?.metaDescription || ""}
                      onChange={(e) => setFormData({ ...formData, seoData: { ...formData.seoData, metaDescription: e.target.value } })}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-[#e63946] outline-none text-sm transition-all min-h-[105px]"
                      placeholder="Short summary for search results (150-160 chars)"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <SeoPreview 
                    title={String(formData.seoData?.metaTitle || formData.title || "")} 
                    description={String(formData.seoData?.metaDescription || "")} 
                    url={`https://tsvglobal.com/case-studies/${formData.slug}`}
                    image={formData.images?.[0] || ""}
                  />
                </div>

                {/* FAQ Section */}
                <div className="pt-6 border-t border-gray-50 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Case Study FAQs</div>
                    <button 
                      onClick={() => {
                        const newFaq = [...(formData.seoData?.faq || []), { question: "", answer: "" }];
                        setFormData({ ...formData, seoData: { ...formData.seoData, faq: newFaq } });
                      }}
                      className="text-[#e63946] hover:text-red-700 text-[10px] font-bold uppercase flex items-center gap-1"
                    >
                      <Plus size={14} /> Add FAQ
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.seoData?.faq?.map((item: any, idx: number) => (
                      <div key={idx} className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-3 relative group">
                        <button 
                          onClick={() => {
                            const newFaq = formData.seoData.faq.filter((_: any, i: number) => i !== idx);
                            setFormData({ ...formData, seoData: { ...formData.seoData, faq: newFaq } });
                          }}
                          className="absolute top-2 right-2 p-1 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                        <input 
                          type="text" 
                          value={item.question}
                          onChange={(e) => {
                            const newFaq = [...formData.seoData.faq];
                            newFaq[idx].question = e.target.value;
                            setFormData({ ...formData, seoData: { ...formData.seoData, faq: newFaq } });
                          }}
                          className="w-full px-3 py-2 bg-white border border-gray-100 rounded-lg text-xs font-bold focus:border-[#e63946] outline-none"
                          placeholder="Question"
                        />
                        <textarea 
                          value={item.answer}
                          onChange={(e) => {
                            const newFaq = [...formData.seoData.faq];
                            newFaq[idx].answer = e.target.value;
                            setFormData({ ...formData, seoData: { ...formData.seoData, faq: newFaq } });
                          }}
                          className="w-full px-3 py-2 bg-white border border-gray-100 rounded-lg text-xs focus:border-[#e63946] outline-none min-h-[60px]"
                          placeholder="Answer"
                        />
                      </div>
                    ))}
                    {(!formData.seoData?.faq || formData.seoData.faq.length === 0) && (
                      <div className="text-center py-6 border-2 border-dashed border-gray-50 rounded-xl text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        No FAQs added
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                <h3 className="text-sm font-bold text-gray-800 border-b border-gray-50 pb-4 flex items-center gap-2">
                  <Box size={18} className="text-[#e63946]" /> Settings
                </h3>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Slug</label>
                  <input 
                    type="text" 
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#e63946]/10 focus:border-[#e63946] focus:bg-white outline-none font-mono text-xs font-bold transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#e63946]/10 focus:border-[#e63946] focus:bg-white outline-none text-xs font-bold transition-all"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Visibility</label>
                  <select 
                    value={formData.isVisible ? "true" : "false"}
                    onChange={(e) => setFormData({ ...formData, isVisible: e.target.value === "true" })}
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#e63946]/10 focus:border-[#e63946] focus:bg-white outline-none text-xs font-bold transition-all"
                  >
                    <option value="true">Visible</option>
                    <option value="false">Hidden</option>
                  </select>
                </div>

                <div className="space-y-2 pt-4 border-t border-gray-50">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Case Study Images</label>
                  <div className="grid grid-cols-2 gap-2">
                    {formData.images?.map((url: string, idx: number) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group border border-gray-100">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    <MediaSelector 
                      value="" 
                      onChange={handleAddImage}
                      label="Add"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="details">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-800 font-bold uppercase tracking-widest text-xs">
                    <Target size={16} className="text-[#e63946]" /> The Challenge
                  </div>
                  <RichTextEditor 
                    content={formData.challenge || ""} 
                    onChange={(html) => setFormData({ ...formData, challenge: html })} 
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-800 font-bold uppercase tracking-widest text-xs">
                    <CheckCircle2 size={16} className="text-[#e63946]" /> Our Solution
                  </div>
                  <RichTextEditor 
                    content={formData.solution || ""} 
                    onChange={(html) => setFormData({ ...formData, solution: html })} 
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-gray-800 font-bold uppercase tracking-widest text-xs">
                    <BarChart3 size={16} className="text-[#e63946]" /> The Result
                  </div>
                  <RichTextEditor 
                    content={formData.result || ""} 
                    onChange={(html) => setFormData({ ...formData, result: html })} 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                <h3 className="text-sm font-bold text-gray-800 border-b border-gray-50 pb-4 flex items-center gap-2">
                  <Truck size={18} className="text-[#e63946]" /> Logistics Data
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Transport Mode</label>
                    <div className="relative">
                      <Truck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        value={formData.mode || ""}
                        onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-[#e63946] outline-none text-sm transition-all"
                        placeholder="e.g. Road Freight — ODC"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Project Route</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        value={formData.route || ""}
                        onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-[#e63946] outline-none text-sm transition-all"
                        placeholder="e.g. Factory to Port"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-50 space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Key Metrics</label>
                    <button 
                      onClick={handleAddMetric}
                      className="text-[#e63946] hover:text-red-700 text-[10px] font-bold uppercase flex items-center gap-1"
                    >
                      <Plus size={14} /> Add
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.metrics?.map((metric: Metric, index: number) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 group">
                        <div className="flex-1 space-y-1">
                          <input 
                            type="text"
                            value={metric.label}
                            onChange={(e) => handleUpdateMetric(index, 'label', e.target.value)}
                            placeholder="Label"
                            className="w-full bg-transparent text-[9px] font-bold text-gray-400 uppercase tracking-widest outline-none"
                          />
                          <input 
                            type="text"
                            value={metric.value}
                            onChange={(e) => handleUpdateMetric(index, 'value', e.target.value)}
                            placeholder="Value"
                            className="w-full bg-transparent text-xs font-bold text-gray-800 outline-none"
                          />
                        </div>
                        <button 
                          onClick={() => handleRemoveMetric(index)}
                          className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
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
