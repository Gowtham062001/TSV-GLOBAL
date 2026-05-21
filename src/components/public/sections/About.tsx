"use client";

import React from "react";
import Image from "next/image";
import { TSVHeading, TSVSubHeading } from "../shared/TSVHeading";

export interface AboutProps {
  image: string;
  imageAlt?: string;
  badge?: string;
  subHeading?: string;
  heading?: string; // Fallback
  headingPrefix?: string;
  headingHighlight?: string;
  headingSuffix?: string;
  headingBreak?: boolean;
  paragraph1?: string;
  paragraph2?: string;
  paragraph3?: string;
  vision?: { title: string; text: string };
  mission?: { title: string; text: string };
}

export const About: React.FC<AboutProps> = ({
  image,
  imageAlt = "TSV Global Logistics",
  badge,
  subHeading,
  heading,
  headingPrefix,
  headingHighlight,
  headingSuffix,
  headingBreak,
  paragraph1,
  paragraph2,
  paragraph3,
  vision,
  mission
}) => {
  return (
    <section className="about-section padding">
      <div className="container">
        <div className="row">
          <div className="col-lg-5">
            <div className="wow fade-in-left" data-wow-delay="100ms" style={{ position: "relative", paddingRight: "20px" }}>
              <div style={{ position: "relative", width: "100%", height: "450px", borderRadius: "12px", overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}>
                <Image 
                  src={image} 
                  alt={imageAlt} 
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
              {badge && (
                <div 
                  className="about-experience" 
                  style={{ 
                    position: "absolute", bottom: "40px", right: 0, 
                    background: "#c1000a", color: "white", padding: "18px 30px", 
                    borderRadius: "8px", fontWeight: 700, fontSize: "18px", 
                    boxShadow: "0 10px 20px rgba(193,0,10,0.4)", 
                    textTransform: "uppercase", letterSpacing: "0.5px",
                    zIndex: 2
                  }}
                >
                  {badge}
                </div>
              )}
            </div>
          </div>
          <div className="col-lg-7 ps-lg-4">
            <div className="section-heading mb-40">
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

              {paragraph1 && (
                <p className="text-anim mt-4 mb-3" data-effect="fade-in-bottom" data-ease="power4.out">
                  {paragraph1}
                </p>
              )}
              {paragraph2 && (
                <p className="text-anim mb-3" data-effect="fade-in-bottom" data-ease="power4.out">
                  {paragraph2}
                </p>
              )}
              {paragraph3 && (
                <p 
                  className="text-anim mb-4 pb-4" data-effect="fade-in-bottom" data-ease="power4.out" 
                  style={{ borderBottom: "1px solid rgba(0,0,0,0.1)" }}
                >
                  {paragraph3}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="row gy-4 tsv-vm-container">
          {vision && (
            <div className="col-md-6 wow fade-in-bottom" data-wow-delay="100ms">
              <div className="tsv-vm-card vision">
                <div className="tsv-vm-icon">
                  <i className="fa-solid fa-eye"></i>
                </div>
                <div className="tsv-vm-content">
                  <h3>{vision.title}</h3>
                  <p>{vision.text}</p>
                </div>
              </div>
            </div>
          )}
          {mission && (
            <div className="col-md-6 wow fade-in-bottom" data-wow-delay="200ms">
              <div className="tsv-vm-card mission">
                <div className="tsv-vm-icon">
                  <i className="fa-solid fa-bullseye-arrow"></i>
                </div>
                <div className="tsv-vm-content">
                  <h3>{mission.title}</h3>
                  <p>{mission.text}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 991px) {
          .about-experience { 
            bottom: -20px !important; 
            right: 20px !important; 
            padding: 12px 20px !important;
            font-size: 14px !important;
          }
          .col-lg-5 div:first-child {
            height: 350px !important;
            margin-bottom: 40px;
          }
        }
      `}</style>
    </section>
  );
};
