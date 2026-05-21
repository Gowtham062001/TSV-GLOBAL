"use client";

import React, { useState, useEffect } from "react";
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  Search, 
  Check, 
  Plus,
  Loader2,
  Folder,
  FileImage,
  UploadCloud
} from "lucide-react";

interface GalleryImage {
  id: string;
  url: string;
  alt: string | null;
  category: string | null;
}

interface MediaSelectorProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function MediaSelector({ value, onChange, label = "Featured Image" }: MediaSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentFolder, setCurrentFolder] = useState<string>("All");
  const [activeTab, setActiveTab] = useState<"gallery" | "upload">("gallery");
  const [uploading, setUploading] = useState(false);

  // For Upload
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchImages();
    }
  }, [isOpen]);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/gallery");
      if (res.ok) {
        const data = await res.json();
        setImages(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("category", uploadCategory || "uploads");
    formData.append("alt", uploadFile.name);

    try {
      const res = await fetch("/api/admin/gallery/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const newImage = await res.json();
        setImages([newImage, ...images]);
        onChange(newImage.url);
        setIsOpen(false);
        setUploadFile(null);
        setUploadCategory("");
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const folders = React.useMemo(() => {
    const categories = new Set<string>();
    images.forEach(img => {
      if (img.category) categories.add(img.category);
    });
    return Array.from(categories).sort();
  }, [images]);

  const filteredImages = images.filter(img => {
    const matchesSearch = img.url.toLowerCase().includes(searchQuery.toLowerCase()) || 
      img.alt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = currentFolder === "All" || img.category === currentFolder;
    return matchesSearch && matchesFolder;
  });

  return (
        <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">{label}</label>
      
      <div 
        onClick={() => setIsOpen(true)}
        className="relative group cursor-pointer border border-gray-100 rounded-xl overflow-hidden hover:border-[#e63946] transition-all aspect-video flex flex-col items-center justify-center bg-gray-50/30"
      >
        {value ? (
          <>
            <img src={value} alt="Selected" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
              <div className="bg-white text-[#0f172a] px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-xl">
                <ImageIcon size={12} /> Replace
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                }}
                className="bg-[#e63946] text-white p-2 rounded-lg hover:bg-red-700 transition-colors shadow-lg"
              >
                <X size={14} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-300 group-hover:text-[#e63946] transition-all">
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm border border-gray-100 group-hover:scale-110 duration-300">
              <Plus size={16} />
            </div>
            <span className="font-bold text-[9px] uppercase tracking-widest opacity-60 group-hover:opacity-100">Click to Select</span>
          </div>
        )}
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-[#0f172a]/40 backdrop-blur-sm" onClick={() => !uploading && setIsOpen(false)} />
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl flex flex-col h-[500px] max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
            
            {/* Modal Header */}
            <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-red-50 text-[#e63946] rounded-lg flex items-center justify-center">
                  <ImageIcon size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-tight">Media Library</h3>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Asset synchronization</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex bg-gray-50 p-1 rounded-lg">
                  <button 
                    onClick={() => setActiveTab("gallery")}
                    className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest transition-all ${activeTab === 'gallery' ? 'bg-white text-[#e63946] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    Library
                  </button>
                  <button 
                    onClick={() => setActiveTab("upload")}
                    className={`px-3 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest transition-all ${activeTab === 'upload' ? 'bg-white text-[#e63946] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    New
                  </button>
                </div>
                <button onClick={() => setIsOpen(false)} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto bg-gray-50/30">
              {activeTab === "gallery" ? (
                <div className="p-5 space-y-4">
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                      <input 
                        type="text" 
                        placeholder="Search items..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-gray-100 rounded-xl outline-none focus:border-[#e63946] text-xs transition-all shadow-sm font-medium"
                      />
                    </div>
                    <select 
                      value={currentFolder} 
                      onChange={(e) => setCurrentFolder(e.target.value)}
                      className="px-3 py-2 bg-white border border-gray-100 rounded-xl outline-none focus:border-[#e63946] text-[10px] font-bold text-gray-500 shadow-sm"
                    >
                      <option value="All">All Categories</option>
                      {folders.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>

                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
                      <Loader2 className="animate-spin text-[#e63946]" size={20} />
                      <p className="text-[9px] font-bold uppercase tracking-widest">Loading...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {filteredImages.length > 0 ? (
                        filteredImages.map(img => (
                          <div 
                            key={img.id}
                            onClick={() => {
                              onChange(img.url);
                              setIsOpen(false);
                            }}
                            className={`group relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${value === img.url ? 'border-[#e63946] ring-4 ring-red-50' : 'border-white hover:border-gray-100 shadow-sm'}`}
                          >
                            <img src={img.url} alt={img.alt || ""} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            {value === img.url && (
                              <div className="absolute inset-0 bg-[#e63946]/10 flex items-center justify-center">
                                <div className="bg-[#e63946] p-1 rounded-lg shadow-lg text-white">
                                  <Check size={12} strokeWidth={4} />
                                </div>
                              </div>
                            )}
                            <div className="absolute bottom-0 inset-x-0 p-1.5 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                               <p className="text-[7px] text-white font-bold uppercase truncate tracking-wider">{img.category || 'Unsorted'}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full py-16 text-center space-y-2">
                          <div className="w-10 h-10 bg-gray-100 text-gray-300 rounded-full flex items-center justify-center mx-auto">
                            <ImageIcon size={20} />
                          </div>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">No assets</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="max-w-xs mx-auto space-y-6 py-8 px-4">
                  <div 
                    onClick={() => document.getElementById('modal-upload')?.click()}
                    className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center gap-3 transition-all cursor-pointer group ${uploadFile ? 'border-[#e63946] bg-red-50/20' : 'border-gray-100 hover:border-[#e63946]/30 hover:bg-gray-50'}`}
                  >
                      <input 
                        id="modal-upload" 
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setUploadFile(file);
                        }}
                      />
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-all ${uploadFile ? 'bg-[#e63946] text-white shadow-[#e63946]/20' : 'bg-white text-gray-300 group-hover:text-[#e63946]'}`}>
                      {uploadFile ? <FileImage size={20} /> : <UploadCloud size={20} />}
                    </div>
                    {uploadFile ? (
                      <div className="text-center">
                        <p className="text-xs font-bold text-gray-900 truncate max-w-[180px]">{uploadFile.name}</p>
                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-xs font-bold text-gray-600 group-hover:text-gray-900">Choose an image</p>
                        <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">PNG, JPG, WebP</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-1">Category</label>
                      <div className="relative">
                        <Folder className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={12} />
                        <input 
                          type="text" 
                          placeholder="e.g. services..."
                          value={uploadCategory}
                          onChange={(e) => setUploadCategory(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl outline-none focus:border-[#e63946] text-xs transition-all font-medium"
                        />
                      </div>
                    </div>

                    <button 
                      disabled={!uploadFile || uploading}
                      onClick={handleUpload}
                      className="w-full py-3 bg-[#e63946] text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-900/10"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="animate-spin" size={14} />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Check size={14} strokeWidth={3} /> Synchronize
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-2 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between shrink-0">
               <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Active Assets: {images.length}</p>
               <p className="text-[8px] font-bold text-[#e63946] uppercase tracking-widest">TSV Global Solutions</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
