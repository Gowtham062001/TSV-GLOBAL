"use client";

import React from "react";

interface WhatsAppPulseButtonProps {
  phoneNumber?: string;
}

export const WhatsAppPulseButton: React.FC<WhatsAppPulseButtonProps> = ({ 
  phoneNumber = "919600132980" 
}) => {
  return (
    <a 
      style={{ color: "#fff" }} 
      target="_blank" 
      rel="noopener noreferrer"
      href={`https://wa.me/${phoneNumber}?text=Hi`} 
      className="whatsapp-info pulse2"
      aria-label="Chat on WhatsApp"
    > 
      <span className="whatsapp">
        <i className="fa-brands fa-whatsapp"></i>
      </span>
    </a>
  );
};
