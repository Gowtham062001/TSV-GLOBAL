import React from "react";
import { TSVHeading } from "../shared/TSVHeading";

export interface PremiumCTAProps {
  heading?: string; // Fallback
  headingPrefix?: string;
  headingHighlight?: string;
  headingSuffix?: string;
  subHeading?: string;
  description?: string;
  btnText?: string;
  btnUrl?: string;
  bgImage?: string;
}

export function PremiumCTA({
  heading,
  headingPrefix,
  headingHighlight,
  headingSuffix,
  subHeading = "Let's Get Started",
  description = "Connect with our logistics experts today and discover how TSV Global Solutions can streamline your supply chain for maximum efficiency.",
  btnText = "Get A Free Quote",
  btnUrl = "/contact",
}: PremiumCTAProps) {
  return (
    <section style={{
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
      padding: "100px 0", position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 70% 50%, rgba(193,0,10,0.12) 0%, transparent 60%)",
        pointerEvents: "none",
      }} />
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <div className="row align-items-center gy-4">
          <div className="col-lg-8">
            {subHeading && <h4 className="sub-heading" style={{ color: "#c1000a", marginBottom: "16px" }}>{subHeading}</h4>}
            
            {(headingPrefix || headingHighlight) ? (
              <TSVHeading 
                prefix={headingPrefix}
                highlight={headingHighlight}
                suffix={headingSuffix}
                className=""
                tag="h2"
                animAttrs={{}}
                style={{ color: "#fff", fontSize: "42px", fontWeight: 800, lineHeight: 1.2, marginBottom: "20px" }}
              />
            ) : (
              <h2 style={{ color: "#fff", fontSize: "42px", fontWeight: 800, lineHeight: 1.2, marginBottom: "20px" }}>
                {heading || "Ready To Ship Globally?"}
              </h2>
            )}

            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "16px", lineHeight: 1.8, maxWidth: "600px" }}>
              {description}
            </p>
          </div>
          <div className="col-lg-4 text-lg-end">
            <a href={btnUrl} className="default-btn wow fade-in-right" data-wow-delay="300ms">
              {btnText} <i className="fa-regular fa-arrow-right" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
