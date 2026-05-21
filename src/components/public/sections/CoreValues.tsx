"use client";

import React from "react";

export interface CoreValueItem {
  title: string;
  icon: string;
  delay: string;
}

export interface CoreValuesProps {
  heading: string;
  highlight: string;
  subheading: string;
  values: CoreValueItem[];
}

export const CoreValues: React.FC<CoreValuesProps> = ({ heading, highlight, subheading, values }) => {
  return (
    <section className="padding" style={{ background: "#f8f9fa", position: "relative" }}>
      <div className="container">
        <div className="row align-items-center gy-5">
          <div className="col-lg-4 wow fade-in-left" data-wow-delay="100ms">
            <h2 style={{ fontSize: "52px", color: "#1a1a2e", fontWeight: 800, lineHeight: 1.1, marginBottom: "15px", letterSpacing: "-1px" }}>
              Our <br />Core Values
            </h2>
            <p style={{ fontSize: "20px", color: "#323c92", fontWeight: 600, lineHeight: 1.4 }}>Integral to our way of working</p>
            <div style={{ width: "60px", height: "4px", background: "#c1000a", marginTop: "25px", borderRadius: "2px" }}></div>
          </div>
          <div className="col-lg-8">
            <div className="row gy-4">
              {values?.map((val, index) => (
                <div className="col-md-4 col-sm-6 wow fade-in-bottom" data-wow-delay={val.delay} key={index}>
                  <div className="core-value-card">
                    <div className="cv-icon"><i className={val.icon}></i></div>
                    <h3>{val.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .core-value-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 40px 20px;
          text-align: center;
          box-shadow: 0 8px 25px rgba(0,0,0,0.03);
          transition: all 0.3s ease;
          border: 1px solid #f0f0f5;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          z-index: 1;
        }
        .core-value-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: #1a1a2e;
          z-index: -1;
          transform: scaleY(0);
          transform-origin: bottom;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .core-value-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 40px rgba(26,26,46,0.1);
          border-color: #1a1a2e;
        }
        .core-value-card:hover::before {
          transform: scaleY(1);
        }
        .cv-icon {
          width: 75px;
          height: 75px;
          background: rgba(193,0,10,0.06);
          color: #c1000a;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          margin-bottom: 22px;
          transition: all 0.4s ease;
        }
        .core-value-card:hover .cv-icon {
          background: #c1000a;
          color: #ffffff;
          transform: rotateY(360deg);
        }
        .core-value-card h3 {
          font-size: 19px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0;
          transition: color 0.4s ease;
        }
        .core-value-card:hover h3 {
          color: #ffffff;
        }
      `}</style>
    </section>
  );
};
