"use client";

import React from "react";
import { TSVHeading, TSVSubHeading } from "../shared/TSVHeading";

interface Partner {
  name: string;
  logo: string;
  logoAlt?: string;
}

interface PartnersMarqueeProps {
  eyebrow?: string;
  heading?: string;
  description?: string;
  partners?: Partner[];
}

export const PartnersMarquee: React.FC<PartnersMarqueeProps> = ({
  eyebrow = "Trusted By Industry Leaders",
  heading = "Our <span style='color:#c1000a;'>Partners</span>",
  description = "Collaborating with leading companies across industries to deliver world-class logistics solutions.",
  partners = [],
}) => {
  // Use provided partners or default to the known ones if empty
  const displayPartners = partners.length > 0 ? partners : [
    { name: "Amara Raja", logo: "/assets/img/members/Partners/Amara_Raja.png" },
    { name: "JK Tyre", logo: "/assets/img/members/Partners/JK-Tyre-logo.png" },
    { name: "NLC India", logo: "/assets/img/members/Partners/NLC_India_Limited.svg.png" },
    { name: "FCL", logo: "/assets/img/members/Partners/fcl.jpeg" },
    { name: "MP Birla", logo: "/assets/img/members/Partners/mpbirla.jpeg" },
    { name: "Ramco", logo: "/assets/img/members/Partners/ramco.png" },
    { name: "Value Ingredients", logo: "/assets/img/members/Partners/value-ingredients.png" }
  ];

  return (
    <section className="partners-marquee-section">
      <div className="container">
        <div className="gnp-header wow fade-in-bottom">
          <div className="gnp-eyebrow">{eyebrow}</div>
          <h2 dangerouslySetInnerHTML={{ __html: heading ?? "" }} />
          <p>{description}</p>
        </div>
      </div>

      <div className="marquee-track-wrapper">
        <div className="marquee-track" id="partnersTrack">
          {/* Duplicating for seamless loop: Set A + Set B */}
          {[...displayPartners, ...displayPartners].map((partner, index) => (
            <div className="marquee-item" key={index}>
              <img src={partner.logo} alt={partner.logoAlt || partner.name} />
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 768px) {
          h2 { font-size: 28px !important; }
          .marquee-item img { height: 50px !important; }
          .marquee-track { gap: 40px !important; padding-right: 40px !important; }
          .partners-marquee-section { padding: 40px 0 !important; }
        }
      `}</style>
    </section>
  );
};
