import type React from "react";

export function RedPushPin({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span className={`lm-detective-pin ${className}`} style={style} aria-hidden="true">
      <svg width="22" height="26" viewBox="0 0 22 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="pin-drop-shadow" x="-50%" y="-40%" width="220%" height="220%">
            <feDropShadow dx="2" dy="4" stdDeviation="2" floodColor="#091b25" floodOpacity="0.45" />
          </filter>
          <radialGradient id="pin-knob-grad" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#ff7070" />
            <stop offset="30%" stopColor="#ea2222" />
            <stop offset="70%" stopColor="#b91c1c" />
            <stop offset="100%" stopColor="#750b0b" />
          </radialGradient>
          <linearGradient id="pin-stem-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#991b1b" />
            <stop offset="50%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </linearGradient>
          <linearGradient id="pin-needle-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>
        </defs>
        <g filter="url(#pin-drop-shadow)">
          {/* Metal needle point into the surface */}
          <path d="M11 17L11 23" stroke="url(#pin-needle-grad)" strokeWidth="1.6" strokeLinecap="round" />
          {/* Pin base flange / collar */}
          <ellipse cx="11" cy="17" rx="4.2" ry="1.6" fill="#7f1d1d" />
          <ellipse cx="11" cy="16.5" rx="3.8" ry="1.3" fill="#b91c1c" />
          {/* Hourglass waist */}
          <path d="M8.5 11.5C8.5 11.5 9.5 14 11 14C12.5 14 13.5 11.5 13.5 11.5L14.2 16.5C14.2 16.5 13 17 11 17C9 17 7.8 16.5 7.8 16.5L8.5 11.5Z" fill="url(#pin-stem-grad)" />
          {/* Wrapped string collar around pin waist */}
          <ellipse cx="11" cy="14" rx="2.5" ry="1" fill="#7f1d1d" stroke="#dc2626" strokeWidth="0.9" />
          {/* Round knob top */}
          <circle cx="11" cy="7.5" r="5.5" fill="url(#pin-knob-grad)" />
          {/* Glossy specular reflection */}
          <ellipse cx="9" cy="5.5" rx="2" ry="1.2" fill="white" fillOpacity="0.75" transform="rotate(-25 9 5.5)" />
        </g>
      </svg>
    </span>
  );
}
