"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "motion/react";
import { JIMMY_DATASET } from "@/lib/experience/data";

function Count({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const visible = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!visible) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setCount(value);
      return;
    }
    const start = performance.now();
    let animationFrame = 0;
    const frame = (now: number) => {
      const progress = Math.min((now - start) / 900, 1);
      setCount(Math.round(value * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) animationFrame = requestAnimationFrame(frame);
    };
    animationFrame = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animationFrame);
  }, [visible, value]);
  return <span ref={ref}>{count}</span>;
}

export function ByTheNumbers() {
  const stats = JIMMY_DATASET.stats;
  const items = [
    ["days remembered", stats.daysRemembered, "OCT 2026 WINDOW"],
    ["moments recorded", stats.momentsRecorded, "DISCRETE LOGS"],
    ["places visited", stats.placesVisited, "DISTINCT LOCATIONS"],
    ["people connected", stats.peopleMentioned, "RESOLVED TIES"],
  ] as const;
  return (
    <section id="numbers" aria-labelledby="numbers-heading" className="scene scene-data relative min-h-[85vh] flex items-center px-6 md:px-16 lg:px-28 py-24 z-10">
      <div className="max-w-6xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-hairline pb-8">
          <div>
            <div className="text-[11px] font-mono tracking-widest uppercase text-muted mb-5">05 / BY THE NUMBERS · ARCHIVE SUMMARY</div>
            <h2 id="numbers-heading" className="font-serif text-4xl sm:text-5xl md:text-6xl font-light leading-none">A month, in lived dimensions.</h2>
          </div>
          <p className="font-serif italic text-lg text-muted max-w-xs">Not productivity targets. Just the shape of being there.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 mt-10">
          {items.map(([label, value, note], index) => (
            <motion.div key={label} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }} className="relative py-8 pr-6 border-b sm:border-b-0 lg:border-r border-hairline last:border-r-0 lg:pl-6 first:pl-0">
              <div className="font-mono text-7xl md:text-8xl font-light tracking-tight text-brand tabular-nums"><Count value={value} /></div>
              <div className="font-serif text-xl mt-3">{label}</div>
              <div className="text-[10px] font-mono tracking-widest text-muted mt-2">{note}</div>
            </motion.div>
          ))}
        </div>
        <div className="mt-12 h-2 bg-brand/10 relative overflow-hidden"><motion.div initial={{ width: 0 }} whileInView={{ width: "78%" }} viewport={{ once: true }} transition={{ duration: 1 }} className="h-full bg-brand" /><span className="absolute right-0 -top-6 text-[10px] font-mono text-muted">31 days indexed / 74 moments</span></div>
      </div>
    </section>
  );
}
