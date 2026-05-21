import React from "react";
import { prisma } from "@/lib/db";
import { Hero } from "./sections/Hero";
import { About } from "./sections/About";
import { Services } from "./sections/Services";
import { Marquee } from "./sections/Marquee";
import { CaseStudies } from "./sections/CaseStudies";
import { Features } from "./sections/Features";
import { Process } from "./sections/Process";
import { CTA } from "./sections/CTA";
import { PartnersGrid } from "./sections/PartnersGrid";
import { PartnersMarquee } from "./sections/PartnersMarquee";
import { Testimonials } from "./sections/Testimonials";
import { GoogleMap } from "./sections/GoogleMap";
import { ContactGrid } from "./sections/ContactGrid";
import { PageHeader } from "./sections/PageHeader";
import { WhoWeAre } from "./sections/WhoWeAre";
import { VisionMission } from "./sections/VisionMission";
import { CoreValues } from "./sections/CoreValues";
import { AdvantagePromo } from "./sections/AdvantagePromo";
import { JourneyCards } from "./sections/JourneyCards";
import { ServiceGrid } from "./sections/ServiceGrid";
import { CaseStudyGrid } from "./sections/CaseStudyGrid";
import { BlogGrid } from "./sections/BlogGrid";
import { NetworkPartnerMap } from "./sections/NetworkPartnerMap";
import { JobGrid } from "./sections/JobGrid";
import { SuccessTimeline } from "./sections/SuccessTimeline";
import { ChroniclesGallery } from "./sections/ChroniclesGallery";
import { SimpleContent } from "./sections/SimpleContent";
import { GlobalNetworkPartners } from "./sections/GlobalNetworkPartners";
import { StatsFeatures } from "./sections/StatsFeatures";
import { ServiceGallery } from "./sections/ServiceGallery";
import { PremiumPresence } from "./sections/PremiumPresence";
import { PremiumCTA } from "./sections/PremiumCTA";
import { TeamGrid } from "./sections/TeamGrid";
import { SkillSection } from "./sections/SkillSection";
import { BranchSection } from "./sections/BranchSection";
import { QuoteSection } from "./sections/QuoteSection";
import { Error404 } from "./sections/Error404";
import { ContactInfo } from "./sections/ContactInfo";
import { ContactForm } from "./sections/ContactForm";
import { BrochureForm } from "./sections/BrochureForm";
import { CareerWhyUs } from "./sections/CareerWhyUs";
import { CultureStrip } from "./sections/CultureStrip";
import { AssociationsAdvantages } from "./sections/AssociationsAdvantages";
import { AssociationsCTA } from "./sections/AssociationsCTA";
import { CareerCTA } from "./sections/CareerCTA";
import { CaseStudyStats } from "./sections/CaseStudyStats";
import { IndustryFocus } from "./sections/IndustryFocus";
import { ServiceOverview } from "./sections/ServiceOverview";
import { HandlingProcess } from "./sections/HandlingProcess";
import { ServiceAdvantage } from "./sections/ServiceAdvantage";
import { ServiceFAQ } from "./sections/ServiceFAQ";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sectionMap: Record<string, any> = {
  hero_slider: Hero,
  about_us: About,
  about_section: About,
  who_we_are: WhoWeAre,
  service_overview: ServiceOverview,
  handling_process: HandlingProcess,
  service_advantage: ServiceAdvantage,
  why_us: CareerWhyUs,
  career_why_us: CareerWhyUs,
  services_grid: Services,
  services_highlight: Services,
  service_list_grid: ServiceGrid,
  marquee: Marquee,
  running_text: Marquee,
  case_studies: CaseStudies,
  case_studies_carousel: CaseStudies,
  case_study_grid: CaseStudyGrid,
  features: Features,
  stats_features: StatsFeatures,
  industry_focus: IndustryFocus,
  cargo_types: IndustryFocus,
  culture: CultureStrip,
  culture_strip: CultureStrip,
  process: Process,
  process_section: Process,
  cta: CTA,
  cta_section: CTA,
  premium_cta: PremiumCTA,
  partners_grid: PartnersGrid,
  global_network_partners: GlobalNetworkPartners,
  partners_marquee: PartnersMarquee,
  premium_presence: PremiumPresence,
  testimonials: Testimonials,
  google_map: GoogleMap,
  contact_grid: ContactGrid,
  contact_info: ContactInfo,
  contact_form: ContactForm,
  page_header: PageHeader,
  vision_mission: VisionMission,
  core_values: CoreValues,
  advantage_promo: AdvantagePromo,
  journey_cards: JourneyCards,
  network_map: NetworkPartnerMap,
  job_grid: JobGrid,
  job_openings: JobGrid,
  success_timeline: SuccessTimeline,
  chronicles_gallery: ChroniclesGallery,
  simple_content: SimpleContent,
  blog_grid: BlogGrid,
  brochure_form: BrochureForm,
  service_gallery: ServiceGallery,
  team_grid: TeamGrid,
  skill_section: SkillSection,
  branch_section: BranchSection,
  quote_section: QuoteSection,
  associations_advantages: AssociationsAdvantages,
  associations_cta: AssociationsCTA,
  career_cta: CareerCTA,
  case_study_stats: CaseStudyStats,
  service_faq: ServiceFAQ,
  error_404: Error404,
};

export async function SectionRenderer({
  type,
  content,
}: {
  type: string;
  content: Record<string, unknown>;
}) {
  if (!Object.prototype.hasOwnProperty.call(sectionMap, type)) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[SectionRenderer] Unknown section type: "${type}"`);
    }
    return null;
  }

  const Component = sectionMap[type];
  
  if (!Component) {
    if (process.env.NODE_ENV === "development") {
      console.error(`[SectionRenderer] Component for type "${type}" is undefined.`);
    }
    return null;
  }

  // ─── DATA CLEANING: Prevents "Objects are not valid as React child" crashes ───
  // Some sections (like Careers/Associations) may receive malformed stats/metrics objects
  const cleanContent = JSON.parse(JSON.stringify(content), (key, value) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if ('label' in value && 'value' in value && Object.keys(value).length === 2) {
        return `${value.label}: ${value.value}`;
      }
    }
    return value;
  });

  if (type === "case_studies_carousel" || type === "case_studies") {
    try {
      const caseStudies = await prisma.caseStudy.findMany({
        where: { status: "PUBLISHED", isVisible: true },
        orderBy: { createdAt: "desc" },
        take: 6,
      });
      
      cleanContent.items = caseStudies.map((cs: any) => {
        const images = cs.images as any[];
        const image = Array.isArray(images) && images.length > 0 ? images[0] : "/assets/img/aerial-view-container-cargo-ship-sea.jpg";
        return {
          title: cs.title,
          category: cs.industry || "Logistics",
          image: image,
          imageAlt: cs.title,
          link: `/case-studies/${cs.slug}`,
          delay: "200ms"
        };
      });
    } catch (e) {
      console.error("[SectionRenderer] Failed to fetch case studies:", e);
    }
  }

  if (type === "service_list_grid" || type === "services_grid") {
    try {
      const dbServices = await prisma.service.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
      });
      
      if (dbServices.length > 0) {
        // Map to common formats used by ServiceGrid and Services components
        cleanContent.services = dbServices.map((s: any) => ({
          title: s.title,
          slug: s.slug,
          description: s.description || "",
          icon: s.icon || "logis logis-package",
          image: s.image || "/assets/img/aerial-view-container-cargo-ship-sea.jpg",
          imageAlt: s.title
        }));
        
        cleanContent.items = dbServices.map((s: any) => ({
          title: s.title,
          description: s.description || "",
          icon: s.icon || "logis logis-package",
          image: s.image || "/assets/img/aerial-view-container-cargo-ship-sea.jpg",
          imageAlt: s.title,
          link: `/services/${s.slug}`
        }));
      }
    } catch (e) {
      console.error("[SectionRenderer] Failed to fetch services:", e);
    }
  }

  if (type === "blog_grid") {
    try {
      const dbPosts = await prisma.blogPost.findMany({
        where: { status: "PUBLISHED" },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
        take: 6,
        select: {
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          author: true,
          category: true,
          publishedAt: true,
          createdAt: true,
          isFeatured: true,
        },
      });
      if (dbPosts.length > 0) {
        cleanContent.posts = dbPosts.map((p: any) => ({
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt || "",
          coverImage: p.coverImage || "/img/post-1.jpg",
          author: p.author || "TSV Editorial",
          category: p.category || "Insights",
          publishedAt: p.publishedAt || p.createdAt,
          isFeatured: p.isFeatured,
        }));
      }
    } catch (e) {
      console.error("[SectionRenderer] Failed to fetch blog posts:", e);
    }
  }


  return (
    <div data-section-type={type} id={`section-${type.replace(/_/g, '-')}`}>
      <Component {...cleanContent} />
    </div>
  );
}
