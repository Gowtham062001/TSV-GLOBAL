"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Edit, Trash2, Eye, Plus, Search, Edit3, List, LayoutGrid } from "lucide-react";
import { useToast } from "@/components/shared/Toast";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  status: string;
  createdAt: string;
  isFeatured: boolean;
  coverImage: string | null;
}

export default function BlogListClient({ initialPosts }: { initialPosts: BlogPost[] }) {
  const { success, error: toastError } = useToast();
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  useEffect(() => {
    const saved = localStorage.getItem("blog_view_mode") as "list" | "grid";
    if (saved === "list" || saved === "grid") {
      setViewMode(saved);
    }
  }, []);

  const handleViewModeChange = (mode: "list" | "grid") => {
    setViewMode(mode);
    localStorage.setItem("blog_view_mode", mode);
  };

  // Categories CRUD States
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [categoryActionLoading, setCategoryActionLoading] = useState(false);

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await fetch("/api/admin/blog/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (e) {
      toastError("Failed to fetch categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleOpenCategories = () => {
    setShowCategoriesModal(true);
    fetchCategories();
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setCategoryActionLoading(true);
    try {
      const res = await fetch("/api/admin/blog/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName }),
      });
      if (res.ok) {
        const newCat = await res.json();
        setCategories((prev) => [...prev, newCat]);
        setNewCategoryName("");
        success("Category added successfully");
      } else {
        const errData = await res.json();
        toastError(errData.error || "Failed to add category");
      }
    } catch {
      toastError("Network error");
    } finally {
      setCategoryActionLoading(false);
    }
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editingCategoryName.trim()) return;
    setCategoryActionLoading(true);
    try {
      const res = await fetch("/api/admin/blog/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: editingCategoryName }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
        setEditingCategoryId(null);
        setEditingCategoryName("");
        success("Category updated successfully");
      } else {
        const errData = await res.json();
        toastError(errData.error || "Failed to update category");
      }
    } catch {
      toastError("Network error");
    } finally {
      setCategoryActionLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? This won't delete the posts under it but will remove the category reference.`)) return;
    setCategoryActionLoading(true);
    try {
      const res = await fetch(`/api/admin/blog/categories?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        success("Category deleted");
      } else {
        const errData = await res.json();
        toastError(errData.error || "Failed to delete category");
      }
    } catch {
      toastError("Network error");
    } finally {
      setCategoryActionLoading(false);
    }
  };

  const filtered = posts.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase()) ||
      (p.category || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "ALL" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleDelete = async (post: BlogPost) => {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    setDeleting(post.id);
    try {
      const res = await fetch(`/api/admin/blog/${post.id}`, { method: "DELETE" });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== post.id));
        success("Post deleted successfully");
        router.refresh();
      } else {
        toastError("Failed to delete post");
      }
    } catch {
      toastError("Network error");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="admin-shell space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="admin-page-title">Blog Posts</h1>
          <p className="admin-page-subtitle">Create and manage blog articles</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenCategories}
            className="flex items-center gap-2 px-4 py-2 border border-[#f0f2f8] bg-white text-[#0f1523] rounded-lg text-[13px] font-semibold hover:bg-slate-50 transition-all w-fit"
          >
            <span>Manage Categories</span>
          </button>
          <Link
            href="/admin/blog/new"
            className="flex items-center gap-2 px-4 py-2 bg-[#0f1523] text-white rounded-lg text-[13px] font-medium hover:bg-black transition-all w-fit"
          >
            <Plus size={16} />
            <span>New Post</span>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a9ab5]" />
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#cbd5e1] rounded-lg outline-none focus:border-[#0f1523] text-[13px]"
          />
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-white border border-[#cbd5e1] rounded-lg outline-none focus:border-[#0f1523] text-[13px] sm:w-40 flex-1"
          >
            <option value="ALL">All Status</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="SCHEDULED">Scheduled</option>
          </select>
          <div className="flex border border-[#cbd5e1] rounded-lg p-0.5 bg-white shrink-0">
            <button
              onClick={() => handleViewModeChange('list')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-[#0f1523] text-white' : 'text-[#8a9ab5] hover:text-[#0f1523]'}`}
              title="List View"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => handleViewModeChange('grid')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-[#0f1523] text-white' : 'text-[#8a9ab5] hover:text-[#0f1523]'}`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      {viewMode === "list" ? (
        <div className="space-y-2">
          {filtered.map((post) => (
            <div
              key={post.id}
              className="group admin-list-row"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 20px',
                background: '#fff',
                border: '2px solid #cbd5e1',
                borderRadius: 10,
                transition: 'border-color 0.15s'
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#0f1523')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#cbd5e1')}
            >
              {/* Thumbnail */}
              <div className="admin-list-thumb" style={{
                width: 40, height: 40, borderRadius: 8, overflow: 'hidden',
                flexShrink: 0, background: '#f0f2f8', border: '1px solid #e2e8f0'
              }}>
                <img
                  src={post.coverImage || '/assets/img/logo.png'}
                  alt={post.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={e => { (e.target as HTMLImageElement).src = '/assets/img/logo.png'; }}
                />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: 14, fontWeight: 600, color: '#0f1523',
                  margin: '0 0 3px', overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>
                  {post.title}
                  {post.isFeatured && (
                    <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, color: '#d97706', background: 'rgba(245,158,11,0.08)', padding: '2px 8px', borderRadius: 20 }}>
                      FEATURED
                    </span>
                  )}
                </p>
                <p style={{ fontSize: 11, color: '#8a9ab5', margin: 0, fontFamily: 'monospace' }}>
                  /blog/{post.slug}
                </p>
              </div>

              {/* Category */}
              {post.category && (
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '3px 9px',
                  borderRadius: 20, background: 'rgba(59,130,246,0.08)',
                  color: '#2563eb', textTransform: 'uppercase',
                  letterSpacing: '0.4px', flexShrink: 0
                }}>
                  {post.category}
                </span>
              )}

              {/* Status */}
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '3px 9px',
                borderRadius: 20, flexShrink: 0,
                background: post.status === 'PUBLISHED' ? 'rgba(16,185,129,0.1)' : post.status === 'SCHEDULED' ? 'rgba(124,58,237,0.1)' : 'rgba(245,158,11,0.1)',
                color: post.status === 'PUBLISHED' ? '#059669' : post.status === 'SCHEDULED' ? '#7c3aed' : '#d97706',
                textTransform: 'uppercase'
              }}>
                {post.status}
              </span>

              {/* Date */}
              <span className="admin-list-meta" suppressHydrationWarning style={{
                fontSize: 12, color: '#8a9ab5', flexShrink: 0, minWidth: 80, textAlign: 'right'
              }}>
                {format(new Date(post.createdAt), "MMM d, yyyy")}
              </span>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <a
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ width: 32, height: 32, border: '1px solid #f0f2f8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', background: '#fff' }}
                  className="hover:bg-[#f0f2f8]"
                  title="View on site"
                >
                  <Eye size={14} style={{ opacity: 0.5 }} color="#0f1523" />
                </a>
                <Link
                  href={`/admin/blog/${post.id}`}
                  style={{ width: 32, height: 32, border: '1px solid #f0f2f8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  className="hover:bg-[#f0f2f8]"
                  title="Edit"
                >
                  <Edit size={14} style={{ opacity: 0.5 }} color="#0f1523" />
                </Link>
                <button
                  onClick={() => handleDelete(post)}
                  disabled={deleting === post.id}
                  style={{ width: 32, height: 32, border: '1px solid #f0f2f8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', cursor: 'pointer' }}
                  className="hover:bg-red-50 hover:border-red-100 disabled:opacity-40"
                  title="Delete"
                >
                  <Trash2 size={14} style={{ opacity: 0.5 }} color="#c1000a" />
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="p-10 text-center text-[#8a9ab5] text-[13px] border border-[#f0f2f8] rounded-[10px] bg-white">
              {search || filterStatus !== "ALL" ? "No posts match your filters." : "No blog posts yet. Create your first post!"}
            </div>
          )}
        </div>
      ) : (
        <div className="admin-grid-layout">
          {filtered.map((post) => (
            <div
              key={post.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                background: '#fff',
                border: '2px solid #cbd5e1',
                borderRadius: 10,
                overflow: 'hidden',
                transition: 'border-color 0.15s'
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#0f1523')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#cbd5e1')}
            >
              {/* Thumbnail Container */}
              <div style={{ position: 'relative', width: '100%', height: 140, background: '#f0f2f8', overflow: 'hidden' }}>
                <img
                  src={post.coverImage || '/assets/img/logo.png'}
                  alt={post.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  onError={e => { (e.target as HTMLImageElement).src = '/assets/img/logo.png'; }}
                />
                {/* Badges Overlay */}
                <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {post.isFeatured && (
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#d97706', background: '#fff', border: '1px solid rgba(245,158,11,0.2)', padding: '2px 6px', borderRadius: 20, boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                      FEATURED
                    </span>
                  )}
                  {post.category && (
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: '2px 6px',
                      borderRadius: 20, background: '#0f1523',
                      color: '#fff', textTransform: 'uppercase',
                      letterSpacing: '0.4px', width: 'fit-content'
                    }}>
                      {post.category}
                    </span>
                  )}
                </div>
              </div>

              {/* Info Body */}
              <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ flex: 1, minHeight: 64 }}>
                  <p style={{
                    fontSize: 14, fontWeight: 600, color: '#0f1523',
                    margin: '0 0 4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4'
                  }}>
                    {post.title}
                  </p>
                  <p style={{ fontSize: 11, color: '#8a9ab5', margin: 0, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    /blog/{post.slug}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#f0f2f8]">
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: '2px 8px',
                    borderRadius: 20,
                    background: post.status === 'PUBLISHED' ? 'rgba(16,185,129,0.1)' : post.status === 'SCHEDULED' ? 'rgba(124,58,237,0.1)' : 'rgba(245,158,11,0.1)',
                    color: post.status === 'PUBLISHED' ? '#059669' : post.status === 'SCHEDULED' ? '#7c3aed' : '#d97706',
                    textTransform: 'uppercase'
                  }}>
                    {post.status}
                  </span>
                  <span suppressHydrationWarning style={{ fontSize: 11, color: '#8a9ab5' }}>
                    {format(new Date(post.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div style={{ display: 'flex', gap: 6, padding: '10px 16px', background: '#fcfdfe', borderTop: '1px solid #f0f2f8' }}>
                <a
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ flex: 1, height: 30, border: '1px solid #f0f2f8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', background: '#fff', gap: 4 }}
                  className="hover:bg-[#f0f2f8]"
                  title="View on site"
                >
                  <Eye size={12} style={{ opacity: 0.5 }} color="#0f1523" />
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#0f1523' }}>View</span>
                </a>
                <Link
                  href={`/admin/blog/${post.id}`}
                  style={{ flex: 1, height: 30, border: '1px solid #f0f2f8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                  className="hover:bg-[#f0f2f8]"
                  title="Edit"
                >
                  <Edit size={12} style={{ opacity: 0.5 }} color="#0f1523" />
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#0f1523' }}>Edit</span>
                </Link>
                <button
                  onClick={() => handleDelete(post)}
                  disabled={deleting === post.id}
                  style={{ width: 30, height: 30, border: '1px solid #f0f2f8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', cursor: 'pointer' }}
                  className="hover:bg-red-50 hover:border-red-100 disabled:opacity-40 shrink-0"
                  title="Delete"
                >
                  <Trash2 size={12} style={{ opacity: 0.5 }} color="#c1000a" />
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full p-10 text-center text-[#8a9ab5] text-[13px] border border-[#f0f2f8] rounded-[10px] bg-white">
              {search || filterStatus !== "ALL" ? "No posts match your filters." : "No blog posts yet. Create your first post!"}
            </div>
          )}
        </div>
      )}

      {/* Footer count */}
      <p className="text-[12px] text-[#8a9ab5]">
        Showing {filtered.length} of {posts.length} posts
      </p>

      {showCategoriesModal && (
        <div className="fixed inset-0 bg-[#0f1523]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#f0f2f8] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-[#f0f2f8] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#0f1523]">Blog Categories</h3>
                <p className="text-[11px] text-[#8a9ab5]">Manage tags/categories for articles</p>
              </div>
              <button
                onClick={() => setShowCategoriesModal(false)}
                className="text-[#8a9ab5] hover:text-[#0f1523] text-sm font-semibold transition-colors"
              >
                Close
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[350px] overflow-y-auto">
              {/* Add New Category */}
              <form onSubmit={handleAddCategory} className="flex gap-2">
                <input
                  type="text"
                  placeholder="New category name..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 px-4 py-2 border border-[#f0f2f8] rounded-xl outline-none focus:border-[#0f1523] text-[13px] bg-slate-50 focus:bg-white transition-all"
                  disabled={categoryActionLoading}
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0f1523] text-white rounded-xl text-[13px] font-semibold hover:bg-black transition-all disabled:opacity-50"
                  disabled={categoryActionLoading || !newCategoryName.trim()}
                >
                  Add
                </button>
              </form>

              {/* Categories List */}
              {loadingCategories ? (
                <div className="text-center py-6 text-slate-400 text-xs font-medium">Loading categories...</div>
              ) : categories.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">No categories available.</div>
              ) : (
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between p-3 bg-slate-50 border border-[#f0f2f8] rounded-xl hover:bg-slate-100/50 transition-all group"
                    >
                      {editingCategoryId === cat.id ? (
                        <div className="flex items-center gap-2 w-full">
                          <input
                            type="text"
                            value={editingCategoryName}
                            onChange={(e) => setEditingCategoryName(e.target.value)}
                            className="flex-1 px-3 py-1 bg-white border border-[#f0f2f8] rounded-lg text-xs outline-none focus:border-[#0f1523]"
                            disabled={categoryActionLoading}
                          />
                          <button
                            onClick={() => handleUpdateCategory(cat.id)}
                            className="px-3 py-1 bg-[#0f1523] text-white text-[11px] font-bold rounded-lg hover:bg-black transition-all"
                            disabled={categoryActionLoading}
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingCategoryId(null);
                              setEditingCategoryName("");
                            }}
                            className="px-3 py-1 bg-white border border-[#f0f2f8] text-[#0f1523] text-[11px] font-bold rounded-lg hover:bg-slate-50 transition-all"
                            disabled={categoryActionLoading}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-800">{cat.name}</span>
                            <span className="text-[10px] text-slate-400">slug: {cat.slug}</span>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                              onClick={() => {
                                setEditingCategoryId(cat.id);
                                setEditingCategoryName(cat.name);
                              }}
                              className="p-1.5 hover:bg-white rounded-lg text-slate-500 hover:text-slate-900 border border-transparent hover:border-slate-100 transition-all"
                              title="Edit name"
                              disabled={categoryActionLoading}
                            >
                              <Edit size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(cat.id, cat.name)}
                              className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 border border-transparent hover:border-red-100 transition-all"
                              title="Delete category"
                              disabled={categoryActionLoading}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
