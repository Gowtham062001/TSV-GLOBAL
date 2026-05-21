"use client";

import React from "react";

export interface IndustryFocusItem {
  title: string;
  description: string;
  icon?: string;
  isDark?: boolean;
  bgRed?: boolean;
}

export interface IndustryFocusProps {
  eyebrow?: string;
  heading?: string;
  highlight?: string;
  items?: IndustryFocusItem[];
}

export const IndustryFocus: React.FC<IndustryFocusProps> = ({
  eyebrow,
  heading,
  highlight,
  items = [],
}) => {
  return (
    <section className="padding" style={{ background: "#f8f9fa" }}>
      <div className="container">
        {(eyebrow || heading) && (
          <div className="section-heading text-center mb-40 wow fade-in-bottom" data-wow-delay="200ms">
            {eyebrow && <h4 className="sub-heading">{eyebrow}</h4>}
            {heading && (
              <h2>
                {heading} <span className="hl">{highlight}</span>
              </h2>
            )}
          </div>
        )}
        <div className="row gy-4 justify-content-center">
          {items.map((item, index) => (
            <div
              key={index}
              className={`col-lg-${items.length === 2 ? "5" : items.length === 4 ? "3" : "4"} col-md-6 wow fade-in-bottom`}
              data-wow-delay={`${(index + 1) * 100}ms`}
            >
              <div
                style={{
                  background: item.bgRed ? "#c1000a" : (item.isDark ? "#1a1a2e" : "#fff"),
                  padding: "45px 30px",
                  borderRadius: "12px",
                  boxShadow: item.isDark 
                    ? "0 10px 40px rgba(0,0,0,0.15)" 
                    : "0 10px 40px rgba(0,0,0,0.05)",
                  borderBottom: `4px solid ${item.bgRed ? "#fff" : "#c1000a"}`,
                  height: "100%",
                  textAlign: "center",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                {item.icon && (
                  <i
                    className={item.icon}
                    style={{
                      fontSize: "40px",
                      color: item.bgRed ? "#fff" : "#c1000a",
                      marginBottom: "18px",
                      display: "block",
                    }}
                  ></i>
                )}
                <h3
                  style={{
                    fontSize: "20px",
                    marginBottom: "12px",
                    color: (item.bgRed || item.isDark) ? "#fff" : "#1a1a2e",
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    color: item.bgRed ? "rgba(255,255,255,0.9)" : (item.isDark ? "rgba(255,255,255,0.75)" : "#666"),
                    fontSize: "14px",
                    lineHeight: "1.8",
                    margin: 0,
                  }}
                >
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
