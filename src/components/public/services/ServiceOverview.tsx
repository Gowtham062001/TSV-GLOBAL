"use client";

import { decodeHTML } from "@/lib/utils";
import Link from "next/link";

interface ServiceOverviewProps {
  data: {
    image: string;
    imageAlt?: string;
    badge?: string;
    badgeIcon?: string;
    subHeading?: string;
    heading: string;
    paragraphs: string[];
    featureList?: { icon: string; text: string }[];
    ctaText?: string;
    ctaUrl?: string;
  };
}

const ServiceOverview: React.FC<ServiceOverviewProps> = ({ data }) => {
  const {
    image,
    imageAlt,
    badge = "Our Services",
    badgeIcon = "fa-regular fa-boxes-stacked",
    subHeading,
    heading,
    paragraphs = [],
    featureList = [],
    ctaText = "Request a Quote",
    ctaUrl = "/contact",
  } = data;

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
                <i className={badgeIcon} style={{ marginRight: "8px" }}></i> {badge}
              </div>
            </div>
          </div>
          <div className="col-lg-6 wow fade-in-right" data-wow-delay="300ms">
            <div className="section-heading mb-25">
              <h4 className="sub-heading">{subHeading || badge}</h4>
                <h2 dangerouslySetInnerHTML={{ __html: decodeHTML(heading) }}></h2>
            </div>
            {paragraphs.map((p, i) => (
              <p
                key={i}
                style={{ marginBottom: i === paragraphs.length - 1 ? "25px" : "15px" }}
                  dangerouslySetInnerHTML={{ __html: decodeHTML(p) }}
              ></p>
            ))}
            {featureList.length > 0 && (
              <ul className="check-list mb-20">
                {featureList.map((item, i) => (
                  <li key={i}>
                    <i className={item.icon || "fa-solid fa-check"}></i> {item.text}
                  </li>
                ))}
              </ul>
            )}
            <Link href={ctaUrl} className="default-btn mt-10">
              {ctaText} <i className="fa-regular fa-arrow-right-long" style={{ marginLeft: "6px" }}></i>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceOverview;
