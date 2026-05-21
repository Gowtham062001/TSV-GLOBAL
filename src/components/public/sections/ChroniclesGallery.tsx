"use client";

import React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export interface GalleryItem {
  id: string;
  image: string;
  title: string;
}

export interface GalleryCategory {
  id: string;
  title: string;
  date?: string;
  items: GalleryItem[];
}

export interface ChroniclesGalleryProps {
  categories: GalleryCategory[];
}

export const ChroniclesGallery: React.FC<ChroniclesGalleryProps> = ({ categories }) => {
  return (
    <section className="bg-white padding lg:py-20">
      <div className="container">
        {categories?.map((category) => (
          <div key={category.id} className="category-section mb-16 last:mb-0">
            <div className="flex items-center justify-between mb-8 px-4">
              <div>
                <h3 className="text-2xl font-bold text-[#2C368F] relative pl-4 border-l-4 border-[#ED2224]">
                  {category.title}
                </h3>
                {category.date && (
                  <p className="mt-1 ml-4 text-sm font-semibold text-gray-500">
                    <i className="fa-regular fa-calendar-range text-[#ED2224] mr-2"></i>
                    {category.date}
                  </p>
                )}
              </div>
              <div className="flex gap-3">
                <button className={`nav-btn prev-${category.id} w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-[#ED2224] hover:text-white transition-colors`}>
                  <i className="fa-regular fa-chevron-left"></i>
                </button>
                <button className={`nav-btn next-${category.id} w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-[#ED2224] hover:text-white transition-colors`}>
                  <i className="fa-regular fa-chevron-right"></i>
                </button>
              </div>
            </div>

            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={30}
              slidesPerView={1}
              navigation={{
                prevEl: `.prev-${category.id}`,
                nextEl: `.next-${category.id}`,
              }}
              breakpoints={{
                768: { slidesPerView: 2 },
                992: { slidesPerView: 3 },
              }}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              className="px-4 chronicles-swiper"
            >
              {category.items.map((item) => (
                <SwiperSlide key={item.id}>
                  <div className="group relative rounded-xl overflow-hidden aspect-video shadow-lg cursor-pointer">
                    <Image 
                      src={item.image} 
                      alt={item.title} 
                      fill
                      className="object-cover transform group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2C368F]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                      <h4 className="text-white font-semibold text-lg">{item.title}</h4>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ))}
      </div>
    </section>
  );
};
