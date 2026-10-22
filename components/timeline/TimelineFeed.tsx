"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  CalendarDays,
  Clock,
  Compass,
  Search,
  X,
} from "lucide-react";
import type { TimelineItem } from "@/lib/queries/activities";
import { TimelineCard } from "@/components/activity/TimelineCard";
import { selectForgottenCandidate } from "@/lib/queries/forgotten";

const CATEGORIES = [
  "all",
  "career",
  "social",
  "health",
  "learning",
  "leisure",
  "routine",
  "other",
] as const;

function formatTimelineDateHeader(dateStr: string) {
  try {
    const d = new Date(`${dateStr}T00:00:00Z`);
    const dateFormatted = new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(d);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const diffDays = Math.round(
      (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    );

    let relativeLabel = "";
    if (diffDays === 0) relativeLabel = "Hari ini · Today";
    else if (diffDays === 1) relativeLabel = "Kemarin · Yesterday";
    else if (diffDays > 1) relativeLabel = `${diffDays} hari lalu`;
    else if (diffDays < 0) relativeLabel = "Mendatang · Future";

    return { dateFormatted, relativeLabel };
  } catch {
    return { dateFormatted: dateStr, relativeLabel: "" };
  }
}

export function TimelineFeed({
  initialItems,
  demo = false,
}: {
  initialItems: TimelineItem[];
  demo?: boolean;
}) {
  const [items] = useState<TimelineItem[]>(() => {
    if (demo && typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("extra_demo_memories");
        if (stored) {
          const parsed = JSON.parse(stored) as TimelineItem[];
          return [...parsed, ...initialItems];
        }
      } catch {
        // Ignore JSON error
      }
    }
    return initialItems;
  });

  const [filter, setFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [dismissForgotten, setDismissForgotten] = useState(false);

  const forgotten = useMemo(() => selectForgottenCandidate(items), [items]);

  // Real-time category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: items.length };
    for (const item of items) {
      const cat = item.category ?? "other";
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return counts;
  }, [items]);

  // Search and category filter
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesCategory = filter === "all" || item.category === filter;
      if (!matchesCategory) return false;
      if (!q) return true;

      const inSummary = item.summary.toLowerCase().includes(q);
      const inRaw = item.rawText.toLowerCase().includes(q);
      const inPeople = item.people.some((p) => p.name.toLowerCase().includes(q));
      const inPlaces = item.places.some((pl) => pl.name.toLowerCase().includes(q));
      const inTopics = item.topics.some((t) => t.name.toLowerCase().includes(q));

      return inSummary || inRaw || inPeople || inPlaces || inTopics;
    });
  }, [filter, items, query]);

  // Group by date and sort groups
  const groups = useMemo(() => {
    const grouped = filtered.reduce<Record<string, TimelineItem[]>>(
      (result, item) => {
        (result[item.occurredAt] ??= []).push(item);
        return result;
      },
      {}
    );

    const sortedEntries = Object.entries(grouped).sort(([dateA], [dateB]) => {
      return sortOrder === "desc"
        ? dateB.localeCompare(dateA)
        : dateA.localeCompare(dateB);
    });

    return sortedEntries;
  }, [filtered, sortOrder]);

  const linkSuffix = demo ? "?demo=jimmy" : "";

  return (
    <div className="space-y-6">
      {/* 01. Tactile S-14 Forgotten Highlight Banner */}
      {forgotten && !dismissForgotten && (
        <section className="timeline-highlight relative overflow-hidden rounded-2xl border border-amber-500/25 bg-gradient-to-r from-amber-500/[0.06] via-surface to-surface p-5 shadow-sm transition-all sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-mono font-medium text-amber-600 dark:text-amber-400">
              <Compass className="h-3.5 w-3.5 text-amber-500" />
              Rediscovered memory · {forgotten.daysAgo} days ago
            </span>
            <div className="flex items-center gap-2.5">
              <Link
                href={`/forgot-this${linkSuffix}`}
                className="text-xs font-mono font-medium text-amber-600 dark:text-amber-400 hover:underline"
              >
                Open memory
              </Link>
              <button
                type="button"
                onClick={() => setDismissForgotten(true)}
                aria-label="Dismiss forgotten memory highlight"
                className="rounded-lg p-1 text-muted hover:bg-surface-subdued hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <p className="mt-3 font-serif text-lg sm:text-xl text-foreground leading-snug">
            “{forgotten.summary}”
          </p>
          <p className="mt-1.5 text-xs font-mono text-muted">
            {formatTimelineDateHeader(forgotten.occurredAt).dateFormatted} · Last anchor mention {forgotten.daysAgo} days ago
          </p>
        </section>
      )}

      {/* 02. Unified Control Toolbar */}
      <div className="timeline-controls space-y-3.5 rounded-2xl border border-hairline/80 bg-surface p-4 shadow-sm sm:p-5">
        {/* Top Controls Row: Search + Sort Toggle + View Switcher */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
            <input
              type="text"
              aria-label="Search memories by keyword, person, place, or topic"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search memories, people, places, topics..."
              className="w-full rounded-xl border border-hairline bg-surface-subdued py-2.5 pl-9 pr-9 text-sm text-foreground placeholder:text-muted outline-none transition focus:border-brand/60 focus:ring-2 focus:ring-brand/10"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search query"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {/* Sort Toggle Button */}
            <button
              type="button"
              onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
              title={`Switch to ${sortOrder === "desc" ? "Oldest First" : "Newest First"}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-hairline bg-surface-subdued px-3 py-2.5 text-xs font-mono text-foreground hover:border-brand/40 hover:bg-surface transition-colors cursor-pointer"
            >
              <ArrowUpDown className="h-3.5 w-3.5 text-brand" />
              <span>{sortOrder === "desc" ? "Newest First" : "Oldest First"}</span>
            </button>

            {/* View Switcher: Feed List vs Visual Calendar */}
            <div className="inline-flex items-center rounded-xl border border-hairline bg-surface-subdued p-1">
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-lg bg-surface border border-hairline/80 px-2.5 py-1 text-xs font-mono font-medium text-brand shadow-xs"
              >
                <Clock className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Feed</span>
              </button>
              <Link
                href={`/calendar${linkSuffix}`}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-mono text-muted transition hover:text-foreground"
              >
                <CalendarDays className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Calendar</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Controls Row: Category Filter Tabs & Count */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1 border-t border-hairline/60">
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {CATEGORIES.map((cat) => {
              const count = categoryCounts[cat] || 0;
              const isActive = filter === cat;
              return (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-mono capitalize transition-colors cursor-pointer ${
                    isActive
                      ? "bg-brand text-white font-medium shadow-xs"
                      : "border border-hairline bg-surface-subdued text-muted hover:border-brand/30 hover:text-foreground"
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-xs ${
                      isActive ? "bg-white/20 text-white" : "bg-hairline/70 text-muted"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="text-xs font-mono text-muted shrink-0 text-right">
            Showing <span className="font-semibold text-foreground">{filtered.length}</span> of {items.length} moments
          </div>
        </div>
      </div>

      {/* 03. Connected Timeline Spine with Chronological Nodes */}
      {groups.length > 0 ? (
        <div className="timeline-spine relative my-8 ml-3 space-y-10 border-l-2 border-hairline/80 pl-6 sm:ml-4 sm:pl-8">
          {groups.map(([date, dateItems]) => {
            const { dateFormatted, relativeLabel } = formatTimelineDateHeader(date);
            return (
              <section key={date} className="relative group">
                {/* Node dot on the timeline spine */}
                <div className="absolute -left-[1.95rem] sm:-left-[2.45rem] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-brand bg-canvas ring-4 ring-canvas flex items-center justify-center transition-transform group-hover:scale-125">
                  <div className="h-1.5 w-1.5 rounded-full bg-brand" />
                </div>

                {/* Date Header */}
                <header className="mb-4">
                  <div className="flex flex-wrap items-baseline gap-2.5">
                    <h2 className="font-serif text-xl sm:text-2xl font-normal text-foreground tracking-tight">
                      {dateFormatted}
                    </h2>
                    {relativeLabel && (
                      <span className="rounded-full border border-hairline bg-surface-subdued px-2.5 py-1 font-mono text-xs text-muted">
                        {relativeLabel}
                      </span>
                    )}
                    <span className="font-mono text-xs text-muted">
                      · {dateItems.length} {dateItems.length === 1 ? "moment" : "moments"}
                    </span>
                  </div>
                </header>

                {/* Memory Cards for this Day */}
                <div className="timeline-day-list divide-y divide-hairline/70 overflow-hidden rounded-2xl border border-hairline/80 bg-surface shadow-sm">
                  {dateItems.map((item, index) => (
                    <TimelineCard
                      key={item.id}
                      item={item}
                      demo={demo}
                      editorial={false}
                      index={index}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-hairline bg-surface/50 p-12 text-center shadow-xs space-y-2">
          <p className="text-lg font-semibold text-foreground">No memories match this filter</p>
          <p className="text-sm text-muted">
            Try adjusting your search query or selecting a different category.
          </p>
          <button
            type="button"
            onClick={() => {
              setFilter("all");
              setQuery("");
            }}
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-hairline bg-surface px-3 py-1.5 text-xs font-mono text-brand hover:border-brand transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
