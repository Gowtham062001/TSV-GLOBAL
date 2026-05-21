import React from "react";

export interface SEOData {
  title: string;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
  schema?: Record<string, unknown>;
}

export const SEOHead: React.FC<{ data: SEOData }> = ({ data }) => {
  if (!data) return null;

  return (
    <>
      <title>{data.title}</title>
      <meta name="description" content={data.description} />
      {data.ogTitle && <meta property="og:title" content={data.ogTitle} />}
      {data.ogDescription && <meta property="og:description" content={data.ogDescription} />}
      {data.ogImage && <meta property="og:image" content={data.ogImage} />}
      {data.canonical && <link rel="canonical" href={data.canonical} />}
      {data.schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data.schema) }}
        />
      )}
    </>
  );
};
