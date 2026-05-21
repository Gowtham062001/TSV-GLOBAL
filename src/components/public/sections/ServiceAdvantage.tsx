"use client";

import React from "react";

export interface AdvantageItem {
  title: string;
  description: string;
  icon: string;
  isDark?: boolean;
}

export interface ServiceAdvantageProps {
  eyebrow?: string;
  heading?: string;
  highlight?: string;
  items?: AdvantageItem[];
}

export const ServiceAdvantage: React.FC<ServiceAdvantageProps> = ({
  eyebrow = "Our Advantage",
  heading = "Why Choose",
  highlight = "TSV Global Solutions?",
  items = [],
}) => {
  return (
    <section className="padding" style={{ background: "#f8f9fa" }}>
      <div className="container">
        <div className="section-heading text-center mb-40 wow fade-in-bottom" data-wow-delay="200ms">
          {eyebrow && <h4 className="sub-heading">{eyebrow}</h4>}
          <h2>
            {heading} <span className="hl">{highlight}</span>
          </h2>
        </div>
        <div className="row gy-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="col-lg-4 col-md-6 wow fade-in-bottom"
              data-wow-delay={`${(index + 1) * 100}ms`}
            >
              <div
                style={{
                  background: item.isDark ? "#1a1a2e" : "#fff",
                  padding: "35px 28px",
                  borderRadius: "10px",
                  textAlign: "center",
                  boxShadow: item.isDark 
                    ? "0 4px 25px rgba(0,0,0,0.1)" 
                    : "0 4px 25px rgba(0,0,0,0.06)",
                  height: "100%",
                  borderBottom: `3px solid ${index < 3 ? "#c1000a" : "#1a1a2e"}`,
                  transition: "transform 0.3s ease",
                }}
              >
                <div
                  style={{
                    width: "70px",
                    height: "70px",
                    background: item.isDark ? "rgba(255,255,255,0.1)" : "rgba(193,0,10,0.08)",
                    borderRadius: "50%",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "20px",
                  }}
                >
                  <i
                    className={item.icon}
                    style={{ fontSize: "30px", color: item.isDark ? "#c1000a" : "#c1000a" }}
                  ></i>
                </div>
                <h3
                  style={{
                    marginBottom: "12px",
                    fontSize: "20px",
                    color: item.isDark ? "#fff" : "#1a1a2e",
                  }}
                >
                  {item.title}
                </h3>
                <p style={{ color: item.isDark ? "rgba(255,255,255,0.75)" : "#666", margin: 0 }}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        div:hover {
          transform: translateY(-5px);
        }
      `}</style>
    </section>
  );
};
