/**
 * SECTION INVENTORY
 * 1. Page Header
 * 2. Who We Are
 * 3. Counters
 * 4. Vision Mission
 * 5. Core Values
 * 6. Advantage Promo
 * 7. CTA
 * 8. Journey Cards
 */

import { prisma } from "@/lib/db";
import { SectionRenderer } from "@/components/public/SectionRenderer";
import { Metadata } from "next";
import { SeoData } from "@/lib/types";
import { safeFetch } from "@/lib/safe-fetch";
import { notFound } from "next/navigation";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await safeFetch(
    () => prisma.page.findUnique({
      where: { slug: "about" },
    }),
    null,
    "about_page_metadata"
  );

  if (!page || !page.isVisible || page.status !== "PUBLISHED") return {};

  const seo = page.seoData as any;
  return {
    title: seo?.metaTitle || seo?.title || `${page.title} | TSV Global Solutions`,
    description: seo?.metaDescription || seo?.description || "Learn about TSV Global Solutions and our commitment to excellence in global logistics.",
    alternates: {
      canonical: seo?.canonicalUrl || "https://tsvglobal.com/about",
    },
    openGraph: {
      title: seo?.metaTitle || seo?.title || page.title,
      description: seo?.metaDescription || seo?.description,
      images: seo?.ogImage ? [{ url: seo.ogImage }] : [],
    },
  };
}

export default async function AboutPage() {
  const page = await safeFetch(
    () => prisma.page.findUnique({
      where: { slug: "about" },
      include: {
        sections: {
          where: { isVisible: true },
          orderBy: { order: "asc" },
        },
      },
    }),
    null,
    "about_page"
  );

  if (!page || !page.isVisible || page.status !== "PUBLISHED") {
    notFound();
  }

  const seo = page.seoData as any;

  return (
    <>
      {seo?.faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: seo.faqSchema }}
        />
      )}
      {page.sections.map((section) => (
        <SectionRenderer 
          key={section.id} 
          type={section.type} 
          content={section.content as Record<string, unknown>} 
        />
      ))}
    </>
  );
}
