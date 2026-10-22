"use client";

import React from "react";

interface RollingTextProps {
  text: string;
  className?: string;
}

export function RollingText({ text, className = "" }: RollingTextProps) {
  const words = text.split(" ");

  return (
    <span className={`inline-flex flex-wrap items-center gap-[0.28em] ${className}`}>
      {words.map((word, i) => (
        <span key={i} className="relative inline-flex overflow-hidden leading-tight">
          <span
            className="inline-block transition-transform duration-[340ms] ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-full motion-reduce:transition-none motion-reduce:group-hover:translate-y-0"
            style={{ transitionDelay: `${i * 40}ms` }}
          >
            {word}
          </span>
          <span
            className="absolute top-0 left-0 inline-block translate-y-full transition-transform duration-[340ms] ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:translate-y-0 text-current motion-reduce:hidden"
            style={{ transitionDelay: `${i * 40}ms` }}
            aria-hidden="true"
          >
            {word}
          </span>
        </span>
      ))}
    </span>
  );
}
