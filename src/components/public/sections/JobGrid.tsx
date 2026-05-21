"use client";

import React from "react";

export interface Job {
  id: string;
  title: string;
  type: string;
  location: string;
  experience: string;
  description: string;
  link: string;
  icon: string;
  isExpired?: boolean;
  borderColor: string;
  iconBg: string;
}

export interface JobGridProps {
  eyebrow?: string;
  heading?: string;
  highlight?: string;
  jobs: Job[];
}

export function JobGrid({ 
  eyebrow = "We're Hiring", 
  heading = "Current", 
  highlight = "Job Openings", 
  jobs = [] 
}: JobGridProps) {
  const getBorderColor = (idx: number, custom?: string) => custom || (idx % 2 === 0 ? "#2C368F" : "#ED2224");
  const getIconBg = (idx: number, custom?: string) => custom || (idx % 2 === 0 ? "rgba(44, 54, 143, 0.08)" : "rgba(237, 34, 36, 0.08)");

  return (
    <section className="padding" style={{ background: "#f8f9fa" }}>
      <div className="container">
        <div className="section-heading text-center mb-50 wow fade-in-bottom" data-wow-delay="200ms">
          <h4 className="sub-heading">{eyebrow}</h4>
          <h2>{heading} <span className="hl">{highlight}</span></h2>
        </div>
        <div className="row gy-4">
          {jobs && jobs.map((job, index) => {
            const borderColor = getBorderColor(index, job.borderColor);
            const iconBg = getIconBg(index, job.iconBg);
            return (
              <div className="col-lg-6 wow fade-in-bottom" data-wow-delay={`${(index + 1) * 100}ms`} key={job.id}>
                <div
                  style={{
                    background: "#fff",
                    borderRadius: "12px",
                    padding: "28px",
                    boxShadow: "0 5px 25px rgba(0,0,0,0.06)",
                    borderLeft: `4px solid ${borderColor}`,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "18px",
                    height: "100%"
                  }}
                >
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      background: iconBg,
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}
                  >
                    <i className={`fa-regular ${job.icon || 'fa-briefcase'}`} style={{ color: borderColor, fontSize: "24px" }}></i>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "8px",
                        marginBottom: "8px"
                      }}
                    >
                      <h4 style={{ margin: 0, fontSize: "18px", color: "#2C368F" }}>{job.title}</h4>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {job.isExpired && (
                          <span
                            style={{
                              background: "#666",
                              color: "#fff",
                              fontSize: "11px",
                              fontWeight: "700",
                              padding: "4px 12px",
                              borderRadius: "20px"
                            }}
                          >
                            Expired
                          </span>
                        )}
                        <span
                          style={{
                            background: index % 2 === 0 ? "#2C368F" : "#ED2224",
                            color: "#fff",
                            fontSize: "11px",
                            fontWeight: "700",
                            padding: "4px 12px",
                            borderRadius: "20px"
                          }}
                        >
                          {job.type}
                        </span>
                      </div>
                    </div>
                    <p style={{ color: "#888", fontSize: "13px", marginBottom: "12px" }}>
                      <i className="fa-regular fa-location-dot" style={{ color: "#ED2224", marginRight: "5px" }}></i>
                      {job.location} &nbsp;|&nbsp; 
                      <i className="fa-regular fa-briefcase" style={{ color: "#ED2224", marginRight: "5px" }}></i>
                      {job.experience}
                    </p>
                    <p style={{ color: "#555", fontSize: "14px", marginBottom: "16px" }}>{job.description}</p>
                    {!job.isExpired && (
                      <a href={job.link || `mailto:cs@tsvglobal.com?subject=Application - ${job.title}`} style={{ color: "#ED2224", fontWeight: "700", fontSize: "13.5px", textDecoration: "none" }}>
                        Apply Now <i className="fa-regular fa-arrow-right-long" style={{ marginLeft: "5px" }}></i>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
