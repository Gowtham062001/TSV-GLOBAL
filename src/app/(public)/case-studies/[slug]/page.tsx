import { prisma } from "@/lib/db";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { SeoData } from "@/lib/types";
import Link from "next/link";
import CaseStudyGallery from "@/components/public/CaseStudyGallery";
import CaseStudyMetrics from "@/components/public/CaseStudyMetrics";
import { safeFetch } from "@/lib/safe-fetch";

export const revalidate = 0; // Set to 0 for real-time updates while we finish the site

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const cs = await safeFetch(
    () => prisma.caseStudy.findUnique({
      where: { slug: params.slug },
    }),
    null,
    "case-study_detail_metadata"
  );

  if (!cs || cs.isVisible === false) return {};

  const seo = cs.seoData as any;
  return {
    title: seo?.metaTitle || seo?.title || `${cs.title} | Case Study | TSV Global`,
    description: seo?.metaDescription || seo?.description || cs.challenge?.substring(0, 160),
    alternates: {
      canonical: seo?.canonicalUrl || `https://tsvglobal.com/case-studies/${cs.slug}`,
    },
    openGraph: {
      title: seo?.metaTitle || seo?.title || cs.title,
      description: seo?.metaDescription || seo?.description,
      images: seo?.ogImage ? [{ url: seo.ogImage }] : (cs.images?.[0] ? [{ url: cs.images[0] }] : []),
    },
  };
}

export default async function CaseStudyDetailPage({ params }: { params: { slug: string } }) {
  const cs = await safeFetch(
    () => prisma.caseStudy.findUnique({
      where: { slug: params.slug },
    }),
    null,
    "case-study_detail"
  );

  if (!cs || cs.isVisible === false) {
    notFound();
  }

  const seo = cs.seoData as any;
  const metrics = Array.isArray(cs.metrics)
    ? (cs.metrics as any[]).map(m => ({ label: m.label || '', value: m.value || '' }))
    : Object.entries(cs.metrics as any || {}).map(([label, value]) => ({ label, value: String(value) }));
  const images = Array.isArray(cs.images) ? cs.images : [];

  return (
    <main className="bg-white">
      {/* FAQ Schema */}
      {seo?.faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: seo.faqSchema }}
        />
      )}
      {/* Page Header */}
      <section 
        className="page-header relative py-24 bg-[#1a1a2e] text-white overflow-hidden"
        style={{
          ...(seo?.bgImage ? {
            backgroundImage: `linear-gradient(rgba(14, 14, 32, 0.7), rgba(14, 14, 32, 0.85)), url(${seo.bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          } : {}),
          color: seo?.textColor || undefined
        }}
      >
        <div className="container relative z-10">
          <div className="max-w-4xl">
            <h4 
              style={seo?.subTextColor ? { color: seo.subTextColor } : undefined} 
              className="text-[#c1000a] font-bold uppercase tracking-[3px] text-sm mb-5"
            >
              {cs.tags || "Case Study"}
            </h4>
            <h1 
              style={seo?.textColor ? { color: seo.textColor } : undefined} 
              className="text-4xl md:text-6xl font-black leading-tight tracking-tight text-white"
            >
              {cs.title}
            </h1>
          </div>
        </div>
      </section>

      {/* Breadcrumb Strip - Legacy Style */}
      <div className="bg-[#1a1a2e] py-4 border-t border-white/5">
        <div className="container">
          <div className="flex items-center gap-2 text-[14px]">
            <Link href="/" className="text-white/70 font-semibold hover:text-white transition-colors">Home</Link>
            <i className="fa-regular fa-chevron-right text-white/30 text-[10px]"></i>
            <Link href="/case-studies" className="text-white/70 font-semibold hover:text-white transition-colors">Case Studies</Link>
            <i className="fa-regular fa-chevron-right text-white/30 text-[10px]"></i>
            <span className="text-[#c1000a] font-bold truncate">{cs.title}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <section className="py-24">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            {/* Left Content: The Story */}
            <div className="lg:col-span-8">
              <span className="inline-block bg-[#c1000a] text-white text-[12px] font-extrabold px-5 py-2 rounded-full mb-6 uppercase tracking-wider">
                {cs.tags || "ODC Cargo"}
              </span>
              <h2 className="text-3xl font-extrabold text-[#1a1a2e] mb-8 leading-[1.35] tracking-tight">{cs.title}</h2>
              
              <div className="flex flex-wrap gap-x-10 gap-y-4 mb-12">
                {cs.industry && (
                  <div className="flex items-center gap-2.5 text-[14px] text-[#444]">
                    <i className="fa-regular fa-industry text-[#c1000a]"></i>
                    <span className="font-bold text-[#1a1a2e]">Industry:</span> {cs.industry}
                  </div>
                )}
                {cs.mode && (
                  <div className="flex items-center gap-2.5 text-[14px] text-[#444]">
                    <i className="fa-regular fa-truck-moving text-[#c1000a]"></i>
                    <span className="font-bold text-[#1a1a2e]">Mode:</span> {cs.mode}
                  </div>
                )}
                {cs.route && (
                  <div className="flex items-center gap-2.5 text-[14px] text-[#444]">
                    <i className="fa-regular fa-location-dot text-[#c1000a]"></i>
                    <span className="font-bold text-[#1a1a2e]">Route:</span> {cs.route}
                  </div>
                )}
              </div>

              {/* The Problem-Solution Trinity */}
              <div className="space-y-12">
                {/* Challenge */}
                <div className="wow fadeInUp">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 bg-[#c1000a] rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-red-500/20">
                      <i className="fa-solid fa-triangle-exclamation text-white text-lg"></i>
                    </div>
                    <h3 className="text-2xl font-extrabold text-[#1a1a2e]">The Challenge</h3>
                  </div>
                  <p className="text-[#555] text-[16px] leading-[1.85] pl-16">
                    {cs.challenge}
                  </p>
                </div>

                {/* Solution */}
                <div className="wow fadeInUp" data-wow-delay="100ms">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 bg-[#1a1a2e] rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-navy-500/20">
                      <i className="fa-solid fa-lightbulb text-white text-lg"></i>
                    </div>
                    <h3 className="text-2xl font-extrabold text-[#1a1a2e]">Our Solution</h3>
                  </div>
                  <p className="text-[#555] text-[16px] leading-[1.85] pl-16">
                    {cs.solution}
                  </p>
                </div>

                {/* Result */}
                <div className="wow fadeInUp" data-wow-delay="200ms">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 bg-[#c1000a] rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-red-500/20">
                      <i className="fa-solid fa-circle-check text-white text-lg"></i>
                    </div>
                    <h3 className="text-2xl font-extrabold text-[#1a1a2e]">The Result</h3>
                  </div>
                  <p className="text-[#555] text-[16px] leading-[1.85] pl-16">
                    {cs.result}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Sidebar: Sticky Key Metrics */}
            <div className="lg:col-span-4 lg:sticky lg:top-24">
              <CaseStudyMetrics metrics={metrics} />
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Swiper Gallery */}
      {images.length > 0 && (
        <CaseStudyGallery images={images} />
      )}


    </main>
  );
}
