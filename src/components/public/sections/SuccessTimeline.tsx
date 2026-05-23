"use client";

import React, { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
export interface Milestone {
  year: string;
  title: string;
  description?: string;   // DB stores a single description string
  points?: string[];       // or an array of bullet points
  image?: string;
}

export interface SuccessTimelineProps {
  milestones: Milestone[];
}

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
/** Convert description string → array of bullet points */
function toPoints(m: Milestone): string[] {
  if (m.points && m.points.length > 0) return m.points;
  if (m.description) {
    // Split on sentence boundaries or comma lists
    return m.description
      .split(/\.\s+|,\s+(?=[A-Z])/)
      .map(s => s.replace(/\.$/, "").trim())
      .filter(Boolean);
  }
  return [m.title];
}

/* ─────────────────────────────────────────────
   ROAD PATH (SVG viewBox 1400 × 560)
   Rises from bottom-left → top-right
───────────────────────────────────────────── */
const ROAD_PATH =
  "M -20 530 C 120 530, 220 460, 380 390 S 600 290, 800 230 S 1050 145, 1250 95 S 1370 75, 1420 70";

/** 6 pin positions along the road curve, manually tuned */
const PIN_POSITIONS = [
  { x: 55,   y: 500 }, // 2015
  { x: 245,  y: 425 }, // 2016-20
  { x: 470,  y: 340 }, // 2021-23
  { x: 710,  y: 255 }, // 2024
  { x: 970,  y: 178 }, // 2025
  { x: 1230, y: 110 }, // 2026
];

/** Alternating label positions: even pins → content above, odd → below */
const CONTENT_ABOVE = [true, false, true, false, true, false];

/* ─────────────────────────────────────────────
   MAIN EXPORT  (replaces old SuccessTimeline)
───────────────────────────────────────────── */
export const SuccessTimeline: React.FC<SuccessTimelineProps> = ({
  milestones,
}) => {
  const [activePin, setActivePin] = useState<number | null>(null);
  const [visiblePins, setVisiblePins] = useState<Set<number>>(new Set());
  const [isMobile, setIsMobile] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Scroll-in animation for pins
  useEffect(() => {
    if (isMobile) { setVisiblePins(new Set(milestones.map((_, i) => i))); return; }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.getAttribute("data-pin-idx") || "0");
            setVisiblePins(prev => new Set(Array.from(prev).concat(idx)));
          }
        });
      },
      { threshold: 0.25, rootMargin: "0px 0px -80px 0px" }
    );
    document.querySelectorAll("[data-pin-idx]").forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [isMobile, milestones]);

  // Road draw animation
  const [roadProgress, setRoadProgress] = useState(0);
  useEffect(() => {
    if (isMobile) { setRoadProgress(1); return; }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start: number | null = null;
          const duration = 1800;
          const step = (ts: number) => {
            if (!start) start = ts;
            const p = Math.min((ts - start) / duration, 1);
            setRoadProgress(p);
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [isMobile]);

  // Milestones come from DB in descending order (2026→2015), reverse for road (2015→2026)
  const ordered = [...milestones].reverse();

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        width: "100%",
        minHeight: isMobile ? "auto" : "90vh",
        overflow: "hidden",
        background: "linear-gradient(180deg, #fafafa 0%, #f5f5f0 50%, #fafafa 100%)",
      }}
    >
      {/* ── CONTENT WRAPPER ── */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 1400,
          margin: "0 auto",
          padding: isMobile ? "40px 20px 60px" : "40px 48px 80px",
        }}
      >
        {/* FIX 5 — SECTION HEADING */}
        <div style={{
          textAlign: 'center',
          marginBottom: '50px',
          paddingTop: '60px'
        }}>
          <span style={{
            display: 'inline-block',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '2.5px',
            textTransform: 'uppercase',
            color: '#c1000a',
            marginBottom: '12px',
            padding: '5px 16px',
            border: '1px solid rgba(193,0,10,0.2)',
            borderRadius: '20px',
            background: 'rgba(193,0,10,0.04)',
            fontFamily: "DM Sans, sans-serif"
          }}>
            Our Journey
          </span>
          <h2 style={{
            fontSize: 'clamp(32px, 4vw, 52px)',
            fontWeight: 800,
            color: '#0f1523',
            margin: '0 0 16px',
            letterSpacing: '-1px',
            lineHeight: 1.1,
            fontFamily: "DM Sans, sans-serif"
          }}>
            Our Milestones
          </h2>
          <p style={{
            fontSize: '15px',
            color: '#8a9ab5',
            maxWidth: '480px',
            margin: '0 auto',
            lineHeight: 1.7,
            fontFamily: "DM Sans, sans-serif"
          }}>
            A decade of growth, innovation, and global expansion
            in logistics and freight forwarding.
          </p>
        </div>

        {/* DESKTOP ROAD */}
        {!isMobile && (
          <DesktopRoad
            milestones={ordered}
            activePin={activePin}
            onPinHover={setActivePin}
            roadProgress={roadProgress}
            visiblePins={visiblePins}
          />
        )}

        {/* MOBILE TIMELINE */}
        {isMobile && <MobileTimeline milestones={ordered} />}
      </div>

      {/* ── GLOBAL STYLES ── */}
      <style>{`
        @keyframes pinDrop {
          0%   { opacity: 0; transform: translateY(-24px) scale(0.7); }
          65%  { transform: translateY(6px) scale(1.05); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes cardFade {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes roadDash {
          to { stroke-dashoffset: -60; }
        }
        .tsv-road-dashes {
          animation: roadDash 2.5s linear infinite;
        }
        .tsv-pin-group {
          transition: filter 0.2s ease;
        }
        .tsv-pin-group:hover {
          filter: drop-shadow(0 4px 12px rgba(193,0,10,0.35));
        }
      `}</style>
    </section>
  );
};

/* ─────────────────────────────────────────────
   DESKTOP ROAD COMPONENT
───────────────────────────────────────────── */
function DesktopRoad({
  milestones,
  activePin,
  onPinHover,
  roadProgress,
  visiblePins,
}: {
  milestones: Milestone[];
  activePin: number | null;
  onPinHover: (i: number | null) => void;
  roadProgress: number;
  visiblePins: Set<number>;
}) {
  // Road animation: use stroke-dasharray trick
  const TOTAL_PATH_LEN = 1560; // approximate path length
  const drawn = roadProgress * TOTAL_PATH_LEN;

  return (
    <div style={{ position: "relative", width: "100%", paddingBottom: '80px', overflow: 'visible' }}>
      <svg
        viewBox="-20 -180 1440 780"
        style={{
          width: '100%',
          height: 'auto',
          overflow: 'visible',
          display: 'block'
        }}
      >
        <defs>
          {/* Road draw mask */}
          <clipPath id="road-clip">
            <rect x="0" y="-180" width={drawn} height="780" />
          </clipPath>
        </defs>

        {/* 1. Road shadow (subtle) */}
        <path
          d={ROAD_PATH}
          fill="none"
          stroke="rgba(0,0,0,0.18)"
          strokeWidth="56"
          strokeLinecap="round"
          clipPath="url(#road-clip)"
        />

        {/* 2. Road surface */}
        <path
          d={ROAD_PATH}
          fill="none"
          stroke="#1e2235"
          strokeWidth="52"
          strokeLinecap="round"
          clipPath="url(#road-clip)"
        />

        {/* 3. Center dashes only — no edge lines */}
        <path
          className="tsv-road-dashes"
          d={ROAD_PATH}
          fill="none"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="2"
          strokeDasharray="28 18"
          strokeLinecap="round"
          clipPath="url(#road-clip)"
        />

        {/* ── MILESTONE PINS ── */}
        {milestones.map((m, i) => {
          const pos = PIN_POSITIONS[i];
          if (!pos) return null;
          const isActive = activePin === i;
          const isVisible = visiblePins.has(i);
          
          // Force isAbove logic: first 2 are above to prevent bottom cutoff, then alternate
          const isAbove = i <= 1 ? true : i % 2 === 0;
          
          const pts = toPoints(m);

          // Shift x position left for right side cards
          let cardX = pos.x - 120;
          if (i === 3) cardX = pos.x - 130;
          else if (i === 4) cardX = pos.x - 180;
          else if (i === 5) cardX = pos.x - 220;

          return (
            <g
              key={i}
              className="tsv-pin-group"
              data-pin-idx={i}
              style={{
                cursor: "pointer",
                opacity: isVisible ? 1 : 0,
                animation: isVisible
                  ? `pinDrop 0.5s cubic-bezier(0.22,1,0.36,1) ${i * 140}ms both`
                  : "none",
              }}
              onMouseEnter={() => onPinHover(i)}
              onMouseLeave={() => onPinHover(null)}
            >
              {/* Connector line (FIX 4) */}
              <line
                x1={pos.x}
                y1={pos.y - 14}
                x2={pos.x}
                y2={isAbove ? pos.y - 115 : pos.y + 48}
                stroke="#c1000a"
                strokeWidth="1"
                strokeDasharray="3 4"
                opacity={isActive ? 0.8 : 0.4}
                style={{ transition: "opacity 0.2s" }}
              />

              {/* Small circle at connector end (FIX 4) */}
              <circle
                cx={pos.x}
                cy={isAbove ? pos.y - 115 : pos.y + 48}
                r="3"
                fill="#c1000a"
                opacity={isActive ? 0.9 : 0.5}
                style={{ transition: "opacity 0.2s" }}
              />

              {/* Year label BELOW PIN (outside card) (FIX 1) */}
              <text
                x={pos.x}
                y={pos.y + 36}
                textAnchor="middle"
                style={{
                  fontSize: "16px",
                  fontWeight: "800",
                  fill: isActive ? "#c1000a" : "#0f1523",
                  fontFamily: "DM Sans, sans-serif",
                  transition: "fill 0.2s",
                }}
              >
                {m.year}
              </text>

              {/* Pin icon */}
              <PinIcon cx={pos.x} cy={pos.y} active={isActive} />

              {/* Content card (FIX 3) */}
              <foreignObject
                x={cardX}
                y={isAbove ? pos.y - 220 : pos.y + 50}
                width="240"
                height="300"
                style={{ overflow: "visible" }}
              >
                <div
                  style={{
                    background: '#ffffff',
                    border: `1px solid ${isActive ? "#c1000a" : "rgba(193,0,10,0.12)"}`,
                    borderTop: '3px solid #c1000a',
                    borderRadius: '12px',
                    padding: '16px 18px',
                    boxShadow: isActive
                      ? '0 10px 28px rgba(193,0,10,0.18), 0 4px 20px rgba(0,0,0,0.10)'
                      : '0 4px 20px rgba(0,0,0,0.10)',
                    width: '100%',
                    backdropFilter: "blur(10px)",
                    transition: "all 0.25s ease",
                    animation: isVisible
                      ? `cardFade 0.45s ease ${i * 140 + 200}ms both`
                      : "none",
                    fontFamily: "DM Sans, Inter, sans-serif",
                  }}
                >
                  {/* Card title (year label inside card) (FIX 1) */}
                  <p
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#c1000a',
                      letterSpacing: '1.5px',
                      textTransform: 'uppercase',
                      margin: '0 0 6px',
                    }}
                  >
                    {m.year}
                  </p>

                  {/* Card milestone title (FIX 1) */}
                  <h4
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#0f1523',
                      margin: '0 0 8px',
                      lineHeight: 1.3,
                    }}
                  >
                    {m.title}
                  </h4>

                  {/* Card bullet points (FIX 1) */}
                  <ul
                    style={{
                      fontSize: '12px',
                      color: '#4a5568',
                      lineHeight: 1.6,
                      listStyle: 'disc',
                      paddingLeft: '14px',
                      margin: 0,
                    }}
                  >
                    {pts.slice(0, 3).map((pt, pi) => (
                      <li
                        key={pi}
                        style={{
                          fontSize: '12px',
                          color: '#4a5568',
                          lineHeight: '1.6',
                          marginBottom: '3px',
                        }}
                      >
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PIN SVG ICON
───────────────────────────────────────────── */
function PinIcon({
  cx,
  cy,
  active,
}: {
  cx: number;
  cy: number;
  active: boolean;
}) {
  const W = active ? 32 : 26;
  const H = active ? 44 : 36;
  const x = cx - W / 2;
  const y = cy - H;

  return (
    <g style={{ transition: "all 0.22s cubic-bezier(0.22,1,0.36,1)" }}>
      {/* Drop shadow */}
      <ellipse
        cx={cx}
        cy={cy + 3}
        rx={W * 0.38}
        ry={3.5}
        fill="rgba(0,0,0,0.22)"
      />
      {/* Pin body */}
      <path
        d={`
          M ${cx} ${cy}
          C ${cx} ${cy}, ${x} ${y + H * 0.62}, ${x} ${y + W / 2}
          A ${W / 2} ${W / 2} 0 1 1 ${x + W} ${y + W / 2}
          C ${x + W} ${y + H * 0.62}, ${cx} ${cy}, ${cx} ${cy}
        `}
        fill="#c1000a"
        stroke={active ? "#8a0007" : "#a50009"}
        strokeWidth={active ? 1.5 : 1}
      />
      {/* White inner ring */}
      <circle cx={cx} cy={y + W / 2} r={W * 0.28} fill="#ffffff" />
      {/* Red inner dot */}
      <circle cx={cx} cy={y + W / 2} r={W * 0.11} fill="#c1000a" />
      {/* Active glow ring */}
      {active && (
        <circle
          cx={cx}
          cy={y + W / 2}
          r={W / 2 + 7}
          fill="rgba(193,0,10,0.12)"
          stroke="rgba(193,0,10,0.25)"
          strokeWidth={1}
        />
      )}
    </g>
  );
}

/* ─────────────────────────────────────────────
   MOBILE VERTICAL TIMELINE (FIX 6)
───────────────────────────────────────────── */
function MobileTimeline({ milestones }: { milestones: Milestone[] }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0px',
      position: 'relative',
      paddingLeft: '24px',
      marginTop: '20px'
    }}>
      {/* Vertical red line */}
      <div style={{
        position: 'absolute',
        left: '7px',
        top: '12px',
        bottom: '12px',
        width: '2px',
        background: 'linear-gradient(180deg, #c1000a 0%, rgba(193,0,10,0.15) 100%)',
      }} />

      {milestones.map((m, i) => {
        const pts = toPoints(m);
        return (
          <div key={i} style={{
            position: 'relative',
            marginBottom: '32px',
          }}>
            {/* Pin circle */}
            <div style={{
              position: 'absolute',
              left: '-29px',
              top: '12px',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: '#c1000a',
              border: '2.5px solid #fff',
              boxShadow: '0 0 0 2px #c1000a, 0 2px 8px rgba(193,0,10,0.3)',
              zIndex: 2
            }} />

            {/* Card */}
            <div style={{
              background: '#fff',
              border: '1px solid #f0f2f8',
              borderTop: '3px solid #c1000a',
              borderRadius: '10px',
              padding: '16px 18px',
              boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
              fontFamily: "DM Sans, Inter, sans-serif"
            }}>
              {/* Year badge */}
              <span style={{
                display: 'inline-block',
                fontSize: '11px',
                fontWeight: 800,
                color: '#fff',
                background: '#c1000a',
                padding: '3px 10px',
                borderRadius: '20px',
                marginBottom: '8px',
                letterSpacing: '0.5px'
              }}>
                {m.year}
              </span>

              {/* Title */}
              <h3 style={{
                fontSize: '15px',
                fontWeight: 700,
                color: '#0f1523',
                margin: '0 0 10px',
                lineHeight: 1.3
              }}>
                {m.title}
              </h3>

              {/* Points */}
              <ul style={{
                margin: 0,
                padding: '0 0 0 16px',
                listStyle: 'disc'
              }}>
                {pts.map((pt, pi) => (
                  <li key={pi} style={{
                    fontSize: '13px',
                    color: '#4a5568',
                    lineHeight: '1.65',
                    marginBottom: '4px'
                  }}>
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
}
