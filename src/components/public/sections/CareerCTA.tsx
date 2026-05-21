"use client";
import React from "react";

export interface CareerCTAProps {
  badge?: string;
  heading: string;
  description: string;
  button_text: string;
  email: string;
}

export const CareerCTA: React.FC<CareerCTAProps> = ({
  badge,
  heading,
  description,
  button_text,
  email,
}) => {
  return (
    <section className="padding" style={{ background: "#f8f9fa", textAlign: "center" }}>
      <div className="container">
        <div 
          className="wow fade-in-bottom" 
          data-wow-delay="200ms"
          style={{
            background: "#fff",
            padding: "60px 40px",
            borderRadius: "20px",
            boxShadow: "0 10px 50px rgba(0,0,0,0.05)",
            maxWidth: "900px",
            margin: "0 auto"
          }}
        >
          {badge && (
            <span 
              style={{ 
                color: "#c1000a", 
                fontWeight: "700", 
                fontSize: "14px", 
                letterSpacing: "1px", 
                textTransform: "uppercase",
                display: "block",
                marginBottom: "15px"
              }}
            >
              {badge}
            </span>
          )}
          <h2 style={{ fontSize: "36px", color: "#1a1a2e", marginBottom: "20px", fontWeight: "800" }}>
            {heading}
          </h2>
          <p style={{ fontSize: "17px", color: "#666", marginBottom: "35px", maxWidth: "700px", margin: "0 auto 35px", lineHeight: "1.7" }}>
            {description}
          </p>
          <a 
            href={`mailto:${email}`} 
            className="default-btn"
            style={{ 
              background: "#c1000a", 
              color: "#fff", 
              padding: "16px 40px", 
              borderRadius: "8px", 
              fontWeight: "700", 
              fontSize: "16px",
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              textDecoration: "none",
              transition: "all 0.3s ease"
            }}
          >
            <i className="fa-regular fa-paper-plane"></i> {button_text}
          </a>
        </div>
      </div>
      <style jsx>{`
        .default-btn:hover {
          background: #1a1a2e !important;
          transform: translateY(-3px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        @media (max-width: 768px) {
          h2 { font-size: 28px !important; }
          .padding { padding: 60px 0 !important; }
        }
      `}</style>
    </section>
  );
};
