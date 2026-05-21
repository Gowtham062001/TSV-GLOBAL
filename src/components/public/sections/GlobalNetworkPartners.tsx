"use client";
import React from "react";
import Image from "next/image";
import { TSVHeading } from "../shared/TSVHeading";

interface Partner {
  name: string;
  logo: string;
  logoAlt?: string;
  description: string;
  badge: string;
}

interface GlobalNetworkPartnersProps {
  eyebrow?: string;
  heading?: string; // Fallback
  headingPrefix?: string;
  headingHighlight?: string;
  headingSuffix?: string;
  headingBreak?: boolean;
  description?: string;
  partners?: Partner[];
}

export const GlobalNetworkPartners: React.FC<GlobalNetworkPartnersProps> = ({
  eyebrow = "Credibility & Trust",
  heading,
  headingPrefix,
  headingHighlight,
  headingSuffix,
  headingBreak,
  description = "We are proud members of globally recognized logistics associations.",
  partners = [],
}) => {
  const delays = ["0s", "0.1s", "0.2s", "0.3s", "0.4s", "0.5s", "0.6s", "0.7s"];

  return (
    <section className="gnp-section padding">
      <div className="container">
        <div className="gnp-header wow fade-in-bottom">
          <div className="gnp-eyebrow">{eyebrow}</div>
          
          {(headingPrefix || headingHighlight) ? (
            <TSVHeading 
              prefix={headingPrefix}
              highlight={headingHighlight}
              suffix={headingSuffix}
              hasBreak={headingBreak}
              animAttrs={{}}
              className=""
              tag="h2"
            />
          ) : (
            <h2>{heading || "Our Global Network Partners"}</h2>
          )}
          
          <p>{description}</p>
        </div>

        <div className="gnp-grid">
          {partners.map((partner, i) => (
            <div
              key={i}
              className="gnp-card wow fade-in-bottom"
              data-wow-delay={delays[i] || "0s"}
            >
              <div className="gnp-card-logo">
                <img src={partner.logo} alt={partner.logoAlt || partner.name} />
              </div>
              <div className="gnp-card-divider"></div>
              <h3>{partner.name}</h3>
              <p>{partner.description}</p>
              <div className="gnp-badge">
                <i className="fa-solid fa-circle-check"></i>
                {partner.badge}
              </div>
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 768px) {
          .gnp-grid { 
            grid-template-columns: 1fr !important; 
            gap: 24px !important; 
          }
          .gnp-header h2 { font-size: 26px !important; text-align: left !important; }
          .gnp-header p { text-align: left !important; }
          .gnp-card { 
            padding: 40px 25px !important; 
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .gnp-card-logo {
            width: 100% !important;
            max-width: 280px !important;
            margin: 0 auto !important;
          }
          .gnp-card-divider {
            width: 60px !important;
            margin: 20px auto !important;
          }
          .gnp-card h3 { font-size: 18px !important; }
          .gnp-badge { margin: 15px auto 0 !important; }
        }
      `}</style>
    </section>
  );
};
