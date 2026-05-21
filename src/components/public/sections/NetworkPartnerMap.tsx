"use client";

import React, { useState } from "react";

const PORT_MAP_CONFIG = {
    bounds: {
        minLng: -169.110266,
        maxLat: 83.600842,
        maxLng: 190.486279,
        minLat: -58.508473
    },
    project: function(lat: number, lng: number) {
        const totalWidth = this.bounds.maxLng - this.bounds.minLng;
        const totalHeight = this.bounds.maxLat - this.bounds.minLat;
        let normalizedLng = lng;
        if (lng < this.bounds.minLng) normalizedLng += 360;
        const x = ((normalizedLng - this.bounds.minLng) / totalWidth) * 100;
        const y = ((this.bounds.maxLat - lat) / totalHeight) * 100;
        return {
            x: Math.min(Math.max(x, 0), 100),
            y: Math.min(Math.max(y, 0), 100)
        };
    },
    getRandomShipments: function() {
        return Math.floor(Math.random() * 9000) + 1000;
    }
};

interface Port {
  name: string;
  country: string;
  lng: number;
  lat: number;
  cargo?: string;
}

export interface NetworkPartnerMapProps {
  heading?: string;
  description?: string;
  pins?: Port[];
}

const DEFAULT_PORTS: Port[] = [
    { name: "Dubai", country: "United Arab Emirates", lng: 55.27, lat: 25.25 },
    { name: "Abu Dhabi", country: "United Arab Emirates", lng: 54.37, lat: 24.47 },
    { name: "Jebel Ali", country: "United Arab Emirates", lng: 55.02, lat: 24.98 },
    { name: "Chennai", country: "India", lng: 80.27, lat: 13.08 },
    { name: "Mundra", country: "India", lng: 69.70, lat: 22.84 },
    { name: "Nhava Sheva", country: "India", lng: 72.95, lat: 18.95 },
    { name: "Singapore", country: "Singapore", lng: 103.85, lat: 1.28 },
    { name: "Shanghai", country: "China", lng: 121.47, lat: 31.23 },
    { name: "Rotterdam", country: "Netherlands", lng: 4.50, lat: 51.92 },
    { name: "Hamburg", country: "Germany", lng: 9.99, lat: 53.55 },
    { name: "New York", country: "United States", lng: -74.00, lat: 40.71 },
    { name: "Los Angeles", country: "United States", lng: -118.24, lat: 34.05 },
    { name: "Sydney", country: "Australia", lng: 151.20, lat: -33.86 },
    { name: "Auckland", country: "New Zealand", lng: 174.76, lat: -36.84 },
    { name: "Durban", country: "South Africa", lng: 31.02, lat: -29.85 },
];

export const NetworkPartnerMap: React.FC<NetworkPartnerMapProps> = ({ 
  heading = "Global Network Partners", 
  description = "Our strategic presence across major global hubs ensures seamless logistics connectivity.",
  pins = DEFAULT_PORTS
}) => {
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; port: Port | null }>({
    visible: false,
    x: 0,
    y: 0,
    port: null
  });

  const handleMouseEnter = (e: React.MouseEvent, port: Port) => {
    setTooltip({
      visible: true,
      x: e.clientX + 15,
      y: e.clientY + 15,
      port: {
        ...port,
        cargo: port.cargo || PORT_MAP_CONFIG.getRandomShipments().toLocaleString()
      }
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (tooltip.visible) {
      setTooltip(prev => ({ ...prev, x: e.clientX + 15, y: e.clientY + 15 }));
    }
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  return (
    <section className="footprint-map-section bg-white padding">
      <div className="container">
        <div className="section-heading text-center mb-50">
          <h3 className="sub-heading">Global Coverage</h3>
          <h2>{heading}</h2>
          <p className="max-w-2xl mx-auto">{description}</p>
        </div>

        <div className="footprint-map-wrapper relative overflow-hidden bg-[#fdfdfd] p-10 rounded-3xl border border-[#f0f0f0] shadow-sm">
          <img src="/img/world_local.svg" alt="World Map" className="w-full h-auto grayscale opacity-80" />
          
          <div className="absolute inset-0 pointer-events-none">
            {pins.map((port, index) => {
              const pos = PORT_MAP_CONFIG.project(port.lat, port.lng);
              return (
                <div
                  key={index}
                  className="port-pin pointer-events-auto absolute w-[10px] h-[10px] bg-[#ED2224] rounded-full cursor-pointer z-20 shadow-[0_0_10px_rgba(237,34,36,0.6)] animate-pulse"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
                  onMouseEnter={(e) => handleMouseEnter(e, port)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                />
              );
            })}
          </div>
        </div>
      </div>

      {tooltip.visible && tooltip.port && (
        <div 
          className="fixed z-[1000] bg-black/90 backdrop-blur-md border border-[#ED2224]/40 p-4 rounded-xl color-white pointer-events-none shadow-2xl min-w-[200px]"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="font-bold text-[#ED2224]">{tooltip.port.name}</div>
          <div className="text-sm text-gray-400">{tooltip.port.country}</div>
          <div className="mt-2 text-xs border-t border-gray-800 pt-2 flex justify-between">
            <span>Cargo Capacity:</span>
            <span className="text-white">{tooltip.port.cargo} TEUs</span>
          </div>
        </div>
      )}
      <style jsx>{`
        @media (max-width: 768px) {
          .footprint-map-wrapper { 
            padding: 20px 10px !important; 
            border-radius: 15px !important;
            margin: 0 -10px;
          }
          .port-pin { width: 6px !important; height: 6px !important; }
          h2 { font-size: 28px !important; }
          .section-heading p { font-size: 14px !important; }
        }
      `}</style>
    </section>
  );
};
