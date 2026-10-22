"use client";

import { motion } from "motion/react";
import { JIMMY_DATASET } from "@/lib/experience/data";

export function Patterns() {
  const patterns = JIMMY_DATASET.patterns;
  return (
    <section id="patterns" className="scene scene-ivory relative min-h-[90vh] flex items-center px-6 md:px-16 lg:px-28 py-24 z-10">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid lg:grid-cols-[0.62fr_1.38fr] gap-12 lg:gap-24 items-start">
          <div>
            <div className="text-[11px] font-mono tracking-widest uppercase text-muted mb-6">06 / PATTERNS · RECURRENCE</div>
            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light leading-[1.02]">The places that quietly repeat.</h2>
            <p className="text-sm text-muted leading-relaxed mt-7 max-w-sm">A frequency view of recurring visits and social rhythms across the archive. Repetition, without a score.</p>
            <div className="mt-12 text-[11px] font-mono text-muted uppercase tracking-widest"><span className="inline-block w-3 h-3 rounded-full bg-brand align-middle mr-2" /> One mark = one occurrence</div>
          </div>
          <div className="border-y border-hairline">
            {patterns.map((pattern, index) => (
              <motion.div key={pattern.id} initial={{ opacity: 0, x: 15 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="py-7 border-b last:border-b-0 border-hairline">
                <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-2 mb-4">
                  <div><span className="text-[10px] font-mono uppercase tracking-widest text-brand mr-3">{pattern.category}</span><span className="font-serif text-2xl">{pattern.label}</span></div>
                  <span className="text-xs font-mono text-muted">{pattern.frequency}</span>
                </div>
                <div className="grid grid-cols-[42px_1fr] gap-3 items-center">
                  <span className="text-[10px] font-mono text-faint">MAR</span>
                  <div className="flex gap-1">{Array.from({ length: pattern.months[0].count }).map((_, i) => <i key={i} className="w-2 h-2 rounded-full bg-brand/50" />)}</div>
                  <span className="text-[10px] font-mono text-faint">APR</span>
                  <div className="flex gap-1">{Array.from({ length: pattern.months[1].count }).map((_, i) => <i key={i} className="w-2 h-2 rounded-full bg-brand" />)}</div>
                  <span className="text-[10px] font-mono text-faint">MAY</span>
                  <div className="flex gap-1">{Array.from({ length: pattern.months[2].count }).map((_, i) => <i key={i} className="w-2 h-2 rounded-full bg-brand/70" />)}</div>
                </div>
                <div className="text-xs text-muted mt-4 max-w-lg">{pattern.insight}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
