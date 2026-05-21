"use client";

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ClientInitialization() {
  useEffect(() => {
    // Initialize AOS
    AOS.init({
      duration: 1000,
      once: true,
      easing: "ease-in-out",
    });

    // Initialize GSAP ScrollTriggers for elements with .text-anim etc.
    // This replicates the logic in the original main.js but for the React lifecycle
    const textAnims = document.querySelectorAll(".text-anim");
    textAnims.forEach((el) => {
      gsap.from(el, {
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
        },
        opacity: 0,
        y: 20,
        duration: 1,
        ease: "power2.out",
      });
    });

    // Handle smooth scrolling or other legacy JS logic here
  }, []);

  return null;
}
