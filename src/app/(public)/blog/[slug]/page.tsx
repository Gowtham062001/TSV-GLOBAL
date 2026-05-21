import { prisma } from "@/lib/db";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { safeFetch } from "@/lib/safe-fetch";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await safeFetch<any>(
    () => prisma.blogPost.findUnique({ where: { slug: params.slug } }),
    null,
    "blog_post_meta"
  );
  if (!post) return {};
  const seo = post.seoData as any;
  return {
    title: seo?.metaTitle || `${post.title} | Blog | TSV Global`,
    description: seo?.metaDescription || post.excerpt || "Logistics insights from TSV Global Solutions.",
    alternates: { canonical: seo?.canonicalUrl || `https://tsvglobal.com/blog/${post.slug}` },
    openGraph: {
      title: seo?.metaTitle || post.title,
      description: seo?.metaDescription || post.excerpt,
      images: post.coverImage ? [{ url: post.coverImage }] : [],
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await safeFetch<any>(
    () => prisma.blogPost.findUnique({ where: { slug: params.slug } }),
    null,
    "blog_post_detail"
  );

  if (!post || post.status !== "PUBLISHED") notFound();

  // Related posts — same category, exclude current
  const related = await safeFetch<any[]>(
    () => prisma.blogPost.findMany({
      where: { status: "PUBLISHED", category: post.category ?? undefined, slug: { not: post.slug } },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { title: true, slug: true, coverImage: true, excerpt: true, category: true, publishedAt: true, createdAt: true },
    }),
    [],
    "blog_related"
  );

  const seo = post.seoData as any;
  const publishDate = post.publishedAt || post.createdAt;
  const tags = post.tags ? post.tags.split(",").map((t: string) => t.trim()).filter(Boolean) : [];

  return (
    <>
      {seo?.faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: seo.faqSchema }} />
      )}

      {/* Page Header */}
      <section className="page-header-section" style={{ background: "linear-gradient(135deg,#0f1523 0%,#1a2035 100%)", padding: "100px 0 60px" }}>
        <div className="container">
          {/* Breadcrumb */}
          <nav style={{ marginBottom: "24px" }}>
            <ol style={{ display: "flex", flexWrap: "wrap", gap: "8px", listStyle: "none", padding: 0, margin: 0 }}>
              <li><Link href="/" style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", textDecoration: "none" }}>Home</Link></li>
              <li style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>/</li>
              <li><Link href="/blog" style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", textDecoration: "none" }}>Blog</Link></li>
              <li style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>/</li>
              <li style={{ color: "#fff", fontSize: "13px", maxWidth: "300px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{post.title}</li>
            </ol>
          </nav>

          {post.category && (
            <span className="sub-heading" style={{ color: "#c1000a", fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", marginBottom: "16px", display: "block" }}>
              {post.category}
            </span>
          )}
          <h1 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, color: "#fff", lineHeight: 1.25, maxWidth: "800px", marginBottom: "24px" }}>
            {post.title}
          </h1>

          {/* Meta row */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "24px" }}>
            {post.author && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(193,0,10,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <i className="fa-regular fa-user" style={{ color: "#c1000a", fontSize: "13px" }}></i>
                </div>
                <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px" }}>{post.author}</span>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <i className="fa-regular fa-calendar" style={{ color: "#c1000a", fontSize: "13px" }}></i>
              <span suppressHydrationWarning style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px" }}>
                {new Date(publishDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
            {post.readTime && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="fa-regular fa-clock" style={{ color: "#c1000a", fontSize: "13px" }}></i>
                <span style={{ color: "rgba(255,255,255,0.7)", fontSize: "13px" }}>{post.readTime} min read</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Cover Image */}
      {post.coverImage && (
        <div style={{ position: "relative", maxHeight: "500px", overflow: "hidden" }}>
          <img
            src={post.coverImage}
            alt={post.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 60%, rgba(15,21,35,0.3))" }} />
        </div>
      )}

      {/* Content */}
      <section style={{ padding: "80px 0", background: "#fff" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr min(280px, 30%)", gap: "60px", alignItems: "start" }}>

            {/* Main Content */}
            <div>
              {/* Excerpt highlight */}
              {post.excerpt && (
                <blockquote style={{
                  borderLeft: "4px solid #c1000a", paddingLeft: "24px",
                  margin: "0 0 40px", color: "#475569", fontSize: "18px",
                  fontWeight: 600, lineHeight: 1.7, fontStyle: "italic"
                }}>
                  {post.excerpt}
                </blockquote>
              )}

              {/* Body */}
              <div
                className="blog-content-body"
                style={{ color: "#374151", fontSize: "16px", lineHeight: 1.85 }}
                dangerouslySetInnerHTML={{
                  __html: typeof post.content === "string" ? post.content : JSON.stringify(post.content)
                }}
              />

              {/* Tags */}
              {tags.length > 0 && (
                <div style={{ marginTop: "48px", paddingTop: "32px", borderTop: "1px solid #f0f2f8" }}>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginRight: "12px" }}>Tags:</span>
                  {tags.map((tag: string) => (
                    <span key={tag} style={{
                      display: "inline-block", marginRight: "8px", marginBottom: "8px",
                      padding: "4px 14px", background: "rgba(193,0,10,0.06)",
                      color: "#c1000a", borderRadius: "20px", fontSize: "12px", fontWeight: 600
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Back link */}
              <div style={{ marginTop: "48px" }}>
                <Link href="/blog" className="default-btn" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                  <i className="fa-solid fa-arrow-left"></i> Back to Blog
                </Link>
              </div>
            </div>

            {/* Sidebar */}
            <aside style={{ position: "sticky", top: "100px" }}>
              {/* Category badge */}
              {post.category && (
                <div style={{ background: "#fff", border: "1px solid #f0f2f8", borderRadius: "12px", padding: "20px", marginBottom: "24px" }}>
                  <h4 style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>Category</h4>
                  <span style={{ padding: "6px 16px", background: "rgba(193,0,10,0.08)", color: "#c1000a", borderRadius: "20px", fontSize: "13px", fontWeight: 700 }}>
                    {post.category}
                  </span>
                </div>
              )}

              {/* Related posts in sidebar */}
              {related.length > 0 && (
                <div style={{ background: "#fff", border: "1px solid #f0f2f8", borderRadius: "12px", padding: "20px" }}>
                  <h4 style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px" }}>Related Articles</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {related.map((r) => (
                      <Link key={r.slug} href={`/blog/${r.slug}`} style={{ display: "flex", gap: "12px", alignItems: "flex-start", textDecoration: "none" }}>
                        {r.coverImage && (
                          <img src={r.coverImage} alt={r.title} style={{ width: "64px", height: "48px", objectFit: "cover", borderRadius: "8px", flexShrink: 0 }} />
                        )}
                        <div>
                          <p style={{ fontSize: "13px", fontWeight: 600, color: "#0f1523", lineHeight: 1.4, margin: "0 0 4px" }}>{r.title}</p>
                          <span suppressHydrationWarning style={{ fontSize: "11px", color: "#94a3b8" }}>
                            {new Date(r.publishedAt || r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>

      {/* More Posts Grid */}
      {related.length > 0 && (
        <section style={{ padding: "80px 0", background: "#f8f9fc" }}>
          <div className="container">
            <div className="section-heading text-center mb-40">
              <h4 className="sub-heading">Continue Reading</h4>
              <h2>More from our <span className="hl">Blog</span></h2>
            </div>
            <div className="row gy-4">
              {related.map((r, i) => (
                <div className="col-lg-4 col-md-6" key={r.slug}>
                  <div className="blog-item wow fade-in-bottom" data-wow-delay={`${(i + 1) * 100}ms`}>
                    <div className="blog-thumb">
                      <img src={r.coverImage || "/img/post-1.jpg"} alt={r.title} />
                    </div>
                    <div className="blog-content">
                      <ul className="blog-meta">
                        <li suppressHydrationWarning><i className="fa-regular fa-calendar"></i> {new Date(r.publishedAt || r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</li>
                        {r.category && <li><i className="fa-regular fa-folder"></i> {r.category}</li>}
                      </ul>
                      <h3><Link href={`/blog/${r.slug}`}>{r.title}</Link></h3>
                      {r.excerpt && <p>{r.excerpt}</p>}
                      <Link className="read-more" href={`/blog/${r.slug}`}>Read More</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
