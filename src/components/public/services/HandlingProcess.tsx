"use client";

import React from "react";

interface Step {
  number: string;
  title: string;
  subLabel?: string;
  icon: string;
  items: string[];
}

interface HandlingProcessProps {
  data: {
    subHeading?: string;
    heading: string;
    steps: Step[];
  };
}

const HandlingProcess: React.FC<HandlingProcessProps> = ({ data }) => {
  const { subHeading = "Step By Step", heading, steps = [] } = data;

  return (
    <section className="padding" style={{ background: "#f8f9fa" }}>
      <div className="container">
        <div className="section-heading text-center mb-50 wow fade-in-bottom" data-wow-delay="200ms">
          <h4 className="sub-heading">{subHeading}</h4>
          <h2 dangerouslySetInnerHTML={{ __html: heading }}></h2>
        </div>

        {/* Timeline Strip (Visible on Desktop) */}
        <div
          className="d-none d-lg-flex align-items-center justify-content-center mb-50 wow fade-in-bottom"
          data-wow-delay="150ms"
          style={{ gap: 0 }}
        >
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div style={{ textAlign: "center", flex: 1 }}>
                <div
                  style={{
                    width: "72px",
                    height: "72px",
                    background: index % 2 === 0 ? "#c1000a" : "#1a1a2e",
                    borderRadius: "50%",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "26px",
                    fontWeight: 800,
                    color: "#fff",
                    border: "4px solid #fff",
                    boxShadow:
                      index % 2 === 0
                        ? "0 4px 20px rgba(193,0,10,0.35)"
                        : "0 4px 20px rgba(26,26,46,0.25)",
                    marginBottom: "10px",
                  }}
                >
                  {index + 1}
                </div>
                <p
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#1a1a2e",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    margin: 0,
                  }}
                >
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: "3px",
                    background:
                      index % 2 === 0
                        ? "linear-gradient(to right,#c1000a,#1a1a2e)"
                        : "linear-gradient(to right,#1a1a2e,#c1000a)",
                    marginBottom: "28px",
                  }}
                ></div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Cards */}
        <div className="row gy-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className="col-lg-3 col-md-6 wow fade-in-bottom"
              data-wow-delay={`${(index + 1) * 100}ms`}
            >
              <div
                style={{
                  background: "#fff",
                  borderRadius: "12px",
                  padding: "32px 24px",
                  boxShadow: "0 5px 25px rgba(0,0,0,0.07)",
                  borderLeft: `5px solid ${index % 2 === 0 ? "#c1000a" : "#1a1a2e"}`,
                  height: "100%",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "18px" }}>
                  <div
                    style={{
                      width: "52px",
                      height: "52px",
                      background: index % 2 === 0 ? "#c1000a" : "#1a1a2e",
                      borderRadius: "10px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <i
                      className={
                        index === 0
                          ? "fa-regular fa-comments"
                          : index === 1
                          ? "fa-regular fa-file-lines"
                          : index === 2
                          ? "logis logis-cruise"
                          : "fa-regular fa-circle-check"
                      }
                      style={{ color: "#fff", fontSize: "22px" }}
                    ></i>
                  </div>
                  <h3 style={{ margin: 0, fontSize: "18px", color: "#1a1a2e" }}>{step.title}</h3>
                </div>
                <p style={{ color: "#666", fontSize: "14px", lineHeight: 1.75, margin: 0 }}>
                  {step.items[0]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HandlingProcess;
