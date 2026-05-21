"use client";

import React from "react";

interface AdvantageCard {
  title: string;
  description: string;
  icon: string;
  accentColor?: string; // e.g., #c1000a or #1a1a2e
}

interface OurAdvantageProps {
  data: {
    subHeading?: string;
    heading: string;
    cards: AdvantageCard[];
  };
}

const OurAdvantage: React.FC<OurAdvantageProps> = ({ data }) => {
  const { subHeading = "Our Advantage", heading, cards = [] } = data;

  return (
    <section className="padding" style={{ background: "#f8f9fa" }}>
      <div className="container">
        <div className="section-heading text-center mb-40 wow fade-in-bottom" data-wow-delay="200ms">
          <h4 className="sub-heading">{subHeading}</h4>
          <h2 dangerouslySetInnerHTML={{ __html: heading }}></h2>
        </div>
        <div className="row gy-4">
          {cards.map((card, i) => {
            const isDark = card.accentColor === "#1a1a2e";
            return (
              <div key={i} className="col-lg-4 col-md-6 wow fade-in-bottom" data-wow-delay={`${(i + 1) * 100}ms`}>
                <div
                  style={{
                    background: isDark ? "#1a1a2e" : "#fff",
                    padding: "35px 28px",
                    borderRadius: "10px",
                    textAlign: "center",
                    boxShadow: isDark ? "0 4px 25px rgba(0,0,0,0.1)" : "0 4px 25px rgba(0,0,0,0.06)",
                    height: "100%",
                    borderBottom: "3px solid #c1000a",
                    transition: "transform 0.3s ease",
                  }}
                >
                  <div
                    style={{
                      width: "70px",
                      height: "70px",
                      background: isDark ? "rgba(255,255,255,0.1)" : "rgba(193,0,10,0.08)",
                      borderRadius: "50%",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "20px",
                    }}
                  >
                    <i className={card.icon} style={{ fontSize: "30px", color: isDark ? "#c1000a" : "#c1000a" }}></i>
                  </div>
                  <h3
                    style={{
                      marginBottom: "12px",
                      fontSize: "20px",
                      color: isDark ? "#fff" : "#1a1a2e",
                    }}
                  >
                    {card.title}
                  </h3>
                  <p style={{ color: isDark ? "rgba(255,255,255,0.75)" : "#666" }}>
                    {card.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default OurAdvantage;
