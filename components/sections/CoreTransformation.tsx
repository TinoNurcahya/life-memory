"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, CheckCircle2, MapPin, Sparkles, Tag, User, Zap } from "lucide-react";

const SAMPLES = [
  {
    id: "sample-1",
    raw: "stopped by Blank Street Coffee on the way back home with Lena. first time trying seasonal latte. read Next.js docs for 2 hours.",
    date: "Wednesday, Oct 1, 2026",
    time: "3:40 PM",
    category: "learning",
    secondaryCategory: "social",
    place: "Blank Street Coffee",
    person: "Lena",
    topic: "Next.js 16",
    badge: "First-time place visit",
    confidence: "98% grounded",
  },
  {
    id: "sample-2",
    raw: "stuck at NYU Bobst Library till 1am grinding algorithm dynamic programming problems with Ethan. solved 3 hard questions.",
    date: "Friday, Oct 16, 2026",
    time: "1:15 AM",
    category: "career",
    secondaryCategory: "learning",
    place: "NYU Bobst Library",
    person: "Ethan",
    topic: "Dynamic Programming",
    badge: "Recurring routine",
    confidence: "99% grounded",
  },
];

export function CoreTransformation() {
  const [activeIdx, setActiveIdx] = useState(0);
  const sample = SAMPLES[activeIdx];

  return (
    <section id="transformation" aria-labelledby="transformation-heading" className="scene scene-ivory relative min-h-[90vh] flex items-center px-6 sm:px-12 md:px-20 lg:px-28 py-24 z-10">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid lg:grid-cols-[0.72fr_1.28fr] gap-12 lg:gap-20 items-start">
          <div className="lg:sticky lg:top-32">
            <div className="text-[11px] font-mono tracking-widest uppercase text-muted mb-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand" /> THE CORE TRANSFORMATION · S-01
            </div>
            <h2 id="transformation-heading" className="font-serif text-4xl sm:text-5xl md:text-6xl font-light text-foreground leading-[0.98]">
              A sentence becomes a place you can return to.
            </h2>
            <p className="font-sans text-sm sm:text-base text-muted leading-relaxed mt-7 max-w-md">
              Plain language goes in. A grounded, longitudinal memory comes back — without forms, tags, or invented context.
            </p>
            <div className="mt-12 flex items-center gap-3">
              <span className="text-xs font-mono text-muted uppercase tracking-wider">Read another note</span>
              {SAMPLES.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveIdx(idx)}
                  aria-label={`Show sample ${idx + 1}`}
                  className={`w-8 h-8 rounded-full border text-xs font-mono transition-colors ${activeIdx === idx ? "bg-brand text-white border-brand" : "bg-surface border-hairline text-muted hover:text-foreground"}`}
                >
                  0{idx + 1}
                </button>
              ))}
            </div>
          </div>

          <motion.div key={sample.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="relative">
            <div className="text-[11px] font-mono text-muted uppercase tracking-widest mb-4">One note / two readings</div>
            <div className="relative border-y border-hairline py-8 md:py-10">
              <div className="absolute left-0 top-0 bottom-0 w-px bg-brand/30" />
              <div className="pl-6 md:pl-10">
                <div className="flex items-center justify-between text-[11px] font-mono text-muted mb-6">
                  <span className="flex items-center gap-2 uppercase tracking-wider"><Zap className="w-3.5 h-3.5 text-amber-500" /> Raw note</span>
                  <span>{sample.date} · {sample.time}</span>
                </div>
                <p className="font-serif italic text-2xl sm:text-3xl leading-tight text-foreground max-w-2xl">&ldquo;{sample.raw}&rdquo;</p>
              </div>
            </div>

            <div className="flex items-center gap-3 py-5 text-[11px] font-mono text-brand uppercase tracking-widest">
              <span className="h-px w-8 bg-brand/50" /><Sparkles className="w-3.5 h-3.5" /> Gemini resolves signal
            </div>

            <div className="relative border border-brand/30 bg-surface/70 p-6 md:p-8 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline pb-4 mb-7">
                <span className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-brand"><CheckCircle2 className="w-4 h-4" /> Structured memory</span>
                <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400">{sample.badge}</span>
              </div>
              <div className="grid sm:grid-cols-[1fr_auto] gap-8 items-start">
                <div>
                  <div className="text-[11px] font-mono text-muted mb-2">{sample.date}</div>
                  <h3 className="font-serif text-3xl text-foreground mb-5">{sample.place}</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-subdued border border-hairline text-xs"><User className="w-3 h-3 text-brand" /> {sample.person}</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-subdued border border-hairline text-xs"><MapPin className="w-3 h-3 text-brand" /> {sample.place}</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand/10 border border-brand/20 text-xs text-brand"><Tag className="w-3 h-3" /> {sample.topic}</span>
                  </div>
                </div>
                <div className="text-right text-[11px] font-mono text-muted">
                  <div className="text-brand font-semibold">{sample.confidence}</div>
                  <div className="mt-1 uppercase tracking-wider">{sample.category} · {sample.secondaryCategory}</div>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-hairline text-[11px] font-mono text-muted flex items-center justify-between">
                <span>Evidence, not interpretation</span><ArrowRight className="w-4 h-4 text-brand" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
