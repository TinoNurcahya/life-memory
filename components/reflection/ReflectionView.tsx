"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, RefreshCw, BookOpen } from "lucide-react";
import { toast } from "sonner";
import type { FormattedMonthlyEssay, FormattedParagraph } from "@/lib/reflection/monthly";
import { FootnotePopover } from "./FootnotePopover";
import { getOrGenerateMonthlyReflection } from "@/app/actions/activities";

function ParagraphProse({
  paragraph,
  demo,
}: {
  paragraph: FormattedParagraph;
  demo: boolean;
}) {
  const footnoteMap = new Map(paragraph.footnotes.map((fn) => [fn.globalIndex, fn]));

  // Split text by global citation markers like [1], [2], etc.
  const parts = paragraph.text.split(/(\[\d+\])/g);

  return (
    <p className="font-serif text-lg leading-relaxed text-foreground/90 sm:text-xl sm:leading-loose">
      {parts.map((part, index) => {
        const match = part.match(/^\[(\d+)\]$/);
        if (match) {
          const indexNum = parseInt(match[1], 10);
          const fn = footnoteMap.get(indexNum);
          if (fn) {
            return <FootnotePopover key={index} footnote={fn} demo={demo} />;
          }
        }
        return <span key={index}>{part}</span>;
      })}
    </p>
  );
}

export function ReflectionView({
  initialEssay,
  targetMonth,
  demo = false,
}: {
  initialEssay: FormattedMonthlyEssay;
  targetMonth: string; // YYYY-MM
  demo?: boolean;
}) {
  const [essay, setEssay] = useState<FormattedMonthlyEssay>(initialEssay);
  const [isPending, startTransition] = useTransition();

  const handleRegenerate = () => {
    startTransition(async () => {
      try {
        toast.info("Regenerating monthly reflection with Gemini…");
        const res = await getOrGenerateMonthlyReflection(targetMonth, demo, true);
        if (res.success) {
          setEssay(res.data);
          toast.success("Fresh reflection generated and grounded.");
        } else {
          toast.error(res.error || "Could not regenerate reflection.");
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Error regenerating reflection.");
      }
    });
  };

  // Month navigation helpers
  const [yearStr, monthStr] = targetMonth.split("-");
  const currentDate = new Date(Date.UTC(Number(yearStr), Number(monthStr) - 1, 1));

  const prevMonthDate = new Date(currentDate);
  prevMonthDate.setUTCMonth(prevMonthDate.getUTCMonth() - 1);
  const prevMonthSlug = prevMonthDate.toISOString().slice(0, 7);

  const nextMonthDate = new Date(currentDate);
  nextMonthDate.setUTCMonth(nextMonthDate.getUTCMonth() + 1);
  const nextMonthSlug = nextMonthDate.toISOString().slice(0, 7);

  const querySuffix = demo ? `&demo=jimmy` : "";

  return (
    <div className="mx-auto max-w-3xl pb-16">
      {/* Navigation Header */}
      <div className="mb-8 flex items-center justify-between border-b border-hairline/60 pb-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-wider text-muted">
            Footnote-Grounded Monthly Essay
          </span>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2">
          <Link
            href={`/reflection?month=${prevMonthSlug}${querySuffix}`}
            className="rounded p-1 text-muted transition hover:bg-surface-subdued hover:text-foreground"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <span className="font-mono text-xs font-medium text-foreground">{essay.month}</span>
          <Link
            href={`/reflection?month=${nextMonthSlug}${querySuffix}`}
            className="rounded p-1 text-muted transition hover:bg-surface-subdued hover:text-foreground"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Main Essay Card */}
      <article className="rounded-3xl border border-hairline bg-surface p-6 sm:p-10 shadow-xs">
        {/* Header Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-brand">
              <BookOpen className="h-3 w-3" />
              {essay.source === "gemini" ? "Gemini 3.8 Flash · Grounded" : "Deterministic report"}
            </span>
            {essay.modelUsed && (
              <span className="hidden text-[10px] text-muted sm:inline">{essay.modelUsed}</span>
            )}
          </div>

          <button
            type="button"
            onClick={handleRegenerate}
            disabled={isPending}
            className="inline-flex items-center gap-1 text-[11px] text-brand hover:underline disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${isPending ? "animate-spin" : ""}`} />
            {isPending ? "Reflecting…" : "Regenerate"}
          </button>
        </div>

        {/* Title */}
        <h1 className="mt-6 font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl sm:leading-tight">
          {essay.title}
        </h1>

        {/* Key Themes Chips */}
        {essay.key_themes.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5 border-b border-hairline/50 pb-5">
            {essay.key_themes.map((theme) => (
              <span
                key={theme}
                className="rounded-full bg-surface-subdued px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted"
              >
                #{theme}
              </span>
            ))}
          </div>
        )}

        {/* Essay Paragraphs with Interactive Popovers */}
        <div className="mt-8 space-y-6">
          {essay.paragraphs.map((p, idx) => (
            <ParagraphProse key={idx} paragraph={p} demo={demo} />
          ))}
        </div>

        {/* Verified Footnotes Section (Bibliography) */}
        {essay.bibliography.length > 0 && (
          <section className="mt-12 border-t border-hairline pt-6">
            <h2 className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-muted">
              <BookOpen className="h-3.5 w-3.5 text-brand" /> Verified Citations ({essay.bibliography.length})
            </h2>
            <ol className="mt-4 space-y-3 font-serif text-xs text-muted">
              {essay.bibliography.map((item) => (
                <li key={item.globalIndex} className="flex items-start gap-2">
                  <span className="font-mono text-brand font-semibold min-w-5">
                    [{item.globalIndex}]
                  </span>
                  <div>
                    <span className="font-medium text-foreground">{item.evidence.summary}</span>
                    <span className="ml-2 font-mono text-[10px] text-muted">
                      ({item.evidence.date} · {item.evidence.category})
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}
      </article>
    </div>
  );
}
