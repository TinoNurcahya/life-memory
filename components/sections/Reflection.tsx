"use client";

import { motion } from "motion/react";

export function Reflection() {
  return (
    <section id="reflection" aria-labelledby="reflection-heading" className="scene scene-void scene-field relative flex min-h-[100vh] items-center px-6 py-32 text-[#e9e5dc] sm:px-12 md:px-20 lg:px-28">
      <div className="mx-auto w-full max-w-6xl">
        <span className="mb-20 block text-[10px] font-mono uppercase tracking-[0.28em] text-[#747b7d]">10 / The space between</span>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.2 }}>
          <h2 id="reflection-heading" className="max-w-5xl font-serif text-[clamp(3rem,8vw,8rem)] font-light leading-[0.88] tracking-[-0.05em]">
            A life is not only
            <span className="block pl-[12vw] italic text-[#7893d0]">what you remember.</span>
          </h2>
          <div className="mt-24 grid max-w-3xl gap-8 border-t border-[#7893d0]/25 pt-6 sm:grid-cols-[1fr_1.5fr]">
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#7893d0]">The emotional void</p>
            <p className="max-w-sm text-lg leading-relaxed text-[#aeb2b1]">It is also everything that happened between the memories: the ordinary hours that held you together before you knew they mattered.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
