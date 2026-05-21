/**
 * SECTION INVENTORY
 * 1. Hero Slider
 * 2. About Us
 * 3. Services Grid
 * 4. Case Studies
 * 5. Counters
 * 6. Testimonials
 * 7. CTA
 * 8. Marquee
 * 9. Process
 * 10. Features
 * 11. Partners Grid
 */

import { prisma } from "@/lib/db";
import { SectionRenderer } from "@/components/public/SectionRenderer";
import { Metadata } from "next";
import { SeoData } from "@/lib/types";
import { safeFetch } from "@/lib/safe-fetch";

export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata(): Promise<Metadata> {
  const page = await safeFetch(
    () => prisma.page.findUnique({
      where: { slug: "home" },
    }),
    null,
    "home_page_metadata"
  );

  if (!page) return {};

  const seo = page.seoData as any;
  return {
    title: seo?.metaTitle || seo?.title || "TSV Global Solutions | Expert Logistics & Supply Chain",
    description: seo?.metaDescription || seo?.description || "Expert logistics solutions by TSV Global. Pan-India and global reach.",
    alternates: {
      canonical: seo?.canonicalUrl || "https://tsvglobal.com",
    },
    openGraph: {
      title: seo?.metaTitle || seo?.title || page.title,
      description: seo?.metaDescription || seo?.description,
      images: seo?.ogImage ? [{ url: seo.ogImage }] : [],
    },
  };
}

export default async function Home() {
  // Fetch home page with sections
  const page = await safeFetch(
    () => prisma.page.findUnique({
      where: { slug: "home" },
      include: {
        sections: {
          where: { isVisible: true },
          orderBy: { order: "asc" },
        },
      },
    }),
    null,
    "home_page"
  );

  if (!page) {
    return <div>Page not found. Please run seed.</div>;
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
