import React from "react";
import Image from "next/image";
import { TSVHeading, TSVSubHeading } from "../shared/TSVHeading";

export interface ProcessStep {
  title: string;
  subtitle: string;
  icon: string;
  items: string[];
}

export interface ProcessProps {
  subHeading?: string;
  heading?: string; // Fallback
  headingPrefix?: string;
  headingHighlight?: string;
  headingSuffix?: string;
  headingBreak?: boolean;
  description?: string;
  steps: ProcessStep[];
}

export const Process: React.FC<ProcessProps> = ({
  subHeading,
  heading,
  headingPrefix,
  headingHighlight,
  headingSuffix,
  headingBreak,
  description,
  steps
}) => {
  return (
    <section className="process-section padding">
      <div className="map-pattern"></div>
      <div className="container">
        <div className="section-heading text-center mb-40">
          {subHeading && <TSVSubHeading text={subHeading} />}
          
          {(headingPrefix || headingHighlight) ? (
            <TSVHeading 
              prefix={headingPrefix}
              highlight={headingHighlight}
              suffix={headingSuffix}
              hasBreak={headingBreak}
            />
          ) : (
            <h2 className="text-anim" data-effect="fade-in-right" data-split="char" data-delay="0.3" data-duration="1">
              {heading}
            </h2>
          )}
          
          {description && (
            <p className="text-anim" data-effect="fade-in-bottom" data-ease="power4.out">
              {description}
            </p>
          )}
        </div>
        
        <div className="row process-wrapper gy-lg-0 gy-4 position-relative" style={{ backgroundImage: "none" }}>
          {/* Connector Line */}
          <div className="d-none d-lg-block" style={{ position: "absolute", top: "75px", left: "16.66%", width: "66.66%", height: "2px", zIndex: 0 }}>
            <style>
              {`
                .animated-dash {
                  stroke-dasharray: 10 10;
                  animation: dash-move 1.5s linear infinite;
                }
                @keyframes dash-move {
                  to {
                    stroke-dashoffset: -20;
                  }
                }
              `}
            </style>
            <svg width="100%" height="2" style={{ position: "absolute", top: 0, left: 0 }}>
              <line x1="0" y1="1" x2="100%" y2="1" stroke="#323c92" strokeWidth="2" className="animated-dash" />
            </svg>
            <div style={{ position: "absolute", left: "-4px", top: "-3px", width: "8px", height: "8px", borderRadius: "50%", border: "2px solid #323c92", background: "#fff", zIndex: 2 }}></div>
            <div style={{ position: "absolute", right: "-4px", top: "-3px", width: "8px", height: "8px", borderRadius: "50%", border: "2px solid #323c92", background: "#fff", zIndex: 2 }}></div>
          </div>

          {/* Process Steps */}
          {steps && steps.map((step, index) => (
            <div className="col-lg-4 col-md-6" key={index}>
              <div className="process-item wow fade-in-bottom text-center" data-wow-delay={`${(index * 200) + 100}ms`} style={{ background: "transparent", boxShadow: "none", padding: 0, minHeight: "auto" }}>
                <div className="process-icon-new mb-4 mx-auto" style={{ width: "150px", height: "150px", borderRadius: "50%", background: "#fff", border: "8px solid #323c92", boxShadow: "0 15px 30px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1, overflow: "hidden" }}>
                  <div style={{ position: "relative", width: "60px", height: "60px" }}>
                    <Image src={step.icon} alt={step.title} fill style={{ objectFit: "contain" }} />
                  </div>
                </div>
                <div className="process-content mt-4">
                  <h3 style={{ textTransform: "uppercase" }}>{step.title}</h3>
                  <h4 style={{ color: "#323c92", marginBottom: "20px" }}>{step.subtitle}</h4>
                  <ul style={{ listStyle: "none", padding: 0, textAlign: "left", display: "inline-block" }}>
                    {step.items && step.items.map((item, iIndex) => (
                      <li key={iIndex} style={{ position: "relative", paddingLeft: "15px", marginBottom: "8px" }}>
                        <span style={{ position: "absolute", left: 0, top: 0, color: "#c1000a" }}>•</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
