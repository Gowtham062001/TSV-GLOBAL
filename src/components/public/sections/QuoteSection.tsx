import React from "react";
import { TSVHeading } from "../shared/TSVHeading";

export interface QuoteSectionProps {
  heading?: string; // Fallback
  headingPrefix?: string;
  headingHighlight?: string;
  headingSuffix?: string;
  subHeading?: string;
  description?: string;
  bgImage?: string;
  services?: string[];
}

export function QuoteSection({
  heading,
  headingPrefix,
  headingHighlight,
  headingSuffix,
  subHeading = "Get Started Today",
  description = "Fill out the form and our logistics specialists will contact you within 24 hours with a customized solution for your shipment needs.",
  bgImage = "/assets/img/aerial-view-container-cargo-ship-sea.jpg",
  services = ["Air Freight", "Sea Freight", "Road Freight", "Project Cargo", "Custom Clearance", "NVOCC", "ODC Cargo"],
}: QuoteSectionProps) {
  return (
    <section className="quote-section padding" style={{
      position: "relative", overflow: "hidden",
      background: `linear-gradient(rgba(26,26,46,0.88), rgba(26,26,46,0.92)), url(${bgImage}) center/cover no-repeat`,
    }}>
      <div className="map-pattern" />
      <div className="container">
        <div className="row align-items-center gy-5">
          <div className="col-lg-5">
            <div className="section-heading white">
              {subHeading && <h3 className="sub-heading" style={{ color: "#c1000a" }}>{subHeading}</h3>}
              
              {(headingPrefix || headingHighlight) ? (
                <TSVHeading 
                  prefix={headingPrefix}
                  highlight={headingHighlight}
                  suffix={headingSuffix}
                  className=""
                  tag="h2"
                  animAttrs={{}}
                  style={{ color: "#fff" }}
                />
              ) : (
                <h2 style={{ color: "#fff" }}>
                  {heading || "Request A Free Quote"}
                </h2>
              )}

              <p style={{ color: "rgba(255,255,255,0.7)" }}>{description}</p>
              <ul className="check-list white" style={{ marginTop: "24px" }}>
                {["Fast Response Time", "Competitive Pricing", "Expert Consultation", "24/7 Support"].map((item, i) => (
                  <li key={i}>
                    <i className="fa-solid fa-circle-check" style={{ color: "#c1000a" }} /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="col-lg-7">
            <div style={{
              background: "#fff", borderRadius: "20px", padding: "40px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}>
              <h3 style={{ color: "#1a1a2e", fontWeight: 800, marginBottom: "24px" }}>Quick Quote Request</h3>
              <form className="row g-3">
                <div className="col-md-6">
                  <input type="text" className="form-control" placeholder="Your Name *" required
                    style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px 16px" }} />
                </div>
                <div className="col-md-6">
                  <input type="email" className="form-control" placeholder="Email Address *" required
                    style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px 16px" }} />
                </div>
                <div className="col-md-6">
                  <input type="tel" className="form-control" placeholder="Phone Number *" required
                    style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px 16px" }} />
                </div>
                <div className="col-md-6">
                  <select className="form-select"
                    style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px 16px" }}>
                    <option>Select Service *</option>
                    {services.map((s, i) => <option key={i}>{s}</option>)}
                  </select>
                </div>
                <div className="col-12">
                  <textarea className="form-control" rows={3} placeholder="Describe your shipment requirements..."
                    style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px 16px", resize: "none" }} />
                </div>
                <div className="col-12">
                  <button type="submit" className="default-btn w-100" style={{ textAlign: "center", justifyContent: "center" }}>
                    Submit Quote Request <i className="fa-regular fa-arrow-right" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
