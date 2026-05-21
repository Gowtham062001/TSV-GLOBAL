import React from "react";
import Image from "next/image";
import { TSVHeading, TSVSubHeading } from "../shared/TSVHeading";

export interface SkillSectionProps {
  heading?: string; // Fallback
  headingPrefix?: string;
  headingHighlight?: string;
  headingSuffix?: string;
  headingBreak?: boolean;
  subHeading?: string;
  description?: string;
  videoImage?: string;
  planeImage?: string;
  skills?: Array<{ label: string; percentage: number }>;
}

export function SkillSection({
  heading,
  headingPrefix,
  headingHighlight,
  headingSuffix,
  headingBreak,
  subHeading = "Professional Expertise",
  description = "Our team brings deep expertise across every facet of global logistics, from documentation to last-mile delivery.",
  videoImage = "/assets/img/content-bg-5.jpg",
  planeImage = "/assets/img/plane-flying.png",
  skills = [
    { label: "Freight Forwarding", percentage: 95 },
    { label: "Custom Clearance", percentage: 90 },
    { label: "Project Cargo", percentage: 88 },
    { label: "Transportation", percentage: 92 },
  ],
}: SkillSectionProps) {
  return (
    <section className="skill-section bg-grey padding">
      <div className="container">
        <div className="row align-items-center gy-4">
          <div className="col-lg-6">
            <div className="video-wrap" style={{ position: "relative" }}>
              <div style={{ position: "relative", width: "100%", height: "400px", borderRadius: "12px", overflow: "hidden" }}>
                <Image src={videoImage} alt="expertise" fill style={{ objectFit: "cover" }} />
              </div>
              {planeImage && (
                <div 
                  className="wow fade-in-left"
                  data-wow-delay="200ms"
                  style={{ position: "absolute", bottom: "-30px", right: "-20px", width: "160px", height: "100px" }}
                >
                  <Image src={planeImage} alt="plane" fill style={{ objectFit: "contain" }} />
                </div>
              )}
            </div>
          </div>
          <div className="col-lg-6">
            <div className="section-heading mb-30">
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
                  {heading || "Our Core Competencies"}
                </h2>
              )}
              <p>{description}</p>
            </div>
            <div className="skill-wrap">
              {skills.map((skill, i) => (
                <div className="skill-item" key={i} style={{ marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontWeight: 600, color: "#1a1a2e" }}>{skill.label}</span>
                    <span style={{ fontWeight: 700, color: "#c1000a" }}>{skill.percentage}%</span>
                  </div>
                  <div style={{ height: "6px", background: "#e2e8f0", borderRadius: "99px", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${skill.percentage}%`,
                      background: "linear-gradient(90deg, #c1000a, #e63946)",
                      borderRadius: "99px", transition: "width 1s ease",
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
