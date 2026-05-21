"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { TSVHeading, TSVSubHeading } from "../shared/TSVHeading";

interface Counter {
  icon: string;
  count: number;
  suffix?: string;
  label: string;
}

interface PromoItem {
  icon: string;
  title: string;
  text: string;
}

interface Tab {
  id: string;
  label: string;
  title: string;
  text: string;
  checkList?: string[];
  btnText?: string;
  btnUrl?: string;
  image: string;
  imageAlt?: string;
}

interface StatsFeaturesProps {
  counters?: Counter[];
  subHeading?: string;
  heading?: string; // Fallback
  headingPrefix?: string;
  headingHighlight?: string;
  headingSuffix?: string;
  headingBreak?: boolean;
  description?: string;
  promoItems?: PromoItem[];
  tabs?: Tab[];
}

export const StatsFeatures: React.FC<StatsFeaturesProps> = ({
  counters = [],
  subHeading,
  heading,
  headingPrefix,
  headingHighlight,
  headingSuffix,
  headingBreak,
  description,
  promoItems = [],
  tabs = [],
}) => {
  const [activeTab, setActiveTab] = useState(tabs.length > 0 ? tabs[0].id : "");

  useEffect(() => {
    const initOdometer = () => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const el = entry.target as HTMLElement;
              const count = el.getAttribute("data-count");
              if (count && !(el as any)._counted) {
                (el as any)._counted = true;
                let start = 0;
                const end = parseInt(count);
                const duration = 2000;
                const step = (end / duration) * 16;
                const timer = setInterval(() => {
                  start += step;
                  if (start >= end) {
                    el.textContent = end.toString();
                    clearInterval(timer);
                  } else {
                    el.textContent = Math.floor(start).toString();
                  }
                }, 16);
              }
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 }
      );

      document.querySelectorAll(".odometer[data-count]").forEach((el) => {
        observer.observe(el);
      });
    };
    initOdometer();
  }, []);

  return (
    <section className="content-features bg-dark padding-bottom">
      <div className="bg-half"></div>
      <div className="map-pattern"></div>
      <div className="container">
        {/* Counters row */}
        {counters.length > 0 && (
          <div className="counter-wrap">
            {counters.map((c, i) => (
              <div
                key={i}
                className="counter-item wow fade-in-bottom"
                data-wow-delay={`${i * 200 + 100}ms`}
              >
                <div className="counter-icon">
                  <i className={c.icon}></i>
                </div>
                <div className="counter-content">
                  <h3>
                    <span className="odometer" data-count={c.count}>0</span>
                    {c.suffix}
                  </h3>
                  <h4>{c.label}</h4>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Heading + promo list (left) | Feature tabs (right) */}
        <div className="row mt-5">
          <div className="col-lg-6">
            {(subHeading || heading || headingPrefix || headingHighlight) && (
              <div className="section-heading white mb-40">
                {subHeading && <TSVSubHeading text={subHeading} />}
                
                {(headingPrefix || headingHighlight) ? (
                  <TSVHeading 
                    prefix={headingPrefix}
                    highlight={headingHighlight}
                    suffix={headingSuffix}
                    hasBreak={headingBreak}
                    style={{ color: "#fff" }}
                  />
                ) : (
                  <h2 className="text-anim" data-effect="fade-in-right" data-split="char" data-delay="0.3" data-duration="1" style={{ color: "#fff" }}>
                    {heading}
                  </h2>
                )}
                
                {description && (
                  <p
                    className="text-anim"
                    data-effect="fade-in-bottom"
                    data-ease="power4.out"
                  >
                    {description}
                  </p>
                )}
              </div>
            )}

            {promoItems.length > 0 && (
              <ul className="promo-list white mb-30">
                {promoItems.map((promo, i) => (
                  <li
                    key={i}
                    className="wow fade-in-bottom"
                    data-wow-delay={`${i * 200 + 100}ms`}
                  >
                    <i className={promo.icon}></i>
                    <div className="promo-content">
                      <h3>{promo.title}</h3>
                      <p>{promo.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Feature Tabs */}
          {tabs.length > 0 && (
            <div className="col-lg-6 position-relative">
              <div
                className="feature-tab wow fade-in-bottom"
                data-wow-delay="200ms"
              >
                <nav className="feature-tab-nav">
                  <div className="nav nav-tabs" id="nav-tab" role="tablist">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        className={`nav-link ${
                          activeTab === tab.id ? "active" : ""
                        }`}
                        onClick={() => setActiveTab(tab.id)}
                        type="button"
                        role="tab"
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </nav>
                <div className="tab-content" id="nav-tabContent">
                  {tabs.map((tab) => (
                    <div
                      key={tab.id}
                      className={`tab-pane fade ${
                        activeTab === tab.id ? "active show" : ""
                      }`}
                    >
                      <div className="tab-inner">
                        <div className="feature-tab-content">
                          <h3>{tab.title}</h3>
                          <p>{tab.text}</p>
                          {tab.checkList && tab.checkList.length > 0 && (
                            <ul className="check-list mb-20">
                              {tab.checkList.map((item, idx) => (
                                <li key={idx}>
                                  <i className="fa-solid fa-check"></i>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          )}
                          <Link
                            href={tab.btnUrl || "/services"}
                            className="default-btn"
                          >
                            {tab.btnText || "Discover More"}
                          </Link>
                        </div>
                        <div className="tab-thumb" style={{ position: "relative", width: "160px", height: "160px" }}>
                          <Image src={tab.image} alt={tab.imageAlt || tab.title} fill style={{ objectFit: "cover", borderRadius: "12px" }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
