import React from "react";
import Link from "next/link";
import { TSVHeading, TSVSubHeading } from "../shared/TSVHeading";

export interface CTAPromoItem {
  title: string;
  text: string;
  icon: string;
}

export interface CTAProps {
  subHeading?: string;
  eyebrow?: string; // Fallback for subHeading
  heading?: string; 
  headingPrefix?: string;
  headingHighlight?: string;
  highlight?: string; // Fallback for headingHighlight
  headingSuffix?: string;
  headingBreak?: boolean;
  description?: string;
  btnText?: string;
  btnUrl?: string;
  button?: { text: string; link: string }; // Fallback for btnText/btnUrl
  promoItems?: CTAPromoItem[];
  promo_items?: CTAPromoItem[]; // Fallback for promoItems
}

export const CTA: React.FC<CTAProps> = ({
  subHeading,
  eyebrow,
  heading,
  headingPrefix,
  headingHighlight,
  highlight,
  headingSuffix,
  headingBreak,
  description,
  btnText,
  btnUrl,
  button,
  promoItems,
  promo_items
}) => {
  const displaySubHeading = subHeading || eyebrow || "Ready to Work With Us?";
  const displayHeadingPrefix = headingPrefix || (heading && !headingHighlight && !highlight ? heading : "Let's Move Your Cargo");
  const displayHeadingHighlight = headingHighlight || highlight || "Worldwide!";
  const displayDescription = description || "Connect with our logistics experts today and get a customized shipping solution designed for your business needs.";
  const displayBtnText = btnText || button?.text || "Get a Free Quote";
  const displayBtnUrl = btnUrl || button?.link || "/contact";
  const displayPromoItems = promoItems || promo_items || [
    { title: "Road Freight", text: "Pan-India transport solutions.", icon: "logis logis-truck-3" },
    { title: "Ocean Freight", text: "FCL & LCL consolidation.", icon: "logis logis-cruise" },
    { title: "Air Freight", text: "Express worldwide.", icon: "logis logis-airplane-flying" }
  ];

  return (
    <section className="cta-section padding">
      <div className="container-fluid px-4 px-lg-0">
        <div className="row cta-wrapper gx-0">
          <div className="col-lg-6">
            <div className="section-heading white">
              {displaySubHeading && <TSVSubHeading text={displaySubHeading} />}
              
              {(displayHeadingPrefix || displayHeadingHighlight) ? (
                <TSVHeading 
                  prefix={displayHeadingPrefix}
                  highlight={displayHeadingHighlight}
                  suffix={headingSuffix}
                  hasBreak={headingBreak}
                />
              ) : (
                <h2 className="text-anim" data-effect="fade-in-right" data-split="char" data-delay="0.3" data-duration="1" style={{ color: "white" }}>
                  {heading}
                </h2>
              )}

              {displayDescription && (
                <p className="wow fade-in-bottom" data-wow-delay="150ms" style={{ color: "rgba(255,255,255,0.8)", marginBottom: "30px", fontSize: "18px", maxWidth: "550px" }}>
                  {displayDescription}
                </p>
              )}
              
              <Link href={displayBtnUrl} className="default-btn wow fade-in-bottom" data-wow-delay="200ms">
                {displayBtnText}
              </Link>
            </div>
          </div>
          <div className="cta-men wow fade-in-bottom" data-wow-delay="200ms"></div>
        </div>
        <div className="row promo-item-wrapper gx-0">
          {displayPromoItems.map((item, index) => (
            <div className="col-lg-4" key={index}>
              <div className="promo-item">
                <i className={item.icon}></i>
                <div className="promo-content">
                  <h3>{item.title}</h3>
                  <p>{item.text || (item as any).description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
