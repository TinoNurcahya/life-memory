"use client";

import { Drawer } from "vaul";
import Link from "next/link";
import { X, ExternalLink, Calendar, CheckCircle2, BookmarkCheck } from "lucide-react";
import type { Insight, InsightEvidence } from "@/types/database";

interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  insight: Insight | null;
  demo?: boolean;
  className?: string;
}

function HighlightedSnippet({ snippet, term }: { snippet: string; term?: string }) {
  const trimmed = term?.trim();
  if (!trimmed) {
    return <span className="font-serif text-base leading-relaxed text-foreground/90">“{snippet}”</span>;
  }

  let parts: string[] = [snippet];
  let hasMatch = false;

  try {
    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");
    parts = snippet.split(regex);
    hasMatch = parts.length > 1;
  } catch {
    hasMatch = false;
  }

  if (!hasMatch) {
    return <span className="font-serif text-base leading-relaxed text-foreground/90">“{snippet}”</span>;
  }

  return (
    <span className="font-serif text-base leading-relaxed text-foreground/90">
      “
      {parts.map((part, i) =>
        part.toLowerCase() === trimmed.toLowerCase() ? (
          <mark
            key={i}
            className="rounded bg-brand/20 px-1 py-0.5 font-medium text-brand transition-colors"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
      ”
    </span>
  );
}

function getTypeBadge(type: Insight["type"]) {
  switch (type) {
    case "first_time":
      return {
        label: "First-Time Experience",
        classes: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
      };
    case "recurring":
      return {
        label: "Recurring Pattern",
        classes: "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
      };
    case "change":
      return {
        label: "Monthly Shift",
        classes: "border-indigo-500/20 bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
      };
    default:
      return {
        label: type,
        classes: "border-brand/20 bg-brand/10 text-brand",
      };
  }
}

export function EvidenceDrawer({ isOpen, onClose, insight, demo = false, className = "" }: EvidenceDrawerProps) {
  if (!insight) return null;

  const badge = getTypeBadge(insight.type);
  const metadata = (insight.metadata as Record<string, unknown>) || {};
  const highlightTerm = (metadata.highlightTerm as string) || (metadata.label as string) || (insight.category as string) || "";
  const evidenceList: InsightEvidence[] = insight.evidence || [];

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity duration-300" />
        <Drawer.Content
          className={"fixed bottom-0 left-0 right-0 z-50 mx-auto flex max-h-[85vh] max-w-2xl flex-col rounded-t-[28px] border-t border-hairline bg-surface p-6 shadow-2xl focus:outline-hidden sm:p-8 " + className}
        >
          {/* Accessible Drag Handle */}
          <Drawer.Handle className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-border-hairline" />

          {/* Header Row */}
          <div className="flex items-start justify-between gap-4 border-b border-hairline/60 pb-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${badge.classes}`}
                >
                  <BookmarkCheck className="h-3 w-3" />
                  {badge.label}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-hairline bg-surface-subdued px-2.5 py-0.5 font-mono text-[10px] text-muted">
                  <CheckCircle2 className="h-3 w-3 text-brand" />
                  {evidenceList.length} verified {evidenceList.length === 1 ? "source" : "sources"}
                </span>
              </div>

              <Drawer.Title className="mt-2.5 font-serif text-2xl font-normal text-foreground">
                {insight.title}
              </Drawer.Title>
              <Drawer.Description className="mt-1 text-sm text-muted">
                {insight.description}
              </Drawer.Description>
            </div>

            <Drawer.Close asChild>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close drawer"
                className="rounded-full p-2 text-muted transition hover:bg-surface-subdued hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </Drawer.Close>
          </div>

          {/* Evidence List */}
          <div className="mt-5 space-y-3 overflow-y-auto pr-1 pb-4">
            <p className="font-mono text-xs uppercase tracking-wider text-muted">
              Source memories proving this pattern
            </p>

            {evidenceList.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">No evidence records found.</p>
            ) : (
              evidenceList.map((item, index) => {
                const targetHash = item.activity_detail_id ? `#detail-${item.activity_detail_id}` : "";
                const timelineUrl = demo
                  ? `/timeline?demo=jimmy${targetHash}`
                  : `/timeline${targetHash}`;

                return (
                  <article
                    key={`${item.activity_detail_id}-${index}`}
                    className="group rounded-2xl border border-hairline bg-surface-subdued/50 p-4 transition-all duration-200 hover:border-brand/40 hover:bg-surface-subdued"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2 font-mono text-xs text-muted">
                      <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                        <Calendar className="h-3.5 w-3.5 text-brand" />
                        {item.occurred_at}
                      </span>
                      <span className="text-[10px] text-muted">
                        Evidence #{index + 1}
                      </span>
                    </div>

                    <div className="pl-1">
                      <HighlightedSnippet snippet={item.snippet} term={highlightTerm} />
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-hairline/40 pt-2.5">
                      <span className="font-mono text-[10px] text-muted">
                        Detail: {item.activity_detail_id.slice(0, 8)}…
                      </span>
                      <Link
                        href={timelineUrl}
                        onClick={onClose}
                        className="inline-flex items-center gap-1 font-mono text-xs font-medium text-brand transition hover:underline"
                      >
                        View in Timeline <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
