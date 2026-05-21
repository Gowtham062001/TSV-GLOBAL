/*
 * PAGE: services/project-management/[vertical] 
 * → batteries | solar-panel | oil-gas | food-products | chemicals
 * ══════════════════════════════════════════════════════════
 * Section 01 | Page Header          → page_header
 * Section 02 | Service Detail Body  → simple_content
 * Section 03 | Service Gallery      → service_gallery
 * Section 04 | CTA Section          → cta_section
 * ══════════════════════════════════════════════════════════
 * HTML SECTIONS : 4  |  OUTPUT SECTIONS: 4  ✅ MATCH
 */
import { prisma } from "@/lib/db";
import { SectionRenderer } from "@/components/public/SectionRenderer";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const revalidate = 3600;

const VERTICALS: Record<string, { title: string; description: string }> = {
  "batteries": { title: "Batteries & Energy Storage", description: "Specialized handling and transport of batteries and energy storage systems complying with IATA/IMO DG regulations." },
  "solar-panel": { title: "Solar Panel Logistics", description: "Careful handling and transportation of solar panels and renewable energy equipment from manufacturing to installation sites." },
  "oil-gas": { title: "Oil & Gas Logistics", description: "End-to-end supply chain solutions for the oil & gas sector, including oversized equipment and hazmat cargo." },
  "food-products": { title: "Food Products Logistics", description: "Temperature-controlled and compliant logistics solutions for food products, ensuring quality and freshness." },
  "chemicals": { title: "Chemical Logistics", description: "Safe and compliant transportation of chemicals and hazardous materials following all regulatory requirements." },
};

export async function generateStaticParams() {
  return Object.keys(VERTICALS).map((v) => ({ vertical: v }));
}

export async function generateMetadata({ params }: { params: { vertical: string } }): Promise<Metadata> {
  const info = VERTICALS[params.vertical];
  if (!info) return {};

  const page = await prisma.page.findUnique({
    where: { slug: `services/project-management/${params.vertical}` },
  });

  const seo = page?.seoData as any;

  return {
    title: seo?.metaTitle || seo?.title || `${info.title} | TSV Global Solutions`,
    description: seo?.metaDescription || seo?.description || info.description,
    alternates: {
      canonical: seo?.canonicalUrl || `https://tsvglobal.com/services/project-management/${params.vertical}`,
    },
    openGraph: {
      title: seo?.metaTitle || seo?.title || info.title,
      description: seo?.metaDescription || seo?.description || info.description,
      images: seo?.ogImage ? [{ url: seo.ogImage }] : [],
    },
  };
}

export default async function ProjectManagementVerticalPage({ params }: { params: { vertical: string } }) {
  const info = VERTICALS[params.vertical];
  if (!info) notFound();

  const page = await prisma.page.findUnique({
    where: { slug: `services/project-management/${params.vertical}` },
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
      <SectionRenderer type="page_header" content={{ title: info.title, breadcrumbs: [{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: "Project Management", href: "/services/project-management" }, { label: info.title }] }} />
      <SectionRenderer type="simple_content" content={{ heading: info.title, content: `<p>${info.description}</p><p>TSV Global Solutions brings specialized expertise and compliance knowledge to deliver safe, efficient logistics solutions tailored to industry-specific requirements.</p>`, sidebar: true }} />
      <SectionRenderer type="service_gallery" content={{ heading: "Our Capabilities" }} />
      <SectionRenderer type="cta_section" content={{ heading: "Need Specialized Logistics?", subHeading: "Get Expert Advice", btnText: "Contact Our Team", btnUrl: "/contact" }} />
    </>
  );
}
