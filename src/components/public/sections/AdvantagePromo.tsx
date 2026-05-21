import React from "react";

export interface AdvantageItem {
  title: string;
  text: string;
  icon: string;
}

export interface AdvantagePromoProps {
  eyebrow: string;
  heading: string;
  highlight: string;
  image: string;
  advantages: AdvantageItem[];
}

export const AdvantagePromo: React.FC<AdvantagePromoProps> = ({ eyebrow, heading, highlight, image, advantages }) => {
  return (
    <section className="padding" style={{ background: "#1a1a2e" }}>
      <div className="container">
        <div className="section-heading text-center mb-40 wow fade-in-bottom" data-wow-delay="200ms">
          <h4 className="sub-heading" style={{ color: "#c1000a" }}>{eyebrow}</h4>
          <h2 style={{ color: "#fff" }}>{heading} <span style={{ color: "#c1000a" }}>{highlight}</span></h2>
        </div>
        <div className="row gy-4 align-items-center">
          <div className="col-lg-6 wow fade-in-left" data-wow-delay="300ms">
            <img src={image} alt="Why TSV"
              style={{ width: "100%", borderRadius: "10px" }} />
          </div>
          <div className="col-lg-6 wow fade-in-right" data-wow-delay="400ms">
            <div className="promo-list">
              <ul style={{ listStyle: "none", padding: 0 }}>
                {advantages?.map((adv, index) => (
                  <li style={{ marginBottom: "25px", display: "flex", alignItems: "flex-start", gap: "16px" }} key={index}>
                    <div style={{ minWidth: "50px", height: "50px", background: "#c1000a", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className={adv.icon} style={{ fontSize: "22px", color: "#fff" }}></i>
                    </div>
                    <div className="promo-content">
                      <h3 style={{ color: "#fff", fontSize: "18px", fontWeight: 700, margin: "0 0 5px" }}>{adv.title}</h3>
                      <p style={{ color: "rgba(255,255,255,0.7)", margin: 0 }}>{adv.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
