import { prisma } from "@/lib/db";
import { SectionRenderer } from "@/components/public/SectionRenderer";
import { Metadata } from "next";
import { SeoData } from "@/lib/types";
import { notFound } from "next/navigation";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await prisma.page.findUnique({
    where: { slug: "careers" },
  });

  if (!page || !page.isVisible || page.status !== "PUBLISHED") return {};

  const seo = page.seoData as any;
  return {
    title: seo?.metaTitle || seo?.title || `${page.title} | TSV Global Solutions`,
    description: seo?.metaDescription || seo?.description || "Join our team of experts and build your career in the dynamic world of global logistics.",
    alternates: {
      canonical: seo?.canonicalUrl || "https://tsvglobal.com/careers",
    },
    openGraph: {
      title: seo?.metaTitle || seo?.title || page.title,
      description: seo?.metaDescription || seo?.description,
      images: seo?.ogImage ? [{ url: seo.ogImage }] : [],
    },
  };
}

export default async function CareersPage() {
  const page = await prisma.page.findUnique({
    where: { slug: "careers" },
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

  // Fetch live jobs from the database (with safety check for the model)
  const liveJobs = (prisma as any).job ? await (prisma as any).job.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
  }) : [];

  return (
    <>
      {seo?.faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: seo.faqSchema }}
        />
      )}
      {page.sections.map((section) => {
        let content = section.content as Record<string, unknown>;
        
        // If this is the job openings section, inject live jobs
        if (section.type === "job_openings" && liveJobs.length > 0) {
          content = {
            ...content,
            jobs: liveJobs.map((job: any) => ({
              id: job.id,
              title: job.title,
              type: job.type,
              location: job.location,
              experience: job.experience,
              description: job.description,
              link: job.link,
              icon: job.icon,
              isExpired: job.isExpired,
            }))
          };
        }

        return (
          <SectionRenderer 
            key={section.id} 
            type={section.type} 
            content={content} 
          />
        );
      })}
    </>
  );
}
