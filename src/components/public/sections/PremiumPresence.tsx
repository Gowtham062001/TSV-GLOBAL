"use client";

import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";

// Extend window for AnyChart
declare global {
  interface Window {
    anychart: any;
    shippingPortsData: any;
    tsvMap: any;
  }
}

export interface Region {
  name: string;
  image: string;
  lon: number;
  lat: number;
  zoom: number;
}

export interface PremiumPresenceProps {
  heading?: string;
  headingHighlight?: string;
  description?: string;
  regions?: Region[];
}

export const PremiumPresence: React.FC<PremiumPresenceProps> = ({
  heading = "Global",
  headingHighlight = "Coverage",
  description = "Our strategic presence across major global hubs ensures seamless logistics connectivity.",
  regions = []
}) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [stats, setStats] = useState<{label: string, count: number}[]>([]);

  // Divide regions into left and right for the split layout
  const leftRegions = regions.slice(0, Math.ceil(regions.length / 2));
  const rightRegions = regions.slice(Math.ceil(regions.length / 2));

  useEffect(() => {
    // Basic counter animation logic
    const initCounters = () => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const count = parseInt(el.getAttribute('data-count') || '0');
            let start = 0;
            const duration = 2000;
            const step = (count / duration) * 16;
            const timer = setInterval(() => {
              start += step;
              if (start >= count) {
                el.textContent = count.toString();
                clearInterval(timer);
              } else {
                el.textContent = Math.floor(start).toString();
              }
            }, 16);
            observer.unobserve(el);
          }
        });
      }, { threshold: 0.5 });

      document.querySelectorAll('.odometer-trigger').forEach(el => observer.observe(el));
    };

    if (isScriptLoaded) initCounters();
  }, [isScriptLoaded]);

  useEffect(() => {
    // Check if AnyChart is already available or wait for it
    const checkAnyChart = setInterval(() => {
      if (window.anychart && window.shippingPortsData) {
        setIsScriptLoaded(true);
        clearInterval(checkAnyChart);
      }
    }, 500);

    return () => clearInterval(checkAnyChart);
  }, []);

  useEffect(() => {
    if (!isScriptLoaded || !window.anychart || !window.shippingPortsData) return;

    const anychart = window.anychart;
    
    // Cleanup previous instance if any
    const container = document.getElementById('anychart-map-container');
    if (container) container.innerHTML = '';
    window.tsvMap = null;

    anychart.onDocumentReady(() => {
      anychart.theme('darkGlamour');
      const map = anychart.map();
      window.tsvMap = map;

      // Ensure the world geodata is loaded
      if (anychart.maps && anychart.maps.world) {
        map.geoData('anychart.maps.world');
      } else {
        console.warn("[PremiumPresence] Map geodata not yet available, retrying...");
        return; 
      }
      
      // Configure map title
      map.title()
        .enabled(true)
        .useHtml(true)
        .text('Global Port Network & Shipping Logistics Hubs')
        .fontColor('#ffffff')
        .fontSize(16)
        .padding([0, 0, 20, 0]);

      // Set background transparent to match section
      map.background().fill('transparent');

      // ─── LEGACY RESTORATION: Match thresholds and colors from archive exactly ───
      const rawData = (window as any).shippingPortsData || [];
      
      const createSeries = (name: string, data: any[], color: string) => {
        if (data.length === 0) return;

        const dataSet = anychart.data.set(data).mapAs({
          'lat': 'lat',
          'long': 'long',
          'name': 'Name',
          'country': 'Country',
          'outflows': 'outflows'
        });

        const series = map.marker(dataSet);
        series.name(name)
          .fill(color)
          .stroke('none')
          .type('circle')
          .size(3)
          .labels(false)
          .selectionMode('none');

        series.legendItem()
          .iconType('circle')
          .iconFill(color);

        series.hovered()
          .size(5)
          .fill('#c1000a')
          .stroke('2 #ffffff');

        series.tooltip()
          .useHtml(true)
          .padding([8, 13, 10, 13])
          .width(300)
          .fontSize(12)
          .fontColor('#e6e6e6')
          .titleFormat(function(this: any) { return this.getData('name'); })
          .format(function(this: any) {
            return `<span style="color: #bfbfbf">Country: </span>${this.getData('country')}<br/>` +
                   `<span style="color: #bfbfbf">Outflows: </span>${Math.round(this.getData('outflows') || 0).toLocaleString()}`;
          });
      };

      // Exact categories from associations.html archive
      const cat1 = rawData.filter((p: any) => (Number(p.outflows) || 0) < 100000);
      const cat2 = rawData.filter((p: any) => (Number(p.outflows) || 0) >= 100000 && (Number(p.outflows) || 0) < 1000000);
      const cat3 = rawData.filter((p: any) => (Number(p.outflows) || 0) >= 1000000 && (Number(p.outflows) || 0) < 5000000);
      const cat4 = rawData.filter((p: any) => (Number(p.outflows) || 0) >= 5000000 && (Number(p.outflows) || 0) < 10000000);
      const cat5 = rawData.filter((p: any) => (Number(p.outflows) || 0) >= 10000000);

      createSeries('Up to 100,000', cat1, '#D1FAE9');
      createSeries('100,000 - 1,000,000', cat2, '#9CE0E5');
      createSeries('1,000,000 - 5,000,000', cat3, '#00ACC3');
      createSeries('5,000,000 - 10,000,000', cat4, '#355CB1');
      createSeries('More than 10,000,000', cat5, '#c1000a');

      // Configure legend
      map.legend()
        .enabled(true)
        .position('bottom')
        .padding([20, 0, 0, 0]);

      // Add zoom controls
      const zoomController = anychart.ui.zoom();
      zoomController.render(map);

      map.container('anychart-map-container');
      map.draw();

      // Aggressive Credits Removal
      const removeCredits = () => {
        // AnyChart often injects elements with specific classes or text
        const credits = document.querySelectorAll('.anychart-credits, .anychart-credits-indicator, .anychart-credits-logo, a[href*="anychart.com"], .anychart-unlicensed');
        credits.forEach(el => {
          (el as HTMLElement).style.display = 'none';
          el.remove();
        });
        
        // Find text content "AnyChart Trial" or "Unlicensed"
        const allDivs = document.querySelectorAll('div, span, a');
        allDivs.forEach(el => {
          const text = el.textContent || "";
          if (text.includes("anychart trial") || text.includes("unlicensed") || text.includes("anychart.com")) {
            (el as HTMLElement).style.display = 'none';
          }
        });
      };

      removeCredits();
      const observer = new MutationObserver(removeCredits);
      if (container) observer.observe(container, { childList: true, subtree: true });
      const interval = setInterval(removeCredits, 300);
      const timeout = setTimeout(removeCredits, 1500); // Late check

      return () => {
        observer.disconnect();
        clearInterval(interval);
        clearTimeout(timeout);
      };
    });
  }, [isScriptLoaded]);

  const handleRegionClick = (region: Region) => {
    setActiveRegion(region.name);
    if (window.tsvMap) {
      const coords = window.tsvMap.transform(region.lon, region.lat);
      window.tsvMap.zoomTo(region.zoom, coords.x, coords.y);
    }
  };

  const handleReset = () => {
    setActiveRegion(null);
    if (window.tsvMap) {
      window.tsvMap.zoomTo(1, 0, 0);
    }
  };

  return (
    <section className="premium-presence-section">
      <div className="container-fluid px-lg-5">
        <h2 className="presence-title" onClick={handleReset} style={{ cursor: 'pointer' }}>
          {heading} <span>{headingHighlight}</span>
        </h2>

        <div className="row align-items-center">
          {/* Left Regions (First 3) */}
          <div className="col-xl-3 col-lg-3 order-1 order-lg-1">
            <div className="region-card-wrapper">
              {leftRegions.map((region, idx) => (
                <div 
                  key={idx} 
                  className="region-card wow fadeInLeft" 
                  data-wow-delay={`${idx * 0.1}s`}
                  onClick={() => handleRegionClick(region)}
                  style={{ borderColor: activeRegion === region.name ? '#c1000a' : '' }}
                >
                  <img 
                    src={region.image} 
                    alt={region.name} 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/img/logo.png'; 
                      (e.target as HTMLImageElement).style.opacity = '0.3';
                    }}
                  />
                  <div className="region-content">
                    <div className="region-label">{region.name}</div>
                    <div className="region-icon"><i className="fa-solid fa-plus"></i></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map Center */}
          <div className="col-xl-6 col-lg-6 order-2 order-lg-2">
            <div className="map-container">
              <div id="anychart-map-container">
                {!isScriptLoaded && (
                  <div className="d-flex align-items-center justify-content-center h-100 text-white/40">
                    <div className="spinner-border text-danger me-3" role="status"></div>
                    Loading Global Map...
                  </div>
                )}
              </div>
              <div className="map-overlay-highlight"></div>
            </div>
          </div>

          {/* Right Regions (Next 3) */}
          <div className="col-xl-3 col-lg-3 order-3">
            <div className="region-card-wrapper">
              {rightRegions.map((region, idx) => (
                <div 
                  key={idx} 
                  className="region-card region-card-right wow fadeInRight" 
                  data-wow-delay={`${idx * 0.1}s`}
                  onClick={() => handleRegionClick(region)}
                  style={{ borderColor: activeRegion === region.name ? '#c1000a' : '' }}
                >
                  <img 
                    src={region.image} 
                    alt={region.name} 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/img/logo.png'; 
                      (e.target as HTMLImageElement).style.opacity = '0.3';
                    }}
                  />
                  <div className="region-content">
                    <div className="region-label">{region.name}</div>
                    <div className="region-icon"><i className="fa-solid fa-plus"></i></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="row justify-content-center mt-70 g-4 text-center presence-stats-row">
          <div className="col-lg-3 col-md-6 wow fade-in-bottom">
            <h3 className="stat-number"><span className="odometer-trigger" data-count="50">0</span>+</h3>
            <p className="stat-label">Global Partners</p>
          </div>
          <div className="col-lg-3 col-md-6 wow fade-in-bottom" data-wow-delay="200ms">
            <h3 className="stat-number"><span className="odometer-trigger" data-count="20">0</span>+</h3>
            <p className="stat-label">Countries Served</p>
          </div>
          <div className="col-lg-3 col-md-6 wow fade-in-bottom" data-wow-delay="400ms">
            <h3 className="stat-number"><span className="odometer-trigger" data-count="150">0</span>+</h3>
            <p className="stat-label">Agents Worldwide</p>
          </div>
        </div>

        <div className="text-center mt-5 text-white/50 max-w-2xl mx-auto px-3">
          <p>{description}</p>
        </div>
      </div>
      <style jsx>{`
        .mt-70 { margin-top: 70px; }
        .stat-number { font-size: 48px; font-weight: 800; color: #c1000a; margin-bottom: 5px; }
        .stat-label { text-transform: uppercase; font-size: 11px; letter-spacing: 2px; font-weight: 700; opacity: 0.7; color: #fff; }
        @media (max-width: 991px) {
          .presence-title { font-size: 28px !important; text-align: center !important; margin-bottom: 30px !important; }
          .map-container { min-height: 350px !important; margin: 30px 0 !important; }
          #anychart-map-container { height: 350px !important; }
          .region-card-wrapper { 
            display: grid !important; 
            grid-template-columns: 1fr !important; 
            gap: 15px !important; 
            padding: 0 15px !important;
          }
          .region-card { 
            width: 100% !important; 
            height: 130px !important; 
            margin: 0 !important; 
          }
          .region-label { font-size: 15px !important; font-weight: 700 !important; }
          .region-card img { 
            width: 100% !important;
            height: 100% !important; 
            object-fit: cover !important; 
            opacity: 0.9 !important;
          }
        }
        @media (max-width: 576px) {
          .presence-title { font-size: 24px !important; }
        }
      `}</style>
    </section>
  );
};
