"use client";

import React, { useState } from "react";

export interface FeatureTab {
  id: string;
  label: string;
  title: string;
  text: string;
  image: string;
  list: string[];
}

export interface FeaturesProps {
  tabs: FeatureTab[];
}

export const Features: React.FC<FeaturesProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(tabs && tabs.length > 0 ? tabs[0].id : "");

  if (!tabs || tabs.length === 0) return null;

  return (
    <section className="padding" style={{ background: "#1a1a2e", marginTop: "-1px" }}>
      <div className="container">
        <div className="row">
          <div className="col-lg-6">
            {/* Empty for spacing as handled in index.html layout */}
          </div>
          <div className="col-lg-6 position-relative">
            <div className="feature-tab wow fade-in-bottom" data-wow-delay="200ms">
              <nav className="feature-tab-nav">
                <div className="nav nav-tabs" id="nav-tab" role="tablist">
                  {tabs.map((tab) => (
                    <button 
                      key={tab.id}
                      className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab.id)}
                      type="button" 
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </nav>
              <div className="tab-content" id="nav-tabContent">
                {tabs.map((tab) => (
                  <div key={tab.id} className={`tab-pane fade ${activeTab === tab.id ? 'active show' : ''}`}>
                    <div className="tab-inner">
                      <div className="feature-tab-content">
                        <h3>{tab.title}</h3>
                        <p>{tab.text}</p>
                        <ul className="check-list mb-20">
                          {tab.list.map((item, index) => (
                            <li key={index}><i className="fa-solid fa-check"></i>{item}</li>
                          ))}
                        </ul>
                        <a href="/services" className="default-btn">Discover More</a>
                      </div>
                      <div className="tab-thumb">
                        <img src={tab.image} alt={tab.title} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
