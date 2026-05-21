"use client";
import React from "react";

export interface CultureItem {
  title: string;
  description: string;
  text?: string; // Fallback
  icon: string;
  highlight?: boolean;
  isFeatured?: boolean; // Fallback
}

export interface CultureStripProps {
  badge?: string;
  eyebrow?: string;
  heading: string;
  highlight?: string;
  items: CultureItem[];
}

export const CultureStrip: React.FC<CultureStripProps> = ({
  badge,
  eyebrow,
  heading,
  highlight,
  items,
}) => {
  return (
    <section className="padding" style={{ background: "#1a1a2e" }}>
      <div className="container">
        <div className="section-heading text-center mb-40 wow fade-in-bottom" data-wow-delay="200ms">
          <h4 className="sub-heading" style={{ color: "#c1000a" }}>
            {badge || eyebrow}
          </h4>
          <h2 style={{ color: "#fff" }}>
            {heading} <span className="hl">{highlight}</span>
          </h2>
        </div>
        <div className="row gy-4 text-center">
          {items?.map((item, index) => {
            const isFeatured = item.highlight || item.isFeatured;
            return (
              <div className="col-lg-3 col-md-6 wow fade-in-bottom" data-wow-delay={`${(index + 1) * 100}ms`} key={index}>
                <div
                  style={{
                    background: isFeatured ? "#c1000a" : "rgba(255,255,255,0.06)",
                    border: isFeatured ? "none" : "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    padding: "32px 20px",
                    height: "100%",
                    transition: "transform 0.3s ease",
                  }}
                >
                  <i
                    className={`fa-regular ${item.icon}`}
                    style={{
                      fontSize: "38px",
                      color: isFeatured ? "#fff" : "#c1000a",
                      marginBottom: "16px",
                      display: "block",
                    }}
                  ></i>
                  <h4 style={{ color: "#fff", fontSize: "18px", marginBottom: "10px", fontWeight: "700" }}>{item.title}</h4>
                  <p
                    style={{
                      color: isFeatured ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.65)",
                      fontSize: "14px",
                      lineHeight: "1.6"
                    }}
                  >
                    {item.description || item.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 768px) {
          h2 { font-size: 28px !important; }
          .padding { padding: 60px 0 !important; }
        }
      `}</style>
    </section>
  );
};
