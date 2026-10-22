"use client";

import { motion } from "motion/react";
import { MemoryMedia } from "@/components/experience/MemoryMedia";

export function ThePresent() {
  return (
    <section id="present" aria-labelledby="present-heading" className="scene scene-paper relative min-h-[95vh] px-6 py-32 sm:px-12 md:px-20 lg:px-28">
      <div className="mx-auto flex max-w-6xl flex-col justify-center">
        <span className="mb-24 text-[10px] font-mono uppercase tracking-[0.28em] text-brand">01 / The ordinary</span>
        <div className="max-w-5xl">
          <motion.h2
            id="present-heading"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 1 }}
            className="font-serif text-[clamp(3rem,8vw,8rem)] font-light leading-[0.9] tracking-[-0.05em] text-foreground"
          >
            Most days disappear
            <span className="block pl-[12vw] italic text-muted">without leaving a trace.</span>
          </motion.h2>

          <div className="mt-20 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.2 }}
            >
              <MemoryMedia
                src="/images/memory-autumn-park.jpg"
                alt="Two empty wooden chairs in an autumn park plaza"
                caption="The brief conversation that shifted your direction."
                className="memory-media--present"
              >
                <div className="memory-media__lines" />
                <span className="memory-media__stamp">AUTUMN / 14:20</span>
                <span className="memory-media__word">unnoticed</span>
              </MemoryMedia>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.35 }}
              className="border-t border-hairline pt-6 text-sm leading-relaxed text-muted max-w-md"
            >
              <p className="mb-3 font-serif text-2xl italic text-foreground">You remember the milestones.</p>
              <p>You forget everything that happened around them: the coffees, the rain, the brief conversations that shifted your direction.</p>
              <div className="mt-8 flex items-center gap-3 text-[11px] font-mono uppercase tracking-widest text-brand">
                <span className="w-1.5 h-1.5 rounded-full bg-brand" />
                Evidence precedes memory
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
