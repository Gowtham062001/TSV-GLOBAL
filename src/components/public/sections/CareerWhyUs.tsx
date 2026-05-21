import React from "react";

export interface Feature {
  title: string;
  description: string;
  text?: string; // Fallback
  icon: string;
}

export interface CareerWhyUsProps {
  badge?: string;
  eyebrow?: string;
  heading: string;
  highlight?: string;
  description: string;
  features: Feature[];
  image: string;
  experience_years?: string;
}

export const CareerWhyUs: React.FC<CareerWhyUsProps> = ({
  badge,
  eyebrow,
  heading,
  highlight,
  description,
  features,
  image,
  experience_years,
}) => {
  return (
    <section className="padding" style={{ background: "#fff" }}>
      <div className="container">
        <div className="row align-items-center gy-5">
          <div className="col-lg-6 wow fade-in-left" data-wow-delay="200ms">
            <div className="section-heading mb-30">
              <h4 className="sub-heading">{badge || eyebrow}</h4>
              <h2>
                {heading} <span className="hl">{highlight}</span>
              </h2>
            </div>
            <p style={{ marginBottom: "25px", color: "#555", lineHeight: "1.7" }}>{description}</p>
            <div className="row gy-3">
              {features?.map((f, i) => (
                <div className="col-sm-6" key={i}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                    <div
                      style={{
                        width: "46px",
                        height: "46px",
                        background: "rgba(193,0,10,0.08)",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <i className={`fa-regular ${f.icon}`} style={{ color: "#c1000a", fontSize: "20px" }}></i>
                    </div>
                    <div>
                      <h5 style={{ margin: "0 0 5px", fontSize: "16px", color: "#1a1a2e", fontWeight: "700" }}>{f.title}</h5>
                      <p style={{ margin: 0, fontSize: "13.5px", color: "#666", lineHeight: "1.5" }}>{f.description || f.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-lg-6 wow fade-in-right" data-wow-delay="300ms">
            <div style={{ position: "relative", borderRadius: "14px", overflow: "hidden", boxShadow: "0 10px 40px rgba(0,0,0,0.1)" }}>
              <img
                src={image}
                alt="TSV Global Team"
                style={{ width: "100%", borderRadius: "14px", display: "block", objectFit: "cover" }}
              />
              {experience_years && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "24px",
                    left: "24px",
                    background: "#c1000a",
                    color: "#fff",
                    padding: "14px 22px",
                    borderRadius: "8px",
                    boxShadow: "0 4px 15px rgba(193,0,10,0.3)"
                  }}
                >
                  <span style={{ fontSize: "28px", fontWeight: "800", display: "block", lineHeight: "1" }}>
                    {experience_years}
                  </span>
                  <span style={{ fontSize: "13px", fontWeight: "600" }}>Years of Excellence</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
