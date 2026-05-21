import { prisma } from "@/lib/db";
import { SectionRenderer } from "@/components/public/SectionRenderer";
import { Metadata } from "next";
import { SeoData } from "@/lib/types";
import { safeFetch } from "@/lib/safe-fetch";
import { notFound } from "next/navigation";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await safeFetch<any>(
      () => prisma.page.findUnique({
        where: { slug: "case-studies" },
      }),
      null,
      "case-studies_page_metadata"
    );

    if (!page || !page.isVisible || page.status !== "PUBLISHED") return {};

    const seo = page.seoData as any;
    return {
      title: seo?.metaTitle || seo?.title || `${page.title} | TSV Global Solutions`,
      description: seo?.metaDescription || seo?.description || "Explore our project portfolio and success stories in handling complex global logistics challenges.",
      alternates: {
        canonical: seo?.canonicalUrl || "https://tsvglobal.com/case-studies",
      },
      openGraph: {
        title: seo?.metaTitle || seo?.title || page.title,
        description: seo?.metaDescription || seo?.description,
        images: seo?.ogImage ? [{ url: seo.ogImage }] : [],
      },
    };
  } catch (error) {
    console.error("Prerender Metadata timeout on /case-studies:", error);
    return {
      title: "Case Studies | TSV Global Solutions",
      description: "Explore our project portfolio and success stories in handling complex global logistics challenges.",
    };
  }
}

export default async function CaseStudiesPage() {
  try {
    const page = await safeFetch<any>(
      () => prisma.page.findUnique({
        where: { slug: "case-studies" },
        include: {
          sections: {
            where: { isVisible: true },
            orderBy: { order: "asc" },
          },
        },
      }),
      null,
      "case-studies_page"
    );

    if (!page) {
      return (
        <div className="py-20 text-center text-gray-500">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Case Studies</h2>
          <p className="text-sm">Read our success stories and logistics operations worldwide.</p>
        </div>
      );
    }

    const seo = page.seoData as any;

    // Fetch real case studies from database
    const realCaseStudies = await safeFetch<any[]>(
      () => prisma.caseStudy.findMany({
        where: { status: "PUBLISHED", isVisible: true },
        orderBy: { createdAt: "desc" },
      }),
      [],
      "case-studies_list"
    );

    return (
      <>
        {seo?.faqSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: seo.faqSchema }}
          />
        )}
        {page.sections.map((section: any) => {
          // If this is the grid section, inject the real database items
          const sectionContent = { ...(section.content as Record<string, unknown>) };
          if (section.type === "case_study_grid" && realCaseStudies.length > 0) {
            sectionContent.items = realCaseStudies.map(cs => ({
              title: cs.title,
              slug: cs.slug,
              tags: cs.tags,
              description: cs.challenge || cs.solution, // Fallback for description
              images: cs.images,
              metrics: Array.isArray(cs.metrics)
                ? (cs.metrics as any[]).map(m => ({ label: m.label || '', value: m.value || '' }))
                : Object.entries(cs.metrics as any || {}).map(([label, value]) => ({ label, value: String(value) }))
            }));
          }

          return (
            <SectionRenderer
              key={section.id}
              type={section.type}
              content={sectionContent}
            />
          );
        })}
      </>
    );
  } catch (error) {
    console.error("Prerender Page timeout on /case-studies:", error);
    return (
      <div className="py-20 text-center text-gray-500">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Case Studies</h2>
        <p className="text-sm">Read our success stories and logistics operations worldwide.</p>
      </div>
    );
  }
}