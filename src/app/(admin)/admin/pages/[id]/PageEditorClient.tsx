"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
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
import { 
  GripVertical, 
  Eye, 
  EyeOff, 
  Edit3, 
  Trash2, 
  Globe, 
  Settings, 
  ArrowLeft,
  ExternalLink,
  Save,
  Plus,
  Layout,
  Loader2,
  X,
  Search,
  Edit,
  Check
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SeoPreview } from "@/components/admin/SeoPreview";
import { SectionEditor } from "@/components/admin/SectionEditor";
import { MediaSelector } from "@/components/admin/MediaSelector";
import { useToast } from "@/components/shared/Toast";

interface Section {
  id: string;
  type: string;
  label: string;
  content: Record<string, unknown>;
  isVisible: boolean;
  order: number;
}

interface Page {
  id: string;
  title: string;
  slug: string;
  status: string;
  isVisible: boolean;
  seoData?: any;
  sections: Section[];
}

const AVAILABLE_SECTION_TYPES = [
  { type: "hero_slider", label: "Hero Slider", desc: "Top header slider with slides, text & images" },
  { type: "about_section", label: "About Us Section", desc: "Intro block with title, description and brand image" },
  { type: "who_we_are", label: "Who We Are", desc: "Premium introductory layout with list features" },
  { type: "marquee", label: "Marquee Scroll", desc: "Horizontal scrolling keywords banner block" },
  { type: "page_header", label: "Page Header Banner", desc: "Page title header with custom background image" },
  { type: "breadcrumb_strip", label: "Breadcrumb Strip", desc: "Thin navigation strip (Home > Section > Page)" },
  { type: "simple_content", label: "Simple Rich Content", desc: "General custom HTML / typography block" },
  { type: "google_map", label: "Google Map Embed", desc: "Dynamic interactive Google Map iframe" },
  { type: "service_faq", label: "Accordion Page FAQs", desc: "Expandable accordions for general page FAQs" },
  { type: "services_grid", label: "Services Showcase", desc: "Feature all standard services in a premium grid" },
  { type: "cta_section", label: "Conversion Banner", desc: "Call to action strip with dynamic contact elements" },
  { type: "case_studies", label: "Case Studies Strip", desc: "Horizontal sequence of published portfolio items" }
];

function SortableSectionItem({ 
  section, 
  index, 
  onToggle,
  onEdit,
  onDelete
}: { 
  section: Section, 
  index: number,
  onToggle: (id: string) => void,
  onEdit: (section: Section) => void,
  onDelete: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 'auto',
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-2xl border transition-all flex items-center gap-6 p-5 group shadow-sm admin-section-row ${
        isDragging ? 'shadow-2xl border-[#e63946] ring-4 ring-red-50' : 'hover:border-gray-300'
      } ${!section.isVisible ? 'opacity-50' : ''}`}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-[#e63946] transition-colors p-2"
      >
        <GripVertical size={20} />
      </div>
      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-xs font-black text-slate-400 group-hover:bg-red-50 group-hover:text-[#e63946] transition-all">
        {String(index + 1).padStart(2, '0')}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="font-bold text-slate-800 truncate">{section.label}</h3>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
            {section.type.replace('_', ' ')}
          </span>
        </div>
        <p className="text-xs text-slate-400 truncate font-medium">
          {JSON.stringify(section.content).substring(0, 120)}...
        </p>
      </div>
      <div className="flex items-center gap-1">
        <button 
          onClick={() => onToggle(section.id)}
          className={`p-2.5 rounded-xl transition-all ${
            section.isVisible 
              ? 'text-green-500 hover:bg-green-50' 
              : 'text-slate-300 hover:bg-slate-100'
          }`}
          title={section.isVisible ? "Visible on page" : "Hidden from page"}
        >
          {section.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
        <button 
          onClick={() => onEdit(section)}
          className="p-2.5 text-slate-400 hover:text-[#c1000a] hover:bg-red-50 rounded-xl transition-all" 
          title="Edit Section Content"
        >
          <Edit3 size={18} />
        </button>
        <button 
          onClick={() => onDelete(section.id)}
          className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" 
          title="Delete Section"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

export default function PageEditorClient({ page }: { page: Page }) {
  const { success, error: toastError } = useToast();
  const [sections, setSections] = useState(page.sections);
  const [seoData, setSeoData] = useState(page.seoData || { metaTitle: "", metaDescription: "", canonicalUrl: "", faq: [] });
  const [isSaving, setIsSaving] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [title, setTitle] = useState(page.title);
  const [slug, setSlug] = useState(page.slug);
  const [status, setStatus] = useState(page.status || "DRAFT");
  const [isVisible, setIsVisible] = useState(page.isVisible !== undefined ? page.isVisible : true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(page.title);
  const [tempSlug, setTempSlug] = useState(page.slug);

  const faqSchema = React.useMemo(() => {
    if (!seoData?.faq || seoData.faq.length === 0) return null;

    const questions = seoData.faq
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
  }, [seoData?.faq]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        return newOrder.map((item, idx) => ({ ...item, order: idx }));
      });
    }
  };

  const handleToggleVisibility = (id: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, isVisible: !s.isVisible } : s));
  };

  const handleDeleteSection = (id: string) => {
    if (confirm("Are you sure you want to delete this section from this page layout?")) {
      setSections(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleUpdateSection = (updatedSection: Section) => {
    setSections(prev => prev.map(s => s.id === updatedSection.id ? updatedSection : s));
    setEditingSection(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        ...seoData,
        faqSchema: faqSchema
      };

      // Save sections
      const sectionsRes = await fetch(`/api/admin/pages/${page.id}/sections`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections }),
      });

      // Save SEO and Page Details
      const pageRes = await fetch(`/api/admin/pages/${page.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title,
          slug,
          status,
          isVisible,
          seoData: payload 
        }),
      });

      if (sectionsRes.ok && pageRes.ok) {
        success("Global page architecture synchronized!");
      } else {
        toastError("Failed to synchronize page data.");
      }
    } catch (error) {
      console.error(error);
      toastError("Synchronization failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredSectionTypes = useMemo(() => {
    return AVAILABLE_SECTION_TYPES.filter(item => 
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="space-y-10 pb-32 animate-in fade-in duration-1000">
      {/* Editor Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-50/30 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110"></div>
        <div className="flex items-center gap-6 relative z-10">
          <Link href="/admin/pages" className="w-14 h-14 bg-slate-50 text-slate-400 hover:text-[#c1000a] hover:bg-red-50 rounded-2xl flex items-center justify-center transition-all border border-slate-100 shadow-sm">
            <ArrowLeft size={22} />
          </Link>
          <div>
            <div className="flex items-center gap-4 mb-1">
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    className="px-4 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold font-['Outfit'] focus:ring-2 focus:ring-[#c1000a]/10 focus:border-[#c1000a] outline-none"
                    placeholder="Page Title"
                  />
                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                    <span className="text-xs text-slate-400 font-mono">/</span>
                    <input
                      type="text"
                      value={tempSlug}
                      onChange={(e) => setTempSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                      className="bg-transparent text-xs font-mono outline-none w-28"
                      placeholder="slug"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (!tempTitle.trim() || !tempSlug.trim()) {
                        toastError("Title and slug cannot be empty");
                        return;
                      }
                      setTitle(tempTitle);
                      setSlug(tempSlug);
                      setIsEditingTitle(false);
                    }}
                    className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setTempTitle(title);
                      setTempSlug(slug);
                      setIsEditingTitle(false);
                    }}
                    className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-['Outfit']">{title}</h2>
                  <button
                    onClick={() => setIsEditingTitle(true)}
                    className="p-1.5 text-slate-400 hover:text-[#c1000a] rounded-lg hover:bg-red-50 transition-all"
                    title="Edit Title & Slug"
                  >
                    <Edit size={14} />
                  </button>
                </>
              )}
              <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[9px] font-bold uppercase tracking-[0.2em] rounded-full border border-slate-200 font-['Outfit']">Active Architecture</span>
            </div>
            {!isEditingTitle && (
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.25em] font-['Outfit']">/{slug}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-bold tracking-[0.2em] font-['Outfit'] outline-none"
          >
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
          </select>

          <button
            type="button"
            onClick={() => setIsVisible(!isVisible)}
            className={`px-6 py-4 border rounded-2xl text-[10px] font-bold tracking-[0.2em] font-['Outfit'] transition-all flex items-center gap-2 ${
              isVisible 
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' 
                : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
            {isVisible ? 'VISIBLE' : 'HIDDEN'}
          </button>

          <Link 
            href={`/${slug}`} 
            target="_blank" 
            className="flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-slate-50 transition-all border border-slate-100 shadow-sm font-['Outfit']"
          >
            <ExternalLink size={18} /> Preview
          </Link>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-3 px-10 py-4 bg-[#c1000a] text-white rounded-2xl text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-[#a00008] disabled:opacity-50 transition-all shadow-xl shadow-red-900/10 active:scale-95 font-['Outfit']"
          >
            {isSaving ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            {isSaving ? "Syncing..." : "Sync Architecture"}
          </button>
        </div>
      </div>

      <Tabs defaultValue="sections" className="w-full">
        <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl mb-12 flex w-fit border border-slate-200/50 shadow-inner">
          <TabsTrigger value="sections" className="px-10 py-3.5 rounded-xl flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#c1000a] data-[state=active]:shadow-lg transition-all font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400 font-['Outfit']">
            <Layout size={16} /> Construction
          </TabsTrigger>
          <TabsTrigger value="seo" className="px-10 py-3.5 rounded-xl flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#c1000a] data-[state=active]:shadow-lg transition-all font-bold text-[10px] uppercase tracking-[0.2em] text-slate-400 font-['Outfit']">
            <Globe size={16} /> SEO & Indexing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sections" className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-500">
          <div className="flex items-center justify-between px-4">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 font-['Outfit'] tracking-tight">Section Sequence</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 font-['Outfit']">Hierarchical layout engine</p>
            </div>
            <button 
              onClick={() => setIsAddingSection(true)}
              className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#c1000a] transition-all shadow-xl shadow-slate-900/10 font-['Outfit']"
            >
              <Plus size={18} /> Append Node
            </button>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-6">
                {sections.length === 0 ? (
                  <div className="text-center p-20 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 font-['Outfit'] font-bold uppercase tracking-widest text-[11px]">
                    No layout sections appended yet. Click "Append Node" to begin construction!
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

        <TabsContent value="seo">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                <div>
                  <h3 className="text-lg font-black text-[#0f172a] tracking-tight uppercase tracking-widest font-['Outfit']">Search Engine Optimization</h3>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Global visibility and schema configuration</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Meta Title</label>
                      <input 
                        type="text" 
                        value={seoData.metaTitle || seoData.title || ""}
                        onChange={(e) => setSeoData({ ...seoData, metaTitle: e.target.value })}
                        className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#e63946]/10 focus:border-[#e63946] focus:bg-white outline-none transition-all text-sm font-bold" 
                        placeholder="Optimized page title..." 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Canonical URL</label>
                      <input 
                        type="text" 
                        value={seoData.canonicalUrl || ""}
                        onChange={(e) => setSeoData({ ...seoData, canonicalUrl: e.target.value })}
                        className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#e63946]/10 focus:border-[#e63946] focus:bg-white outline-none transition-all text-[11px] font-mono text-gray-600" 
                        placeholder="https://tsvglobal.com/..." 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Meta Description</label>
                    <textarea 
                      rows={5} 
                      value={seoData.metaDescription || seoData.description || ""}
                      onChange={(e) => setSeoData({ ...seoData, metaDescription: e.target.value })}
                      className="w-full px-5 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#e63946]/10 focus:border-[#e63946] focus:bg-white outline-none transition-all text-sm leading-relaxed" 
                      placeholder="Page summary for search results (150-160 characters)..." 
                    />
                  </div>
                </div>

                <div className="pt-8 border-t border-gray-50 space-y-6">
                   <div className="flex items-center justify-between">
                     <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Page Specific FAQs</h4>
                     <button 
                       onClick={() => setSeoData({ ...seoData, faq: [...(seoData.faq || []), { question: "", answer: "" }] })}
                       className="text-[#e63946] text-[10px] font-black uppercase tracking-widest hover:text-red-700 flex items-center gap-1.5"
                     >
                       <Plus size={14} /> Add FAQ Item
                     </button>
                   </div>
                   
                   <div className="space-y-4">
                     {seoData.faq?.map((item: any, idx: number) => (
                       <div key={idx} className="bg-gray-50/50 p-5 rounded-[1.5rem] border border-gray-100 relative group transition-all hover:bg-white hover:shadow-xl hover:shadow-red-900/5">
                         <button 
                           onClick={() => setSeoData({ ...seoData, faq: seoData.faq.filter((_: any, i: number) => i !== idx) })}
                           className="absolute top-3 right-3 p-1.5 text-gray-300 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                         >
                           <Trash2 size={16} />
                         </button>
                         <div className="space-y-3">
                           <input 
                             type="text"
                             value={item.question}
                             onChange={(e) => {
                               const newFaq = [...seoData.faq];
                               newFaq[idx].question = e.target.value;
                               setSeoData({ ...seoData, faq: newFaq });
                             }}
                             className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-[#e63946]"
                             placeholder="Question"
                           />
                           <textarea 
                             value={item.answer}
                             onChange={(e) => {
                               const newFaq = [...seoData.faq];
                               newFaq[idx].answer = e.target.value;
                               setSeoData({ ...seoData, faq: newFaq });
                             }}
                             className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 text-xs outline-none focus:border-[#e63946] min-h-[60px]"
                             placeholder="Answer"
                           />
                         </div>
                       </div>
                     ))}
                     {(!seoData.faq || seoData.faq.length === 0) && (
                       <div className="text-center py-10 border-2 border-dashed border-gray-50 rounded-[2rem] text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                         No Page FAQs defined
                       </div>
                     )}
                   </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">SERP Performance Preview</h3>
                <SeoPreview 
                  title={String(seoData.metaTitle || seoData.title || page.title)} 
                  description={String(seoData.metaDescription || seoData.description || "")} 
                  url={`https://tsvglobal.com/${page.slug}`}
                  image={seoData.ogImage}
                />
              </div>

              <div className="bg-[#0f172a] text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-[#e63946]/20 to-transparent opacity-50"></div>
                <div className="relative z-10 space-y-6">
                  <h3 className="text-lg font-black tracking-tight uppercase tracking-widest">Social Meta</h3>
                  <MediaSelector 
                    value={seoData.ogImage} 
                    onChange={(url) => setSeoData({ ...seoData, ogImage: url })} 
                    label="Open Graph Asset"
                  />
                  <div className="pt-4 border-t border-white/5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 bg-[#e63946] rounded-full"></div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">Recommended size: 1200 x 630px</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Append Layout Node Modal */}
      {isAddingSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight font-['Outfit']">Append Section</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 font-['Outfit']">Select a dynamic component layout node</p>
              </div>
              <button 
                onClick={() => {
                  setIsAddingSection(false);
                  setSearchTerm("");
                }}
                className="w-10 h-10 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-[#c1000a] rounded-xl flex items-center justify-center transition-all border border-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-8 border-b border-slate-100 bg-slate-50/50">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search layout modules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-[#c1000a] focus:ring-2 focus:ring-red-100 outline-none text-sm font-medium transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSectionTypes.length === 0 ? (
                <div className="col-span-2 text-center py-20 text-slate-400 font-['Outfit'] font-bold uppercase tracking-widest text-[11px]">
                  No matching layout modules found
                </div>
              ) : (
                filteredSectionTypes.map((item) => (
                  <button
                    key={item.type}
                    onClick={() => {
                      const newSection: Section = {
                        id: `temp_${Date.now()}`,
                        type: item.type,
                        label: item.label,
                        content: {},
                        isVisible: true,
                        order: sections.length
                      };
                      setSections([...sections, newSection]);
                      setIsAddingSection(false);
                      setSearchTerm("");
                      setEditingSection(newSection);
                    }}
                    className="flex items-start text-left p-5 bg-white hover:bg-red-50/30 border border-slate-100 hover:border-red-200 rounded-2xl transition-all group hover:shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
                  >
                    <div className="w-10 h-10 bg-slate-50 group-hover:bg-[#c1000a]/10 text-slate-400 group-hover:text-[#c1000a] rounded-xl flex items-center justify-center transition-all border border-slate-100 group-hover:border-transparent mr-4 flex-shrink-0">
                      <Plus size={16} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm font-['Outfit'] mb-1 group-hover:text-[#c1000a] transition-all">{item.label}</h4>
                      <p className="text-xs text-slate-400 font-medium leading-relaxed">{item.desc}</p>
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
          section={editingSection}
          onClose={() => setEditingSection(null)}
          onSave={handleUpdateSection}
        />
      )}
    </div>
  );
}
