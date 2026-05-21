"use client";

import React, { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("[PublicErrorBoundry]:", error);
  }, [error]);

  return (
    <section className="tsv-error-section" style={{
      padding: "120px 0", background: "#f8f9fc",
      minHeight: "75vh", display: "flex", alignItems: "center",
      textAlign: "center"
    }}>
      <div className="container">
        <div className="error-content" style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div style={{ 
            width: "80px", height: "80px", background: "#fef5f5", 
            borderRadius: "50%", display: "flex", alignItems: "center", 
            justifyContent: "center", margin: "0 auto 30px", color: "#c1000a",
            fontSize: "32px"
          }}>
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <h2 style={{ fontSize: "32px", fontWeight: 800, color: "#1a1a2e", marginBottom: "16px" }}>
            Oops! Something went wrong
          </h2>
          <p style={{ color: "#64748b", fontSize: "17px", lineHeight: 1.8, marginBottom: "40px" }}>
            We encountered an unexpected error while loading this page. This usually happens due to a temporary connection issue or a missing data section.
          </p>
          
          <div className="d-flex gap-3 justify-content-center">
            <button
              onClick={() => reset()}
              className="default-btn"
              style={{ background: "#c1000a", color: "#fff", border: "none", cursor: "pointer" }}
            >
              Try Again <i className="fa-solid fa-rotate-right ms-2"></i>
            </button>
            <Link href="/" className="default-btn" style={{ background: "#1a1a2e", color: "#fff" }}>
              Back to Home
            </Link>
          </div>

          {process.env.NODE_ENV === "development" && (
            <div style={{ 
              marginTop: "40px", padding: "20px", background: "#fff", 
              borderRadius: "12px", border: "1px solid #e2e8f0", 
              textAlign: "left", fontSize: "13px", color: "#64748b",
              overflowX: "auto"
            }}>
              <p style={{ fontWeight: "700", color: "#c1000a", marginBottom: "8px" }}>Developer Info:</p>
              <code>{error.message}</code>
              {error.digest && <p style={{ marginTop: "8px" }}>Digest: {error.digest}</p>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
