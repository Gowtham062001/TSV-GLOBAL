/**
 * SECTION INVENTORY
 * 1. Page Header
 * 2. Service List Grid
 * 3. CTA
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
      where: { slug: "services" },
    }),
    null,
    "services_page_metadata"
  );

  if (!page || !page.isVisible || page.status !== "PUBLISHED") return {};

  const seo = page.seoData as any;
  return {
    title: seo?.metaTitle || seo?.title || `${page.title} | TSV Global Solutions`,
    description: seo?.metaDescription || seo?.description || "Explore our comprehensive range of global logistics and supply chain services.",
    alternates: {
      canonical: seo?.canonicalUrl || "https://tsvglobal.com/services",
    },
    openGraph: {
      title: seo?.metaTitle || seo?.title || page.title,
      description: seo?.metaDescription || seo?.description,
      images: seo?.ogImage ? [{ url: seo.ogImage }] : [],
    },
  };
}

export default async function ServicesPage() {
  const page = await safeFetch(
    () => prisma.page.findUnique({
      where: { slug: "services" },
      include: {
        sections: {
          where: { isVisible: true },
          orderBy: { order: "asc" },
        },
      },
    }),
    null,
    "services_page"
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
