/*
 * PAGE: refund-policy.html → app/(public)/return-refund-policy/page.tsx
 * ══════════════════════════════════════════════════════════
 * Section 01 | Page Header     → page_header
 * Section 02 | Policy Content  → simple_content
 * ══════════════════════════════════════════════════════════
 * HTML SECTIONS : 2  |  OUTPUT SECTIONS: 2  ✅ MATCH
 */
import { prisma } from "@/lib/db";
import { SectionRenderer } from "@/components/public/SectionRenderer";
import { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await prisma.page.findUnique({
    where: { slug: "return-refund-policy" },
  });

  if (!page) return {
    title: "Return & Refund Policy | TSV Global Solutions",
    description: "Understand TSV Global Solutions' return and refund policy for freight and logistics services.",
  };

  const seo = page.seoData as any;
  return {
    title: seo?.metaTitle || seo?.title || `${page.title} | TSV Global Solutions`,
    description: seo?.metaDescription || seo?.description || "Understand TSV Global Solutions' return and refund policy for freight and logistics services.",
    alternates: {
      canonical: seo?.canonicalUrl || "https://tsvglobal.com/return-refund-policy",
    },
    openGraph: {
      title: seo?.metaTitle || seo?.title || page.title,
      description: seo?.metaDescription || seo?.description,
      images: seo?.ogImage ? [{ url: seo.ogImage }] : [],
    },
  };
}

export default async function RefundPolicyPage() {
  const page = await prisma.page.findUnique({
    where: { slug: "return-refund-policy" },
    include: { sections: { where: { isVisible: true }, orderBy: { order: "asc" } } },
  });

  const seo = page?.seoData as any;

  const fallbackContent = `<h2>Return & Refund Policy</h2>
<p>This policy outlines the return and refund procedures for services provided by TSV Global Solutions Pvt Ltd.</p>
<h3>1. Service Cancellations</h3>
<p>Cancellation requests must be submitted in writing. Cancellation charges may apply depending on the stage of service delivery.</p>
<h3>2. Refund Eligibility</h3>
<p>Refunds are considered on a case-by-case basis for services not yet rendered. Services already in progress may not be eligible for full refund.</p>
<h3>3. Processing Time</h3>
<p>Approved refunds will be processed within 7-14 business days to the original payment method.</p>
<h3>4. Non-Refundable Items</h3>
<p>Government fees, customs duties, port charges, and third-party service charges are non-refundable once incurred.</p>
<h3>5. Disputes</h3>
<p>For disputes or refund requests, please contact our customer service at cs@tsvglobal.com with your service reference number.</p>`;

  if (!page) {
    return (
      <>
        <section className="page-header" style={{ background: "#1a1a2e", padding: "80px 0" }}>
          <div className="container"><div className="page-header-info">
            <h1 style={{ color: "#fff" }}>Return & Refund Policy</h1>
          </div></div>
        </section>
        <section className="padding bg-grey">
          <div className="container">
            <div className="simple-content-wrap" style={{ maxWidth: "900px", margin: "0 auto" }}
              dangerouslySetInnerHTML={{ __html: fallbackContent }} />
          </div>
        </section>
      </>
    );
  }

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
