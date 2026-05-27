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
    { name: "Amara Raja", logo: "https://res.cloudinary.com/dpjfe67wh/image/upload/v1779862628/tsvglobal/gallery/partners/1779862628437-amara-raja.png" },
    { name: "JK Tyre", logo: "https://res.cloudinary.com/dpjfe67wh/image/upload/v1779862630/tsvglobal/gallery/partners/1779862629547-jk-tyre-logo.png" },
    { name: "NLC India", logo: "https://res.cloudinary.com/dpjfe67wh/image/upload/v1779862631/tsvglobal/gallery/partners/1779862630800-nlc-india-limited-svg.png" },
    { name: "FCL", logo: "https://res.cloudinary.com/dpjfe67wh/image/upload/v1779862632/tsvglobal/gallery/partners/1779862632089-fcl.jpg" },
    { name: "MP Birla", logo: "https://res.cloudinary.com/dpjfe67wh/image/upload/v1779862633/tsvglobal/gallery/partners/1779862633156-mpbirla.jpg" },
    { name: "Ramco", logo: "https://res.cloudinary.com/dpjfe67wh/image/upload/v1779862634/tsvglobal/gallery/partners/1779862634226-ramco.webp" },
    { name: "Value Ingredients", logo: "https://res.cloudinary.com/dpjfe67wh/image/upload/v1779862635/tsvglobal/gallery/partners/1779862635193-value-ingredients.png" }
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
          .marquee-item img { height: 80px !important; max-height: 80px !important; }
          .marquee-track { gap: 40px !important; padding-right: 40px !important; }
          .partners-marquee-section { padding: 40px 0 !important; }
        }
      `}</style>
    </section>
  );
};
