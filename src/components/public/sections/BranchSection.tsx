import React from "react";
import Image from "next/image";
import { TSVHeading, TSVSubHeading } from "../shared/TSVHeading";

export interface BranchSectionProps {
  heading?: string; // Fallback
  headingPrefix?: string;
  headingHighlight?: string;
  headingSuffix?: string;
  headingBreak?: boolean;
  subHeading?: string;
  description?: string;
  branches?: Array<{
    city: string;
    type: string;
    address: string;
    phone?: string;
    email?: string;
    image?: string;
    mapUrl?: string;
  }>;
}

export function BranchSection({
  heading,
  headingPrefix,
  headingHighlight,
  headingSuffix,
  headingBreak,
  subHeading = "Our Offices",
  description = "With offices strategically located in Chennai and Navi Mumbai, TSV Global Solutions is positioned to serve clients across India's major logistics hubs.",
  branches = [
    {
      city: "Chennai",
      type: "Corporate Office",
      address: "No. 101, Ground floor, NSIC STBP Industrial Estate, Hindustan Teleprinters Staff Quarters, SIDCO Industrial Estate, Ekkatuthangal, Chennai, Tamil Nadu 600032, INDIA",
      phone: "+91 96001 32975",
      email: "cs@tsvglobal.com",
      image: "/assets/img/aerial-view-container-cargo-ship-sea.jpg",
    },
    {
      city: "Navi Mumbai",
      type: "Branch Office",
      address: "Foundation Tower, Office #57, Ground Floor, Sector-11, (Opposite PNB Bank), CBD Belapur, Navi Mumbai - 400614, INDIA",
      phone: "+91 96001 32975",
      email: "cs@tsvglobal.com",
      image: "/assets/img/banner/banner-3.jpg",
    },
  ],
}: BranchSectionProps) {
  return (
    <section className="branch-section padding" style={{ background: "#f8f9fc" }}>
      <div className="container">
        <div className="section-heading text-center mb-40 wow fade-in-bottom" data-wow-delay="200ms">
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
              {heading || "Branch Locations"}
            </h2>
          )}
          <p>{description}</p>
        </div>
        <div className="row gy-4">
          {branches.map((branch, i) => (
            <div className="col-lg-6" key={i}>
              <div className="wow fade-in-bottom" data-wow-delay={`${(i + 1) * 200}ms`} style={{
                background: "#fff", borderRadius: "16px", overflow: "hidden",
                boxShadow: "0 4px 24px rgba(26,26,46,0.08)", border: "1px solid #e2e8f0",
              }}>
                <div style={{ position: "relative", height: "200px", overflow: "hidden" }}>
                  <Image src={branch.image || ""} alt={branch.city} fill style={{ objectFit: "cover" }} />
                  <div style={{
                    position: "absolute", top: "16px", left: "16px",
                    background: "#c1000a", color: "#fff",
                    padding: "6px 16px", borderRadius: "99px", fontSize: "12px", fontWeight: 700,
                    zIndex: 1
                  }}>
                    {branch.type}
                  </div>
                </div>
                <div style={{ padding: "28px" }}>
                  <h3 style={{ color: "#1a1a2e", fontSize: "22px", fontWeight: 800, marginBottom: "12px" }}>
                    <i className="fa-regular fa-location-dot" style={{ color: "#c1000a", marginRight: "8px" }} />
                    {branch.city}
                  </h3>
                  <p style={{ color: "#64748b", lineHeight: 1.8, marginBottom: "16px" }}>{branch.address}</p>
                  {branch.phone && (
                    <p style={{ margin: "6px 0" }}>
                      <i className="fa-regular fa-phone" style={{ color: "#c1000a", marginRight: "8px" }} />
                      <a href={`tel:${branch.phone}`} style={{ color: "#1a1a2e", fontWeight: 600 }}>{branch.phone}</a>
                    </p>
                  )}
                  {branch.email && (
                    <p style={{ margin: "6px 0" }}>
                      <i className="fa-regular fa-envelope" style={{ color: "#c1000a", marginRight: "8px" }} />
                      <a href={`mailto:${branch.email}`} style={{ color: "#1a1a2e", fontWeight: 600 }}>{branch.email}</a>
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
