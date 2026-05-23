import { prisma } from "@/lib/db";
import { SectionRenderer } from "@/components/public/SectionRenderer";
import { Metadata } from "next";
import { SeoData } from "@/lib/types";
import { notFound } from "next/navigation";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await prisma.page.findUnique({
    where: { slug: "corporate-chronicles" },
  });

  if (!page || !page.isVisible || page.status !== "PUBLISHED") return {};

  const seo = page.seoData as any;
  return {
    title: seo?.metaTitle || seo?.title || `${page.title} | TSV Global Solutions`,
    description: seo?.metaDescription || seo?.description || "Explore our corporate journey and the milestones that define our excellence in global logistics.",
    alternates: {
      canonical: seo?.canonicalUrl || "https://tsvglobal.com/corporate-chronicles",
    },
    openGraph: {
      title: seo?.metaTitle || seo?.title || page.title,
      description: seo?.metaDescription || seo?.description,
      images: seo?.ogImage ? [{ url: seo.ogImage }] : [],
    },
  };
}

export default async function CorporateChroniclesPage() {
  const page = await prisma.page.findUnique({
    where: { slug: "corporate-chronicles" },
    include: {
      sections: {
        where: { isVisible: true },
        orderBy: { order: "asc" },
      },
    },
  });

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
