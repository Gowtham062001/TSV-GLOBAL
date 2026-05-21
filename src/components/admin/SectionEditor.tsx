"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Settings, AlertCircle, Plus, Trash2 } from "lucide-react";
import { MediaSelector } from "./MediaSelector";

interface SectionEditorProps {
  section: {
    id: string;
    type: string;
    label: string;
    content: Record<string, any>;
  };
  onClose: () => void;
  onSave: (updatedSection: any) => void;
}

export function SectionEditor({ section, onClose, onSave }: SectionEditorProps) {
  const DEFAULT_CONTENT: Record<string, any> = {
    cta: {
      eyebrow: "Ready to Work With Us?",
      heading: "Let's Move Your Cargo",
      highlight: "Worldwide!",
      description: "Connect with our logistics experts today and get a customized shipping solution designed for your business needs.",
      button: { text: "Get a Free Quote", link: "/contact" },
      promo_items: [
        { title: "Road Freight", description: "Pan-India transport solutions.", icon: "logis logis-truck-3" },
        { title: "Ocean Freight", description: "FCL & LCL consolidation.", icon: "logis logis-cruise" },
        { title: "Air Freight", description: "Express worldwide.", icon: "logis logis-airplane-flying" }
      ]
    },
    cta_section: {
      eyebrow: "Ready to Work With Us?",
      heading: "Let's Move Your Cargo",
      highlight: "Worldwide!",
      description: "Connect with our logistics experts today and get a customized shipping solution designed for your business needs.",
      button: { text: "Get a Free Quote", link: "/contact" },
      promo_items: [
        { title: "Road Freight", description: "Pan-India transport solutions.", icon: "logis logis-truck-3" },
        { title: "Ocean Freight", description: "FCL & LCL consolidation.", icon: "logis logis-cruise" },
        { title: "Air Freight", description: "Express worldwide.", icon: "logis logis-airplane-flying" }
      ]
    },
    premium_cta: {
      subHeading: "Let's Get Started",
      headingPrefix: "Ready To",
      headingHighlight: "Ship Globally?",
      description: "Connect with our logistics experts today and discover how TSV Global Solutions can streamline your supply chain for maximum efficiency.",
      btnText: "Get A Free Quote",
      btnUrl: "/contact"
    },
    hero_slider: {
      slides: [
        {
          title: "Global Logistics Solutions",
          subTitle: "Delivering Excellence Across All Frontiers",
          image: "/assets/img/aerial-view-container-cargo-ship-sea.jpg"
        }
      ]
    },
    about_section: {
      title: "Leading The Way In Global Logistics",
      subtitle: "About TSV Global Solutions",
      content: "<p>Providing premium global logistical expertise for more than 11 years.</p>",
      image: "/assets/img/about.jpg"
    },
    about_us: {
      title: "Leading The Way In Global Logistics",
      subtitle: "About TSV Global Solutions",
      content: "<p>Providing premium global logistical expertise for more than 11 years.</p>",
      image: "/assets/img/about.jpg"
    },
    who_we_are: {
      title: "Who We Are",
      subtitle: "Excellence & Commitment",
      content: "<p>TSV Global Solutions is a leading NVOCC and freight forwarding company.</p>"
    },
    marquee: {
      text: "TSV Global Solutions • Excellence in Logistics • Air Freight • Ocean Freight • Customs Clearance •"
    },
    running_text: {
      text: "TSV Global Solutions • Excellence in Logistics • Air Freight • Ocean Freight • Customs Clearance •"
    },
    page_header: {
      title: "New Page Title",
      breadcrumbs: [
        { label: "Home", href: "/" },
        { label: "About" }
      ]
    },
    simple_content: {
      heading: "New Heading",
      content: "<p>Write your section content here...</p>",
      sidebar: false
    },
    google_map: {
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.4851221319227!2d80.20336217596041!3d13.004724987313364!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a52674261877cf5%3A0xe5a1b32d2ea7f9b8!2sTSV%20GLOBAL%20SOLUTIONS%20PVT%20LTD!5e0!3m2!1sen!2sin!4v1716301234567!5m2!1sen!2sin"
    },
    service_faq: {
      title: "Frequently Asked Questions",
      items: [
        { question: "What is your main transit route?", answer: "We cover over 140+ global shipping routes." }
      ]
    }
  };

  const [content, setContent] = useState(() => {
    const baseContent = section.content || {};
    const defaults = DEFAULT_CONTENT[section.type] || {};
    return { ...defaults, ...baseContent };
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsOpen(true), 10);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300);
  };

  const updateField = (path: string, value: any) => {
    const newContent = { ...content };
    const parts = path.split(".");
    let current = newContent;
    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
    setContent(newContent);
  };

  const handleSave = () => {
    onSave({ ...section, content });
    handleClose();
  };

  const renderField = (key: string, value: any, path: string) => {
    const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
    
    if (key.toLowerCase().includes("image") || key.toLowerCase().includes("img")) {
      return (
        <div key={path} className="py-2">
          <MediaSelector 
            value={value} 
            onChange={(url) => updateField(path, url)} 
            label={label}
          />
        </div>
      );
    }

    if (typeof value === "string") {
      if (value.length > 100 || key.toLowerCase().includes("description") || key.toLowerCase().includes("content")) {
        return (
          <div key={path} className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">{label}</label>
            <textarea
              value={value}
              onChange={(e) => updateField(path, e.target.value)}
              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#e63946]/10 focus:border-[#e63946] focus:bg-white outline-none transition-all text-sm font-medium min-h-[120px]"
            />
          </div>
        );
      }
      return (
        <div key={path} className="space-y-1.5">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">{label}</label>
          <input
            type="text"
            value={value}
            onChange={(e) => updateField(path, e.target.value)}
            className="w-full px-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#e63946]/10 focus:border-[#e63946] focus:bg-white outline-none transition-all text-sm font-medium"
          />
        </div>
      );
    }

    if (typeof value === "boolean") {
      return (
        <div key={path} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">{label}</label>
          <button
            onClick={() => updateField(path, !value)}
            className={`w-10 h-5 rounded-full relative transition-all ${value ? 'bg-green-500' : 'bg-gray-300'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${value ? 'left-5.5' : 'left-0.5'}`} />
          </button>
        </div>
      );
    }

    if (Array.isArray(value)) {
      return (
        <div key={path} className="space-y-4 pt-4 border-t border-gray-100 mt-4">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">{label} ({value.length})</label>
            <button 
              onClick={() => {
                const newArray = [...value];
                const template = value.length > 0 
                  ? (typeof value[0] === 'object' ? Object.fromEntries(Object.entries(value[0]).map(([k, v]) => [k, typeof v === 'string' ? '' : v])) : '')
                  : {};
                newArray.push(template);
                updateField(path, newArray);
              }}
              className="w-8 h-8 flex items-center justify-center bg-red-50 text-[#e63946] hover:bg-[#e63946] hover:text-white rounded-lg transition-all"
            >
              <Plus size={14} />
            </button>
          </div>
          <div className="space-y-4 pl-4 border-l-2 border-gray-100">
            {value.map((item, index) => (
              <div key={`${path}.${index}`} className="p-4 bg-gray-50/30 rounded-xl border border-gray-50 space-y-4 relative group">
                <button 
                  onClick={() => {
                    const newArray = [...value];
                    newArray.splice(index, 1);
                    updateField(path, newArray);
                  }}
                  className="absolute -right-2 -top-2 w-7 h-7 bg-white text-gray-300 hover:text-red-600 rounded-full shadow-sm border border-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10"
                >
                  <Trash2 size={12} />
                </button>
                {typeof item === 'object' && item !== null
                  ? Object.entries(item).map(([subKey, subVal]) => renderField(subKey, subVal, `${path}.${index}.${subKey}`))
                  : renderField(`Item ${index + 1}`, item, `${path}.${index}`)
                }
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (typeof value === "object" && value !== null) {
      return (
        <div key={path} className="space-y-4 pt-4 border-t border-gray-100 mt-4">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">{label}</label>
          <div className="space-y-4 pl-4 border-l-2 border-gray-100">
            {Object.entries(value).map(([subKey, subVal]) => renderField(subKey, subVal, `${path}.${subKey}`))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 z-[1000] flex justify-end overflow-hidden font-sans">
      <div 
        className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />
      <div 
        className={`relative w-full max-w-lg bg-white shadow-2xl h-full flex flex-col transition-transform duration-300 ease-out border-l border-gray-100 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-red-50 text-[#e63946] rounded-xl flex items-center justify-center">
              <Settings size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Configuration</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{section.label}</p>
            </div>
          </div>
          <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar pb-32">
          <div className="bg-red-50/50 border border-red-100 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="text-[#e63946] shrink-0 mt-0.5" size={16} />
            <p className="text-[10px] text-[#e63946] font-bold uppercase tracking-widest leading-relaxed">
              Synchronization active. Changes are local until deployment.
            </p>
          </div>
          <div className="space-y-4">
            {Object.entries(content).map(([key, value]) => renderField(key, value, key))}
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 bg-white sticky bottom-0 z-10">
          <div className="flex gap-4">
            <button onClick={handleClose} className="flex-1 py-3 bg-gray-50 text-gray-500 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-200 text-[10px]">Cancel</button>
            <button onClick={handleSave} className="flex-[2] py-3 bg-[#e63946] text-white rounded-xl font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-900/10 flex items-center justify-center gap-2 text-[10px]">
              <Save size={16} /> Apply Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
