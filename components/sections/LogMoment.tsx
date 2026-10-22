"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { JIMMY_DATASET } from "@/lib/experience/data";
import { RefreshCw } from "lucide-react";
import { MemoryTrace } from "./MemoryTrace";
import { MemoryMedia } from "@/components/experience/MemoryMedia";

export function LogMoment() {
  const [logText, setLogText] = useState(JIMMY_DATASET.defaultSeedLog);
  const extracted = logText.trim().length > 10;

  return (
    <section id="log" aria-labelledby="log-heading" className="scene scene-paper relative min-h-screen px-6 py-32 text-[#0b0d0f] sm:px-12 md:px-20 lg:px-28">
      <MemoryTrace className="text-[#263b67] opacity-40" />
      <div className="mx-auto max-w-6xl">
        <div className="mb-24 flex items-center justify-between border-b border-[#0b0d0f]/20 pb-4 text-[10px] font-mono uppercase tracking-[0.25em] text-[#747b7d]">
          <span>02 / Trace</span>
          <button type="button" onClick={() => setLogText(JIMMY_DATASET.defaultSeedLog)} className="flex items-center gap-2 hover:text-[#0b0d0f]">
            <RefreshCw className="h-3 w-3" /> Seed sample
          </button>
        </div>
        <div className="grid gap-16 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
          <div>
            <p className="mb-8 text-[10px] font-mono uppercase tracking-[0.25em] text-[#263b67]">A moment, before it becomes a pattern</p>
            <h2 id="log-heading" className="font-serif text-5xl font-light leading-[0.95] tracking-tight sm:text-7xl">
              Write it<br /><em>as it was.</em>
            </h2>
          </div>
          <div className="relative border-b border-[#0b0d0f]/30 pb-5">
            <div className="mb-6 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-[#747b7d]">
              <span>Tuesday / 21:43</span><span>Raw fragment</span>
            </div>
            <textarea
              aria-label="Write a memory fragment"
              data-memory-source="fragment"
              value={logText}
              onChange={(event) => setLogText(event.target.value)}
              rows={4}
              className="w-full resize-none bg-transparent font-serif text-2xl leading-relaxed outline-none placeholder:text-[#747b7d]/50 sm:text-3xl"
              placeholder="Worked late. Raka brought coffee..."
            />
            <div className="mt-6 flex min-h-8 flex-wrap gap-2">
              <AnimatePresence>
                {extracted && JIMMY_DATASET.extractedItems.map((item, index) => (
                  <motion.span
                    key={item.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    data-memory-entity={item.type}
                    className="border-b border-[#263b67] px-1 pb-1 text-[10px] font-mono uppercase tracking-wider text-[#263b67]"
                  >
                    {item.label} / {item.type}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          </div>
          <MemoryMedia
            src="/images/memory-rainy-commute.jpg"
            alt="An ordinary rainy evening street with warm amber shoplights"
            caption="No milestone. Just evidence."
            className="memory-media--log mt-20"
          >
            <div className="memory-media__lines" />
            <span className="memory-media__stamp">TUESDAY / 21:43</span>
            <span className="memory-media__word">coffee / rain / home</span>
          </MemoryMedia>
        </div>
      </div>
    </section>
  );
}
