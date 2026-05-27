import { prisma } from "@/lib/db";
import { SectionRenderer } from "@/components/public/SectionRenderer";
import { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await prisma.page.findUnique({
    where: { slug: "services/transportation" },
  });

  if (!page) return {
    title: "Transportation Services | TSV Global Solutions",
    description: "Comprehensive road, sea and air freight transportation solutions across India and globally.",
  };

  const seo = page.seoData as any;
  return {
    title: seo?.metaTitle || seo?.title || "Transportation Services | TSV Global Solutions",
    description: seo?.metaDescription || seo?.description || "Comprehensive road, sea and air freight transportation solutions across India and globally.",
    alternates: {
      canonical: seo?.canonicalUrl || "https://tsvglobal.com/services/transportation",
    },
    openGraph: {
      title: seo?.metaTitle || seo?.title || page.title,
      description: seo?.metaDescription || seo?.description,
      images: seo?.ogImage ? [{ url: seo.ogImage }] : [],
    },
  };
}

export default async function TransportationPage() {
  const page = await prisma.page.findUnique({
    where: { slug: "services/transportation" },
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
      <SectionRenderer type="page_header" content={{ title: "Transportation", breadcrumbs: [{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: "Transportation" }] }} />
      <SectionRenderer type="services_grid" content={{
        subHeading: "Transportation Solutions",
        heading: "Global Transport <span class='hl'>Services</span>",
        description: "Comprehensive multimodal transportation solutions connecting your cargo to the world.",
        items: [
          { title: "Road Freight", icon: "logis logis-truck-2", image: "/assets/img/road-freight-2.jpg", description: "Pan-India surface transport for all cargo types.", link: "/services/transportation/road-freight" },
          { title: "Sea Freight", icon: "logis logis-cruise", image: "/assets/img/aerial-view-container-cargo-ship-sea.jpg", description: "FCL & LCL to 140+ global ports.", link: "/services/transportation/sea-freight" },
          { title: "Air Freight", icon: "logis logis-airplane-flying", image: "/assets/img/air.jpg", description: "Express air cargo for time-sensitive shipments.", link: "/services/transportation/air-freight" },
        ],
      }} />
    </>
  );
}
