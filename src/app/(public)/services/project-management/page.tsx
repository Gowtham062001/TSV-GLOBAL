/*
 * PAGE: services/project-management → Project Management Overview
 * ══════════════════════════════════════════════════════════
 * Section 01 | Page Header  → page_header
 * Section 02 | Services Grid → services_grid (sub-services)
 * Section 03 | CTA          → cta_section
 * ══════════════════════════════════════════════════════════
 * HTML SECTIONS : 3  |  OUTPUT SECTIONS: 3  ✅ MATCH
 */
import { prisma } from "@/lib/db";
import { SectionRenderer } from "@/components/public/SectionRenderer";
import { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await prisma.page.findUnique({
    where: { slug: "services/project-management" },
  });

  if (!page) return {
    title: "Project Management | TSV Global Solutions",
    description: "Specialized project management logistics for batteries, solar panels, oil & gas, food products and chemicals.",
  };

  const seo = page.seoData as any;
  return {
    title: seo?.metaTitle || seo?.title || "Project Management | TSV Global Solutions",
    description: seo?.metaDescription || seo?.description || "Specialized project management logistics for batteries, solar panels, oil & gas, food products and chemicals.",
    alternates: {
      canonical: seo?.canonicalUrl || "https://tsvglobal.com/services/project-management",
    },
    openGraph: {
      title: seo?.metaTitle || seo?.title || page.title,
      description: seo?.metaDescription || seo?.description,
      images: seo?.ogImage ? [{ url: seo.ogImage }] : [],
    },
  };
}

export default async function ProjectManagementPage() {
  const page = await prisma.page.findUnique({
    where: { slug: "services/project-management" },
    include: { sections: { where: { isVisible: true }, orderBy: { order: "asc" } } },
  });

  const seo = page?.seoData as any;

  if (page?.sections?.length) {
    return (
      <>
        {seo?.faqSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: seo.faqSchema }}
          />
        )}
        {page.sections.map((s) => (
          <SectionRenderer key={s.id} type={s.type} content={s.content as Record<string, unknown>} />
        ))}
      </>
    );
  }

  return (
    <>
      <SectionRenderer type="page_header" content={{ title: "Project Management", breadcrumbs: [{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: "Project Management" }] }} />
      <SectionRenderer type="services_grid" content={{
        subHeading: "Industry Verticals",
        heading: "Specialized <span class='hl'>Project Cargo</span> Solutions",
        description: "Tailored logistics solutions designed for high-value, sensitive, and industry-specific cargo across multiple sectors.",
        items: [
          { title: "Batteries & Energy Storage", icon: "logis logis-loader", image: "/assets/img/aerial-view-container-cargo-ship-sea.jpg", description: "DG-compliant battery and energy system transport.", link: "/services/project-management/batteries" },
          { title: "Solar Panel Logistics", icon: "logis logis-worldwide", image: "/assets/img/banner/banner-3.jpg", description: "Careful handling of solar PV panels to project sites.", link: "/services/project-management/solar-panel" },
          { title: "Oil & Gas", icon: "logis logis-map-1", image: "/assets/img/aerial-view-cargo-ship-cargo-container-harbor.webp", description: "End-to-end supply chain for O&G sector equipment.", link: "/services/project-management/oil-gas" },
          { title: "Food Products", icon: "logis logis-truck-3", image: "/assets/img/road-freight-2.jpg", description: "Temperature-controlled food logistics solutions.", link: "/services/project-management/food-products" },
          { title: "Chemicals", icon: "logis logis-cruise", image: "/assets/img/air.jpg", description: "Hazmat-compliant chemical cargo transportation.", link: "/services/project-management/chemicals" },
        ],
      }} />
      <SectionRenderer type="cta_section" content={{ heading: "Have A Complex Project?", subHeading: "Talk To Our Experts", btnText: "Request A Consultation", btnUrl: "/contact" }} />
    </>
  );
}
