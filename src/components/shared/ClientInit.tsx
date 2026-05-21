"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ClientInit() {
  const pathname = usePathname();

  useEffect(() => {
    const initAll = async () => {
      // 0. Initialize Lenis Smooth Scroll
      try {
        const Lenis = (await import("lenis")).default;
        const lenis = new Lenis({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: "vertical",
          gestureOrientation: "vertical",
          smoothWheel: true,
          wheelMultiplier: 1,
          smoothTouch: false,
          touchMultiplier: 2,
        } as any);

        const raf = (time: number) => {
          lenis.raf(time);
          requestAnimationFrame(raf);
        };

        requestAnimationFrame(raf);
      } catch (err) {
        console.error("Lenis init error:", err);
      }

      // 1. Initialize WOW.js
      try {
        if (typeof window !== "undefined") {
          const WOW = (window as any).WOW || (await import("wowjs")).default;
          if (WOW) {
            const wow = new WOW({ 
              live: false,
              boxClass: 'wow',
              animateClass: 'animated',
              offset: 0,
              mobile: true,
            });
            wow.init();
          }
        }
      } catch (err) {
        console.warn("WOW init error:", err);
      }

      // 2. Initialize GSAP Text Animations
      try {
        const { gsap } = await import("gsap");
        const { ScrollTrigger } = await import("gsap/ScrollTrigger");
        gsap.registerPlugin(ScrollTrigger);

        document.querySelectorAll("[data-effect]").forEach((el) => {
          const effect = el.getAttribute("data-effect");
          const delay = parseFloat(el.getAttribute("data-delay") || "0");
          const duration = parseFloat(el.getAttribute("data-duration") || "1");
          const ease = el.getAttribute("data-ease") || "power2.out";

          gsap.fromTo(
            el,
            { 
              opacity: 0, 
              x: effect?.includes("right") ? -40 : (effect?.includes("left") ? 40 : 0),
              y: effect?.includes("bottom") ? 30 : (effect?.includes("top") ? -30 : 0) 
            },
            { 
              opacity: 1, 
              x: 0, 
              y: 0, 
              duration, 
              delay,
              ease,
              scrollTrigger: { 
                trigger: el, 
                start: "top 90%",
                toggleActions: "play none none none" 
              }
            }
          );
        });
      } catch (err) {
        console.error("GSAP init error:", err);
      }
    };

    initAll();
  }, [pathname]);

  return null;
}
