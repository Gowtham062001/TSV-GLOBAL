/*
 * PAGE: terms-and-conditions.html → app/(public)/terms-and-conditions/page.tsx
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
    where: { slug: "terms-and-conditions" },
  });

  if (!page) return {
    title: "Terms & Conditions | TSV Global Solutions",
    description: "Read the terms and conditions governing your use of TSV Global Solutions' services.",
  };

  const seo = page.seoData as any;
  return {
    title: seo?.metaTitle || seo?.title || `${page.title} | TSV Global Solutions`,
    description: seo?.metaDescription || seo?.description || "Read the terms and conditions governing your use of TSV Global Solutions' services.",
    alternates: {
      canonical: seo?.canonicalUrl || "https://tsvglobal.com/terms-and-conditions",
    },
    openGraph: {
      title: seo?.metaTitle || seo?.title || page.title,
      description: seo?.metaDescription || seo?.description,
      images: seo?.ogImage ? [{ url: seo.ogImage }] : [],
    },
  };
}

export default async function TermsPage() {
  const page = await prisma.page.findUnique({
    where: { slug: "terms-and-conditions" },
    include: { sections: { where: { isVisible: true }, orderBy: { order: "asc" } } },
  });

  const seo = page?.seoData as any;

  const fallbackContent = `<h2>Terms and Conditions</h2>
<p>Welcome to TSV Global Solutions Pvt Ltd. By accessing or using our services, you agree to be bound by these terms and conditions.</p>
<h3>1. Services</h3>
<p>TSV Global Solutions provides freight forwarding, NVOCC, custom clearance, project cargo, and transportation services subject to these terms.</p>
<h3>2. Quotations</h3>
<p>All quotations are subject to availability and current market rates. Rates are valid for the period specified in the quotation.</p>
<h3>3. Liability</h3>
<p>Our liability is limited as per standard industry terms and applicable laws governing freight forwarding and logistics services.</p>
<h3>4. Payment</h3>
<p>Payment terms are as agreed upon in individual service agreements. Late payments may attract charges as specified.</p>
<h3>5. Governing Law</h3>
<p>These terms are governed by the laws of India and subject to the jurisdiction of courts in Chennai, Tamil Nadu.</p>`;

  if (!page) {
    return (
      <>
        <section className="page-header" style={{ background: "#1a1a2e", padding: "80px 0" }}>
          <div className="container"><div className="page-header-info">
            <h1 style={{ color: "#fff" }}>Terms & Conditions</h1>
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
