"use client";

import { decodeHTML } from "@/lib/utils";
import Link from "next/link";

interface ServiceCTAProps {
  data: {
    heading: string;
    subHeading?: string;
    description: string;
    primaryBtnText?: string;
    primaryBtnUrl?: string;
  };
}

const ServiceCTA: React.FC<ServiceCTAProps> = ({ data }) => {
  const {
    heading,
    subHeading = "Get Started Today",
    description,
    primaryBtnText = "Get a Free Quote",
    primaryBtnUrl = "/contact",
  } = data;

  return (
    <section className="cta-section padding-bottom">
      <div className="container">
        <div className="row cta-wrapper gx-0 align-items-center">
          <div className="col-lg-8">
            <div className="section-heading white">
              <h4 className="sub-heading">{subHeading}</h4>
                <h2 dangerouslySetInnerHTML={{ __html: decodeHTML(heading) }}></h2>
              <p style={{ color: "rgba(255,255,255,0.8)", maxWidth: "500px", marginBottom: "30px" }}>
                {description}
              </p>
              <Link href={primaryBtnUrl} className="default-btn wow fade-in-bottom" data-wow-delay="200ms">
                <i className="fa-regular fa-paper-plane" style={{ marginRight: "8px" }}></i> {primaryBtnText}
              </Link>
            </div>
          </div>
          <div className="cta-men wow fade-in-bottom" data-wow-delay="200ms"></div>
        </div>
        <div className="row promo-item-wrapper gx-0">
          <div className="col-lg-4">
            <div className="promo-item">
              <i className="logis logis-truck-3"></i>
              <div className="promo-content">
                <h3>Road Freight</h3>
                <p>Pan-India transport for all cargo types.</p>
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="promo-item">
              <i className="logis logis-cruise"></i>
              <div className="promo-content">
                <h3>Ocean Freight</h3>
                <p>FCL & LCL to 150+ global ports.</p>
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="promo-item">
              <i className="logis logis-airplane-flying"></i>
              <div className="promo-content">
                <h3>Air Freight</h3>
                <p>Express air cargo worldwide.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceCTA;
