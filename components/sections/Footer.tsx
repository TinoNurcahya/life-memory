"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MemoryTrace } from "./MemoryTrace";
import { MemoryMedia } from "@/components/experience/MemoryMedia";

export function Footer() {
  return (
    <footer aria-labelledby="footer-heading" className="scene scene-void scene-field relative z-10 border-t border-hairline px-6 py-32 sm:px-12 md:px-20 lg:px-28">
      <MemoryTrace className="text-[#7893d0] opacity-30" />
      <div className="mx-auto max-w-6xl">
        <div className="mb-32 max-w-3xl">
          <span className="mb-8 block text-[10px] font-mono uppercase tracking-[0.28em] text-brand">12 / Make room for today</span>
          <h2 id="footer-heading" className="font-serif text-[clamp(3.5rem,9vw,9rem)] font-light leading-[0.82] tracking-[-0.06em]">
            Keep what
            <span className="block pl-[10vw] italic text-brand">matters.</span>
          </h2>
          <p className="mt-12 max-w-sm text-sm leading-relaxed text-muted">The archive can gather the past. You choose what to notice next. Record one ordinary moment and let the shape of your life reveal itself over time.</p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Link href="/register" className="group inline-flex items-center gap-3 border-b border-brand pb-2 text-sm text-foreground hover:text-brand">
              Record your first moment <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/dashboard?demo=jimmy" className="text-xs font-mono text-muted hover:text-foreground">Explore the archive</Link>
          </div>
        </div>
        <MemoryMedia
          src="/images/memory-late-night-desk.jpg"
          alt="An intimate late night workspace desk with notebook and warm lamp"
          caption="The fragments do not disappear. They find their place."
          className="memory-media--footer mb-16"
        >
          <div className="memory-media__lines" />
          <span className="memory-media__stamp">LIFE MEMORY / 23:14</span>
          <span className="memory-media__word">gathered</span>
        </MemoryMedia>
        <div className="flex flex-col justify-between gap-5 border-t border-hairline pt-6 text-xs font-mono text-muted sm:flex-row">
          <span>Life Memory / Private personal intelligence</span>
          <div className="flex gap-5"><Link href="/login">Sign in</Link><Link href="/register">Register</Link></div>
        </div>
      </div>
    </footer>
  );
}
