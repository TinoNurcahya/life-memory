"use client";

import { motion } from "motion/react";
import { JIMMY_DATASET } from "@/lib/experience/data";

export function MonthReconstruction() {
  const data = JIMMY_DATASET.monthReconstruction;
  const stats = JIMMY_DATASET.stats;

  return (
    <section
      id="month-reconstruction"
      aria-labelledby="month-heading"
      className="scene scene-void relative min-h-[90vh] flex flex-col justify-center px-6 md:px-16 lg:px-28 py-24 z-10"
    >
      <div className="max-w-4xl">
        <div className="text-[11px] font-mono tracking-widest uppercase text-muted mb-8">
          11 / GATHERING THE THREADS · LONGITUDINAL ARCHIVE
        </div>

        <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 mb-10 pb-6 border-b border-hairline/60">
          <h2 id="month-heading" className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-foreground">
            {data.month}
          </h2>
          <div className="flex flex-wrap gap-3 text-xs font-mono text-muted">
            <span className="text-foreground font-semibold">{stats.momentsRecorded} moments</span>
            <span>·</span>
            <span>{stats.placesVisited} places</span>
            <span>·</span>
            <span>{stats.peopleMentioned} people</span>
            <span>·</span>
            <span>{stats.recurringPatterns} patterns</span>
          </div>
        </div>

        <p className="font-serif italic text-base sm:text-lg text-foreground/80 leading-relaxed max-w-2xl mb-12">
          &ldquo;{data.summary}&rdquo;
        </p>

        <p className="mb-8 max-w-md text-sm leading-relaxed text-muted">
          One month, gathered without smoothing away its edges. These are the small returns that make a life legible.
        </p>

        {/* Condensed Timeline Events */}
        <div className="space-y-4">
          {data.timelineEvents.map((evt, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, duration: 0.5 }}
              className="flex items-start sm:items-center gap-4 rounded-xl border border-hairline bg-surface/80 p-4 transition-colors hover:border-brand/40"
            >
              <span className="text-xs font-mono font-semibold text-brand min-w-[70px]">
                {evt.date}
              </span>
              <span className="text-sm font-sans text-foreground/90 flex-1 leading-snug">
                {evt.text}
              </span>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded text-[11px] font-mono capitalize bg-surface-subdued text-muted border border-hairline">
                {evt.category}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
