"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MapPin, User, ArrowUpRight } from "lucide-react";
import type { FormattedFootnote } from "@/lib/reflection/monthly";

export function FootnotePopover({
  footnote,
  demo = false,
}: {
  footnote: FormattedFootnote;
  demo?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const timelineLink = demo
    ? `/timeline?demo=jimmy#${footnote.evidenceId}`
    : `/timeline#${footnote.evidenceId}`;

  return (
    <span className="relative inline-block" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        onMouseEnter={() => setIsOpen(true)}
        aria-label={`Footnote citation ${footnote.globalIndex}`}
        aria-expanded={isOpen}
        className="mx-0.5 inline-flex h-4 items-center justify-center rounded px-1 font-mono text-[11px] font-semibold text-brand transition-colors hover:bg-brand/10 hover:text-brand-hover focus:outline-none focus:ring-1 focus:ring-brand"
      >
        [{footnote.globalIndex}]
      </button>

      {isOpen && (
        <div
          role="tooltip"
          className="absolute bottom-full left-1/2 z-50 mb-2 w-72 -translate-x-1/2 rounded-2xl border border-hairline/80 bg-surface/95 p-4 text-left shadow-lg backdrop-blur-md transition-all sm:w-80"
        >
          <div className="flex items-center justify-between gap-2 border-b border-hairline/60 pb-2 text-xs font-mono text-muted">
            <span className="font-semibold text-brand">Evidence [{footnote.globalIndex}]</span>
            <time dateTime={footnote.evidence.date}>{footnote.evidence.date}</time>
          </div>

          <p className="mt-2.5 font-serif text-sm leading-snug text-foreground">
            “{footnote.evidence.summary}”
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-brand">
              {footnote.evidence.category}
            </span>
            {footnote.evidence.people.map((p) => (
              <span
                key={p}
                className="inline-flex items-center gap-1 rounded bg-surface-subdued px-1.5 py-0.5 text-[10px] text-muted"
              >
                <User className="h-2.5 w-2.5 text-brand" />
                {p}
              </span>
            ))}
            {footnote.evidence.places.map((place) => (
              <span
                key={place}
                className="inline-flex items-center gap-1 rounded bg-surface-subdued px-1.5 py-0.5 text-[10px] text-muted"
              >
                <MapPin className="h-2.5 w-2.5 text-brand" />
                {place}
              </span>
            ))}
          </div>

          <div className="mt-3.5 border-t border-hairline/50 pt-2 text-right">
            <Link
              href={timelineLink}
              className="inline-flex items-center gap-1 text-[11px] font-mono text-brand hover:underline"
            >
              Open in timeline <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </span>
  );
}
