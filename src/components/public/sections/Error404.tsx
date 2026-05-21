"use client";
import Link from "next/link";

export interface Error404Props {
  heading?: string;
  subHeading?: string;
  description?: string;
  btnText?: string;
  btnUrl?: string;
  image?: string;
}

export function Error404({
  heading = "Page Not Found",
  subHeading = "Oops! Looks like you're lost",
  description = "The page you're looking for doesn't exist or may have been moved. Let's get you back on track.",
  btnText = "Go Back to Home",
  btnUrl = "/",
  image = "/assets/img/404.png",
}: Error404Props) {
  return (
    <section className="tsv-error-section" style={{
      padding: "120px 0", background: "#f8f9fc",
      position: "relative", overflow: "hidden",
      minHeight: "75vh", display: "flex", alignItems: "center",
    }}>
      <div className="map-pattern" style={{
        position: "absolute", inset: 0,
        background: "url('/assets/img/map-pattern.png') center/cover no-repeat",
        opacity: 0.04, pointerEvents: "none",
      }} />
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <div className="error-content-box" style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto" }}>
          <div className="error-num-wrap" style={{ position: "relative", marginBottom: "50px" }}>
            <div className="error-num-text" style={{
              fontSize: "clamp(100px, 20vw, 220px)", fontWeight: 900, lineHeight: 1,
              background: "linear-gradient(135deg, #1a1a2e 0%, #c1000a 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              opacity: 0.08, letterSpacing: "-10px", userSelect: "none",
            }}>
              404
            </div>
            <div style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%, -50%)", width: "100%", maxWidth: "400px",
            }}>
              <img
                src={image}
                alt="404 Not Found"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/assets/img/aerial-view-container-cargo-ship-sea.jpg";
                  (e.target as HTMLImageElement).style.borderRadius = "16px";
                }}
                style={{
                  width: "100%",
                  filter: "drop-shadow(0 25px 50px rgba(26,26,46,0.15))",
                  animation: "tsv-float 4s ease-in-out infinite",
                }}
              />
            </div>
          </div>
          <h4 style={{ color: "#c1000a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "3px", marginBottom: "16px" }}>
            {subHeading}
          </h4>
          <h1 style={{ color: "#1a1a2e", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, marginBottom: "20px" }}>
            {heading}
          </h1>
          <p style={{ color: "#64748b", fontSize: "17px", lineHeight: 1.8, maxWidth: "500px", margin: "0 auto 40px" }}>
            {description}
          </p>
          <Link href={btnUrl} className="default-btn wow fade-in-bottom" data-wow-delay="300ms">
            {btnText} <i className="fa-regular fa-arrow-right" />
          </Link>
        </div>
      </div>
      <style>{`
        @keyframes tsv-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </section>
  );
}
