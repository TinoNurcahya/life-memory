"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Calendar, Sparkles } from "lucide-react";
import { JIMMY_DATASET } from "@/lib/experience/data";

export function Firsts() {
  const firsts = JIMMY_DATASET.firsts;
  const [selectedIdx, setSelectedIdx] = useState(0);
  const active = firsts[selectedIdx];
  return (
    <section id="firsts" aria-labelledby="firsts-heading" className="scene scene-paper relative min-h-[90vh] flex items-center px-6 md:px-16 lg:px-28 py-24 z-10">
      <div className="max-w-6xl mx-auto w-full">
        <div className="text-[11px] font-mono tracking-widest uppercase text-muted mb-6">07 / FIRST OCCURRENCES</div>
        <div className="grid lg:grid-cols-[0.62fr_1.38fr] gap-12 lg:gap-24">
          <div>
            <h2 id="firsts-heading" className="font-serif text-4xl sm:text-5xl md:text-6xl font-light leading-[1.02]">Every routine has a beginning.</h2>
            <p className="text-sm text-muted leading-relaxed mt-7 max-w-sm">Milestone moments before they became ordinary. Follow the thread from first note to familiar rhythm.</p>
            <div className="relative mt-12 ml-2 border-l border-brand/40">
              {firsts.map((item, index) => (
                <button type="button" key={item.id} onClick={() => setSelectedIdx(index)} className="group relative block text-left pl-7 pb-7 last:pb-0 w-full">
                  <span className={`absolute -left-[5px] top-1 w-2 h-2 rounded-full ring-4 ring-[var(--color-canvas)] transition-colors ${selectedIdx === index ? "bg-brand" : "bg-faint group-hover:bg-brand"}`} />
                  <span className={`text-[11px] font-mono tracking-wider ${selectedIdx === index ? "text-brand" : "text-muted"}`}>{item.date}</span>
                  <span className={`block font-serif text-lg mt-1 ${selectedIdx === index ? "text-foreground" : "text-muted"}`}>{item.title}</span>
                </button>
              ))}
            </div>
          </div>
          <motion.div key={active.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="relative min-h-[360px] border-t border-b border-hairline py-8 md:py-12 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-mono text-muted uppercase tracking-widest"><span className="text-amber-600 dark:text-amber-400 flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" /> First time recorded</span><span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {active.date}</span></div>
            <div className="py-10">
              <div className="text-[10px] font-mono text-brand uppercase tracking-widest mb-4">{active.category}</div>
              <h3 className="font-serif text-4xl sm:text-5xl font-light leading-tight">{active.title}</h3>
              <p className="text-sm text-brand mt-5">{active.subtitle}</p>
            </div>
            <blockquote className="font-serif italic text-lg text-foreground/80 border-l-2 border-amber-500/50 pl-5 max-w-xl">&ldquo;{active.context}&rdquo;</blockquote>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
