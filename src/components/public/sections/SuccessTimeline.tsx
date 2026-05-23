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
        background: "#f7f6f2",
      }}
    >
      {/* ── BACKGROUND ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url(/assets/img/banner/banner-3.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center 40%",
          opacity: 0.07,
          zIndex: 0,
        }}
      />
      {/* Subtle texture overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(160deg, rgba(255,255,255,0.96) 0%, rgba(247,246,242,0.92) 60%, rgba(240,238,232,0.88) 100%)",
          zIndex: 1,
        }}
      />

      {/* ── CONTENT WRAPPER ── */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 1400,
          margin: "0 auto",
          padding: isMobile ? "60px 20px 60px" : "80px 48px 0",
        }}
      >
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
    <div style={{ position: "relative", width: "100%", paddingBottom: 40 }}>
      <svg
        viewBox="0 0 1400 560"
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          overflow: "visible",
        }}
      >
        <defs>
          {/* Road draw mask */}
          <clipPath id="road-clip">
            <rect x="0" y="0" width={drawn} height="560" />
          </clipPath>
        </defs>

        {/* ── ROAD SHADOW ── */}
        <path
          d={ROAD_PATH}
          fill="none"
          stroke="rgba(0,0,0,0.18)"
          strokeWidth={54}
          strokeLinecap="round"
          clipPath="url(#road-clip)"
        />

        {/* ── ROAD SURFACE (dark tarmac) ── */}
        <path
          d={ROAD_PATH}
          fill="none"
          stroke="#1a1a2e"
          strokeWidth={50}
          strokeLinecap="round"
          clipPath="url(#road-clip)"
        />

        {/* ── ROAD EDGE — yellow kerb (right side) ── */}
        <path
          d={ROAD_PATH}
          fill="none"
          stroke="rgba(240,185,60,0.5)"
          strokeWidth={53}
          strokeLinecap="round"
          strokeDasharray="18 14"
          strokeDashoffset="0"
          clipPath="url(#road-clip)"
        />

        {/* ── ROAD SURFACE again (cover yellow inside) ── */}
        <path
          d={ROAD_PATH}
          fill="none"
          stroke="#1a1a2e"
          strokeWidth={48}
          strokeLinecap="round"
          clipPath="url(#road-clip)"
        />

        {/* ── CENTER DASHES (animated) ── */}
        <path
          className="tsv-road-dashes"
          d={ROAD_PATH}
          fill="none"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray="28 18"
          clipPath="url(#road-clip)"
        />

        {/* ── MILESTONE PINS ── */}
        {milestones.map((m, i) => {
          const pos = PIN_POSITIONS[i];
          if (!pos) return null;
          const isActive = activePin === i;
          const isVisible = visiblePins.has(i);
          const above = CONTENT_ABOVE[i];
          const pts = toPoints(m);

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
              {/* Dashed stem connecting pin to content box */}
              <line
                x1={pos.x}
                y1={pos.y - 26}
                x2={pos.x}
                y2={above ? pos.y - 118 : pos.y + 58}
                stroke={isActive ? "#c1000a" : "rgba(193,0,10,0.35)"}
                strokeWidth={1.5}
                strokeDasharray="5 4"
                style={{ transition: "stroke 0.2s" }}
              />

              {/* Year label — below pin */}
              <text
                x={pos.x}
                y={pos.y + 46}
                textAnchor="middle"
                style={{
                  fontSize: "14px",
                  fontWeight: "800",
                  fill: isActive ? "#c1000a" : "#0f1523",
                  fontFamily: "DM Sans, Inter, sans-serif",
                  transition: "fill 0.2s",
                  letterSpacing: "0.5px",
                }}
              >
                {m.year}
              </text>

              {/* Pin icon */}
              <PinIcon cx={pos.x} cy={pos.y} active={isActive} />

              {/* Content card */}
              <foreignObject
                x={pos.x - 115}
                y={above ? pos.y - 230 : pos.y + 60}
                width={230}
                height={170}
                style={{ overflow: "visible" }}
              >
                <div
                  style={{
                    background: isActive
                      ? "#ffffff"
                      : "rgba(255,255,255,0.93)",
                    border: `1.5px solid ${isActive ? "#c1000a" : "rgba(26,26,46,0.1)"}`,
                    borderRadius: "12px",
                    padding: "12px 14px 14px",
                    boxShadow: isActive
                      ? "0 10px 28px rgba(193,0,10,0.18), 0 2px 8px rgba(0,0,0,0.06)"
                      : "0 3px 14px rgba(0,0,0,0.09)",
                    backdropFilter: "blur(10px)",
                    transition: "all 0.25s ease",
                    animation: isVisible
                      ? `cardFade 0.45s ease ${i * 140 + 200}ms both`
                      : "none",
                    fontFamily: "DM Sans, Inter, sans-serif",
                  }}
                >
                  <p
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "#c1000a",
                      margin: "0 0 6px",
                      textTransform: "uppercase",
                      letterSpacing: "0.6px",
                    }}
                  >
                    {m.title}
                  </p>
                  <ul
                    style={{
                      margin: 0,
                      padding: "0 0 0 14px",
                      listStyleType: "disc",
                    }}
                  >
                    {pts.slice(0, 3).map((pt, pi) => (
                      <li
                        key={pi}
                        style={{
                          fontSize: "11px",
                          color: "#374151",
                          lineHeight: "1.55",
                          marginBottom: "3px",
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
   MOBILE VERTICAL TIMELINE
───────────────────────────────────────────── */
function MobileTimeline({ milestones }: { milestones: Milestone[] }) {
  return (
    <div style={{ position: "relative", paddingLeft: 32 }}>
      {/* Vertical line */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 8,
          top: 8,
          bottom: 8,
          width: 2,
          background:
            "linear-gradient(to bottom, #c1000a 0%, rgba(193,0,10,0.15) 100%)",
          borderRadius: 2,
        }}
      />

      {milestones.map((m, i) => {
        const pts = toPoints(m);
        return (
          <div
            key={i}
            style={{
              position: "relative",
              marginBottom: 44,
              paddingLeft: 24,
              animation: `cardFade 0.5s ease ${i * 100}ms both`,
            }}
          >
            {/* Pin dot */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                left: -25,
                top: 5,
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "#c1000a",
                border: "3px solid #f7f6f2",
                boxShadow: "0 0 0 2px #c1000a",
                zIndex: 2,
              }}
            />

            {/* Year ghost text */}
            <p
              style={{
                fontSize: 48,
                fontWeight: 900,
                color: "rgba(193,0,10,0.1)",
                margin: "0 0 2px",
                lineHeight: 1,
                letterSpacing: "-2px",
                fontFamily: "DM Sans, Inter, sans-serif",
                pointerEvents: "none",
              }}
            >
              {m.year}
            </p>

            {/* Title */}
            <h3
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: "#c1000a",
                margin: "0 0 10px",
                fontFamily: "DM Sans, Inter, sans-serif",
              }}
            >
              {m.title}
            </h3>

            {/* Bullet points */}
            <ul
              style={{
                margin: 0,
                padding: "0 0 0 18px",
                listStyleType: "disc",
              }}
            >
              {pts.map((pt, pi) => (
                <li
                  key={pi}
                  style={{
                    fontSize: 14,
                    color: "#4b5563",
                    lineHeight: 1.65,
                    marginBottom: 5,
                    fontFamily: "DM Sans, Inter, sans-serif",
                  }}
                >
                  {pt}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
