"use client";

import React, { useEffect } from "react";

interface GalleryImage {
  url: string;
  alt: string;
  caption?: string;
}

interface PhotoGalleryProps {
  data: {
    subHeading?: string;
    heading: string;
    images: GalleryImage[];
  };
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ data }) => {
  const { subHeading = "Our Work", heading, images = [] } = data;

  useEffect(() => {
    // Initialize Swiper if it's available globally (legacy approach)
    // or we can rely on the project's existing Swiper integration.
    // In this project, we typically use the Swiper from the window/main.js logic
    // or standard React Swiper. Since the user wants EXACT HTML UI, 
    // we'll provide the structure that the legacy Swiper JS expects.
    if (typeof window !== "undefined" && (window as any).Swiper) {
      new (window as any).Swiper(".gallery-slider", {
        slidesPerView: 1,
        spaceBetween: 24,
        loop: true,
        pagination: { el: ".gallery-slider .swiper-pagination", clickable: true },
        breakpoints: {
          768: { slidesPerView: 2 },
          1200: { slidesPerView: 3 },
        },
      });
    }
  }, [images]);

  return (
    <section className="padding" style={{ background: "#f8f9fa", overflow: "hidden" }}>
      <div className="container">
        <div className="section-heading text-center mb-40 wow fade-in-bottom" data-wow-delay="200ms">
          <h4 className="sub-heading">{subHeading}</h4>
          <h2 dangerouslySetInnerHTML={{ __html: heading }}></h2>
        </div>
        <div className="swiper gallery-slider wow fade-in-bottom" data-wow-delay="300ms">
          <div className="swiper-wrapper">
            {images.map((img, i) => (
              <div key={i} className="swiper-slide">
                <div style={{ borderRadius: "10px", overflow: "hidden", position: "relative" }}>
                  <img
                    src={img.url}
                    alt={img.alt || "Project Cargo Operations"}
                    style={{ width: "100%", height: "280px", objectFit: "cover", display: "block" }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: "linear-gradient(transparent, rgba(26,26,46,0.85))",
                      padding: "20px",
                      color: "#fff",
                    }}
                  >
                    <p style={{ margin: 0, fontSize: "15px", fontWeight: 600 }}>{img.caption || img.alt}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="swiper-pagination" style={{ marginTop: "25px", position: "relative", bottom: 0 }}></div>
        </div>
      </div>
    </section>
  );
};

export default PhotoGallery;
