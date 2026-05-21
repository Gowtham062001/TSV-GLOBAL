"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export interface HeroSlideProps {
  image: string;
  imageAlt: string;
  eyebrow: string;
  captionMedium: string;
  captionBig: string;
  captionBigSpan: string;
  captionSmall: string;
  primaryBtnText: string;
  primaryBtnUrl: string;
  primaryBtnIcon?: string;
  secondaryBtnText: string;
  secondaryBtnUrl: string;
  secondaryBtnIcon?: string;
  counterNum: string;
}

export interface HeroProps {
  slides: HeroSlideProps[];
  stats: Array<{ icon: string; value: string; label: string }>;
}

export const Hero: React.FC<HeroProps> = ({ slides, stats }) => {
  useEffect(() => {
    const initSlider = async () => {
      // @ts-ignore
      const Swiper = (await import("swiper")).default;
      const { Navigation, Pagination, Autoplay } = await import("swiper/modules");
      await import("swiper/css");
      await import("swiper/css/navigation");
      await import("swiper/css/pagination");

      new Swiper(".main-slider", {
        modules: [Navigation, Pagination, Autoplay],
        loop: true,
        speed: 1000,
        autoplay: { delay: 5000, disableOnInteraction: false },
        pagination: {
          el: ".slider-pagination",
          clickable: true,
        },
        navigation: {
          nextEl: ".slider-button-next",
          prevEl: ".slider-button-prev",
        },
      });
    };
    initSlider();
  }, []);

  if (!slides || slides.length === 0) return null;

  return (
    <div className="slider-section">
      <div className="swiper main-slider">
        <div className="swiper-wrapper">
          {slides.map((slide, index) => (
            <div className="swiper-slide" key={index}>
              <div className="slider-img-wrap">
                <div className="slider-img">
                  <Image 
                    src={slide.image} 
                    alt={slide.imageAlt || slide.eyebrow} 
                    fill 
                    priority={index === 0}
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className="slider-accent-strip"></div>
                <div className="slider-geo-shape"></div>
                <div className="slider-geo-shape-2"></div>
              </div>
              <div className="container">
                <div className="slider-content-wrap">
                  <div className="slider-content">
                    <div className="slider-eyebrow">
                      <div className="dot"></div>
                      <span>{slide.eyebrow}</span>
                    </div>
                    <div className="slider-caption medium">
                      {slide.captionMedium}
                    </div>
                    <div className="slider-caption big">
                      {slide.captionBig} <br />
                      <span>{slide.captionBigSpan}</span>
                    </div>
                    <div className="slider-caption small">
                      {slide.captionSmall}
                    </div>
                    <div className="slider-btn">
                      <Link href={slide.primaryBtnUrl} className="default-btn">
                        {slide.primaryBtnText}{" "}
                        <i className={slide.primaryBtnIcon || "fa-regular fa-arrow-right"}></i>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div className="slider-stats-bar">
                {stats &&
                  stats.map((stat, sIndex) => (
                    <div className="slider-stat-item" key={sIndex}>
                      <div className="stat-icon">
                        <i className={stat.icon}></i>
                      </div>
                      <div className="stat-text">
                        <h4>{stat.value}</h4>
                        <p>{stat.label}</p>
                      </div>
                    </div>
                  ))}
              </div>
              <div className="slider-counter">
                <div className="slider-counter-num">
                  {slide.counterNum || String(index + 1).padStart(2, "0")}
                </div>
                <div className="slider-counter-line"></div>
              </div>
            </div>
          ))}
        </div>

        <div className="slider-pagination"></div>
        <div className="swiper-nav slider-button-prev">
          <i className="fa-regular fa-arrow-left"></i>
        </div>
        <div className="swiper-nav slider-button-next">
          <i className="fa-regular fa-arrow-right"></i>
        </div>
      </div>
      <style jsx>{`
        .btn-black { background: #1a1a2e !important; }
        .btn-black:hover { background: #c1000a !important; }
        @media (max-width: 991px) {
          .slider-caption.big { font-size: 32px !important; line-height: 1.2 !important; }
          .slider-caption.medium { font-size: 14px !important; margin-bottom: 5px !important; }
          .slider-caption.small { font-size: 13px !important; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
          .slider-stats-bar { display: none !important; }
          .slider-counter { display: none !important; }
          .slider-img img { object-position: center !important; }
          .slider-content { padding-top: 40px !important; }
          .slider-btn { 
            width: 100% !important;
            display: flex !important;
            justify-content: flex-start !important;
            align-items: center !important;
            max-width: none !important;
          }
          .slider-btn a { 
            width: auto !important; 
            min-width: 220px !important;
            text-align: center; 
            justify-content: center;
            padding: 18px 40px !important;
            font-size: 14px !important;
            font-weight: 700 !important;
            letter-spacing: 0.1em !important;
            display: inline-flex !important;
            align-items: center !important;
            border-radius: 4px !important;
            text-transform: uppercase !important;
          }
        }
        @media (max-width: 576px) {
          .slider-caption.big { font-size: 26px !important; }
          .slider-eyebrow { font-size: 12px !important; }
          .slider-btn { max-width: 100%; }
        }
      `}</style>
    </div>
  );
};
