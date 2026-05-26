"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Save, ChevronLeft, Building2, Target, CheckCircle2, Truck, MapPin, BarChart3, Plus, Trash2, Globe, ExternalLink, Box, Layout, Search, GripVertical, Eye, EyeOff, Edit3, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { MediaSelector } from "@/components/admin/MediaSelector";
import { useToast } from "@/components/shared/Toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SeoPreview } from "@/components/admin/SeoPreview";
import { SectionEditor } from "@/components/admin/SectionEditor";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Metric {
  label: string;
  value: string;
}

interface Section {
  id: string;
  type: string;
  label: string;
  content: Record<string, any>;
  isVisible: boolean;
  order: number;
}

const AVAILABLE_SECTION_TYPES = [
  { type: "page_header", label: "Page Header Banner", desc: "Top hero banner with background image and main title" },
  { type: "breadcrumb_strip", label: "Breadcrumb Strip", desc: "Thin navigation strip (Home > Section > Page)" },
  { type: "simple_content", label: "Simple Rich Content", desc: "General custom HTML / typography block" },
  { type: "service_faq", label: "Case Study FAQs", desc: "Expandable accordion questions and answers" },
  { type: "cta_section", label: "Conversion Banner", desc: "Call to action strip with contact elements" },
  { type: "case_study_stats", label: "Case Study Stats", desc: "Key performance metrics and result highlights" },
];

function SortableSectionItem({
  section,
  index,
  onToggle,
  onEdit,
  onDelete,
}: {
  section: Section;
  index: number;
  onToggle: (id: string) => void;
  onEdit: (section: Section) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 100 : "auto" };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl border transition-all flex items-center gap-4 p-4 group shadow-sm ${
        isDragging ? "shadow-xl border-[#e63946] ring-2 ring-red-50" : "hover:border-gray-300"
      } ${!section.isVisible ? "opacity-50" : ""}`}
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-[#e63946] transition-colors p-2">
        <GripVertical size={20} />
      </div>
      <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-[10px] font-bold text-gray-400 group-hover:bg-red-50 group-hover:text-[#e63946] transition-all border border-gray-100">
        {String(index + 1).padStart(2, "0")}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="font-bold text-gray-800 truncate">{section.label}</h3>
          <span className="text-[10px] bg-red-50 text-[#e63946] px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
            {section.type.replace(/_/g, " ")}
          </span>
        </div>
        <p className="text-xs text-gray-400 truncate">{JSON.stringify(section.content).substring(0, 100)}...</p>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onToggle(section.id)}
          className={`p-2 rounded-lg transition-all ${
            section.isVisible ? "text-green-600 hover:bg-green-50" : "text-gray-300 hover:bg-gray-50"
          }`}
          title={section.isVisible ? "Visible" : "Hidden"}
        >
          {section.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
        <button type="button" onClick={() => onEdit(section)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
          <Edit3 size={18} />
        </button>
        <button type="button" onClick={() => onDelete(section.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete">
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
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
  metrics: any;
  images: any;
  status: string;
  sections?: Section[];
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
    seoData: { metaTitle: "", metaDescription: "", canonicalUrl: "", faq: [] }
  });

  const [sections, setSections] = useState<Section[]>(cs?.sections || []);
  const [isSaving, setIsSaving] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex).map((item, idx) => ({ ...item, order: idx }));
      });
    }
  };

  const handleToggleVisibility = (id: string) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, isVisible: !s.isVisible } : s)));
  };

  const handleUpdateSection = (updatedSection: Section) => {
    if (!sections.find((s) => s.id === updatedSection.id)) {
      setSections([...sections, updatedSection]);
    } else {
      setSections((prev) => prev.map((s) => (s.id === updatedSection.id ? updatedSection : s)));
    }
    setEditingSection(null);
  };

  const handleDeleteSection = (id: string) => {
    if (confirm("Are you sure you want to delete this section?")) {
      setSections((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const filteredSectionTypes = useMemo(() => {
    return AVAILABLE_SECTION_TYPES.filter(
      (item) =>
        item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);


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
        seoData: { ...formData.seoData, faqSchema: faqSchema }
      };

      // 1. Save general case study metadata
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save case study metadata");

      const savedCs = await response.json();
      const actualId = cs?.id || savedCs.id;

      // 2. Save sections
      const sectionsRes = await fetch(`/api/admin/case-studies/${actualId}/sections`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections }),
      });

      if (sectionsRes.ok) {
        success("Case study synchronized successfully!");
        router.push("/admin/case-studies");
        router.refresh();
      } else {
        toastError("Metadata saved but sections sync failed.");
      }
    } catch (error: any) {
      console.error(error);
      toastError(error.message || "Failed to save case study.");
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
            <Layout size={16} /> Basic Info &amp; SEO
          </TabsTrigger>
          <TabsTrigger value="details" className="px-6 py-2 rounded-lg flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#e63946] data-[state=active]:shadow-sm transition-all font-bold text-sm text-gray-400">
            <Layout size={16} /> Case Study Details
          </TabsTrigger>
          <TabsTrigger value="sections" className="px-6 py-2 rounded-lg flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#e63946] data-[state=active]:shadow-sm transition-all font-bold text-sm text-gray-400">
            <Box size={16} /> Page Sections
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

              {/* Header Style Configuration */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-800 uppercase tracking-widest border-b border-gray-50 pb-4">
                  <Layout size={18} className="text-[#e63946]" /> Header Style & Presentation
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <MediaSelector 
                      value={formData.seoData?.bgImage || ""} 
                      onChange={(url) => setFormData({ ...formData, seoData: { ...formData.seoData, bgImage: url } })} 
                      label="Header Background Image"
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Header Title Color</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={formData.seoData?.textColor || "#ffffff"}
                          onChange={(e) => setFormData({ ...formData, seoData: { ...formData.seoData, textColor: e.target.value } })}
                          className="w-10 h-10 border border-gray-200 rounded-xl cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={formData.seoData?.textColor || ""}
                          onChange={(e) => setFormData({ ...formData, seoData: { ...formData.seoData, textColor: e.target.value } })}
                          className="flex-1 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-[#e63946] outline-none text-sm transition-all font-medium"
                          placeholder="#ffffff"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Header Tag/Subtext Color</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={formData.seoData?.subTextColor || "#c1000a"}
                          onChange={(e) => setFormData({ ...formData, seoData: { ...formData.seoData, subTextColor: e.target.value } })}
                          className="w-10 h-10 border border-gray-200 rounded-xl cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={formData.seoData?.subTextColor || ""}
                          onChange={(e) => setFormData({ ...formData, seoData: { ...formData.seoData, subTextColor: e.target.value } })}
                          className="flex-1 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:border-[#e63946] outline-none text-sm transition-all font-medium"
                          placeholder="#c1000a"
                        />
                      </div>
                    </div>
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

        <TabsContent value="sections" className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div>
              <h3 className="font-bold text-gray-900">Page Sections</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Drag to reorder · click Eye to hide/show · click Edit to configure</p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingSection(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all shadow-sm"
            >
              <Plus size={16} className="text-[#e63946]" /> Append Node
            </button>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {sections.length === 0 ? (
                  <div className="text-center p-20 bg-white border-2 border-dashed border-gray-100 rounded-2xl text-gray-400">
                    No layout sections appended yet. Click &quot;Append Node&quot; to begin.
                  </div>
                ) : (
                  sections.map((section, index) => (
                    <SortableSectionItem
                      key={section.id}
                      section={section}
                      index={index}
                      onToggle={handleToggleVisibility}
                      onEdit={setEditingSection}
                      onDelete={handleDeleteSection}
                    />
                  ))
                )}
              </div>
            </SortableContext>
          </DndContext>
        </TabsContent>
      </Tabs>

      {/* Append Layout Node Modal */}
      {isAddingSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Append Section</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Select a modular layout node to append</p>
              </div>
              <button
                type="button"
                onClick={() => { setIsAddingSection(false); setSearchTerm(""); }}
                className="w-8 h-8 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-[#e63946] rounded-lg flex items-center justify-center transition-all border border-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search layout modules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-[#e63946] focus:ring-2 focus:ring-red-100 outline-none text-xs font-medium transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSectionTypes.length === 0 ? (
                <div className="col-span-2 text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-[10px]">No matching modules found</div>
              ) : (
                filteredSectionTypes.map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => {
                      const newSection: Section = {
                        id: `temp_${Date.now()}`,
                        type: item.type,
                        label: item.label,
                        content: {},
                        isVisible: true,
                        order: sections.length,
                      };
                      setSections([...sections, newSection]);
                      setIsAddingSection(false);
                      setSearchTerm("");
                      setEditingSection(newSection);
                    }}
                    className="flex items-start text-left p-4 bg-white hover:bg-red-50/30 border border-slate-100 hover:border-red-200 rounded-xl transition-all group hover:shadow-sm"
                  >
                    <div className="w-8 h-8 bg-slate-50 group-hover:bg-[#e63946]/10 text-slate-400 group-hover:text-[#e63946] rounded-lg flex items-center justify-center transition-all border border-slate-100 group-hover:border-transparent mr-3 flex-shrink-0">
                      <Plus size={14} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs mb-0.5 group-hover:text-[#e63946] transition-all">{item.label}</h4>
                      <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {editingSection && (
        <SectionEditor
          section={editingSection as any}
          onClose={() => setEditingSection(null)}
          onSave={handleUpdateSection as any}
        />
      )}
    </div>
  );
}
