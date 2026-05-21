"use client";

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ServiceFAQProps {
  eyebrow?: string;
  heading?: string;
  highlight?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  faqs?: FAQItem[];
}

export const ServiceFAQ: React.FC<ServiceFAQProps> = ({
  eyebrow = "Have Questions?",
  heading = "Frequently Asked",
  highlight = "Questions",
  faqs = [],
}) => {
  const [openIndex, setOpenIndex] = useState<number>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section className="padding" style={{ background: "#fff" }}>
      <div className="container">
        <div className="section-heading text-center mb-50 wow fade-in-bottom" data-wow-delay="200ms">
          {eyebrow && <h4 className="sub-heading">{eyebrow}</h4>}
          <h2>
            {heading} <span className="hl">{highlight}</span>
          </h2>
        </div>
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div className="faq-accordion" id="faqAccordion">
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className="faq-item wow fade-in-bottom" 
                  data-wow-delay={`${(index + 1) * 50}ms`}
                  style={{ 
                    border: "1px solid #e8e8e8", 
                    borderRadius: "10px", 
                    marginBottom: index === faqs.length - 1 ? 0 : "14px", 
                    overflow: "hidden"
                  }}
                >
                  <button 
                    className="faq-btn" 
                    onClick={() => toggleFaq(index)}
                    style={{ 
                      width: "100%", 
                      background: "#fff", 
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
                      transition: "background 0.3s"
                    }}
                  >
                    {faq.question}
                    <span 
                      className="faq-icon"
                      style={{ 
                        width: "34px", 
                        height: "34px", 
                        background: openIndex === index ? "#1a1a2e" : "#c1000a", 
                        borderRadius: "50%", 
                        display: "inline-flex", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        flexShrink: 0, 
                        transition: "all 0.3s ease",
                        transform: openIndex === index ? "rotate(180deg)" : "rotate(0)"
                      }}
                    >
                      {openIndex === index ? (
                        <Minus size={14} color="#fff" />
                      ) : (
                        <Plus size={14} color="#fff" />
                      )}
                    </span>
                  </button>
                  <div 
                    className="faq-body" 
                    style={{ 
                      display: openIndex === index ? "block" : "none", 
                      padding: "0 28px 22px" 
                    }}
                  >
                    <p style={{ color: "#555", fontSize: "15px", lineHeight: 1.8, margin: 0 }} dangerouslySetInnerHTML={{ __html: faq.answer }}></p>
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
