"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EXPERIENCE_CONFIG } from "@/lib/experience/config";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let dispose: (() => void) | undefined;

    const syncPreference = () => {
      dispose?.();
      dispose = undefined;
      if (!desktopQuery.matches || motionQuery.matches) return;

      const lenis = new Lenis({
        duration: EXPERIENCE_CONFIG.scroll.duration,
        easing: EXPERIENCE_CONFIG.scroll.easing,
        autoRaf: false,
        // Lenis already reads each target's CSS scroll-margin-top.
        anchors: true,
        syncTouch: false,
        infinite: false,
      });
      const updateTicker = (time: number) => lenis.raf(time * 1000);
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(updateTicker);

      dispose = () => {
        gsap.ticker.remove(updateTicker);
        lenis.off("scroll", ScrollTrigger.update);
        lenis.destroy();
      };
    };

    syncPreference();
    desktopQuery.addEventListener("change", syncPreference);
    motionQuery.addEventListener("change", syncPreference);
    return () => {
      desktopQuery.removeEventListener("change", syncPreference);
      motionQuery.removeEventListener("change", syncPreference);
      dispose?.();
    };
  }, []);

  return <div className="smooth-scroll-wrapper">{children}</div>;
}
