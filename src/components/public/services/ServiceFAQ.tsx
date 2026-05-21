"use client";

import React, { useState } from "react";
import { decodeHTML } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
}

interface ServiceFAQProps {
  data: {
    subHeading?: string;
    heading: string;
    faq: FAQItem[];
  };
}

const ServiceFAQ: React.FC<ServiceFAQProps> = ({ data }) => {
  const { subHeading = "Have Questions?", heading, faq = [] } = data;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="padding" style={{ background: "#fff" }}>
      <div className="container">
        <div className="section-heading text-center mb-50 wow fade-in-bottom" data-wow-delay="200ms">
          <h4 className="sub-heading">{subHeading}</h4>
          <h2 dangerouslySetInnerHTML={{ __html: decodeHTML(heading) }}></h2>
        </div>
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div className="faq-accordion" id="faqAccordion">
              {faq.map((item, i) => (
                <div
                  key={i}
                  className="faq-item wow fade-in-bottom"
                  data-wow-delay={`${(i + 1) * 50}ms`}
                  style={{
                    border: "1px solid #e8e8e8",
                    borderRadius: "10px",
                    marginBottom: "14px",
                    overflow: "hidden",
                  }}
                >
                  <button
                    className="faq-btn"
                    onClick={() => toggleFaq(i)}
                    style={{
                      width: "100%",
                      background: activeIndex === i ? "#f9f9f9" : "#fff",
                      border: "none",
                      padding: "22px 28px",
                      textAlign: "left",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "#1a1a2e",
                      transition: "background 0.3s",
                    }}
                  >
                    {item.question}
                    <span
                      className="faq-icon"
                      style={{
                        width: "34px",
                        height: "34px",
                        background: "#c1000a",
                        borderRadius: "50%",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "transform 0.3s",
                        transform: activeIndex === i ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    >
                      <i
                        className={activeIndex === i ? "fa-regular fa-minus" : "fa-regular fa-plus"}
                        style={{ color: "#fff", fontSize: "14px" }}
                      ></i>
                    </span>
                  </button>
                  <div
                    className="faq-body"
                    style={{
                      display: activeIndex === i ? "block" : "none",
                      padding: "0 28px 22px",
                    }}
                  >
                    <p
                      style={{
                        color: "#555",
                        fontSize: "15px",
                        lineHeight: 1.8,
                        margin: 0,
                      }}
                    >
                      {item.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceFAQ;
