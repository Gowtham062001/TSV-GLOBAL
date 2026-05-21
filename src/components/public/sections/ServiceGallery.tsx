"use client";

import React, { useEffect, useRef, useState } from "react";

export interface ServiceGalleryProps {
  heading?: string;
  eyebrow?: string;
  subHeading?: string;
  slides?: any[];
}

export function ServiceGallery({ heading, eyebrow, subHeading, slides = [] }: ServiceGalleryProps) {
  const swiperRef = useRef<HTMLDivElement>(null);
  const [isSwiperReady, setIsSwiperReady] = useState(false);

  useEffect(() => {
    let swiperInstance: any = null;
    let attempts = 0;
    const maxAttempts = 20; // 5 seconds total

    const initSwiper = () => {
      if (typeof window !== "undefined" && (window as any).Swiper && swiperRef.current) {
        if (swiperInstance) {
          swiperInstance.destroy(true, true);
        }

        try {
          swiperInstance = new (window as any).Swiper(swiperRef.current, {
            slidesPerView: 1,
            spaceBetween: 24,
            loop: slides.length > 3, // Only loop if we have enough slides
            autoplay: {
              delay: 4000,
              disableOnInteraction: false,
            },
            pagination: { 
              el: '.swiper-pagination', 
              clickable: true 
            },
            breakpoints: {
              768: { slidesPerView: 2 },
              1200: { slidesPerView: 3 }
            }
          });
          setIsSwiperReady(true);
          return true;
        } catch (err) {
          console.error("Swiper Init Error:", err);
        }
      }
      return false;
    };

    // Polling mechanism for window.Swiper
    const checkAndInit = () => {
      const success = initSwiper();
      if (!success && attempts < maxAttempts) {
        attempts++;
        setTimeout(checkAndInit, 250);
      }
    };

    checkAndInit();

    return () => {
      if (swiperInstance) {
        swiperInstance.destroy(true, true);
      }
    };
  }, [slides]);

  // Normalize slides: handle both {image, caption} and just string URLs
  const normalizedSlides = (slides && slides.length > 0 ? slides : [
    { image: "/assets/img/aerial-view-container-cargo-ship-sea.jpg", caption: "Cargo Operations" },
    { image: "/assets/img/banner/banner-3.jpg", caption: "Port Handling" },
    { image: "/assets/img/air.jpg", caption: "Freight Forwarding" },
    { image: "/assets/img/road-freight-2.jpg", caption: "Project Cargo" },
    { image: "/assets/img/aerial-view-cargo-ship-cargo-container-harbor.webp", caption: "Custom Clearance" },
  ]).map(s => typeof s === 'string' ? { image: s, caption: "" } : s);

  const sub = eyebrow || subHeading;

  return (
    <section className="padding" style={{ background: "#f8f9fa", overflow: "hidden" }}>
      <div className="container">
        {(heading || sub) && (
          <div className="section-heading text-center mb-50 wow fade-in-bottom" data-wow-delay="200ms">
            {sub && <h4 className="sub-heading">{sub}</h4>}
            {heading && <h2 className="text-4xl md:text-5xl font-black">{heading}</h2>}
          </div>
        )}
        
        {/* If Swiper hasn't initialized yet, we show a basic 3-col grid as fallback so it never shows just 1 image */}
        <div
          ref={swiperRef}
          className={`swiper gallery-slider wow fade-in-bottom ${!isSwiperReady ? 'swiper-fallback-grid' : ''}`}
          data-wow-delay="300ms"
        >
          <div className="swiper-wrapper">
            {normalizedSlides.map((slide: any, i: number) => (
              <div className="swiper-slide" key={i}>
                <div className="gallery-card">
                  <img
                    src={slide.image}
                    alt={slide.caption || "Gallery Image"}
                    className="gallery-image"
                  />
                  {slide.caption && (
                    <div className="gallery-caption">
                      <p>{slide.caption}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="swiper-pagination" style={{ marginTop: "40px", position: "relative", bottom: 0 }}></div>
        </div>
      </div>

      <style jsx>{`
        .gallery-card {
          border-radius: 20px;
          overflow: hidden;
          position: relative;
          box-shadow: 0 15px 40px rgba(0,0,0,0.08);
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          height: 350px;
        }
        .gallery-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 25px 50px rgba(193,0,10,0.15);
        }
        .gallery-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.8s ease;
        }
        .gallery-card:hover .gallery-image {
          transform: scale(1.1);
        }
        .gallery-caption {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(26,26,46,0.95));
          padding: 30px 25px 25px;
          color: #fff;
          transform: translateY(5px);
          transition: all 0.3s ease;
        }
        .gallery-caption p {
          margin: 0;
          font-size: 18px;
          font-weight: 800;
          letter-spacing: 0.5px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        /* Fallback Grid styles if JS Swiper is not ready */
        :global(.swiper-fallback-grid .swiper-wrapper) {
          display: grid !important;
          grid-template-columns: repeat(3, 1fr) !important;
          gap: 24px !important;
        }
        @media (max-width: 1200px) {
          :global(.swiper-fallback-grid .swiper-wrapper) {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 768px) {
          :global(.swiper-fallback-grid .swiper-wrapper) {
            grid-template-columns: 1fr !important;
          }
        }
        :global(.swiper-fallback-grid .swiper-slide) {
          width: 100% !important;
          margin: 0 !important;
        }
      `}</style>
    </section>
  );
}
