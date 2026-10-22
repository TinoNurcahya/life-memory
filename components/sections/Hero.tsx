"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowDown, ArrowRight } from "lucide-react";
import { MemoryTrace } from "./MemoryTrace";
import { MemoryMedia } from "@/components/experience/MemoryMedia";

const fragments = [
  { value: "21:43", label: "time", position: "left-[8%] top-[22%]" },
  { value: "rain", label: "weather", position: "left-[30%] top-[13%]" },
  { value: "Raka", label: "person", position: "right-[19%] top-[25%]" },
  { value: "coffee", label: "place", position: "left-[16%] bottom-[25%]" },
  { value: "Tuesday", label: "day", position: "right-[11%] bottom-[28%]" },
  { value: "home", label: "place", position: "right-[31%] bottom-[14%]" },
];

const headline = [
  { text: "The", className: "text-[#f4f7ff]" },
  { text: "shape", className: "pl-[7vw] text-[#d4e2ff]" },
  { text: "of", className: "pl-[14vw] text-[#91b5ed] italic" },
  { text: "your life.", className: "pl-[20vw] text-[#f4f7ff]" },
];

export function Hero() {
  const reducedMotion = useReducedMotion();
  const animate = reducedMotion ? false : true;

  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      className="scene scene-ink scene-field relative flex min-h-screen flex-col justify-between overflow-hidden px-6 pb-10 pt-32 text-[#edf3ff] sm:px-12 md:px-20 lg:px-28"
    >
      <MemoryTrace className="text-[#91b5ed]" />
      <MemoryMedia
        src="/images/hero-memory.jpg"
        alt="Archival memory photograph of a warm quiet cafe on a rainy evening"
        caption="A life is assembled from ordinary evidence."
        className="memory-media--hero"
      >
        <div className="memory-media__lines" />
        <span className="memory-media__stamp">ARCHIVE / 21:43</span>
        <span className="memory-media__word">ordinary</span>
      </MemoryMedia>
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/2 top-1/2 h-[min(72vw,42rem)] w-[min(72vw,42rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#123968]/50 blur-3xl" />
        {fragments.map((fragment, index) => (
          <motion.span
            key={fragment.value}
            initial={animate ? { opacity: 0, filter: "blur(8px)", scale: 0.8 } : false}
            animate={animate ? { opacity: index % 2 ? 0.42 : 0.7, filter: "blur(0px)", scale: 1 } : { opacity: 0.55, filter: "blur(0px)", scale: 1 }}
            transition={animate ? { duration: 1.1, delay: 0.3 + index * 0.12, ease: "easeOut" } : { duration: 0 }}
            className={`absolute ${fragment.position} flex flex-col gap-1 font-mono text-[10px] uppercase tracking-[0.25em] text-[#8eafd9]`}
          >
            <span className="text-[#d9e7ff]">{fragment.value}</span>
            <span className="text-[8px] tracking-[0.18em] text-[#6688b5]">{fragment.label}</span>
          </motion.span>
        ))}
      </div>

      <div className="relative z-10 flex items-center justify-between border-b border-[#b7cdf0]/20 pb-4 text-[10px] font-mono uppercase tracking-[0.24em] text-[#8eafd9]">
        <span>Life Memory / 00</span>
        <span className="hidden sm:inline">An archive of ordinary days</span>
      </div>

      <div className="relative z-10 my-auto max-w-5xl py-20">
        <motion.div
          initial={animate ? { opacity: 0, y: 16 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={animate ? { duration: 0.7 } : { duration: 0 }}
          className="mb-8 flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.28em] text-[#82c9c4]"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#82c9c4]" />
          From fragments to meaning
        </motion.div>

        <h1 id="hero-heading" className="max-w-4xl font-serif text-[clamp(4rem,11vw,10rem)] font-light leading-[0.82] tracking-[-0.06em]">
          {headline.map((line, index) => (
            <motion.span
              key={line.text}
              initial={animate ? { opacity: 0, filter: "blur(12px)", y: 24 } : false}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={animate ? { duration: 1, delay: 0.55 + index * 0.16, ease: "easeOut" } : { duration: 0 }}
              className={`block ${line.className}`}
            >
              {line.text}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={animate ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={animate ? { duration: 0.8, delay: 1.2 } : { duration: 0 }}
          className="mt-12 max-w-md text-sm font-light leading-relaxed text-[#b1c4df]"
        >
          Time, weather, people, places. Life Memory gathers the small signals
          and reveals the story they were already telling.
        </motion.p>

        <motion.div
          initial={animate ? { opacity: 0, y: 12 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={animate ? { duration: 0.8, delay: 1.4 } : { duration: 0 }}
          className="mt-8 flex items-center gap-5"
        >
          <Link
            href="/register"
            className="group inline-flex items-center gap-3 border-b border-[#91b5ed] pb-2 text-sm text-[#edf3ff] transition-colors hover:text-[#b9d1ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#91b5ed]"
          >
            Begin with today
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link href="/dashboard?demo=jimmy" className="text-xs font-mono text-[#8eafd9] transition-colors hover:text-[#d9e7ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#91b5ed]">
            Explore the archive
          </Link>
        </motion.div>
      </div>

      <div className="relative z-10 flex items-center justify-between border-t border-[#b7cdf0]/20 pt-5 text-[10px] font-mono uppercase tracking-[0.2em] text-[#8eafd9]">
        <span>Fragment → trace → understanding</span>
        <a href="#present" className="flex items-center gap-2 hover:text-[#d9e7ff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#91b5ed]">
          Scroll to enter <ArrowDown className="h-3.5 w-3.5" />
        </a>
      </div>
    </section>
  );
}
