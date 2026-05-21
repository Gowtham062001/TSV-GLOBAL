"use client";
import React from "react";

export interface CaseStudyMetric {
  label: string;
  value: string;
  subLabel: string;
}

export interface CaseStudyItem {
  title: string;
  slug: string;
  client?: string;
  industry?: string;
  images?: unknown;
  tags?: string;
  description?: string;
  metrics?: CaseStudyMetric[];
}

export interface CaseStudyGridProps {
  eyebrow?: string;
  heading?: string;
  highlight?: string;
  items?: CaseStudyItem[];
}

export const CaseStudyGrid: React.FC<CaseStudyGridProps> = ({ eyebrow, heading, highlight, items }) => {
  return (
    <section className="padding" style={{ background: "#f8f9fa" }}>
      <div className="container">
        {(eyebrow || heading) && (
          <div className="section-heading text-center mb-50 wow fade-in-bottom" data-wow-delay="200ms">
            {eyebrow && <h4 className="sub-heading">{eyebrow}</h4>}
            {heading && <h2>{heading} <span className="hl">{highlight}</span></h2>}
          </div>
        )}
        <div className="row gy-4">
          {items?.map((item, index) => {
            const firstImage = Array.isArray(item.images) ? item.images[0] : (item as any).image || item.images;
            return (
              <div className="col-lg-6 wow fade-in-bottom" data-wow-delay={`${(index + 1) * 100}ms`} key={index}>
                <div
                  style={{
                    background: "#fff",
                    borderRadius: "14px",
                    overflow: "hidden",
                    boxShadow: "0 5px 30px rgba(0,0,0,0.07)",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column"
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <img 
                      src={firstImage || "/img/placeholder.jpg"} 
                      alt={item.title} 
                      style={{ width: "100%", height: "240px", objectFit: "cover", display: "block" }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        top: "18px",
                        left: "18px",
                        background: index % 2 === 0 ? "#c1000a" : "#1a1a2e",
                        color: "#fff",
                        fontSize: "12px",
                        fontWeight: "700",
                        padding: "5px 14px",
                        borderRadius: "20px"
                      }}
                    >
                      {item.tags || "Case Study"}
                    </div>
                  </div>
                  <div style={{ padding: "28px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <h3 style={{ fontSize: "20px", color: "#1a1a2e", marginBottom: "12px" }}>{item.title}</h3>
                    <p style={{ color: "#555", fontSize: "14px", lineHeight: "1.8", marginBottom: "20px" }}>
                      {item.description || "TSV Global provides tailored logistics solutions for complex cargo requirements."}
                    </p>
                    

                    <div style={{ paddingTop: "16px", borderTop: "1px solid #eee" }}>
                      <a 
                        href={`/case-studies/${item.slug}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          background: "#c1000a",
                          color: "#fff",
                          padding: "11px 22px",
                          borderRadius: "6px",
                          fontWeight: "700",
                          fontSize: "13.5px",
                          textDecoration: "none",
                          transition: "background 0.25s"
                        }}
                        className="case-study-btn"
                      >
                        Read Full Case Study <i className="fa-regular fa-arrow-right-long"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <style jsx>{`
        .case-study-btn:hover {
          background: #a5000a !important;
        }
      `}</style>
    </section>
  );
};
