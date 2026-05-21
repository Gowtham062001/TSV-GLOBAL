"use client";

import React, { useState, useEffect } from "react";

export const BrochureDownloadModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    brochureTitle: "TSV Global Corporate Brochure"
  });

  useEffect(() => {
    const handleTrigger = (e: Event) => {
      e.preventDefault();
      setIsOpen(true);
    };

    const buttons = document.querySelectorAll('.download-brochure, [data-brochure]');
    buttons.forEach(btn => btn.addEventListener('click', handleTrigger));

    window.addEventListener('open-brochure-modal', () => setIsOpen(true));

    return () => {
      buttons.forEach(btn => btn.removeEventListener('click', handleTrigger));
      window.removeEventListener('open-brochure-modal', () => setIsOpen(true));
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/leads/brochure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSuccess(true);
        const data = await response.json();
        const pdfUrl = data.pdfUrl || '/assets/brochure/tsv-brochure.pdf';
        
        // Open in new tab for preview and auto-download
        window.open(pdfUrl, '_blank');
        
        // Also trigger a download specifically if needed, but window.open is better for "preview"
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = 'TSV-Global-Brochure.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => {
          setIsOpen(false);
          setIsSuccess(false);
          setFormData({ name: "", email: "", phone: "", company: "", brochureTitle: "TSV Global Corporate Brochure" });
        }, 3000);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Sticky Trigger Button */}
      <button 
        id="brochure-sticky-btn" 
        onClick={() => setIsOpen(true)}
        className="fixed top-1/2 -translate-y-1/2 z-[9990] flex flex-col items-center justify-center bg-[#ed2224] text-white py-12 px-6 rounded-l-2xl shadow-[0_10px_40px_rgba(237,34,36,0.4)] hover:bg-red-700 transition-all group overflow-hidden w-16"
        style={{ 
          position: 'fixed', right: '0%', top: '50%', transform: 'translateY(-50%)', 
          zIndex: 99999, visibility: 'visible', opacity: 1, display: 'flex' 
        }}
        aria-label="Download Corporate Brochure"
      >
        <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12"></div>

        <span className="bw-label [writing-mode:vertical-rl] rotate-180 text-[18px] font-black uppercase tracking-[0.25em] relative z-10 whitespace-nowrap">
          Download Brochure
        </span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-[#0f172a]/80 backdrop-blur-md animate-in fade-in duration-300 font-sans">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in zoom-in-95 duration-300 relative border border-white/20">
            
            {/* Header with Background Pattern */}
            <div className="relative bg-[#c1000a] text-white p-6 sm:p-8">
              <div className="absolute inset-0 opacity-10">
                <svg width="100%" height="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 0h100v100H0z" fill="url(#pattern-grid)" />
                  <defs>
                    <pattern id="pattern-grid" width="16" height="16" patternUnits="userSpaceOnUse">
                      <path d="M16 0L0 16M8-8L-8 8M24 8L8 24" stroke="white" strokeWidth="1.5" />
                    </pattern>
                  </defs>
                </svg>
              </div>
              
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center border border-white/30 shadow-inner shrink-0">
                  <i className="fa-solid fa-download text-white text-[20px]"></i>
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold tracking-tight uppercase leading-tight">Corporate Brochure</h3>
                  <p className="text-white/80 text-xs font-medium">Download our latest service portfolio</p>
                </div>
              </div>

              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-black/10 hover:bg-black/20 rounded-lg flex items-center justify-center text-white transition-all backdrop-blur-md"
              >
                <i className="fa-regular fa-xmark text-[18px]"></i>
              </button>
            </div>

            <div className="p-6 sm:p-8">
              {isSuccess ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto border border-green-100 shadow-sm animate-bounce">
                    <i className="fa-solid fa-circle-check text-[32px]"></i>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">Thank You!</h3>
                    <p className="text-gray-500 text-sm font-medium">Your download has started.</p>
                  </div>
                  <div className="pt-2">
                    <button 
                      onClick={() => setIsOpen(false)}
                      className="text-[#c1000a] font-bold text-xs uppercase tracking-widest hover:underline"
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Full Name</label>
                      <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-[#c1000a] outline-none transition-all text-sm font-medium text-gray-900 placeholder:text-gray-300"
                        placeholder="John Smith"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Company</label>
                      <input 
                        required
                        type="text" 
                        value={formData.company}
                        onChange={e => setFormData({...formData, company: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-[#c1000a] outline-none transition-all text-sm font-medium text-gray-900 placeholder:text-gray-300"
                        placeholder="Organization"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Business Email</label>
                    <input 
                      required
                      type="email" 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-[#c1000a] outline-none transition-all text-sm font-medium text-gray-900 placeholder:text-gray-300"
                      placeholder="name@company.com"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Phone Number</label>
                    <input 
                      required
                      type="tel" 
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-red-500/10 focus:border-[#c1000a] outline-none transition-all text-sm font-medium text-gray-900 placeholder:text-gray-300"
                      placeholder="+91"
                    />
                  </div>

                  <div className="pt-2">
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#c1000a] text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 relative group overflow-hidden"
                    >
                      {isSubmitting ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin text-[18px]"></i> <span className="text-sm">Processing...</span>
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-download text-[18px]"></i> <span className="text-sm">Download Now</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 text-gray-400 pt-2">
                    <i className="fa-solid fa-shield-halved text-[12px]"></i>
                    <span className="text-[9px] font-bold uppercase tracking-wider">Secure Download &bull; Privacy Guaranteed</span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
