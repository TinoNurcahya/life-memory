import type { Metadata } from "next";
import Link from "next/link";
import { EditorialShell } from "@/components/editorial/EditorialShell";
import { ShieldCheck, HeartHandshake, BookOpen, Clock, Compass } from "lucide-react";

export const metadata: Metadata = {
  title: "About Our Philosophy · Life Memory",
  description:
    "Why we built an autobiographical life archive. The psychology of memory decay, digital ephemerality, and our ethical AI charter.",
};

export default function AboutPage() {
  return (
    <EditorialShell
      badge="Origin & Philosophy"
      title="An Archive of Being Alive"
      subtitle="We believe that a life is not measured solely in major milestones, but in the quiet, fleeting rhythm of ordinary days. Life Memory exists to rescue those moments from oblivion."
      lastUpdated="October 2026"
    >
      <div className="space-y-12 text-foreground/90">
        {/* Section 1: The Problem of Forgetting */}
        <section className="space-y-4">
          <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-foreground flex items-center gap-2.5">
            <Clock className="h-6 w-6 text-brand" />
            <span>The Quiet Tragedy of Ephemerality</span>
          </h2>
          <p className="text-base leading-relaxed text-muted">
            In 1885, German psychologist Hermann Ebbinghaus discovered the mathematical reality of human memory: within 24 hours of experiencing an ordinary day, we shed nearly 70% of its details. Within a month, without deliberate reinforcement, more than 80% dissolves into indistinct fog.
          </p>
          <p className="text-base leading-relaxed text-muted">
            Modern digital life promised to fix this, but instead created a new kind of amnesia. Social media feeds are engineered for the performance of happiness, optimized for the fleeting dopamine of strangers rather than personal introspection. Chat apps bury heartfelt conversations with dear friends beneath endless streams of work notifications and memes.
          </p>
          <p className="text-base leading-relaxed text-muted">
            We asked ourselves: <em>What if technology helped us keep what actually matters?</em> Not as a boastful public timeline, but as an honest, private sanctuary where every coffee with an old friend, late-night coding breakthrough, or quiet autumn walk finds its permanent place.
          </p>
        </section>

        {/* Section 2: The 4D Living Constellation */}
        <section className="space-y-4 rounded-3xl border border-hairline bg-surface p-6 sm:p-8">
          <h2 className="font-serif text-2xl font-medium tracking-tight text-foreground flex items-center gap-2.5">
            <Compass className="h-6 w-6 text-brand" />
            <span>The Living Constellation: How It Works</span>
          </h2>
          <p className="text-sm leading-relaxed text-muted">
            Unlike traditional journals that require tedious categorization, rigid templates, or tags you will never remember, Life Memory is built around natural, stream-of-consciousness writing. You write as you speak; our intelligent system reconstructs the dimensions:
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
            <div className="rounded-2xl border border-hairline bg-surface-subdued/50 p-4">
              <p className="font-mono text-xs font-semibold uppercase text-brand">1. People (The Ties That Bind)</p>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                Automatically identifies contacts, tracks relationship rhythms, and maps who brings stillness or energy to your life.
              </p>
            </div>
            <div className="rounded-2xl border border-hairline bg-surface-subdued/50 p-4">
              <p className="font-mono text-xs font-semibold uppercase text-brand">2. Places (The Geography of Memory)</p>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                Connects memories to physical spaces—from favorite corner cafes to university labs—charting your personal wanderings.
              </p>
            </div>
            <div className="rounded-2xl border border-hairline bg-surface-subdued/50 p-4">
              <p className="font-mono text-xs font-semibold uppercase text-brand">3. Topics (Curiosity & Craft)</p>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                Surfaces the skills, research queries, and creative passions you pursue across months, revealing how your intellect evolves.
              </p>
            </div>
            <div className="rounded-2xl border border-hairline bg-surface-subdued/50 p-4">
              <p className="font-mono text-xs font-semibold uppercase text-brand">4. Temporal Rhythm (Day Offsets & Times)</p>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                Understands relative phrases like &ldquo;yesterday morning&rdquo; or &ldquo;three nights ago,&rdquo; slotting each atomic moment accurately on the timeline.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3: Ethical AI Charter */}
        <section className="space-y-4">
          <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-foreground flex items-center gap-2.5">
            <ShieldCheck className="h-6 w-6 text-emerald-500" />
            <span>Our Ethical AI Charter</span>
          </h2>
          <p className="text-base leading-relaxed text-muted">
            Trust is the foundational currency of autobiographical journaling. We operate under four inviolable principles:
          </p>
          <ul className="space-y-3 text-sm text-muted">
            <li className="flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 font-mono text-[10px] font-bold text-emerald-600">✓</span>
              <span><strong>Zero Model Training:</strong> Your private notes, names of loved ones, and reflections are never used to train, tune, or improve foundation AI models.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 font-mono text-[10px] font-bold text-emerald-600">✓</span>
              <span><strong>Ephemeral Processing:</strong> AI extraction runs ephemerally via enterprise Google Gemini 3.5 & 3.8 Flash APIs and is never retained by third-party model providers.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 font-mono text-[10px] font-bold text-emerald-600">✓</span>
              <span><strong>100% Data Sovereignty:</strong> You can export every single relational table in standard JSON with a single click, or permanently purge your account at any time.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 font-mono text-[10px] font-bold text-emerald-600">✓</span>
              <span><strong>Grounded Citations (Zero Hallucination):</strong> Every reflection essay and pattern insight cites verifiable atomic notes. We never fabricate events.</span>
            </li>
          </ul>
        </section>

        {/* Section 4: Human Call to Action */}
        <section className="rounded-3xl border border-brand/20 bg-brand/5 p-8 text-center sm:text-left sm:flex sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <h3 className="font-serif text-2xl font-medium text-foreground">Begin Your Living Archive</h3>
            <p className="text-sm text-muted max-w-lg">
              Start preserving the small, authentic moments that make up your days. Explore the interactive demo or create your private cloud vault.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 shrink-0 flex flex-col sm:flex-row gap-3">
            <Link
              href="/dashboard?demo=jimmy"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-2.5 font-mono text-xs font-semibold text-white shadow-sm transition hover:bg-brand/90"
            >
              <Compass className="h-4 w-4" />
              <span>Explore Demo</span>
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-hairline bg-surface px-5 py-2.5 font-mono text-xs text-foreground transition hover:bg-surface-subdued"
            >
              <span>Create Account</span>
            </Link>
          </div>
        </section>
      </div>
    </EditorialShell>
  );
}
