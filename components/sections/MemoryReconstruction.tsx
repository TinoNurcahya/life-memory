"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { JIMMY_DATASET } from "@/lib/experience/data";
import { MemoryObject } from "@/components/experience/MemoryObject";
import { MemoryTrace } from "./MemoryTrace";

const STAGES = [
  { title: "FRAGMENT", desc: "A note, still carrying the shape of a moment." },
  { title: "TRACE", desc: "People, places, and time begin to separate from the sentence." },
  { title: "CONNECT", desc: "Recurring details find one another across the archive." },
  { title: "UNDERSTOOD", desc: "A living structure emerges from ordinary evidence." },
] as const;

export function MemoryReconstruction() {
  const [activeStage, setActiveStage] = useState(0);
  const nodes = JIMMY_DATASET.reconstructionNodes;
  const connections = JIMMY_DATASET.reconstructionConnections;

  return (
    <section id="reconstruction" aria-labelledby="reconstruction-heading" className="scene scene-reconstruction scene-field relative min-h-screen overflow-hidden px-6 py-32 text-[#e9e5dc] sm:min-h-[145vh] sm:px-12 md:px-20 lg:px-28">
      <MemoryTrace className="text-[#7893d0]" />
      <div className="mx-auto max-w-7xl">
        <div className="mb-20 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <span className="mb-5 block text-[10px] font-mono uppercase tracking-[0.28em] text-[#7893d0]">04 / The reveal</span>
            <h2 id="reconstruction-heading" className="font-serif text-5xl font-light leading-[0.9] tracking-[-0.04em] sm:text-7xl">Memory<br /><em>reconstructed.</em></h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-[#aeb2b1]">The forgotten part is not empty. Fragments gather, relationships surface, and the structure is found in what you left behind.</p>
        </div>

        <div role="tablist" aria-label="Memory reconstruction stages" className="mb-8 flex flex-wrap gap-6 border-y border-[#d7d5ce]/20 py-4">
          {STAGES.map((stage, index) => (
            <button
              key={stage.title}
              type="button"
              onClick={() => setActiveStage(index)}
              role="tab"
              aria-selected={activeStage === index}
              aria-controls="reconstruction-stage"
              className={`rounded-sm text-[10px] font-mono tracking-[0.2em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#7893d0] ${activeStage === index ? "text-[#7893d0]" : "text-[#747b7d] hover:text-[#d7d5ce]"}`}
            >
              0{index + 1} / {stage.title}
            </button>
          ))}
        </div>

        <div id="reconstruction-stage" role="tabpanel" aria-live="polite" className="relative h-[520px] overflow-hidden border border-[#d7d5ce]/15 bg-[#111416] lg:sticky lg:top-24">
          <MemoryObject stage={activeStage} />
          <div className="absolute left-6 top-6 z-20 max-w-xs">
            <p className="text-xs font-mono uppercase tracking-widest text-[#7893d0]">{STAGES[activeStage].title}</p>
            <p className="mt-2 text-sm leading-relaxed text-[#747b7d]">{STAGES[activeStage].desc}</p>
          </div>
          <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
            {activeStage >= 1 && connections.map((connection, index) => {
              const source = nodes.find((node) => node.id === connection.source);
              const target = nodes.find((node) => node.id === connection.target);
              if (!source || !target) return null;
              return (
                <motion.line
                  key={`${connection.source}-${connection.target}`}
                  x1={`calc(50% + ${source.x}px)`}
                  y1={`calc(50% + ${source.y}px)`}
                  x2={`calc(50% + ${target.x}px)`}
                  y2={`calc(50% + ${target.y}px)`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: activeStage === 1 ? 0.25 : activeStage === 2 ? 0.5 : 0.8 }}
                  transition={{ duration: 0.8, delay: index * 0.04 }}
                  className="stroke-[#7893d0] stroke-[1]"
                />
              );
            })}
          </svg>
          {nodes.map((node, index) => {
            const isCenter = node.id === "you";
            return (
              <motion.div
                key={node.id}
                animate={{
                  opacity: activeStage === 0 ? (isCenter ? 1 : 0.35) : 1,
                  scale: activeStage === 0 ? (isCenter ? 1.15 : 0.75) : activeStage === 3 ? 1.08 : 1,
                  x: activeStage === 0 ? (isCenter ? 0 : node.x! * 0.35) : node.x,
                  y: activeStage === 0 ? (isCenter ? 0 : node.y! * 0.35) : node.y,
                }}
                transition={{ duration: 0.9, delay: index * 0.04 }}
                className={`absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center border px-3 py-2 ${isCenter ? "border-[#7893d0] bg-[#263b67] text-white" : "border-[#d7d5ce]/25 bg-[#171b1d] text-[#d7d5ce]"}`}
              >
                <span className="text-[9px] font-mono uppercase tracking-widest opacity-60">{node.type}</span>
                <span className="text-xs">{node.label}</span>
              </motion.div>
            );
          })}
          <span className="absolute bottom-5 right-6 text-[10px] font-mono uppercase tracking-wider text-[#747b7d]">
            {activeStage === 3 ? "Memory reconstructed." : "A factual view of a lived day"}
          </span>
        </div>
      </div>
    </section>
  );
}
