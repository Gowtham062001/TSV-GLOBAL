import React from "react";

export interface PartnerItem {
  name: string;
  description: string;
  logo: string;
  badge: string;
}

export interface PartnersGridProps {
  eyebrow: string;
  heading: string;
  highlight: string;
  description: string;
  partners: PartnerItem[];
}

export const PartnersGrid: React.FC<PartnersGridProps> = ({
  eyebrow,
  heading,
  highlight,
  description,
  partners
}) => {
  return (
    <section className="gnp-section">
      <div className="container">
        <div className="gnp-header wow fade-in-bottom">
          <div className="gnp-eyebrow">{eyebrow}</div>
          <h2>{heading} <span style={{ color: "#c1000a" }}>{highlight}</span></h2>
          <p>{description}</p>
        </div>

        <div className="gnp-grid">
          {partners?.map((p, index) => (
            <div className="gnp-card wow fade-in-bottom" data-wow-delay={`${(index + 1) * 80}ms`} key={index}>
              <div className="gnp-card-logo">
                <img src={p.logo} alt={p.name} />
              </div>
              <div className="gnp-card-divider"></div>
              <h3>{p.name}</h3>
              <p>{p.description}</p>
              <span className="gnp-badge"><i className="fa-solid fa-circle-check"></i> {p.badge}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
