"use client";

import React from "react";

export interface ServiceOverviewProps {
  eyebrow: string;
  heading: string;
  highlight?: string;
  paragraphs: string[];
  checklist: { icon: string; text: string }[];
  image: string;
  imageAlt?: string;
  badgeText: string;
  badgeIcon?: string;
}

export const ServiceOverview: React.FC<ServiceOverviewProps> = ({
  eyebrow,
  heading,
  highlight,
  paragraphs,
  checklist,
  image,
  imageAlt,
  badgeText,
  badgeIcon,
}) => {
  return (
    <section className="padding" style={{ background: "#fff" }}>
      <div className="container">
        <div className="row align-items-center gy-4">
          <div className="col-lg-6 wow fade-in-left" data-wow-delay="200ms">
            <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden" }}>
              <img
                src={image}
                alt={imageAlt || heading}
                style={{ width: "100%", borderRadius: "12px", display: "block", objectFit: "cover" }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "20px",
                  left: "20px",
                  background: "#c1000a",
                  color: "#fff",
                  padding: "12px 22px",
                  borderRadius: "6px",
                  fontWeight: 700,
                  fontSize: "16px",
                }}
              >
                {badgeIcon && <i className={badgeIcon} style={{ marginRight: "8px" }}></i>}
                {badgeText}
              </div>
            </div>
          </div>
          <div className="col-lg-6 wow fade-in-right" data-wow-delay="300ms">
            <div className="section-heading mb-25">
              <h4 className="sub-heading">{eyebrow}</h4>
              <h2>
                {heading} {highlight && <span className="hl">{highlight}</span>}
              </h2>
            </div>
            {paragraphs.map((p, index) => (
              <p
                key={index}
                style={{ marginBottom: index === paragraphs.length - 1 ? "25px" : "15px" }}
                dangerouslySetInnerHTML={{ __html: p }}
              ></p>
            ))}
            <ul className="check-list mb-20">
              {checklist.map((item, index) => (
                <li key={index}>
                  <i className={item.icon} style={{ color: "#c1000a", marginRight: "8px" }}></i>
                  <span dangerouslySetInnerHTML={{ __html: item.text }}></span>
                </li>
              ))}
            </ul>
            <a href="/contact" className="default-btn mt-10">
              Request a Quote <i className="fa-regular fa-arrow-right-long" style={{ marginLeft: "6px" }}></i>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
