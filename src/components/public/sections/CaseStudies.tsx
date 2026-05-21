"use client";

import React, { useEffect } from "react";
import Link from "next/link";

export interface CaseStudyItemProps {
  title: string;
  category: string;
  image: string;
  imageAlt?: string;
  link: string;
  delay?: string;
}

export interface CaseStudiesProps {
  
    heading?: string; // Fallback
  headingPrefix?: string;
  headingHighlight?: string;
  headingSuffix?: string;
  headingBreak?: boolean;
  subHeading?: string;

  description: string;
  viewAllText: string;
  viewAllUrl: string;
  items?: CaseStudyItemProps[];
}

export const CaseStudies: React.FC<CaseStudiesProps> = ({
  subHeading,
  heading,
  description,
  viewAllText,
  viewAllUrl,
  items = [],
}) => {
  useEffect(() => {
    const init = async () => {
      // @ts-ignore
      const Swiper = (await import("swiper")).default;
      const { Navigation, Pagination, Autoplay } = await import("swiper/modules");
      await import("swiper/css");
      await import("swiper/css/navigation");
      await import("swiper/css/pagination");

      new Swiper(".project-carousel", {
        modules: [Navigation, Pagination, Autoplay],
        loop: true,
        slidesPerView: 1,
        spaceBetween: 30,
        autoplay: { delay: 4000, disableOnInteraction: false },
        pagination: { el: ".carousel-pagination", clickable: true },
        navigation: {
          nextEl: ".swiper-next",
          prevEl: ".swiper-prev",
        },
        breakpoints: {
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        },
      });
    };
    init();
  }, []);

  return (
    <section className="project-section padding">
      <div className="bg-half"></div>
      <div className="container">
        <div className="section-heading-wrap mb-40">
          <div className="section-heading white">
            <h3 className="sub-heading is-border border-anim">
              {subHeading}
              <span className="sh-underline">
                <img className="sh-truck" src="/img/truck.svg" alt="truck" />
              </span>
            </h3>
            <h2
              className="text-anim"
              data-effect="fade-in-right"
              data-split="char"
              data-delay="0.3"
              data-duration="1"
              dangerouslySetInnerHTML={{ __html: heading ?? "" }}
            />
            <p
              className="text-anim"
              data-effect="fade-in-bottom"
              data-ease="power4.out"
            >
              {description}
            </p>
          </div>
          <Link
            href={viewAllUrl}
            className="default-btn wow fade-in-right"
            data-wow-delay="100ms"
          >
            {viewAllText}
          </Link>
        </div>

        <div className="swiper-outside">
          <div className="swiper project-carousel">
            <div className="swiper-wrapper">
              {items.map((item, index) => (
                <div className="swiper-slide" key={index}>
                  <div
                    className="project-item wow fade-in-bottom"
                    data-wow-delay={item.delay || "200ms"}
                  >
                    <div className="project-thumb project-view" style={{ width: "100%", height: "350px", overflow: "hidden" }}>
                      <Link href={item.link}>
                        <img 
                          src={item.image} 
                          alt={item.imageAlt || item.title} 
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </Link>
                    </div>
                    <div className="project-content">
                      <p className="category">{item.category}</p>
                      <h3>
                        <Link href={item.link}>{item.title}</Link>
                      </h3>
                      <Link href={item.link} className="project-btn">
                        <i className="fa-regular fa-arrow-right"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="carousel-pagination"></div>
          </div>
          <div className="swiper-nav swiper-next">
            <i className="fa-regular fa-arrow-right"></i>
          </div>
          <div className="swiper-nav swiper-prev">
            <i className="fa-regular fa-arrow-left"></i>
          </div>
        </div>
      </div>
    </section>
  );
};
