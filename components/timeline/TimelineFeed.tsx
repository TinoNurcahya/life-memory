"use client";

import { useMemo, useRef, useState, useSyncExternalStore, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpDown, ArrowUpRight, Search, X } from "lucide-react";
import type { TimelineItem } from "@/lib/queries/activities";
import { TimelineCard } from "@/components/activity/TimelineCard";
import { formatArchiveDate } from "@/lib/utils/dates";
import "./timeline.css";

const CATEGORIES = ["all", "career", "social", "health", "learning", "leisure", "routine", "other"] as const;
type CategoryFilter = (typeof CATEGORIES)[number];

const emptySnapshot = () => null;
function getDemoSnapshot() {
  try {
    return sessionStorage.getItem("extra_demo_memories");
  } catch {
    return null;
  }
}

function subscribeDemoMemories(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("focus", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("focus", onChange);
  };
}

function readDemoMemories(snapshot: string | null): TimelineItem[] {
  if (!snapshot) return [];
  try {
    const value: unknown = JSON.parse(snapshot);
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is TimelineItem =>
      item && typeof item === "object" &&
      typeof item.id === "string" && typeof item.activityId === "string" &&
      typeof item.summary === "string" && typeof item.rawText === "string" &&
      typeof item.occurredAt === "string" && /^\d{4}-\d{2}-\d{2}$/.test(item.occurredAt) &&
      Number.isFinite(Date.parse(item.occurredAt)) &&
      (item.category == null || (item.category !== "all" && CATEGORIES.includes(item.category))) &&
      ["PENDING", "RESOLVED", "FAILED"].includes(item.status) &&
      [item.people, item.places, item.topics].every((entities) =>
        Array.isArray(entities) && entities.every((entity) =>
          entity && typeof entity.id === "string" && typeof entity.name === "string"
        )
      ) &&
      (item.imageUrls == null || (Array.isArray(item.imageUrls) &&
        item.imageUrls.every((url: unknown) => typeof url === "string")))
    );
  } catch {
    return [];
  }
}

export function TimelineFeed({
  initialItems,
  demo = false,
  error = null,
}: {
  initialItems: TimelineItem[];
  demo?: boolean;
  error?: string | null;
}) {
  const router = useRouter();
  const storedMemories = useSyncExternalStore(
    subscribeDemoMemories,
    demo ? getDemoSnapshot : emptySnapshot,
    emptySnapshot,
  );
  const items = useMemo(() => {
    const extra = demo ? readDemoMemories(storedMemories) : [];
    return Array.from(new Map([...extra, ...initialItems].map((item) => [item.id, item])).values());
  }, [demo, storedMemories, initialItems]);

  const [filter, setFilter] = useState<CategoryFilter>("all");
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [refreshing, startRefresh] = useTransition();
  const searchRef = useRef<HTMLInputElement>(null);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: items.length };
    for (const item of items) {
      const category = item.category ?? "other";
      counts[category] = (counts[category] ?? 0) + 1;
    }
    return counts;
  }, [items]);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    return items.filter((item) => {
      if (filter !== "all" && (item.category ?? "other") !== filter) return false;
      if (!search) return true;
      return [item.summary, item.rawText,
        ...item.people.map((person) => person.name),
        ...item.places.map((place) => place.name),
        ...item.topics.map((topic) => topic.name),
      ].some((text) => text.toLowerCase().includes(search));
    });
  }, [filter, items, query]);

  const groups = useMemo(() => {
    const days = new Map<string, TimelineItem[]>();
    for (const item of filtered) {
      const day = days.get(item.occurredAt) ?? [];
      day.push(item);
      days.set(item.occurredAt, day);
    }
    return Array.from(days).sort(([a], [b]) =>
      sortOrder === "desc" ? b.localeCompare(a) : a.localeCompare(b)
    );
  }, [filtered, sortOrder]);

  const hasFilters = filter !== "all" || query.trim().length > 0;
  const suffix = demo ? "?demo=jimmy" : "";
  const clearSearch = () => { setQuery(""); searchRef.current?.focus(); };
  const clearFilters = () => { setFilter("all"); clearSearch(); };

  return (
    <>
      <header className="timeline-intro">
        <div>
          <h1>Your timeline</h1>
          <p>{error && items.length === 0 ? "Memories unavailable" :
            items.length === 0 ? "No memories yet" :
              `${items.length} ${items.length === 1 ? "memory" : "memories"}`}</p>
        </div>
        <Link href={"/calendar" + suffix} className="timeline-link">
          Calendar <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </header>

      {error && (
        <section className="timeline-error" role="alert">
          <div><h2>Could not load your memories</h2><p>{error}</p></div>
          <button type="button" className="timeline-link" disabled={refreshing}
            onClick={() => startRefresh(() => router.refresh())}>
            {refreshing ? "Trying again…" : "Try again"}
          </button>
        </section>
      )}

      {items.length > 0 && (
        <>
          <div className="timeline-toolbar" role="search" aria-label="Filter your timeline">
            <div className="timeline-search">
              <Search size={18} aria-hidden="true" />
              <input ref={searchRef} type="search" aria-label="Search memories" placeholder="Search memories, people, places…"
                value={query} onChange={(event) => setQuery(event.target.value)} />
              {query && <button type="button" aria-label="Clear search"
                onClick={clearSearch}><X size={16} aria-hidden="true" /></button>}
            </div>
            <div className="timeline-category">
              <select aria-label="Filter by category" value={filter}
                onChange={(event) => setFilter(event.target.value as CategoryFilter)}>
                {CATEGORIES.map((category) => <option key={category} value={category}>
                  {category === "all" ? "All categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                  {" (" + (categoryCounts[category] ?? 0) + ")"}
                </option>)}
              </select>
            </div>
            <button type="button" className="timeline-sort"
              aria-label={sortOrder === "desc" ? "Newest first. Switch to oldest first" : "Oldest first. Switch to newest first"}
              onClick={() => setSortOrder((current) => current === "desc" ? "asc" : "desc")}>
              <ArrowUpDown size={16} aria-hidden="true" />
              {sortOrder === "desc" ? "Newest first" : "Oldest first"}
            </button>
          </div>
          <div className={"timeline-results" + (hasFilters ? " timeline-results--active" : "")}>
            <p role="status" aria-live="polite" aria-atomic="true">
              {hasFilters ? `${filtered.length} of ${items.length} memories` : ""}
            </p>
            {hasFilters && filtered.length > 0 &&
              <button type="button" className="timeline-link" onClick={clearFilters}>Clear filters</button>}
          </div>
        </>
      )}

      {groups.length > 0 ? (
        <div className="timeline-days">
          {groups.map(([date, dateItems]) => (
            <section className="timeline-day" data-date={date} key={date}
              aria-labelledby={"timeline-date-" + date}>
              <h2 className="timeline-day__date" id={"timeline-date-" + date}>
                <time dateTime={date}>{formatArchiveDate(date)}</time>
              </h2>
              <div className="timeline-day__entries">
                {dateItems.map((item, index) =>
                  <TimelineCard key={item.id} item={item} demo={demo} index={index} />
                )}
              </div>
            </section>
          ))}
        </div>
      ) : items.length > 0 ? (
        <section className="timeline-empty" aria-labelledby="timeline-empty-heading">
          <h2 id="timeline-empty-heading">No memories match your search</h2>
          <p>Try another word or choose a different category.</p>
          <button type="button" className="timeline-link" onClick={clearFilters}>Clear filters</button>
        </section>
      ) : !error ? (
        <section className="timeline-empty" aria-labelledby="timeline-empty-heading">
          <h2 id="timeline-empty-heading">Your story starts with a memory.</h2>
          <p>Write a few words about your day. They will find their place here.</p>
          <Link href={"/dashboard" + suffix} className="timeline-link">
            Write your first memory <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </section>
      ) : null}
    </>
  );
}
