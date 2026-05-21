"use client";
import React from "react";

interface Stat {
  value: string;
  label: string;
}

interface CaseStudyStatsProps {
  stats: Stat[];
}

export const CaseStudyStats: React.FC<CaseStudyStatsProps> = ({ stats }) => {
  return (
    <section style={{ background: "#c1000a", padding: "40px 0" }}>
      <div className="container">
        <div className="row text-center gy-3">
          {stats?.map((stat, i) => (
            <div className="col-lg-3 col-6 wow fade-in-bottom" data-wow-delay={`${i * 100}ms`} key={i}>
              <h2 style={{ color: "#fff", fontSize: "42px", fontWeight: "800", marginBottom: "4px", lineHeight: "1" }}>
                {stat.value}
              </h2>
              <p style={{ color: "rgba(255,255,255,0.85)", margin: 0, fontSize: "15px", fontWeight: "600" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 768px) {
          h2 { font-size: 32px !important; }
          p { font-size: 13px !important; }
        }
      `}</style>
    </section>
  );
};
