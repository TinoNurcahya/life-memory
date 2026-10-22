import React from "react";

interface PaperCurlProps {
  className?: string;
  size?: number | string;
  style?: React.CSSProperties;
}

/**
 * Photorealistic 3D Paper Curl Component.
 * Features an authentic large dog-ear cylindrical roll reaching into the center (~52%),
 * with realistic kraft paper underside texture, lighting gradient, crease ambient occlusion,
 * specular highlight ridge, and seamless corner coverage.
 *
 * Fold diagonal runs from (100, 0) to (0, 100) in viewBox 0 0 100 100.
 * Curled flap tip arches inward to approximately (14, 14), reaching the card's midpoint.
 */
export function PaperCurl({ className = "", size = "100%", style }: PaperCurlProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`lm-retrieved-note-curl ${className}`}
      aria-hidden="true"
      style={{ overflow: "visible", ...style }}
    >
      <defs>
        {/* Soft diffused drop shadow cast by the curl onto the surface behind */}
        <filter id="lm-page-curl-soft-shadow" x="-50%" y="-50%" width="220%" height="220%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="5.5" />
          <feOffset dx="3" dy="3" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.45" />
          </feComponentTransfer>
        </filter>

        {/* Crease shadow on the base paper along the diagonal fold line */}
        <filter id="lm-page-crease-shadow" x="-40%" y="-40%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.8" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.48" />
          </feComponentTransfer>
        </filter>

        {/* 3D cylindrical lighting gradient for the rolled kraft paper flap */}
        <linearGradient id="lm-page-curl-surface" x1="12%" y1="12%" x2="88%" y2="88%">
          <stop offset="0%" stopColor="#d9c4a8" />
          <stop offset="14%" stopColor="#faf2e6" />
          <stop offset="28%" stopColor="#fffdfa" />
          <stop offset="46%" stopColor="#f3e7d5" />
          <stop offset="68%" stopColor="#e3cca9" />
          <stop offset="85%" stopColor="#c5a982" />
          <stop offset="95%" stopColor="#9b805c" />
          <stop offset="100%" stopColor="#6d573d" />
        </linearGradient>

        {/* Specular highlight along the arched ridge of the roll */}
        <linearGradient id="lm-page-curl-ridge" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.85)" />
          <stop offset="25%" stopColor="rgba(255, 255, 255, 0.45)" />
          <stop offset="60%" stopColor="rgba(255, 255, 255, 0.0)" />
        </linearGradient>

        {/* Paper fiber grain texture pattern */}
        <filter id="lm-page-curl-grain" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" result="noise" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.4
                    0 0 0 0 0.3
                    0 0 0 0 0.2
                    0 0 0 0.05 0"
            result="coloredNoise"
          />
          <feComposite operator="in" in2="SourceGraphic" />
        </filter>
      </defs>

      {/* Crease shadow under the fold on the base paper */}
      <path
        className="lm-curl-crease-shadow"
        d="M 100 0 C 72 24, 24 72, 0 100 C 26 76, 76 26, 100 0 Z"
        fill="#1c150e"
        filter="url(#lm-page-crease-shadow)"
      />

      {/* Cast shadow behind the curled flap on the scene background */}
      <path
        className="lm-curl-bg-shadow"
        d="M 0 100 C 18 55, 55 18, 100 0 C 96 65, 65 96, 0 100 Z"
        fill="#060b10"
        filter="url(#lm-page-curl-soft-shadow)"
      />

      {/* The 3D Curled Paper Flap Surface (Underside of note reaching to center) */}
      <g className="lm-retrieved-note-curl-flap">
        {/* Main curved kraft paper flap */}
        <path
          d="M 100 0
             C 72 24, 24 72, 0 100
             C 0 65, 4 30, 14 14
             C 30 4, 65 0, 100 0 Z"
          fill="url(#lm-page-curl-surface)"
        />

        {/* Specular ridge highlight along the curved apex */}
        <path
          d="M 94 6
             C 68 8, 32 20, 16 16
             C 20 32, 8 68, 6 94
             C 20 66, 66 20, 94 6 Z"
          fill="url(#lm-page-curl-ridge)"
          opacity="0.9"
        />

        {/* Paper rim highlight along the cut edges */}
        <path
          d="M 0 100 C 0 65, 4 30, 14 14 C 30 4, 65 0, 100 0"
          stroke="rgba(255, 255, 255, 0.75)"
          strokeWidth="0.8"
          strokeLinecap="round"
          fill="none"
        />

        {/* Ambient depth accent under the rim */}
        <path
          d="M 1 99 C 1 66, 5 32, 14 14 C 32 5, 66 1, 99 1"
          stroke="rgba(80, 60, 40, 0.22)"
          strokeWidth="0.6"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  );
}
