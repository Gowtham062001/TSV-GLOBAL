import { prisma } from "@/lib/db";
import { SectionRenderer } from "@/components/public/SectionRenderer";
import { Metadata } from "next";
import { SeoData } from "@/lib/types";
import fs from "fs";
import path from "path";

export const revalidate = 0; // Disable cache to see changes immediately

export async function generateMetadata(): Promise<Metadata> {
  const page = await prisma.page.findUnique({
    where: { slug: "associations" },
  });

  if (!page || !page.isVisible || page.status !== "PUBLISHED") return {};

  const seo = page.seoData as any;
  return {
    title: seo?.metaTitle || seo?.title || `${page.title} | TSV Global Solutions`,
    description: seo?.metaDescription || seo?.description || "Explore our global network of associations and partners that empower our logistics capabilities.",
    alternates: {
      canonical: seo?.canonicalUrl || "https://tsvglobal.com/associations",
    },
    openGraph: {
      title: seo?.metaTitle || seo?.title || page.title,
      description: seo?.metaDescription || seo?.description,
      images: seo?.ogImage ? [{ url: seo.ogImage }] : [],
    },
  };
}

export default async function AssociationsPage() {
  const page = await prisma.page.findUnique({
    where: { slug: "associations" },
    include: {
      sections: {
        orderBy: { order: "asc" },
      },
    },
  });

  const seo = page?.seoData as any;

  // Load fallback data from JSON only if DB has NO sections
  let sectionsToRender: Array<{ type: string; content: Record<string, unknown> }> = [];
  
  if (page && page.sections && page.sections.length > 0) {
    sectionsToRender = page.sections
      .filter((s: any) => s.isVisible)
      .map((s: any) => ({ type: s.type, content: s.content as Record<string, unknown> }));
  } else {
    try {
      const filePath = path.join(process.cwd(), "prisma/seed/associations-sections.json");
      const seedData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      sectionsToRender = Object.keys(seedData).map(type => ({
        type,
        content: seedData[type]
      }));
    } catch (err) {
      console.error("Failed to load associations seed data:", err);
    }
  }

  if (sectionsToRender.length === 0) {
    return <div>Page not found. Please run seed.</div>;
  }

  return (
    <>
      {seo?.faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: seo.faqSchema }}
        />
      )}
      {sectionsToRender.map((section, idx) => {
        return (
          <SectionRenderer 
            key={idx} 
            type={section.type} 
            content={section.content} 
          />
        );
      })}
    </>
  );
}
