"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface CookieConsentProps {
  heading: string;
  message: string;
  link: string;
}

export const CookieConsent: React.FC<CookieConsentProps> = ({ heading, message, link }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div 
      className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-md bg-white border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-6 rounded-2xl z-[9999] animate-in fade-in slide-in-from-bottom-10 duration-500"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
            <i className="fa-regular fa-cookie-bite text-xl"></i>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 mb-1">{heading}</h4>
            <p className="text-sm text-gray-500 leading-relaxed">
              {message}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2">
          <button 
            onClick={accept}
            className="flex-1 bg-[#1a1a2e] text-white py-2.5 rounded-xl font-bold hover:bg-opacity-90 transition-all text-sm"
          >
            Accept All
          </button>
          <Link 
            href={link} 
            className="flex-1 text-center text-gray-400 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-all text-sm border border-gray-100"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
};
