export interface SeoData {
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImage?: string;
  faq?: { question: string; answer: string }[];
  faqSchema?: string | null;
  // Legacy fields (keeping for compatibility during transition)
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
}
