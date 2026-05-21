import { prisma } from "@/lib/db";
import { SectionRenderer } from "@/components/public/SectionRenderer";
import { Metadata } from "next";
import { SeoData } from "@/lib/types";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await prisma.page.findUnique({
    where: { slug: "our-milestones" },
  });

  if (!page || !page.isVisible || page.status !== "PUBLISHED") return {};

  const seo = page.seoData as any;
  return {
    title: seo?.metaTitle || seo?.title || `${page.title} | TSV Global Solutions`,
    description: seo?.metaDescription || seo?.description || "Trace our journey of growth and excellence in the global logistics industry.",
    alternates: {
      canonical: seo?.canonicalUrl || "https://tsvglobal.com/milestones",
    },
    openGraph: {
      title: seo?.metaTitle || seo?.title || page.title,
      description: seo?.metaDescription || seo?.description,
      images: seo?.ogImage ? [{ url: seo.ogImage }] : [],
    },
  };
}

export default async function OurMilestonesPage() {
  const page = await prisma.page.findUnique({
    where: { slug: "our-milestones" },
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
