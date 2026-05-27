"use client";
import React from "react";
import { TSVHeading, TSVSubHeading } from "../shared/TSVHeading";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

interface TestimonialItem {
  name: string;
  company: string;
  text: string;
  avatarColor: string;
  avatarIcon: string;
  rating: number;
}

interface TestimonialsProps {
  subHeading?: string;
  heading?: string; // Fallback
  headingPrefix?: string;
  headingHighlight?: string;
  headingSuffix?: string;
  headingBreak?: boolean;
  description?: string;
  testimonials?: TestimonialItem[];
}

export const Testimonials: React.FC<TestimonialsProps> = ({
  subHeading,
  heading,
  headingPrefix,
  headingHighlight,
  headingSuffix,
  headingBreak,
  description,
  testimonials = []
}) => {
  return (
    <section className="testimonial-section padding">
      <div className="map-pattern"></div>
      <div className="container">
        <div className="tsv-testi-wrap">
          <div className="section-heading text-center mb-30">
            {subHeading ? (
              <TSVSubHeading text={subHeading} />
            ) : (
              <TSVSubHeading text="Clients Testimonials!" />
            )}
            
            {(headingPrefix || headingHighlight) ? (
              <TSVHeading 
                prefix={headingPrefix}
                highlight={headingHighlight}
                suffix={headingSuffix}
                hasBreak={headingBreak}
              />
            ) : (
              <h2 className="text-anim" data-effect="fade-in-right" data-split="char" data-delay="0.3" data-duration="1">
                {heading || "What Our Clients Say!"}
              </h2>
            )}

          </div>

          <div className="testimonials-slider-wrapper">
            <Swiper
              modules={[Autoplay, Pagination]}
              spaceBetween={30}
              slidesPerView={1}
              breakpoints={{
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              pagination={{ clickable: true, bulletClass: 'swiper-pagination-bullet bg-[#c1000a]' }}
              loop={true}
              className="py-10"
            >
              {testimonials.map((item, index) => (
                <SwiperSlide key={index}>
                  <div className="tsv-tc h-full flex flex-col">
                    <div className="tsv-tc-qdrop">&ldquo;</div>
                    <div className="tsv-tc-stars">
                      {[...Array(item.rating || 5)].map((_, i) => (
                        <i key={i} className="fa-sharp fa-solid fa-star"></i>
                      ))}
                    </div>
                    <p className="tsv-tc-text flex-grow">{item.text}</p>
                    <div className="tsv-tc-bar mt-auto"></div>
                    <div className="tsv-tc-author">
                      <div className="tsv-tc-ava" style={{ background: item.avatarColor || "#c1000a" }}>
                        <i className={`fa-solid ${item.avatarIcon || "fa-user"}`}></i>
                      </div>
                      <div>
                        <div className="tsv-tc-name">{item.name}</div>
                        <div className="tsv-tc-co">{item.company}</div>
                        <div className="tsv-tc-badge"><i className="fa-solid fa-circle-check"></i> Verified Client</div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
      <style jsx global>{`
        .testimonials-slider-wrapper {
          padding-bottom: 40px;
        }
        .testimonials-slider-wrapper .swiper-pagination {
          bottom: 0px !important;
        }
        .testimonials-slider-wrapper .swiper-pagination-bullet {
          width: 10px;
          height: 10px;
          background-color: #cbd5e1;
          opacity: 0.6;
          transition: all 0.3s;
        }
        .testimonials-slider-wrapper .swiper-pagination-bullet-active {
          background-color: #c1000a;
          opacity: 1;
          width: 24px;
          border-radius: 5px;
        }
      `}</style>
    </section>
  );
};
