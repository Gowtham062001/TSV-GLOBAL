"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Save, ChevronLeft, Layout, Box, Globe, ExternalLink, Plus, GripVertical, Eye, EyeOff, Edit3, Trash2, Info, Check, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { MediaSelector } from "@/components/admin/MediaSelector";
import { useToast } from "@/components/shared/Toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionEditor } from "@/components/admin/SectionEditor";
import { SeoPreview } from "@/components/admin/SeoPreview";
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

interface Section {
  id: string;
  type: string;
  label: string;
  content: Record<string, any>;
  isVisible: boolean;
  order: number;
}

interface Service {
  id?: string;
  title: string;
  slug: string;
  description: string | null;
  icon: string | null;
  image: string | null;
  status: string;
  sections?: Section[];
  seoData?: any;
}

const AVAILABLE_SECTION_TYPES = [
  { type: "service_overview", label: "Service Overview", desc: "Introductory layout highlighting core service strengths" },
  { type: "service_gallery", label: "Service Photo Gallery", desc: "Dynamic photo grid or slider showcasing operations" },
  { type: "service_faq", label: "Service Accordion FAQs", desc: "Expandable questions & answers for logistics" },
  { type: "who_we_are", label: "Who We Are Block", desc: "Core identity block to outline brand capabilities" },
  { type: "cta_section", label: "Conversion Banner", desc: "High conversion CTA banner strip" },
  { type: "simple_content", label: "Simple Rich Text Block", desc: "General purpose typography and markdown editor block" },
  { type: "header", label: "Service Page Header (Breadcrumb)", desc: "Top Header banner with title and description" }
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
      className={`bg-white rounded-xl border transition-all flex items-center gap-4 p-4 group shadow-sm admin-section-row ${
        isDragging ? 'shadow-xl border-[#e63946] ring-2 ring-red-50' : 'hover:border-gray-300'
      } ${!section.isVisible ? 'opacity-50' : ''}`}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-[#e63946] transition-colors p-2"
      >
        <GripVertical size={20} />
      </div>
      <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-[10px] font-bold text-gray-400 group-hover:bg-red-50 group-hover:text-[#e63946] transition-all border border-gray-100">
        {String(index + 1).padStart(2, '0')}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h3 className="font-bold text-gray-800 truncate">{section.label}</h3>
          <span className="text-[10px] bg-red-50 text-[#e63946] px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
            {section.type.replace(/_/g, ' ')}
          </span>
        </div>
        <p className="text-xs text-gray-400 truncate">
          {JSON.stringify(section.content).substring(0, 100)}...
        </p>
      </div>
      <div className="flex items-center gap-1">
        <button 
          type="button"
          onClick={() => onToggle(section.id)}
          className={`p-2 rounded-lg transition-all ${
            section.isVisible 
              ? 'text-green-600 hover:bg-green-50' 
              : 'text-gray-300 hover:bg-gray-50'
          }`}
          title={section.isVisible ? "Visible" : "Hidden"}
        >
          {section.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
        <button 
          type="button"
          onClick={() => onEdit(section)}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" 
          title="Edit"
        >
          <Edit3 size={18} />
        </button>
        <button 
          type="button"
          onClick={() => onDelete(section.id)}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" 
          title="Delete"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

export default function ServiceEditorClient({ service }: { service?: Service }) {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  
  const [formData, setFormData] = useState<Service>(service || {
    title: "",
    slug: "",
    description: "",
    icon: "fa-solid fa-box",
    image: "",
    status: "PUBLISHED",
    seoData: {
      metaTitle: "",
      metaDescription: "",
      canonicalUrl: "",
    }
  });

  const [sections, setSections] = useState<Section[]>(service?.sections || []);
  const [isSaving, setIsSaving] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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

  const handleUpdateSection = (updatedSection: Section) => {
    if (!sections.find(s => s.id === updatedSection.id)) {
      setSections([...sections, updatedSection]);
    } else {
      setSections(prev => prev.map(s => s.id === updatedSection.id ? updatedSection : s));
    }
    setEditingSection(null);
  };

  const handleDeleteSection = (id: string) => {
    if (confirm("Are you sure you want to delete this section?")) {
      setSections(prev => prev.filter(s => s.id !== id));
    }
  };

  const faqSchema = useMemo(() => {
    const faqSection = sections.find(s => s.type === 'faq' || s.type === 'service_faq' || s.type === 'service_faqs');
    if (!faqSection || !faqSection.content?.items) return null;

    const questions = faqSection.content.items.map((item: any) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }));

    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": questions
    }, null, 2);
  }, [sections]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const url = service?.id ? `/api/admin/services/${service.id}` : "/api/admin/services";
      const method = service?.id ? "PUT" : "POST";
      
      const payload = {
        ...formData,
        seoData: {
          ...formData.seoData,
          faqSchema: faqSchema
        }
      };

      // 1. Save general service metadata
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to save service metadata");
      }

      const savedService = await res.json();
      const actualServiceId = service?.id || savedService.id;

      // 2. Synchronize sections sequence array
      const sectionsRes = await fetch(`/api/admin/services/${actualServiceId}/sections`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections }),
      });

      if (sectionsRes.ok) {
        success("Service sequence fully synchronized!");
        router.push("/admin/services");
        router.refresh();
      } else {
        toastError("Failed to save layout sections.");
      }
    } catch (error: any) {
      console.error(error);
      toastError(error.message || "Failed to save service.");
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
    <div className="space-y-6 max-w-7xl mx-auto pb-24">
      {/* Editor Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/services" 
            className="w-10 h-10 bg-gray-50 text-gray-500 hover:text-gray-900 rounded-xl flex items-center justify-center transition-all border border-gray-100"
          >
            <ChevronLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">{formData.title || "New Service"}</h2>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[9px] font-bold uppercase tracking-wider rounded border border-gray-200">
                Service Engine
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">/services/{formData.slug || "new-slug"}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {service?.id && (
            <Link 
              href={`/services/${formData.slug}`} 
              target="_blank" 
              className="flex items-center gap-1.5 px-4 py-2 bg-white text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all border border-gray-200 shadow-sm"
            >
              <ExternalLink size={14} /> Preview Live
            </Link>
          )}
          <button 
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#e63946] text-white rounded-xl text-xs font-bold hover:bg-red-700 disabled:opacity-50 transition-all shadow-md"
          >
            {isSaving ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Save size={14} />
            )}
            {isSaving ? "Saving..." : "Save Service"}
          </button>
        </div>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-gray-100/60 p-1 rounded-xl mb-6 flex w-fit border border-gray-200/50">
          <TabsTrigger value="general" className="px-6 py-2 rounded-lg flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#e63946] data-[state=active]:shadow-sm transition-all font-bold text-xs text-gray-500">
            <Layout size={14} /> Overview Settings
          </TabsTrigger>
          <TabsTrigger value="sections" className="px-6 py-2 rounded-lg flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-[#e63946] data-[state=active]:shadow-sm transition-all font-bold text-xs text-gray-500">
            <Box size={14} /> Page Sections
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* General Settings */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Service Title</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      const slug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                      setFormData({ 
                        ...formData, 
                        title: newTitle,
                        slug: service?.id ? formData.slug : slug 
                      });
                    }}
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#e63946]/10 focus:border-[#e63946] focus:bg-white outline-none text-lg font-bold transition-all"
                    placeholder="e.g. Sea Freight Forwarding"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Description</label>
                  <RichTextEditor 
                    content={formData.description || ""} 
                    onChange={(html) => setFormData({ ...formData, description: html })} 
                  />
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
                        placeholder="https://tsvglobal.com/services/..."
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
                    url={`https://tsvglobal.com/services/${formData.slug}`}
                    image={formData.image || ""}
                  />
                </div>

                {faqSchema && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Auto-Generated FAQ Schema</h4>
                      <Check size={14} className="text-green-500" />
                    </div>
                    <pre className="text-[9px] font-mono bg-white p-3 rounded-lg border border-gray-100 max-h-[150px] overflow-y-auto text-gray-500">
                      {faqSchema}
                    </pre>
                  </div>
                )}
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
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Icon Class</label>
                  <input 
                    type="text" 
                    value={formData.icon || ""}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#e63946]/10 focus:border-[#e63946] focus:bg-white outline-none text-xs font-bold transition-all"
                  />
                </div>

                <MediaSelector 
                  value={formData.image || ""} 
                  onChange={(url) => setFormData({ ...formData, image: url })} 
                  label="Featured Image"
                />

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
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sections" className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div>
              <h3 className="font-bold text-gray-900">Page Sections</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Drag to reorder sections</p>
            </div>
            <button 
              type="button"
              onClick={() => setIsAddingSection(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all shadow-sm"
            >
              <Plus size={16} className="text-[#e63946]" /> Append Node
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
              <div className="space-y-3">
                {sections.length === 0 ? (
                  <div className="text-center p-20 bg-white border-2 border-dashed border-gray-100 rounded-2xl text-gray-400">
                    No layout sections appended yet. Click "Append Node" to begin.
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
                onClick={() => {
                  setIsAddingSection(false);
                  setSearchTerm("");
                }}
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
                <div className="col-span-2 text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                  No matching layout modules found
                </div>
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
                        order: sections.length
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
