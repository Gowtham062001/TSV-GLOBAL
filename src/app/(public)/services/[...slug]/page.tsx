import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { SeoData } from "@/lib/types";
import ServiceOverview from "@/components/public/services/ServiceOverview";
import OurAdvantage from "@/components/public/services/OurAdvantage";
import HandlingProcess from "@/components/public/services/HandlingProcess";
import PhotoGallery from "@/components/public/services/PhotoGallery";
import ServiceFAQ from "@/components/public/services/ServiceFAQ";
import ServiceCTA from "@/components/public/services/ServiceCTA";
import Link from "next/link";
import { safeFetch } from "@/lib/safe-fetch";
import { decodeHTML } from "@/lib/utils";
import { SectionRenderer } from "@/components/public/SectionRenderer";

export const revalidate = 0;

export async function generateMetadata({ params }: { params: { slug: string[] } }): Promise<Metadata> {
  let slug = Array.isArray(params.slug) ? params.slug.join("/") : params.slug;
  slug = slug.toLowerCase();
  if (slug === "custom-clearence") slug = "custom-clearance";

  const service = await safeFetch(
    () => prisma.service.findFirst({
      where: { slug },
      include: { parent: true }
    }),
    null,
    "service_slug_metadata"
  );

  if (!service || !service.isVisible || service.status !== "PUBLISHED") return {};
  if (service.parent && (!service.parent.isVisible || service.parent.status !== "PUBLISHED")) return {};

  const seo = service.seoData as any;
  return {
    title: seo?.metaTitle || seo?.title || `${service.title} | TSV Global Solutions`,
    description: seo?.metaDescription || seo?.description || service.description?.substring(0, 160),
    alternates: {
      canonical: seo?.canonicalUrl || `https://tsvglobal.com/services/${slug}`,
    },
    openGraph: {
      title: seo?.metaTitle || seo?.title || service.title,
      description: seo?.metaDescription || seo?.description,
      images: seo?.ogImage ? [{ url: seo.ogImage }] : (service.image ? [{ url: service.image }] : []),
    },
  };
}

export default async function ServicePage({ params }: { params: { slug: string[] } }) {
  let slug = Array.isArray(params.slug) ? params.slug.join("/") : params.slug;
  slug = slug.toLowerCase();
  if (slug === "custom-clearence") slug = "custom-clearance";

  const service = await safeFetch(
    () => prisma.service.findFirst({
      where: { slug },
      include: {
        parent: true,
        sections: { 
          where: { isVisible: true },
          orderBy: { order: "asc" } 
        },
      },
    }),
    null,
    "service_slug_page"
  );

  if (!service || !service.isVisible || service.status !== "PUBLISHED") notFound();
  if (service.parent && (!service.parent.isVisible || service.parent.status !== "PUBLISHED")) {
    notFound();
  }

  const seo = service.seoData as any;

  // Helper to get section data ONLY if it is visible
  const getSection = (type: string) =>
    service.sections.find((s) => s.type === type && s.isVisible);

  return (
    <main className="bg-white">
      {/* FAQ Schema */}
      {seo?.faqSchema && (
        <script
          suppressHydrationWarning
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: decodeHTML(seo.faqSchema) }}
        />
      )}

      {/* Dynamic Header & Breadcrumb Sections */}
      {service.sections?.filter((s: any) => s.type === "page_header" || s.type === "header" || s.type === "breadcrumb" || s.type === "breadcrumb_strip").map((section: any) => (
        <SectionRenderer 
          key={section.id} 
          type={section.type} 
          content={section.content as Record<string, unknown>} 
        />
      ))}

      {/* Exact 6 Section Order */}
      {/* Section 01 | Service Overview */}
      {getSection("service_overview") && (
        <ServiceOverview data={getSection("service_overview")!.content as any} />
      )}

      {/* Section 02 | Our Advantage */}
      {getSection("our_advantage") && (
        <OurAdvantage data={getSection("our_advantage")!.content as any} />
      )}

      {/* Section 03 | Step By Step */}
      {getSection("handling_process") && (
        <HandlingProcess data={getSection("handling_process")!.content as any} />
      )}

      {/* Section 04 | Our Work */}
      {getSection("photo_gallery") && (
        <PhotoGallery data={getSection("photo_gallery")!.content as any} />
      )}

      {/* Section 05 | Have Questions? */}
      {getSection("faq") && (
        <ServiceFAQ data={getSection("faq")!.content as any} />
      )}

      {/* Section 06 | CTA */}
      {getSection("cta") && (
        <ServiceCTA data={getSection("cta")!.content as any} />
      )}

      {/* Dynamic Sections AFTER Main Content */}
      {service.sections?.filter((s: any) => 
        !["page_header", "header", "breadcrumb", "breadcrumb_strip", "service_overview", "our_advantage", "handling_process", "photo_gallery", "faq", "cta"].includes(s.type)
      ).map((section: any) => (
        <SectionRenderer 
          key={section.id} 
          type={section.type} 
          content={section.content as Record<string, unknown>} 
        />
      ))}
    </main>
  );
}
