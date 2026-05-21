import React from "react";

export interface MarqueeProps {
  items: string[];
}

export const Marquee: React.FC<MarqueeProps> = ({ items }) => {
  const defaultItems = [
    "Trusted By All Over The World",
    "Cost Efficient Transportation",
    "Leading Global Logistic Company",
    "100% Safe And Secure Delivery"
  ];
  
  const displayItems = items && items.length > 0 ? items : defaultItems;

  return (
    <section className="running-text" style={{ padding: "0", marginBottom: "-5px" }}>
      <div className="premium-marquee" style={{ padding: "15px 0" }}>
        <ul className="marquee-content">
          {displayItems.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <ul className="marquee-content" aria-hidden="true">
          {displayItems.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
};
