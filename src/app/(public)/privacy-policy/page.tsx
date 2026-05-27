import { prisma } from "@/lib/db";
import { SectionRenderer } from "@/components/public/SectionRenderer";
import { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const page = await prisma.page.findUnique({
    where: { slug: "privacy-policy" },
  });

  if (!page) return {
    title: "Privacy Policy | TSV Global Solutions",
    description: "Learn how TSV Global Solutions collects, uses, and protects your personal information.",
  };

  const seo = page.seoData as any;
  return {
    title: seo?.metaTitle || seo?.title || `${page.title} | TSV Global Solutions`,
    description: seo?.metaDescription || seo?.description || "Learn how TSV Global Solutions collects, uses, and protects your personal information.",
    alternates: {
      canonical: seo?.canonicalUrl || "https://tsvglobal.com/privacy-policy",
    },
    openGraph: {
      title: seo?.metaTitle || seo?.title || page.title,
      description: seo?.metaDescription || seo?.description,
      images: seo?.ogImage ? [{ url: seo.ogImage }] : [],
    },
  };
}

export default async function PrivacyPolicyPage() {
  const page = await prisma.page.findUnique({
    where: { slug: "privacy-policy" },
    include: { sections: { where: { isVisible: true }, orderBy: { order: "asc" } } },
  });

  const seo = page?.seoData as any;

  const fallbackContent = `<h2>Privacy Policy</h2>
<p>TSV Global Solutions Pvt Ltd is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information.</p>
<h3>1. Information We Collect</h3>
<p>We collect information you provide directly to us, such as name, email address, phone number, and company details when you request a quote or contact us.</p>
<h3>2. How We Use Your Information</h3>
<p>We use the information to provide our logistics services, respond to inquiries, send relevant communications, and improve our services.</p>
<h3>3. Information Sharing</h3>
<p>We do not sell or rent your personal information to third parties. We may share information with service partners as necessary to fulfill logistics operations.</p>
<h3>4. Data Security</h3>
<p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access or disclosure.</p>
<h3>5. Contact Us</h3>
<p>For privacy-related queries, please contact us at cs@tsvglobal.com or call +91 96001 32975.</p>`;

  if (!page || page.sections.length === 0) {
    return (
      <>
        <section className="page-header" style={{ background: "#1a1a2e", padding: "80px 0" }}>
          <div className="container"><div className="page-header-info">
            <h1 style={{ color: "#fff" }}>Privacy Policy</h1>
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
