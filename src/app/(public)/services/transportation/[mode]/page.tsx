import { prisma } from "@/lib/db";
import { SectionRenderer } from "@/components/public/SectionRenderer";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const revalidate = 3600;

const TRANSPORT_MODES: Record<string, { title: string; description: string; slug: string }> = {
  "road-freight": {
    slug: "road-freight",
    title: "Road Freight",
    description: "Pan-India surface transport solutions for all cargo types, from FTL to LTL shipments.",
  },
  "sea-freight": {
    slug: "sea-freight",
    title: "Sea Freight",
    description: "FCL and LCL ocean freight solutions connecting India to 140+ global ports worldwide.",
  },
  "air-freight": {
    slug: "air-freight",
    title: "Air Freight",
    description: "Express and economical air cargo solutions for time-sensitive shipments globally.",
  },
};

export async function generateStaticParams() {
  return Object.keys(TRANSPORT_MODES).map((mode) => ({ mode }));
}

export async function generateMetadata({ params }: { params: { mode: string } }): Promise<Metadata> {
  const info = TRANSPORT_MODES[params.mode];
  if (!info) return {};

  const page = await prisma.page.findUnique({
    where: { slug: `services/transportation/${params.mode}` },
  });

  const seo = page?.seoData as any;

  return {
    title: seo?.metaTitle || seo?.title || `${info.title} | TSV Global Solutions`,
    description: seo?.metaDescription || seo?.description || info.description,
    alternates: {
      canonical: seo?.canonicalUrl || `https://tsvglobal.com/services/transportation/${params.mode}`,
    },
    openGraph: {
      title: seo?.metaTitle || seo?.title || info.title,
      description: seo?.metaDescription || seo?.description || info.description,
      images: seo?.ogImage ? [{ url: seo.ogImage }] : [],
    },
  };
}

export default async function TransportationModePage({ params }: { params: { mode: string } }) {
  const info = TRANSPORT_MODES[params.mode];
  if (!info) notFound();

  const page = await prisma.page.findUnique({
    where: { slug: `services/transportation/${params.mode}` },
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
        {page.sections.map((section) => (
          <SectionRenderer key={section.id} type={section.type} content={section.content as Record<string, unknown>} />
        ))}
      </>
    );
  }

  // Fallback with inline sections
  return (
    <>
      <SectionRenderer type="page_header" content={{ title: info.title, breadcrumbs: [{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: "Transportation", href: "/services/transportation" }, { label: info.title }] }} />
      <SectionRenderer type="simple_content" content={{
        heading: info.title,
        content: `<p>${info.description}</p><p>TSV Global Solutions offers comprehensive ${info.title.toLowerCase()} services backed by 11+ years of industry expertise. Our dedicated team ensures your cargo is handled with the utmost care and delivered on time, every time.</p>`,
        sidebar: true,
      }} />
      <SectionRenderer type="service_gallery" content={{ heading: "Our Operations" }} />
      <SectionRenderer type="cta_section" content={{ heading: "Ready to Ship?", subHeading: "Book Your Cargo", btnText: "Get A Free Quote", btnUrl: "/contact" }} />
    </>
  );
}
