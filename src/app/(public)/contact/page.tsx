/**
 * SECTION INVENTORY
 * 1. Page Header
 * 2. Contact Info
 * 3. Contact Form
 * 4. Google Map
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
      where: { slug: "contact" },
    }),
    null,
    "contact_page_metadata"
  );

  if (!page || !page.isVisible || page.status !== "PUBLISHED") return {};

  const seo = page.seoData as any;
  return {
    title: seo?.metaTitle || seo?.title || `${page.title} | TSV Global Solutions`,
    description: seo?.metaDescription || seo?.description || "Get in touch with TSV Global Solutions for expert logistics and supply chain advice.",
    alternates: {
      canonical: seo?.canonicalUrl || "https://tsvglobal.com/contact",
    },
    openGraph: {
      title: seo?.metaTitle || seo?.title || page.title,
      description: seo?.metaDescription || seo?.description,
      images: seo?.ogImage ? [{ url: seo.ogImage }] : [],
    },
  };
}

export default async function ContactPage() {
  const page = await safeFetch(
    () => prisma.page.findUnique({
      where: { slug: "contact" },
      include: {
        sections: {
          where: { isVisible: true },
          orderBy: { order: "asc" },
        },
      },
    }),
    null,
    "contact_page"
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
