"use client";
import React from "react";

export interface AdvantageFeature {
  title: string;
  description: string;
  icon: string;
}

export interface StatItem {
  number: string;
  suffix: string;
  label: string;
}

export interface AssociationsAdvantagesProps {
  eyebrow: string;
  heading: string;
  highlight: string;
  description: string;
  features: AdvantageFeature[];
  stats: StatItem[];
}

export const AssociationsAdvantages: React.FC<AssociationsAdvantagesProps> = ({
  eyebrow,
  heading,
  highlight,
  description,
  features,
  stats
}) => {
  return (
    <section className="adv-section">
      <div className="container">
        <div className="row align-items-center g-5">
          {/* Left: Content */}
          <div className="col-lg-7">
            <div className="adv-eyebrow">Client Advantages</div>
            <h2 className="adv-heading">Why Our Associations <span>Matter</span><br />to Your Business</h2>
            <p className="adv-subtext">Our verified memberships and global partnerships translate directly into measurable benefits for your shipments — from faster transit times to complete risk mitigation.</p>

            {/* Feature Cards */}
            <div className="adv-features-list">
              {features?.map((feature, idx) => (
                <div className="adv-feature-card wow fade-in-left" key={idx} data-wow-delay={`${idx * 0.1}s`}>
                  <div className="adv-icon-wrap">
                    <i className={feature.icon}></i>
                  </div>
                  <div className="adv-feature-text">
                    <h4>{feature.title}</h4>
                    <p>{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Stats Strip */}
          <div className="col-lg-5">
            <div className="adv-stats-strip wow fade-in-right">
              {stats?.map((stat, idx) => (
                <div className="adv-stat-item" key={idx}>
                  <div className="adv-stat-number">{stat.number}<span>{stat.suffix}</span></div>
                  <div className="adv-stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .adv-section {
          padding: 100px 0;
          background: #fff;
          position: relative;
          overflow: hidden;
        }
        .adv-section::before {
          content: '';
          position: absolute;
          top: 0; left: 0; width: 50%; height: 100%;
          background: #f8f9fc;
          clip-path: polygon(0 0, 90% 0, 100% 100%, 0 100%);
          z-index: 0;
        }
        .adv-section > .container { position: relative; z-index: 1; }
        .adv-eyebrow {
          display: inline-flex; align-items: center; gap: 10px;
          font-size: 12px; font-weight: 800; letter-spacing: 3px;
          color: #c1000a; text-transform: uppercase; margin-bottom: 20px;
        }
        .adv-eyebrow::before { content: ''; width: 28px; height: 2px; background: #c1000a; border-radius: 2px; }
        .adv-heading { font-size: 44px; font-weight: 800; color: #1a1a2e; line-height: 1.15; margin-bottom: 20px; }
        .adv-heading span { color: #c1000a; }
        .adv-subtext { font-size: 16px; color: #64748b; line-height: 1.7; margin-bottom: 50px; max-width: 520px; }
        
        .adv-feature-card {
          display: flex; gap: 24px; align-items: flex-start;
          padding: 30px; border-radius: 20px; background: #fff;
          border: 1px solid #f1f5f9; margin-bottom: 20px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative; overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .adv-feature-card::before {
          content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px;
          background: #c1000a;
          transform: scaleY(0); transform-origin: bottom; transition: transform 0.4s ease;
        }
        .adv-feature-card:hover {
          box-shadow: 0 20px 40px rgba(26, 26, 46, 0.1);
          transform: translateY(-5px); border-color: transparent;
        }
        .adv-feature-card:hover::before { transform: scaleY(1); }
        .adv-icon-wrap {
          width: 60px; height: 60px; flex-shrink: 0; background: #fef2f2;
          border-radius: 14px; display: flex; align-items: center; justify-content: center;
          font-size: 24px; color: #c1000a; transition: all 0.3s ease;
        }
        .adv-feature-card:hover .adv-icon-wrap { background: #c1000a; color: #fff; transform: scale(1.1); }
        .adv-feature-text h4 { font-size: 17px; font-weight: 800; color: #1a1a2e; margin-bottom: 8px; }
        .adv-feature-text p { font-size: 14.5px; color: #64748b; line-height: 1.6; margin: 0; }
        
        .adv-stats-strip {
          display: flex; flex-direction: column; gap: 0;
          border-radius: 24px; overflow: hidden;
          box-shadow: 0 40px 80px rgba(26, 26, 46, 0.18);
        }
        .adv-stat-item {
          padding: 40px 45px; background: #1a1a2e;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.3s ease;
        }
        .adv-stat-item:last-child { border-bottom: none; }
        .adv-stat-item:hover { background: #c1000a; transform: scale(1.02); z-index: 10; }
        .adv-stat-number { font-size: 52px; font-weight: 900; color: #fff; line-height: 1; margin-bottom: 8px; }
        .adv-stat-number span { color: #c1000a; font-size: 36px; transition: color 0.3s; }
        .adv-stat-item:hover .adv-stat-number span { color: #fff; }
        .adv-stat-label {
          font-size: 12px; font-weight: 700; letter-spacing: 2.5px;
          text-transform: uppercase; color: rgba(255, 255, 255, 0.5);
        }
        .adv-stat-item:hover .adv-stat-label { color: rgba(255, 255, 255, 0.9); }

        @media (max-width: 991px) {
          .adv-section::before { display: none; }
          .adv-heading { font-size: 30px; }
          .adv-stats-strip { flex-direction: row; flex-wrap: wrap; }
          .adv-stat-item { flex: 1 1 50%; padding: 24px 20px; }
          .adv-stat-number { font-size: 32px; }
        }
        @media (max-width: 575px) {
          .adv-stat-item { flex: 1 1 100%; }
        }
      `}</style>
    </section>
  );
};
