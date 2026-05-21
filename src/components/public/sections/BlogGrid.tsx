"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";

export interface BlogPostItem {
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  author?: string;
  category?: string;
  publishedAt?: string | Date;
  isFeatured?: boolean;
}

export interface BlogGridProps {
  eyebrow?: string;
  heading?: string;
  highlight?: string;
  posts?: BlogPostItem[];
  categories?: { id: string; name: string; slug: string }[];
}

export const BlogGrid: React.FC<BlogGridProps> = ({
  eyebrow,
  heading,
  highlight,
  posts = [],
  categories = []
}) => {
  const [activeCategory, setActiveCategory] = useState("ALL");

  const filteredPosts = useMemo(() => {
    if (activeCategory === "ALL") return posts;
    return posts.filter(
      (p) => (p.category || "").toLowerCase() === activeCategory.toLowerCase()
    );
  }, [posts, activeCategory]);

  // If there are no posts at all, render nothing
  if (!posts || posts.length === 0) return null;

  return (
    <section className="blog-section padding">
      <div className="container">
        {(eyebrow || heading) && (
          <div className="section-heading text-center mb-40 wow fade-in-bottom" data-wow-delay="200ms">
            {eyebrow && <h4 className="sub-heading">{eyebrow}</h4>}
            {heading && (
              <h2>
                {heading} <span className="hl">{highlight}</span>
              </h2>
            )}
          </div>
        )}

        {/* Category Filter Pills */}
        {categories.length > 0 && (
          <div className="flex flex-wrap justify-center items-center gap-2 mb-12 max-w-4xl mx-auto">
            <button
              onClick={() => setActiveCategory("ALL")}
              className={`px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${
                activeCategory === "ALL"
                  ? "bg-[#c1000a] text-white shadow-lg shadow-[#c1000a]/20 scale-105"
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-100"
              }`}
            >
              All
            </button>
            {categories.map((cat) => {
              // Only render category pills if there's at least one post in that category (or show all configured categories)
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`px-6 py-2.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${
                    activeCategory.toLowerCase() === cat.name.toLowerCase()
                      ? "bg-[#c1000a] text-white shadow-lg shadow-[#c1000a]/20 scale-105"
                      : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-100"
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-100">
            <p className="text-slate-400 text-sm">No articles available in this category.</p>
          </div>
        ) : (
          <div className="row gy-4">
            {filteredPosts.map((post, index) => (
              <div className="col-lg-4 col-md-6 animate-in fade-in slide-in-from-bottom-4 duration-300" key={post.slug}>
                <div className="blog-item">
                  <div className="blog-thumb" style={{ position: "relative" }}>
                    <Link href={`/blog/${post.slug}`}>
                      <img
                        src={post.coverImage || "/img/post-1.jpg"}
                        alt={post.title}
                        style={{ width: "100%", height: "220px", objectFit: "cover" }}
                      />
                    </Link>
                    {post.category && (
                      <span
                        style={{
                          position: "absolute",
                          top: "16px",
                          left: "16px",
                          background: "#c1000a",
                          color: "#fff",
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "4px 12px",
                          borderRadius: "20px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {post.category}
                      </span>
                    )}
                    {post.isFeatured && (
                      <span
                        style={{
                          position: "absolute",
                          top: "16px",
                          right: "16px",
                          background: "#f59e0b",
                          color: "#fff",
                          fontSize: "10px",
                          fontWeight: 700,
                          padding: "3px 10px",
                          borderRadius: "20px",
                          textTransform: "uppercase",
                        }}
                      >
                        ★ Featured
                      </span>
                    )}
                  </div>
                  <div className="blog-content">
                    <ul className="blog-meta">
                      {post.author && (
                        <li>
                          <i className="fa-regular fa-user"></i> {post.author}
                        </li>
                      )}
                      <li suppressHydrationWarning>
                        <i className="fa-regular fa-calendar"></i>{" "}
                        {post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Draft"}
                      </li>
                    </ul>
                    <h3>
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>
                    {post.excerpt && <p>{post.excerpt}</p>}
                    <Link className="read-more" href={`/blog/${post.slug}`}>
                      Read More
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
