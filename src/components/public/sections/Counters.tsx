"use client";

import React, { useEffect, useState } from "react";

interface CounterItemProps {
  count: string;
  label: string;
  icon: string;
  suffix?: string;
  delay?: string;
}

const CounterItem = ({ count, label, icon, suffix = "", delay = "200ms" }: CounterItemProps) => {
  const [currentCount, setCurrentCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(count);
    if (isNaN(end)) return;
    if (start === end) {
      setCurrentCount(end);
      return;
    }

    const totalMiliseconds = 2000;
    const incrementTime = Math.max(totalMiliseconds / end, 10);

    const timer = setInterval(() => {
      start += Math.ceil(end / 100);
      if (start >= end) {
        setCurrentCount(end);
        clearInterval(timer);
      } else {
        setCurrentCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [count]);

  return (
    <div className="counter-item wow fade-in-bottom" data-wow-delay={delay}>
      <div className="counter-icon">
        <i className={icon}></i>
      </div>
      <div className="counter-content">
        <h3>
          <span className="odometer">{currentCount}</span>
          {suffix && <span className="counter-suffix">{suffix}</span>}
        </h3>
        <h4>{label}</h4>
      </div>
    </div>
  );
};

export interface CountersProps {
  stats: Array<{ count: string; label: string; icon?: string; suffix?: string }>;
  heading?: {
    eyebrow: string;
    main: string;
    highlight: string;
    description: string;
  };
  promo_list?: Array<{ title: string; description: string; icon: string }>;
  dark?: boolean;
}

export const Counters: React.FC<CountersProps> = ({ stats, heading, promo_list, dark }) => {
  const isSimple = !heading;

  if (isSimple) {
    return (
      <section className="padding-bottom padding-top" style={{ background: "#1a1a2e" }}>
        <div className="container">
          <div className="row text-center gy-4">
            {stats.map((stat, index) => (
              <div className="col-lg-3 col-md-6 wow fade-in-bottom" data-wow-delay={`${(index * 100) + 100}ms`} key={index}>
                <div style={{ color: "#fff" }}>
                  <h2 style={{ fontSize: "52px", fontWeight: 800, color: "#c1000a", marginBottom: "5px" }}>
                    <span className="odometer">{stat.count}</span>
                    {stat.suffix || "+"}
                  </h2>
                  <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "16px" }}>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="content-features bg-dark padding">
      <div className="bg-half"></div>
      <div className="map-pattern"></div>
      <div className="container">
        <div className="counter-wrap">
          {stats.map((stat, index) => (
            <CounterItem 
              key={index} 
              count={stat.count} 
              label={stat.label} 
              icon={stat.icon || "logis logis-loader"} 
              suffix={stat.suffix} 
              delay={`${(index * 200) + 200}ms`} 
            />
          ))}
        </div>
        
        <div className="row mt-5">
          <div className="col-lg-6">
            <div className="section-heading white mb-40">
              <h3 className="sub-heading is-border border-anim">
                {heading.eyebrow}<span className="sh-underline"><img className="sh-truck" src="/img/truck.svg" alt="truck" /></span>
              </h3>
              <h2 className="text-anim" data-effect="fade-in-right" data-split="char" data-delay="0.3" data-duration="1">
                {heading.main} <br /><span className="hl">{heading.highlight}</span>
              </h2>
              <p className="text-anim" data-effect="fade-in-bottom" data-ease="power4.out">
                {heading.description}
              </p>
            </div>
            {promo_list && (
              <ul className="promo-list white mb-30">
                {promo_list.map((promo, index) => (
                  <li className="wow fade-in-bottom" data-wow-delay={`${(index * 200) + 100}ms`} key={index}>
                    <i className={promo.icon}></i>
                    <div className="promo-content">
                      <h3>{promo.title}</h3>
                      <p>{promo.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="col-lg-6 position-relative">
            {/* Tab content will be in Features component */}
          </div>
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 991px) {
          .counter-wrap { 
            display: grid !important; 
            grid-template-columns: repeat(2, 1fr) !important; 
            gap: 20px !important; 
          }
          h2 { font-size: 32px !important; }
        }
        @media (max-width: 576px) {
          .counter-wrap { 
            grid-template-columns: 1fr !important; 
          }
        }
      `}</style>
    </section>
  );
};
