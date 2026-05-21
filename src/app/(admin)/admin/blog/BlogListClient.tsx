"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Edit, Trash2, Eye, Plus, Search, Edit3 } from "lucide-react";
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
}

export default function BlogListClient({ initialPosts }: { initialPosts: BlogPost[] }) {
  const { success, error: toastError } = useToast();
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [deleting, setDeleting] = useState<string | null>(null);

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
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#f0f2f8] rounded-lg outline-none focus:border-[#0f1523] text-[13px]"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-white border border-[#f0f2f8] rounded-lg outline-none focus:border-[#0f1523] text-[13px] sm:w-40"
        >
          <option value="ALL">All Status</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="SCHEDULED">Scheduled</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[10px] border border-[#f0f2f8] overflow-x-auto">
        <table className="w-full text-left admin-table" style={{ minWidth: "600px" }}>
          <thead>
            <tr>
              <th>TITLE</th>
              <th>CATEGORY</th>
              <th>STATUS</th>
              <th>DATE</th>
              <th className="text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((post) => (
              <tr key={post.id} className="hover:bg-[#f8f9fb] transition-all group">
                <td>
                  <div className="flex items-center gap-[14px]">
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "rgba(193,0,10,0.08)",
                        border: "1px solid rgba(193,0,10,0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Edit3 color="#c1000a" style={{ width: "15px", height: "15px", opacity: 0.65 }} />
                    </div>
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: 600, color: "#0f1523", fontFamily: "var(--font-admin)" }}>
                        {post.title}
                        {post.isFeatured && (
                          <span style={{ marginLeft: "8px", fontSize: "10px", fontWeight: 700, color: "#d97706", background: "rgba(245,158,11,0.08)", padding: "2px 8px", borderRadius: "20px" }}>
                            FEATURED
                          </span>
                        )}
                      </div>
                      <div className="slug" style={{ fontSize: "11px", color: "#8a9ab5" }}>⊘ /blog/{post.slug}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: "13px", color: "#4a5568" }}>{post.category || "Uncategorized"}</span>
                </td>
                <td>
                  {post.status === "PUBLISHED" ? (
                    <span style={{ fontSize: "11px", fontWeight: 600, color: "#059669", background: "rgba(16,185,129,0.08)", padding: "4px 10px", borderRadius: "20px" }}>
                      • PUBLISHED
                    </span>
                  ) : post.status === "SCHEDULED" ? (
                    <span style={{ fontSize: "11px", fontWeight: 600, color: "#7c3aed", background: "rgba(124,58,237,0.08)", padding: "4px 10px", borderRadius: "20px" }}>
                      • SCHEDULED
                    </span>
                  ) : (
                    <span style={{ fontSize: "11px", fontWeight: 600, color: "#d97706", background: "rgba(245,158,11,0.08)", padding: "4px 10px", borderRadius: "20px" }}>
                      • DRAFT
                    </span>
                  )}
                </td>
                <td className="admin-list-meta">{format(new Date(post.createdAt), "MMM d, yyyy")}</td>
                <td className="text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    {post.status === "PUBLISHED" && (
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ width: "32px", height: "32px", border: "1px solid #f0f2f8", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}
                        className="hover:bg-[#f0f2f8]"
                        title="View on site"
                      >
                        <Eye size={14} style={{ opacity: 0.5 }} color="#0f1523" />
                      </a>
                    )}
                    <Link
                      href={`/admin/blog/${post.id}`}
                      style={{ width: "32px", height: "32px", border: "1px solid #f0f2f8", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}
                      className="hover:bg-[#f0f2f8]"
                      title="Edit"
                    >
                      <Edit size={14} style={{ opacity: 0.5 }} color="#0f1523" />
                    </Link>
                    <button
                      onClick={() => handleDelete(post)}
                      disabled={deleting === post.id}
                      style={{ width: "32px", height: "32px", border: "1px solid #f0f2f8", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}
                      className="hover:bg-red-50 hover:border-red-100 disabled:opacity-40"
                      title="Delete"
                    >
                      <Trash2 size={14} style={{ opacity: 0.5 }} color="#c1000a" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="p-10 text-center text-[#8a9ab5] text-[13px]">
                  {search || filterStatus !== "ALL" ? "No posts match your filters." : "No blog posts yet. Create your first post!"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
