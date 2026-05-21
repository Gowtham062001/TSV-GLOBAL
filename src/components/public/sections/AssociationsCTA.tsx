"use client";
import React from "react";

export interface TrustItem {
  title: string;
  description: string;
  icon: string;
}

export interface AssociationsCTAProps {
  badge: string;
  heading: string;
  highlight: string;
  description: string;
  btn1Text: string;
  btn1Url: string;
  btn2Text: string;
  btn2Url: string;
  trustItems: TrustItem[];
}

export const AssociationsCTA: React.FC<AssociationsCTAProps> = ({
  badge,
  heading,
  highlight,
  description,
  btn1Text,
  btn1Url,
  btn2Text,
  btn2Url,
  trustItems
}) => {
  return (
    <section className="premium-cta-section">
      <div className="container">
        <div className="cta-inner">
          <div className="row align-items-center g-5">
            {/* Left: Main CTA */}
            <div className="col-lg-7 wow fade-in-left">
              <div className="cta-badge">
                <i className="fa-solid fa-circle"></i> {badge}
              </div>
              <h2 className="cta-main-heading">{heading}<br/>With <span>{highlight}</span></h2>
              <p className="cta-main-desc">{description}</p>
              <div className="cta-btn-group">
                <a href={btn1Url} className="cta-btn-primary">
                  <i className="fa-regular fa-paper-plane"></i> {btn1Text}
                </a>
                <a href={btn2Url} className="cta-btn-secondary">
                  <i className="fa-regular fa-circle-info"></i> {btn2Text}
                </a>
              </div>
            </div>

            {/* Divider */}
            <div className="cta-divider-line d-none d-lg-block"></div>

            {/* Right: Trust Items */}
            <div className="col-lg-4 wow fade-in-right" data-wow-delay="150ms">
              <div className="cta-trust-items">
                {trustItems?.map((item, idx) => (
                  <div className="cta-trust-item" key={idx}>
                    <div className="cta-trust-icon"><i className={item.icon}></i></div>
                    <div className="cta-trust-text">
                      <h5>{item.title}</h5>
                      <p>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .premium-cta-section {
          padding: 0; background: #0b0e14;
          position: relative; overflow: hidden;
        }
        .premium-cta-section::before {
          content: ''; position: absolute; top: -200px; right: -200px;
          width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(193, 0, 10, 0.15) 0%, transparent 70%);
          pointer-events: none;
        }
        .premium-cta-section::after {
          content: ''; position: absolute; bottom: -150px; left: -100px;
          width: 400px; height: 400px; border-radius: 50%;
          background: radial-gradient(circle, rgba(193, 0, 10, 0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .cta-inner { padding: 90px 0; position: relative; z-index: 2; }
        .cta-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(193, 0, 10, 0.15); border: 1px solid rgba(193, 0, 10, 0.35);
          padding: 7px 18px; border-radius: 30px; font-size: 11px; font-weight: 700;
          letter-spacing: 2px; color: #ff6b6b; text-transform: uppercase; margin-bottom: 24px;
        }
        .cta-badge i { font-size: 9px; color: #c1000a; }
        .cta-main-heading { font-size: 52px; font-weight: 900; color: #fff; line-height: 1.1; margin-bottom: 22px; }
        .cta-main-heading span { color: #c1000a; }
        .cta-main-desc { font-size: 16px; color: rgba(255, 255, 255, 0.65); line-height: 1.75; max-width: 540px; margin-bottom: 42px; }
        
        .cta-btn-group { display: flex; gap: 16px; flex-wrap: wrap; }
        .cta-btn-primary {
          display: inline-flex; align-items: center; gap: 10px;
          background: #c1000a; color: #fff; padding: 16px 38px;
          border-radius: 8px; font-size: 15px; font-weight: 700;
          text-decoration: none; transition: all 0.3s ease; border: 2px solid #c1000a;
        }
        .cta-btn-primary:hover {
          background: #a5000a; border-color: #a5000a; transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(193, 0, 10, 0.4); color: #fff;
        }
        .cta-btn-secondary {
          display: inline-flex; align-items: center; gap: 10px;
          background: transparent; color: #fff; padding: 16px 38px;
          border-radius: 8px; font-size: 15px; font-weight: 700;
          text-decoration: none; border: 2px solid rgba(255, 255, 255, 0.25);
          transition: all 0.3s ease;
        }
        .cta-btn-secondary:hover { border-color: #fff; background: rgba(255, 255, 255, 0.06); color: #fff; transform: translateY(-2px); }
        
        .cta-trust-items { display: flex; flex-direction: column; gap: 20px; }
        .cta-trust-item {
          display: flex; gap: 18px; align-items: flex-start;
          padding: 24px; border-radius: 14px; background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.07); transition: all 0.3s;
        }
        .cta-trust-item:hover { background: rgba(193, 0, 10, 0.1); border-color: rgba(193, 0, 10, 0.3); }
        .cta-trust-icon {
          width: 48px; height: 48px; flex-shrink: 0; border-radius: 12px;
          background: rgba(193, 0, 10, 0.15); display: flex; align-items: center;
          justify-content: center; font-size: 18px; color: #c1000a;
        }
        .cta-trust-item:hover .cta-trust-icon { background: #c1000a; color: #fff; }
        .cta-trust-text h5 { font-size: 14px; font-weight: 800; color: #fff; margin-bottom: 4px; }
        .cta-trust-text p { font-size: 12.5px; color: rgba(255, 255, 255, 0.55); line-height: 1.5; margin: 0; }
        .cta-divider-line { width: 1px; background: rgba(255, 255, 255, 0.08); align-self: stretch; margin: 0 20px; }

        @media (max-width: 991px) {
          .cta-main-heading { font-size: 32px; }
          .cta-btn-group { flex-direction: column; }
          .cta-divider-line { display: none; }
        }
      `}</style>
    </section>
  );
};
