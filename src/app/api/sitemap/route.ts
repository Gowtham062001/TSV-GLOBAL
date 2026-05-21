import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://tsvglobal.com";

function buildUrl(path: string): string {
  return `${BASE_URL}/${path.replace(/^\//, "")}`;
}

function urlEntry(
  loc: string,
  opts: {
    lastmod?: Date | string;
    changefreq?: string;
    priority?: number;
  } = {}
): string {
  const { lastmod, changefreq = "weekly", priority = 0.7 } = opts;
  const lastmodStr = lastmod
    ? new Date(lastmod).toISOString().split("T")[0]
    : new Date().toISOString().split("T")[0];

  return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmodStr}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`.trim();
}

export async function GET() {
  try {
    // Fetch all published content in parallel
    const [pages, services, caseStudies, blogPosts] = await Promise.all([
      prisma.page.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true },
      }),
      prisma.service.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true },
      }),
      prisma.caseStudy.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true },
      }),
      prisma.blogPost.findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true, publishedAt: true },
      }),
    ]);

    const entries: string[] = [];
    const usedUrls = new Set<string>();

    const addEntry = (loc: string, opts: any) => {
      if (usedUrls.has(loc)) return;
      entries.push(urlEntry(loc, opts));
      usedUrls.add(loc);
    };

    // 1. Homepage
    addEntry(BASE_URL, { changefreq: "daily", priority: 1.0 });

    // 2. Dynamic CMS pages (from Page model) - including home, about, contact etc.
    for (const page of pages) {
      const url = page.slug === "home" ? BASE_URL : buildUrl(page.slug);
      addEntry(url, { lastmod: page.updatedAt, priority: page.slug === "home" ? 1.0 : 0.8 });
    }

    // 3. Static public pages (fallbacks or non-CMS pages if any)
    const staticPages = [
      { path: "about", priority: 0.8 },
      { path: "services", priority: 0.8 },
      { path: "contact", priority: 0.8 },
      { path: "blog", priority: 0.7 },
      { path: "case-studies", priority: 0.7 },
      { path: "gallery", priority: 0.6 },
      { path: "careers", priority: 0.6 },
      { path: "associations", priority: 0.5 },
      { path: "milestones", priority: 0.5 },
      { path: "corporate-chronicles", priority: 0.5 },
    ];
    for (const { path, priority } of staticPages) {
      addEntry(buildUrl(path), { changefreq: "monthly", priority });
    }

    // 4. Services
    for (const service of services) {
      addEntry(buildUrl(`services/${service.slug}`), {
        lastmod: service.updatedAt,
        changefreq: "monthly",
        priority: 0.8,
      });
    }

    // 5. Case Studies
    for (const cs of caseStudies) {
      addEntry(buildUrl(`case-studies/${cs.slug}`), {
        lastmod: cs.updatedAt,
        changefreq: "monthly",
        priority: 0.7,
      });
    }

    // 6. Blog Posts
    for (const post of blogPosts) {
      addEntry(buildUrl(`blog/${post.slug}`), {
        lastmod: post.publishedAt ?? post.updatedAt,
        changefreq: "never",
        priority: 0.6,
      });
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
    http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
>
${entries.join("\n")}
</urlset>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        // Cache for 1 hour; edge CDNs respect this
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("[Sitemap] Generation failed:", error);
    return new NextResponse("Sitemap generation failed", { status: 500 });
  }
}
