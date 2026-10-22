"use client";

import { motion, useReducedMotion } from "motion/react";

const TRACE_ITEMS = [
  { label: "21:43", type: "time", position: "left-[8%] top-[22%]" },
  { label: "RAKA", type: "person", position: "right-[13%] top-[35%]" },
  { label: "COFFEE", type: "object", position: "left-[18%] bottom-[24%]" },
  { label: "RAIN", type: "context", position: "right-[24%] bottom-[18%]" },
];

export function MemoryTrace({ className = "" }: { className?: string }) {
  const reducedMotion = useReducedMotion();

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <svg className="absolute inset-0 h-full w-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path className="memory-trace-path" d="M12 26 C35 30, 60 37, 85 39" fill="none" stroke="currentColor" strokeWidth="0.12" strokeDasharray="1 2" />
        <path className="memory-trace-path memory-trace-path-delayed" d="M21 78 C38 67, 60 54, 76 80" fill="none" stroke="currentColor" strokeWidth="0.12" strokeDasharray="1 2" />
      </svg>
      {TRACE_ITEMS.map((item, index) => (
        <motion.span
          key={item.label}
          initial={reducedMotion ? false : { opacity: 0, filter: "blur(6px)" }}
          whileInView={{ opacity: 0.5, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.3 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 1, delay: index * 0.12 }}
          className={`absolute ${item.position} flex flex-col gap-1 font-mono text-[9px] uppercase tracking-[0.22em] text-current`}
        >
          <span>{item.label}</span>
          <span className="text-[7px] opacity-60">{item.type}</span>
        </motion.span>
      ))}
    </div>
  );
}
