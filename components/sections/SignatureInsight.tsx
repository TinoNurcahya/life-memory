"use client";

import { motion } from "motion/react";
import { JIMMY_DATASET } from "@/lib/experience/data";
import { Compass, ArrowDown } from "lucide-react";
import { MemoryMedia } from "@/components/experience/MemoryMedia";

export function SignatureInsight() {
  const insight = JIMMY_DATASET.signatureInsight;

  return (
    <section
      id="insight"
      aria-labelledby="insight-heading"
      className="scene scene-void scene-field relative min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-28 py-24 z-10"
    >
      <div className="max-w-6xl w-full">
        <div className="text-[11px] font-mono tracking-widest uppercase text-muted mb-8">
          09 / THE QUIET PROOF · S-14
        </div>

        {/* Quiet Large Statement */}
        <h2 id="insight-heading" className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal text-foreground leading-[1.1] mb-12">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="block text-muted"
          >
            YOU PROBABLY
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.35, ease: "easeOut" }}
            className="block italic font-light text-foreground"
          >
            FORGOT THIS.
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.9, ease: "easeOut" }}
            className="mt-8 block max-w-xl font-sans text-base font-normal leading-relaxed text-muted sm:text-lg"
          >
            But the pattern stayed. One ordinary place, quietly returning.
          </motion.span>
        </h2>

        {/* Evidence Card & Visual Memory Grid */}
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
            className="relative overflow-hidden border-y border-brand/30 bg-transparent py-8 sm:py-12"
          >
            <div className="flex items-center gap-2 text-xs font-mono text-brand mb-6">
              <Compass className="w-4 h-4 text-brand" />
              <span className="tracking-wider uppercase">EVIDENCE FOUND IN YOUR ARCHIVE</span>
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl text-foreground font-normal mb-8 leading-tight">
              &ldquo;{insight.claim}&rdquo;
            </h3>

            {/* Evidence Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 border-y border-hairline/60 mb-8">
              {insight.evidence.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="text-[11px] font-mono text-muted uppercase tracking-wider">
                    {item.label}
                  </div>
                  <div className="text-sm font-sans font-medium text-foreground">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            <p className="font-serif italic text-sm text-muted leading-relaxed">
              {insight.reflectionQuote}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
            className="flex flex-col gap-4"
          >
            <MemoryMedia
              src="/images/memory-cafe-corner.jpg"
              alt="An intimate corner table in a quiet sunlit cafe"
              caption="The same table, 11 times. Quietly returning."
              className="memory-media--insight"
            >
              <div className="memory-media__lines" />
              <span className="memory-media__stamp">OCTOBER / 11 VISITS</span>
              <span className="memory-media__word">anchor</span>
            </MemoryMedia>
            <div className="text-[10px] font-mono text-muted flex items-center justify-between px-1">
              <span>Artifact #14 · Blank Street Coffee</span>
              <span className="text-brand">8/11 visits post 18:00</span>
            </div>
          </motion.div>
        </div>

        <a href="#reflection" className="group mt-12 inline-flex items-center gap-3 text-xs font-mono uppercase tracking-[0.2em] text-muted transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand">
          Stay with the feeling
          <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-1" />
        </a>
      </div>
    </section>
  );
}
