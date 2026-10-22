"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { useReducedMotion } from "motion/react";

interface PolaroidPhotoProps {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  baseRotation?: number;
  sizes?: string;
}

/**
 * Authentic Washi Tape SVG with torn, jagged edges and paper fiber texture.
 */
function WashiTape({ className = "" }: { className?: string }) {
  return (
    <div className={`lm-polaroid-tape-wrap ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 140 34"
        width="140"
        height="34"
        className="lm-polaroid-tape-svg"
      >
        <defs>
          <filter id="lm-tape-shadow" x="-20%" y="-20%" width="140%" height="150%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1.8" />
            <feOffset dx="0" dy="1.8" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.32" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="lm-tape-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f7f1e4" stopOpacity="0.78" />
            <stop offset="50%" stopColor="#ede2cc" stopOpacity="0.72" />
            <stop offset="100%" stopColor="#dfd2b5" stopOpacity="0.68" />
          </linearGradient>
        </defs>

        {/* Tape with realistic jagged torn edges on left and right */}
        <path
          d="M 8 0
             L 6 4 L 9 8 L 5 12 L 8 16 L 6 20 L 9 24 L 6 28 L 8 34
             L 132 34
             L 134 30 L 131 26 L 135 21 L 132 17 L 135 12 L 131 8 L 134 4 L 132 0
             Z"
          fill="url(#lm-tape-grad)"
          filter="url(#lm-tape-shadow)"
        />
        {/* Subtle fiber line accents */}
        <path
          d="M 14 6 L 126 6"
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth="0.8"
          strokeDasharray="4 8"
          fill="none"
        />
        <path
          d="M 12 28 L 128 28"
          stroke="rgba(110, 90, 60, 0.12)"
          strokeWidth="0.8"
          strokeDasharray="6 10"
          fill="none"
        />
      </svg>
    </div>
  );
}

/**
 * Photorealistic Physical Polaroid Photo Component.
 * Features:
 * - Vintage white/ivory archival photo card stock frame with wide chin
 * - Textured semi-transparent washi tape pinned at top
 * - 3D Parallax Tilt with dynamic specular gloss glare on mouse hover
 * - Smooth spring physics interpolation
 */
export function PolaroidPhoto({
  src,
  alt,
  caption = "There is more to come.",
  className = "",
  baseRotation = 2.2,
  sizes = "(max-width: 767px) 85vw, 32vw",
}: PolaroidPhotoProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const reducedMotion = useReducedMotion();

  // CSS variables state for smooth 60fps tilt & glare
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (reducedMotion || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5

      // Tilt angles
      const maxTilt = 13;
      const tiltX = -y * maxTilt;
      const tiltY = x * maxTilt;

      // Glare coordinates
      const glareX = (x + 0.5) * 100;
      const glareY = (y + 0.5) * 100;

      // Dynamic shadow offset
      const shadowX = -tiltY * 1.5;
      const shadowY = tiltX * 1.5 + 24;

      const el = cardRef.current;
      el.style.setProperty("--tilt-x", `${tiltX.toFixed(2)}deg`);
      el.style.setProperty("--tilt-y", `${tiltY.toFixed(2)}deg`);
      el.style.setProperty("--tilt-z", "18px");
      el.style.setProperty("--tilt-scale", "1.03");
      el.style.setProperty("--glare-x", `${glareX.toFixed(1)}%`);
      el.style.setProperty("--glare-y", `${glareY.toFixed(1)}%`);
      el.style.setProperty("--glare-opacity", "1");
      el.style.setProperty("--shadow-x", `${shadowX.toFixed(1)}px`);
      el.style.setProperty("--shadow-y", `${shadowY.toFixed(1)}px`);
    },
    [reducedMotion]
  );

  const handlePointerEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handlePointerLeave = useCallback(() => {
    setIsHovered(false);
    if (!cardRef.current) return;
    const el = cardRef.current;
    el.style.setProperty("--tilt-x", "0deg");
    el.style.setProperty("--tilt-y", "0deg");
    el.style.setProperty("--tilt-z", "0px");
    el.style.setProperty("--tilt-scale", "1");
    el.style.setProperty("--glare-opacity", "0");
    el.style.setProperty("--shadow-x", "0px");
    el.style.setProperty("--shadow-y", "18px");
  }, []);

  // Initialize CSS variables on mount
  useEffect(() => {
    if (!cardRef.current) return;
    const el = cardRef.current;
    el.style.setProperty("--base-rot", `${baseRotation}deg`);
    el.style.setProperty("--tilt-x", "0deg");
    el.style.setProperty("--tilt-y", "0deg");
    el.style.setProperty("--tilt-z", "0px");
    el.style.setProperty("--tilt-scale", "1");
    el.style.setProperty("--glare-opacity", "0");
    el.style.setProperty("--glare-x", "50%");
    el.style.setProperty("--glare-y", "50%");
    el.style.setProperty("--shadow-x", "0px");
    el.style.setProperty("--shadow-y", "18px");
  }, [baseRotation]);

  return (
    <div className={`lm-polaroid-container ${className}`}>
      {/* 3D Perspective Card Wrapper */}
      <div
        ref={cardRef}
        className={`lm-polaroid-card ${isHovered ? "is-hovered" : ""}`}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
      >
        {/* Washi Tape taped at top */}
        <WashiTape />

        {/* White / Ivory Archival Card Stock Frame */}
        <div className="lm-polaroid-frame">
          {/* Inner Photo Window with Vignette */}
          <div className="lm-polaroid-photo-window">
            <Image
              src={src}
              alt={alt}
              fill
              sizes={sizes}
              className="lm-polaroid-img"
              priority={false}
            />

            {/* Specular Glare Reflection Sheen */}
            <div className="lm-polaroid-glare" aria-hidden="true" />

            {/* Photo Paper Edge Shadow */}
            <div className="lm-polaroid-inner-shadow" aria-hidden="true" />
          </div>

          {/* Polaroid Chin with Handwritten Caption */}
          {caption && (
            <div className="lm-polaroid-chin">
              <p className="lm-handwritten lm-polaroid-caption">{caption}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
