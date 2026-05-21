"use client";

import React, { useState, useEffect } from "react";
import { Upload, FileText, Trash2, Eye, Loader2 } from "lucide-react";
import { useToast } from "@/components/shared/Toast";

export default function AdminBrochurePage() {
  const [isUploading, setIsUploading] = useState(false);
  const [currentBrochure, setCurrentBrochure] = useState<{url: string, filename: string} | null>(null);
  const { success, error: toastError } = useToast();

  useEffect(() => {
    fetchCurrentBrochure();
  }, []);

  const fetchCurrentBrochure = async () => {
    try {
      const response = await fetch("/api/admin/brochure");
      if (response.ok) {
        const data = await response.json();
        if (data.url) {
          setCurrentBrochure({ url: data.url, filename: data.filename || "corporate-brochure.pdf" });
        }
      }
    } catch (err) {
      console.error("Failed to fetch brochure", err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Allowed formats: pdf, doc, docx, ppt, pptx
    const allowedTypes = [
      "application/pdf",
      "application/msword", // doc
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
      "application/vnd.openxmlformats-officedocument.presentationml.presentation", // pptx
      "application/vnd.ms-powerpoint", // ppt
    ];

    if (!allowedTypes.includes(file.type)) {
      toastError("Only PDF, DOC, DOCX, and PPT formats are allowed.");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/admin/brochure/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentBrochure({ url: data.url, filename: data.filename });
        success("The brochure asset has been successfully updated.");
      } else {
        toastError("Failed to upload brochure. Please try again.");
      }
    } catch (err) {
      toastError("An error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to remove this brochure?")) return;
    
    try {
      const response = await fetch("/api/admin/brochure", {
        method: "DELETE",
      });

      if (response.ok) {
        setCurrentBrochure(null);
        success("The brochure asset has been removed.");
      } else {
        toastError("Failed to delete brochure.");
      }
    } catch (err) {
      toastError("An error occurred during deletion.");
    }
  };

  return (
    <div className="admin-shell space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="admin-page-title">Brochure</h1>
          <p className="admin-page-subtitle">Global Corporate Profile Management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Asset Status */}
        <div className="bg-white rounded-[10px] border border-[#f0f2f8] p-6 flex flex-col justify-between min-h-[300px]">
          <div>
            <h3 className="text-[13px] font-bold text-[#0f1523] mb-6">Active Document</h3>
            {currentBrochure ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-[#f8f9fb] rounded-lg border border-[#f0f2f8]">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-[#f0f2f8]">
                    <FileText size={20} className="text-[#c1000a]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-[#0f1523] truncate mb-1">{currentBrochure.filename}</p>
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      <p className="text-[11px] text-[#8a9ab5] uppercase tracking-wider">Synchronized & Live</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <a 
                    href={currentBrochure.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#0f1523] text-white rounded-lg text-[13px] font-medium hover:bg-black transition-all"
                  >
                    <Eye size={16} /> Preview
                  </a>
                  <button 
                    onClick={handleDelete}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-[#c1000a] rounded-lg text-[13px] font-medium hover:bg-red-100 transition-all border border-red-100"
                  >
                    <Trash2 size={16} /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center border border-dashed border-[#f0f2f8] rounded-lg">
                <p className="text-[13px] text-[#8a9ab5]">No Active Brochure Detected</p>
              </div>
            )}
          </div>
          <div className="pt-6 mt-6 border-t border-[#f0f2f8]">
            <p className="text-[11px] text-[#8a9ab5]">
              * The active document is automatically served to all visitors who complete the brochure download form.
            </p>
          </div>
        </div>

        {/* Upload Interface */}
        <div className="bg-white rounded-[10px] border border-[#f0f2f8] p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-[13px] font-bold text-[#0f1523] mb-6">Upload Pipeline</h3>
            <p className="text-[13px] text-[#4a5568] mb-6">
              Replace the existing brochure with a new version. Supported formats include PDF, DOC, and DOCX.
            </p>

            <label className={`cursor-pointer w-full flex flex-col items-center justify-center gap-4 p-10 border-2 border-dashed rounded-lg transition-all ${isUploading ? 'bg-slate-50 border-slate-200' : 'bg-white border-[#f0f2f8] hover:border-[#0f1523] hover:bg-slate-50'}`}>
              <div className="w-12 h-12 rounded-full bg-[#f8f9fb] flex items-center justify-center text-[#8a9ab5]">
                {isUploading ? <Loader2 className="animate-spin" size={24} /> : <Upload size={24} />}
              </div>
              <div className="text-center">
                <p className="text-[13px] font-bold text-[#0f1523] mb-1">{isUploading ? "Uploading..." : "Click to select a file"}</p>
                <p className="text-[11px] text-[#8a9ab5]">Max File Size: 20MB</p>
              </div>
              <input 
                type="file" 
                className="hidden" 
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>
          </div>

          <div className="mt-6 flex items-center gap-2">
            {['PDF', 'DOC', 'DOCX'].map(ext => (
              <span key={ext} className="px-2 py-1 bg-[#f8f9fb] text-[#8a9ab5] text-[11px] font-medium rounded border border-[#f0f2f8]">{ext}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
