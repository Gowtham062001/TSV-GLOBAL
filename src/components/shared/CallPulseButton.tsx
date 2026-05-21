"use client";

import React from "react";

interface CallPulseButtonProps {
  phoneNumber?: string;
}

export const CallPulseButton: React.FC<CallPulseButtonProps> = ({ 
  phoneNumber = "919600132975" 
}) => {
  return (
    <a 
      style={{ color: "#fff" }} 
      href={`tel:+${phoneNumber}`} 
      className="phone-call-2 pulse2"
      aria-label="Call Now"
    > 
      <span className="phone">
        <i className="fa-solid fa-phone"></i>
      </span>
    </a>
  );
};
