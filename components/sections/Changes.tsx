"use client";

import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { JIMMY_DATASET } from "@/lib/experience/data";

export function Changes() {
  const changes = JIMMY_DATASET.changes;
  return (
    <section id="changes" className="scene scene-data relative min-h-[90vh] flex items-center px-6 md:px-16 lg:px-28 py-24 z-10">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid lg:grid-cols-[0.62fr_1.38fr] gap-12 lg:gap-24">
          <div>
            <div className="text-[11px] font-mono tracking-widest uppercase text-muted mb-6">08 / DETECTED CHANGES</div>
            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light leading-[1.02]">A life is a line that moves.</h2>
            <p className="text-sm text-muted leading-relaxed mt-7 max-w-sm">Longitudinal shifts, shown as routes rather than judgments. The archive makes distance and duration visible.</p>
          </div>
          <div className="space-y-14">
            {changes.map((change, index) => (
              <motion.article key={change.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.12 }} className="relative">
                <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-hairline pb-3 mb-7">
                  <div className="text-[11px] font-mono tracking-widest text-muted uppercase">{change.periodThen} <ArrowRight className="inline w-3 h-3 mx-2 text-brand" /> {change.periodNow}</div>
                  <div className="text-xs font-mono text-brand">{change.evidenceText}</div>
                </div>
                <div className="grid md:grid-cols-[1fr_auto_1fr] gap-5 items-center">
                  <div>
                    <div className="text-[10px] font-mono text-faint uppercase tracking-widest mb-3">Then</div>
                    <p className="text-sm text-muted mb-4">{change.descriptionThen}</p>
                    <Route nodes={change.sequenceThen} subdued />
                  </div>
                  <ArrowRight className="hidden md:block w-5 h-5 text-brand" />
                  <div>
                    <div className="text-[10px] font-mono text-brand uppercase tracking-widest mb-3">Now</div>
                    <p className="text-sm text-foreground mb-4">{change.descriptionNow}</p>
                    <Route nodes={change.sequenceNow} />
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Route({ nodes, subdued = false }: { nodes: string[]; subdued?: boolean }) {
  return <div className="flex flex-wrap items-center gap-y-2 text-[11px] font-mono">{nodes.map((node, index) => <span key={`${node}-${index}`} className="flex items-center"><span className={`px-2.5 py-1 border ${subdued ? "border-hairline text-muted" : "border-brand/30 text-brand bg-brand/5"}`}>{node}</span>{index < nodes.length - 1 && <ArrowRight className={`w-3 h-3 mx-1.5 ${subdued ? "text-faint" : "text-brand/60"}`} />}</span>)}</div>;
}
