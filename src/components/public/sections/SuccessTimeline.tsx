"use client";

import React, { useEffect, useRef, useState } from "react";

export interface Milestone {
  year: string;
  title: string;
  description: string;
  image: string;
}

export interface SuccessTimelineProps {
  milestones: Milestone[];
}

export const SuccessTimeline: React.FC<SuccessTimelineProps> = ({ milestones }) => {
  const [activeYear, setActiveYear] = useState(milestones && milestones.length > 0 ? milestones[0].year : "");
  const containerRef = useRef<HTMLDivElement>(null);
  const [progressHeight, setProgressHeight] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      if (rect.top < windowHeight / 2) {
        const scrolled = Math.abs(rect.top - windowHeight / 2);
        const total = rect.height;
        const progress = Math.min(Math.max((scrolled / total) * 100, 0), 100);
        setProgressHeight(progress);
      } else {
        setProgressHeight(0);
      }

      const segments = containerRef.current.querySelectorAll('.year-segment');
      segments.forEach((segment) => {
        const segRect = segment.getBoundingClientRect();
        if (segRect.top < windowHeight / 2 && segRect.bottom > windowHeight / 2) {
          const year = segment.getAttribute('data-year') || "";
          setActiveYear(year);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [milestones]);

  return (
    <section className="story-section" ref={containerRef} style={{ background: "#fff", position: "relative", overflow: "hidden" }}>
      <div className="story-bg-layer" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "#fff", zIndex: 1 }}></div>
      
      <div className="story-line" style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: "4px", background: "rgba(237, 34, 36, 0.1)", transform: "translateX(-50%)", zIndex: 2 }}>
        <div 
          className="story-line-progress"
          style={{ position: "absolute", left: 0, top: 0, width: "100%", background: "#ED2224", boxShadow: "0 0 15px rgba(237, 34, 36, 0.5)", transition: "height 0.1s ease-out", height: `${progressHeight}%` }}
        ></div>
      </div>

      <div className="container" style={{ position: "relative", zIndex: 5 }}>
        {milestones?.map((milestone, index) => {
          const isEven = index % 2 === 0;
          return (
            <div 
              key={index} 
              className={`year-segment ${activeYear === milestone.year ? 'active' : ''}`}
              data-year={milestone.year}
              style={{ position: "relative", minHeight: "80vh", display: "flex", alignItems: "center", padding: "80px 0" }}
            >
              <div className={`row w-100 align-items-center ${!isEven ? 'flex-row-reverse' : ''}`}>
                <div className="col-lg-6">
                  <div className="story-visual" style={{ position: "relative", zIndex: 10, padding: isEven ? "0 100px 0 0" : "0 0 0 100px" }}>
                    <div className="story-img-frame" style={{ borderRadius: "20px", overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,0.1)", background: "#f8f9fa", border: "8px solid #fff" }}>
                      <img 
                        src={milestone.image} 
                        alt={milestone.title} 
                        style={{ width: "100%", height: "480px", objectFit: "cover", display: "block" }}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="story-text" style={{ padding: isEven ? "0 0 0 100px" : "0 100px 0 0", position: "relative", textAlign: isEven ? "left" : "right" }}>
                    <span className="year-title-main" style={{
                      fontSize: "160px",
                      fontWeight: "900",
                      color: "#ED2224",
                      lineHeight: "0.8",
                      marginBottom: "25px",
                      letterSpacing: "-6px",
                      opacity: "0.15",
                      display: "block",
                      position: "absolute",
                      top: "-60px",
                      [isEven ? "left" : "right"]: "20px",
                      zIndex: -1,
                      pointerEvents: "none"
                    }}>
                      {milestone.year}
                    </span>
                    <h3 className="milestone-label" style={{ 
                      fontSize: "42px", 
                      fontWeight: "800", 
                      color: "#2C368F", 
                      marginBottom: "20px",
                      position: "relative"
                    }}>
                      {milestone.title}
                    </h3>
                    <p className="story-desc" style={{ 
                      fontSize: "19px", 
                      lineHeight: "1.8",
                      color: "#444", 
                      maxWidth: "520px",
                      fontWeight: "500",
                      marginLeft: isEven ? "0" : "auto"
                    }}>
                      {milestone.description}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Timeline Marker */}
              <div className="story-marker" style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: "50px",
                height: "50px",
                transform: "translate(-50%, -50%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
                background: "#fff",
                border: "4px solid #ED2224",
                borderRadius: "50%",
                boxShadow: "0 4px 15px rgba(237, 34, 36, 0.4)",
                transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
              }}>
                {/* Dot is handled by .story-marker::after in critical-sections.css */}
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @media (max-width: 991px) {
          .story-line { left: 30px !important; transform: translateX(-50%) !important; }
          .year-segment { padding: 40px 0 60px !important; min-height: auto !important; }
          .story-visual, .story-text { width: 100% !important; padding: 0 20px 0 80px !important; text-align: left !important; }
          .year-title-main { position: relative !important; font-size: 70px !important; top: 0 !important; left: 0 !important; right: auto !important; opacity: 0.15 !important; }
          .milestone-label { font-size: 26px !important; }
          .story-desc { font-size: 15px !important; max-width: 100% !important; margin: 0 !important; }
          .story-marker { left: 30px !important; transform: translate(-50%, -50%) !important; top: 45px !important; }
          .story-img-frame img { height: 280px !important; }
          .row { margin: 0 !important; width: 100% !important; }
        }
        .year-segment.active .milestone-label { color: #ED2224 !important; }
      `}</style>
    </section>
  );
};
