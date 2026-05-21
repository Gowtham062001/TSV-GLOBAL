"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface CaseStudyGalleryProps {
  images: string[];
}

const CaseStudyGallery: React.FC<CaseStudyGalleryProps> = ({ images }) => {
  return (
    <section className="bg-[#f8f9fa] py-20 overflow-hidden">
      <div className="container mb-12">
        <div className="text-center">
          <h4 className="text-[#c1000a] font-black uppercase tracking-[4px] text-xs mb-4">Project Visuals</h4>
          <h2 className="text-3xl md:text-5xl font-black text-[#1a1a2e]">Operation <span className="text-[#c1000a]">Gallery</span></h2>
        </div>
      </div>

      <div className="px-4 max-w-[1400px] mx-auto relative group">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          loop={true}
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          speed={1000}
          navigation={{
            nextEl: ".cs-next",
            prevEl: ".cs-prev",
          }}
          pagination={{
            el: ".cs-pagination",
            clickable: true,
            renderBullet: (index, className) => {
              return `<span class="${className}" style="width:12px; height:12px; background:#c1000a; opacity:0.3; transition:all 0.3s; cursor:pointer; margin:0 5px; display:inline-block; border-radius:50%;"></span>`;
            },
          }}
          breakpoints={{
            768: { slidesPerView: 2 },
            1200: { slidesPerView: 3 },
          }}
          className="pb-16"
        >
          {images.map((img, i) => (
            <SwiperSlide key={i}>
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl group/slide">
                <img
                  src={img}
                  alt={`Project Detail ${i + 1}`}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover/slide:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e]/60 to-transparent opacity-0 group-hover/slide:opacity-100 transition-opacity duration-500"></div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-center gap-6 mt-8">
          <button className="cs-prev w-14 h-14 rounded-full bg-[#1a1a2e] text-white flex items-center justify-center hover:bg-[#c1000a] transition-all duration-300 shadow-xl active:scale-95">
            <i className="fa-regular fa-arrow-left text-lg"></i>
          </button>
          <div className="cs-pagination !static !w-auto"></div>
          <button className="cs-next w-14 h-14 rounded-full bg-[#c1000a] text-white flex items-center justify-center hover:bg-[#1a1a2e] transition-all duration-300 shadow-xl active:scale-95 shadow-red-600/20">
            <i className="fa-regular fa-arrow-right text-lg"></i>
          </button>
        </div>
      </div>

      <style jsx global>{`
        .cs-pagination .swiper-pagination-bullet-active {
          opacity: 1 !important;
          transform: scale(1.3);
          background: #c1000a !important;
        }
      `}</style>
    </section>
  );
};

export default CaseStudyGallery;
