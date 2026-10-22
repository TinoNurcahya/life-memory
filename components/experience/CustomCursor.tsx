"use client";

import { useEffect, useRef, useState } from "react";

export function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const frameRef = useRef<number | null>(null);
  const pointerRef = useRef({ x: -100, y: -100 });
  const visibleRef = useRef(false);

  useEffect(() => {
    // Disable on touch devices or reduced motion
    const touchCheck = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (touchCheck || reducedMotion) {
      setIsTouchDevice(true);
      return;
    }

    const onMouseMove = (e: MouseEvent) => {
      pointerRef.current = { x: e.clientX, y: e.clientY };
      if (!visibleRef.current) {
        visibleRef.current = true;
        setIsVisible(true);
      }
      if (frameRef.current === null) {
        frameRef.current = requestAnimationFrame(() => {
          setPosition(pointerRef.current);
          frameRef.current = null;
        });
      }
    };

    const onMouseLeave = () => {
      visibleRef.current = false;
      setIsVisible(false);
    };
    const onMouseEnter = () => {
      visibleRef.current = true;
      setIsVisible(true);
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "BUTTON" ||
          target.tagName === "A" ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.closest("button") ||
          target.closest("a") ||
          target.getAttribute("data-interactive") === "true")
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);
    document.addEventListener("mouseover", onMouseOver);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      document.removeEventListener("mouseover", onMouseOver);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  if (isTouchDevice || !isVisible) return null;

  return (
    <div
      className="pointer-events-none fixed top-0 left-0 z-50 transition-transform duration-75 ease-out"
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
      }}
    >
      <div
        className={`-translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-200 ease-out ${
          isHovered
            ? "w-8 h-8 bg-brand/20 border border-brand scale-125"
            : "w-2.5 h-2.5 bg-foreground/70"
        }`}
      />
    </div>
  );
}
