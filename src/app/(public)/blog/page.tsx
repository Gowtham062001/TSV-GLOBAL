import { prisma } from "@/lib/db";
import { SectionRenderer } from "@/components/public/SectionRenderer";
import { Metadata } from "next";
import { safeFetch } from "@/lib/safe-fetch";
import { notFound } from "next/navigation";
import { BlogGrid } from "@/components/public/sections/BlogGrid";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await safeFetch<any>(
      () => prisma.page.findUnique({ where: { slug: "blog" } }),
      null,
      "blog_page_meta"
    );
    if (!page || !page.isVisible || page.status !== "PUBLISHED") return {};
    const seo = page.seoData as any;
    return {
      title: seo?.metaTitle || `${page.title} | TSV Global Solutions`,
      description: seo?.metaDescription || "Stay updated with the latest logistics trends, industry insights, and global trade news.",
      alternates: { canonical: seo?.canonicalUrl || "https://tsvglobal.com/blog" },
      openGraph: {
        title: seo?.metaTitle || page.title,
        description: seo?.metaDescription,
        images: seo?.ogImage ? [{ url: seo.ogImage }] : [],
      },
    };
  } catch {
    return {
      title: "Blog | TSV Global Solutions",
      description: "Stay updated with the latest logistics trends, industry insights, and global trade news.",
    };
  }
}

export default async function BlogPage() {
  try {
    const page = await safeFetch<any>(
      () => prisma.page.findUnique({
        where: { slug: "blog" },
        include: {
          sections: { where: { isVisible: true }, orderBy: { order: "asc" } },
        },
      }),
      null,
      "blog_page"
    );

    // Always fetch live posts regardless of CMS sections
    const posts = await safeFetch<any[]>(
      () => prisma.blogPost.findMany({
        where: { status: "PUBLISHED" },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        select: {
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          author: true,
          category: true,
          publishedAt: true,
          createdAt: true,
          isFeatured: true,
        },
      }),
      [],
      "blog_posts_list"
    );

    const categoriesSetting = await safeFetch<any>(
      () => prisma.siteSetting.findUnique({ where: { key: "blog_categories" } }),
      null,
      "blog_categories_setting"
    );
    let categoriesList: any[] = [];
    if (categoriesSetting) {
      try {
        categoriesList = JSON.parse(categoriesSetting.value);
      } catch (e) {
        console.error("Failed to parse categories:", e);
      }
    }

    const seo = page?.seoData as any;

    return (
      <>
        {seo?.faqSchema && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: seo.faqSchema }} />
        )}

        {/* Render CMS sections (Page Header etc.) except blog_grid — we handle that ourselves */}
        {page?.sections
          ?.filter((s: any) => s.type !== "blog_grid")
          .map((section: any) => (
            <SectionRenderer
              key={section.id}
              type={section.type}
              content={section.content as Record<string, unknown>}
            />
          ))}

        {/* If no CMS page, render a default header */}
        {!page && (
          <section
            className="page-header-section"
            style={{ background: "linear-gradient(135deg,#0f1523 0%,#1a2035 100%)", padding: "100px 0 60px" }}
          >
            <div className="container text-center">
              <h4 className="sub-heading" style={{ color: "#c1000a", marginBottom: "16px" }}>
                TSV Chronicles
              </h4>
              <h1 style={{ color: "#fff", fontSize: "clamp(28px,4vw,48px)", fontWeight: 800 }}>
                Insights & Industry <span style={{ color: "#c1000a" }}>News</span>
              </h1>
            </div>
          </section>
        )}

        {/* Live Blog Grid from DB */}
        <BlogGrid
          eyebrow="Our Journal"
          heading="Latest"
          highlight="Articles"
          posts={posts.map((p) => ({
            ...p,
            publishedAt: p.publishedAt || p.createdAt,
          }))}
          categories={categoriesList}
        />

        {posts.length === 0 && (
          <section style={{ padding: "80px 0", background: "#f8f9fc", textAlign: "center" }}>
            <div className="container">
              <p style={{ color: "#64748b", fontSize: "16px" }}>No articles published yet. Check back soon!</p>
            </div>
          </section>
        )}
      </>
    );
  } catch (error) {
    console.error("Blog page error:", error);
    return (
      <div className="py-20 text-center text-gray-500">
        <h2 className="text-xl font-bold text-gray-900 mb-2">TSV Chronicles</h2>
        <p className="text-sm">Stay tuned for our latest articles and trade updates!</p>
      </div>
    );
  }
}
