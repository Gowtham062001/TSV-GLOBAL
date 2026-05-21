"use client";

import React, { useState, useMemo } from "react";
import {
  Trash2,
  Folder,
  ChevronRight,
  ChevronLeft,
  Plus,
  Upload,
  X,
  Search,
  FileImage,
  UploadCloud,
  Loader2,
  Edit3,
  Archive,
  RotateCcw,
  CheckSquare,
  Square
} from "lucide-react";

interface Image {
  id: string;
  url: string;
  alt: string | null;
  caption: string | null;
  category: string | null;
  status: string;
}

export function GalleryGridClient({ initialImages, isSuperAdmin = false }: { initialImages: Image[]; isSuperAdmin?: boolean }) {
  const [images, setImages] = useState(initialImages);
  const [selected, setSelected] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "ARCHIVED">("ACTIVE");
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState("");
  const [uploadAlt, setUploadAlt] = useState("");

  const [savingDetails, setSavingDetails] = useState(false);
  const [editAlt, setEditAlt] = useState("");
  const [editCategory, setEditCategory] = useState("");

  const singleSelected = selected.length === 1 ? images.find(img => img.id === selected[0]) : null;

  React.useEffect(() => {
    if (singleSelected) {
      setEditAlt(singleSelected.alt || "");
      setEditCategory(singleSelected.category || "");
    }
  }, [singleSelected?.id]);

  const handleUpdateDetails = async () => {
    if (!singleSelected) return;
    setSavingDetails(true);
    try {
      const res = await fetch(`/api/admin/gallery/${singleSelected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alt: editAlt, category: editCategory }),
      });
      if (res.ok) {
        const updated = await res.json();
        setImages(prev => prev.map(img => img.id === updated.id ? updated : img));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingDetails(false);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" }); // Soft-delete
      if (res.ok) {
        setImages(prev => prev.map(img => img.id === id ? { ...img, status: "ARCHIVED" } : img));
        setSelected(prev => prev.filter(i => i !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/gallery/${id}/restore`, { method: "POST" });
      if (res.ok) {
        setImages(prev => prev.map(img => img.id === id ? { ...img, status: "ACTIVE" } : img));
        setSelected(prev => prev.filter(i => i !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (!isSuperAdmin) {
      alert("Only a Super Admin can permanently delete images.");
      return;
    }
    if (!confirm("Are you sure you want to permanently delete this image from the database? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/gallery/${id}?mode=permanent`, { method: "DELETE" });
      if (res.ok) {
        setImages(prev => prev.filter(img => img.id !== id));
        setSelected(prev => prev.filter(i => i !== id));
      } else if (res.status === 403) {
        alert("Unauthorized to permanently delete images.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBatchAction = async (action: "archive" | "restore" | "delete") => {
    if (selected.length === 0) return;
    
    if (action === "delete") {
      if (!isSuperAdmin) {
        alert("Only a Super Admin can permanently delete images.");
        return;
      }
      if (!confirm(`Are you sure you want to permanently delete ${selected.length} images?`)) return;
    }

    try {
      const res = await fetch("/api/admin/gallery/batch-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selected, action }),
      });

      if (res.ok) {
        if (action === "archive") {
          setImages(prev => prev.map(img => selected.includes(img.id) ? { ...img, status: "ARCHIVED" } : img));
        } else if (action === "restore") {
          setImages(prev => prev.map(img => selected.includes(img.id) ? { ...img, status: "ACTIVE" } : img));
        } else if (action === "delete") {
          setImages(prev => prev.filter(img => !selected.includes(img.id)));
        }
        setSelected([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const tabImages = useMemo(() => {
    return images.filter(img => img.status === activeTab);
  }, [images, activeTab]);

  const folders = useMemo(() => {
    const categories = new Set<string>();
    tabImages.forEach(img => { if (img.category) categories.add(img.category); });
    return Array.from(categories).sort();
  }, [tabImages]);

  const filteredImages = useMemo(() => {
    return tabImages.filter(img => {
      const matchesFolder = currentFolder
        ? img.category === currentFolder
        : searchQuery ? true : !img.category;
      const matchesSearch = searchQuery
        ? (img.alt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
           img.url.toLowerCase().includes(searchQuery.toLowerCase()))
        : true;
      return matchesFolder && matchesSearch;
    });
  }, [tabImages, currentFolder, searchQuery]);

  const totalPages = Math.ceil(filteredImages.length / itemsPerPage);
  const paginatedImages = filteredImages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFolderClick = (folder: string) => {
    setCurrentFolder(folder);
    setCurrentPage(1);
    setSearchQuery("");
  };

  const handleBackToRoot = () => {
    setCurrentFolder(null);
    setCurrentPage(1);
  };

  const handleUpload = async () => {
    if (!uploadFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("category", uploadCategory);
    formData.append("alt", uploadAlt);
    try {
      const res = await fetch("/api/admin/gallery/upload", { method: "POST", body: formData });
      if (res.ok) {
        const newImage = await res.json();
        setImages(prev => [newImage, ...prev]);
        setIsUploadModalOpen(false);
        setUploadFile(null);
        setUploadCategory("");
        setUploadAlt("");
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-shell space-y-6">

      {/* ── Page Header ── */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="admin-page-title">Gallery</h1>
          <p className="admin-page-subtitle">Manage media assets</p>
        </div>
        <button
          onClick={() => { setUploadCategory(""); setUploadAlt(""); setUploadFile(null); setIsUploadModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#0f1523] text-white rounded-lg text-[13px] font-medium hover:bg-black transition-all"
        >
          <Plus size={16} />
          <span>Upload Media</span>
        </button>
      </div>

      {/* ── Active / Archived Tabs & Batch Actions ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-[10px] border border-[#f0f2f8]">
        <div className="flex gap-2">
          <button
            onClick={() => { setActiveTab("ACTIVE"); setCurrentPage(1); setSelected([]); setCurrentFolder(null); }}
            className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${
              activeTab === "ACTIVE"
                ? "bg-[#0f1523] text-white"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            All Active
          </button>
          <button
            onClick={() => { setActiveTab("ARCHIVED"); setCurrentPage(1); setSelected([]); setCurrentFolder(null); }}
            className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all ${
              activeTab === "ARCHIVED"
                ? "bg-[#0f1523] text-white"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            Archived ({images.filter(i => i.status === "ARCHIVED").length})
          </button>
        </div>

        {selected.length > 0 && (
          <div className="flex items-center gap-3 bg-red-50/50 border border-red-100 px-4 py-2 rounded-lg animate-in fade-in duration-300">
            <span className="text-[12px] font-bold text-[#c1000a] font-mono">
              {selected.length} Selected
            </span>
            <div className="h-4 w-px bg-red-100"></div>
            {activeTab === "ACTIVE" ? (
              <button
                onClick={() => handleBatchAction("archive")}
                className="flex items-center gap-1 text-[12px] font-bold text-slate-700 hover:text-[#c1000a] transition-all"
              >
                <Archive size={14} /> Archive
              </button>
            ) : (
              <button
                onClick={() => handleBatchAction("restore")}
                className="flex items-center gap-1 text-[12px] font-bold text-slate-700 hover:text-[#c1000a] transition-all"
              >
                <RotateCcw size={14} /> Restore
              </button>
            )}
            {isSuperAdmin && (
              <button
                onClick={() => handleBatchAction("delete")}
                className="flex items-center gap-1 text-[12px] font-bold text-slate-700 hover:text-red-600 transition-all"
              >
                <Trash2 size={14} /> Delete Permanently
              </button>
            )}
            <div className="h-4 w-px bg-red-100"></div>
            <button
              onClick={() => setSelected([])}
              className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* ── Breadcrumbs & Search ── */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-[10px] border border-[#f0f2f8] gap-4">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-[#0f1523]">
          <button
            onClick={handleBackToRoot}
            className="hover:text-[#dc2626] transition-colors flex items-center gap-1.5"
          >
            <Folder size={15} className="text-[#8a9ab5]" />
            Gallery Root
          </button>
          {currentFolder && (
            <>
              <ChevronRight size={13} className="text-[#8a9ab5]" />
              <span className="text-[#dc2626]">{currentFolder}</span>
            </>
          )}
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a9ab5]" />
          <input
            type="text"
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[#f0f2f8] rounded-lg text-[13px] outline-none focus:border-[#0f1523]"
          />
        </div>
      </div>

      {/* ── FOLDERS GRID ── shown only in root + no search */}
      {!currentFolder && !searchQuery && folders.length > 0 && (
        <div>
          <p className="text-[11px] font-bold text-[#8a9ab5] uppercase tracking-widest mb-3 px-0.5">
            Folders — {folders.length}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {folders.map((folder) => {
              const folderImages = images.filter(img => img.category === folder);
              const previews = folderImages.slice(0, 4);
              return (
                <div
                  key={folder}
                  onClick={() => handleFolderClick(folder)}
                  className="group cursor-pointer bg-white border border-[#f0f2f8] rounded-[12px] overflow-hidden hover:border-[#0f1523] hover:shadow-lg transition-all duration-200"
                >
                  {/* 2×2 preview mosaic */}
                  <div className="grid grid-cols-2 gap-px bg-[#e8eaf2] aspect-square">
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} className="bg-[#f4f6fb] overflow-hidden">
                        {previews[i] ? (
                          <img
                            src={previews[i].url}
                            alt=""
                            className="w-full h-full object-cover opacity-75 group-hover:opacity-100 transition-opacity duration-200"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Folder size={13} className="text-[#c8d0e0]" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {/* Label */}
                  <div className="p-3">
                    <div className="text-[13px] font-semibold text-[#0f1523] truncate">{folder}</div>
                    <div className="text-[11px] text-[#8a9ab5] mt-0.5">{folderImages.length} file{folderImages.length !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── FILES GRID ── */}
      {paginatedImages.length > 0 && (
        <div>
          <p className="text-[11px] font-bold text-[#8a9ab5] uppercase tracking-widest mb-3 px-0.5">
            {currentFolder
              ? `${paginatedImages.length} file${paginatedImages.length !== 1 ? 's' : ''} — /${currentFolder}`
              : searchQuery
                ? `${paginatedImages.length} result${paginatedImages.length !== 1 ? 's' : ''} for "${searchQuery}"`
                : `Uncategorized — ${paginatedImages.length}`}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {paginatedImages.map((img) => {
              const isSel = selected.includes(img.id);
              return (
                <div
                  key={img.id}
                  className={`group relative bg-white border rounded-[12px] overflow-hidden hover:shadow-lg transition-all duration-200 ${
                    isSel ? "border-[#0f1523] ring-2 ring-slate-100" : "border-[#f0f2f8] hover:border-[#0f1523]"
                  }`}
                >
                  {/* Checkbox Overlay */}
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelected(prev => 
                        prev.includes(img.id) ? prev.filter(x => x !== img.id) : [...prev, img.id]
                      );
                    }}
                    className={`absolute top-2.5 left-2.5 z-10 w-6 h-6 rounded-md bg-white border flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 transition-all ${
                      isSel ? "border-[#0f1523] text-[#0f1523]" : "border-slate-200 text-slate-300 opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    {isSel ? <CheckSquare size={14} className="fill-current text-white bg-[#0f1523] rounded-[2px]" /> : <Square size={14} />}
                  </div>

                  {/* Square thumbnail */}
                  <div className="aspect-square bg-[#f4f6fb] overflow-hidden">
                    <img
                      src={img.url}
                      alt={img.alt || "Media"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Hover overlay with action buttons */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelected([img.id]); }}
                      className="w-9 h-9 bg-white rounded-lg flex items-center justify-center hover:bg-[#f0f2f8] transition-colors shadow-md"
                      title="Edit"
                    >
                      <Edit3 size={15} color="#0f1523" />
                    </button>
                    {activeTab === "ACTIVE" ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleArchive(img.id); }}
                        className="w-9 h-9 bg-white rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors shadow-md"
                        title="Archive"
                      >
                        <Archive size={15} color="#c1000a" />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleRestore(img.id); }}
                          className="w-9 h-9 bg-white rounded-lg flex items-center justify-center hover:bg-green-50 transition-colors shadow-md"
                          title="Restore"
                        >
                          <RotateCcw size={15} color="#059669" />
                        </button>
                        {isSuperAdmin && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handlePermanentDelete(img.id); }}
                            className="w-9 h-9 bg-white rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors shadow-md"
                            title="Delete Permanently"
                          >
                            <Trash2 size={15} color="#c1000a" />
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  {/* File label below thumbnail */}
                  <div className="p-2.5">
                    <div className="text-[12px] font-semibold text-[#0f1523] truncate">{img.alt || "Untitled"}</div>
                    <div className="text-[10px] text-[#8a9ab5] truncate">/{img.category || "uncategorized"}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Empty States ── */}
      {!currentFolder && !searchQuery && folders.length === 0 && paginatedImages.length === 0 && (
        <div className="p-16 text-center text-[#8a9ab5] text-[13px] border border-dashed border-[#f0f2f8] rounded-[12px] bg-white">
          <UploadCloud size={36} className="mx-auto mb-3 opacity-30" />
          No media uploaded yet. Click "Upload Media" to get started.
        </div>
      )}
      {(currentFolder || searchQuery) && paginatedImages.length === 0 && (
        <div className="p-12 text-center text-[#8a9ab5] text-[13px] border border-dashed border-[#f0f2f8] rounded-[12px] bg-white">
          No media found{searchQuery ? ` for "${searchQuery}"` : " in this folder"}.
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white border border-[#f0f2f8] p-4 rounded-[10px]">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-3 py-1.5 border border-[#f0f2f8] rounded-md text-[13px] font-medium disabled:opacity-50 hover:bg-slate-50 transition-all"
          >
            <ChevronLeft size={14} /> Previous
          </button>
          <span className="text-[13px] font-medium text-[#8a9ab5]">Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-3 py-1.5 border border-[#f0f2f8] rounded-md text-[13px] font-medium disabled:opacity-50 hover:bg-slate-50 transition-all"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* ── Edit Media Modal ── */}
      {singleSelected && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-[#0f1523]">Edit Media</h3>
              <button onClick={() => setSelected([])} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex justify-center">
                <img
                  src={singleSelected.url}
                  alt={singleSelected.alt || ""}
                  className="max-h-44 object-contain rounded-lg border border-slate-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Alt Text</label>
                <input
                  type="text"
                  value={editAlt}
                  onChange={(e) => setEditAlt(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#0f1523] text-[13px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Category (Folder)</label>
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden focus-within:border-[#0f1523]">
                  <span className="px-3 text-slate-400 font-mono text-[13px] bg-slate-50 border-r border-slate-200 py-2">/</span>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 outline-none text-[13px] font-mono text-slate-700"
                    placeholder="e.g. services"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setSelected([])}
                  className="px-4 py-2 text-[13px] font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { handleUpdateDetails().then(() => setSelected([])); }}
                  disabled={savingDetails || (editAlt === (singleSelected.alt || "") && editCategory === (singleSelected.category || ""))}
                  className="px-4 py-2 bg-[#0f1523] text-white text-[13px] font-medium rounded-lg hover:bg-black transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {savingDetails && <Loader2 size={14} className="animate-spin" />}
                  {savingDetails ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Upload Modal ── */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-[#0f1523]">Upload Media</h3>
              <button onClick={() => setIsUploadModalOpen(false)} disabled={uploading} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <input id="file-input" type="file" accept="image/*" className="hidden" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
              <div
                className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => document.getElementById("file-input")?.click()}
              >
                {uploadFile ? (
                  <>
                    <FileImage className="text-[#0f1523]" size={28} />
                    <span className="text-[13px] font-semibold text-[#0f1523]">{uploadFile.name}</span>
                    <span className="text-[11px] text-[#8a9ab5]">{(uploadFile.size / 1024).toFixed(1)} KB</span>
                  </>
                ) : (
                  <>
                    <Upload className="text-slate-400" size={28} />
                    <span className="text-[13px] font-medium text-slate-500">Click to select image</span>
                    <span className="text-[11px] text-slate-400">PNG, JPG, WEBP</span>
                  </>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Alt Text</label>
                <input
                  type="text"
                  value={uploadAlt}
                  onChange={(e) => setUploadAlt(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-[#0f1523] text-[13px]"
                  placeholder="Describe the image"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Category (Folder)</label>
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden focus-within:border-[#0f1523]">
                  <span className="px-3 text-slate-400 font-mono text-[13px] bg-slate-50 border-r border-slate-200 py-2">/</span>
                  <input
                    type="text"
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    className="w-full px-3 py-2 outline-none text-[13px] font-mono text-slate-700"
                    placeholder="e.g. services"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  disabled={uploading}
                  className="px-4 py-2 text-[13px] font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading || !uploadFile}
                  className="px-4 py-2 bg-[#0f1523] text-white text-[13px] font-medium rounded-lg hover:bg-black transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {uploading && <Loader2 size={14} className="animate-spin" />}
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
