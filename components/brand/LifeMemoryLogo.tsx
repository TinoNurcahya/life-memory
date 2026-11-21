import type { SVGProps } from "react";

/**
 * Official Life Memory Logo (Eight-pointed starburst in squircle with amber core)
 */
export function LifeMemoryLogo({
  className = "h-6 w-6",
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
      {...props}
    >
      <rect width="32" height="32" rx="7" fill="#14171A" />
      <rect
        x="0.5"
        y="0.5"
        width="31"
        height="31"
        rx="6.5"
        stroke="#FFFFFF"
        strokeOpacity="0.15"
      />
      <g stroke="#F5F3EF" strokeWidth="2.2" strokeLinecap="round">
        <line x1="16" y1="7" x2="16" y2="25" />
        <line x1="7" y1="16" x2="25" y2="16" />
        <line x1="9.6" y1="9.6" x2="22.4" y2="22.4" />
        <line x1="22.4" y1="9.6" x2="9.6" y2="22.4" />
      </g>
      <circle cx="16" cy="16" r="2.2" fill="#D97706" />
    </svg>
  );
}
