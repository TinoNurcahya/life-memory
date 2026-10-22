"use client";

import { motion } from "motion/react";

const entities = [
  { label: "WORK", type: "activity", time: "daytime" },
  { label: "OFFICE", type: "place", time: "10:00–17:00" },
  { label: "RAKA", type: "person", time: "after work" },
  { label: "COFFEE", type: "topic", time: "17:30" },
  { label: "RAIN", type: "context", time: "weather" },
  { label: "21:43", type: "time", time: "timestamp" },
];

export function Extraction() {
  return (
    <section id="extraction" aria-labelledby="extraction-heading" className="scene scene-data relative min-h-[90vh] flex items-center px-6 md:px-16 lg:px-28 py-24 z-10">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid lg:grid-cols-[0.55fr_1.45fr] gap-12 lg:gap-24">
          <div>
            <div className="text-[11px] font-mono tracking-widest uppercase text-muted mb-6">03 / AI EXTRACTION · STRUCTURE</div>
            <h2 id="extraction-heading" className="font-serif text-4xl sm:text-5xl md:text-6xl font-light leading-[1.02] text-foreground">The quiet work behind a useful memory.</h2>
            <p className="text-sm text-muted leading-relaxed mt-6 max-w-sm">Entities are resolved from the words you actually used, then placed on a shared temporal axis.</p>
          </div>
          <div>
            <div className="border-l-2 border-brand/40 pl-6 md:pl-10">
              <div className="text-[11px] font-mono text-muted uppercase tracking-widest mb-4">Source note · unedited</div>
              <p className="font-serif text-2xl sm:text-3xl leading-relaxed max-w-3xl">
                <span className="text-brand border-b border-brand">Worked</span> from the <span className="text-brand border-b border-brand">office</span>. Had <span className="text-amber-600 dark:text-amber-400 border-b border-amber-500">coffee</span> with <span className="text-indigo-600 dark:text-indigo-400 border-b border-indigo-500">Raka</span> after work. Went home late because of <span className="text-muted border-b border-muted">rain</span>.
              </p>
            </div>
            <div className="mt-12 relative border-y border-hairline py-8">
              <div className="flex items-center justify-between text-[11px] font-mono text-muted uppercase tracking-widest mb-8"><span>Resolved on one timeline</span><span className="text-brand">Gemini 3.5 Flash-Lite</span></div>
              <div className="absolute left-8 right-8 top-[72px] h-px bg-brand/30" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-10 gap-x-4 relative">
                {entities.map((entity, index) => (
                  <motion.div key={entity.label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.08 }} className="relative">
                    <div className="w-3 h-3 rounded-full bg-brand ring-4 ring-surface mb-4" />
                    <div className="text-[10px] font-mono text-muted uppercase">{entity.type}</div>
                    <div className="font-mono text-sm text-foreground mt-1">{entity.label}</div>
                    <div className="text-[10px] text-faint mt-1">{entity.time}</div>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="text-[11px] text-muted mt-5">Facts are extracted directly from your words without fictionalizing context.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
