"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import type { InsightsModel, InsightView } from "@/lib/insights/model";
import { formatInsightDate } from "@/lib/insights/model";
import { InsightsSources } from "./InsightsSources";
import styles from "./Insights.module.css";

const labels = { first_time: "First recorded", recurring: "Recurring", change: "Changes" };
type Filter = "all" | InsightView["type"];
const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "first_time", label: labels.first_time },
  { value: "recurring", label: labels.recurring },
  { value: "change", label: labels.change },
];

export function InsightsClient({ model, error = null, demo = false }: { model: InsightsModel; error?: string | null; demo?: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState("newest");
  const [limit, setLimit] = useState(12);
  const [selected, setSelected] = useState<InsightView | null>(null);
  const filtered = useMemo(() => model.insights.filter(item => filter === "all" || item.type === filter)
    .sort((a, b) => (sort === "oldest" ? a.sortDate.localeCompare(b.sortDate) : b.sortDate.localeCompare(a.sortDate)) || a.id.localeCompare(b.id)), [model.insights, filter, sort]);
  const visible = filtered.slice(0, limit);
  const retry = () => startTransition(() => router.refresh());
  const timelineHref = demo ? "/timeline?demo=jimmy" : "/timeline";
  const emptyKind = error && !model.insights.length ? "error" : !model.completedCount ? "archive" : !model.insights.length ? "patterns" : "filter";

  return (
    <main className={styles.page} data-insights-page lang="en">
      <header className={styles.intro}>
        <div className={styles.heading}><h1>Insights</h1>{!error && <span>{model.insights.length} {model.insights.length === 1 ? "pattern in archive" : "patterns in archive"}</span>}</div>
        <div className={styles.introBottom}>
          <p>What is new, what repeats, and what shifts across your archive.</p>
          {model.completedCount > 0 && <div className={styles.coverage}>
            <span>{model.completedCount} completed {model.completedCount === 1 ? "memory" : "memories"}{error ? " loaded" : ""}</span>
            <span>{formatInsightDate(model.firstDate)} — {formatInsightDate(model.lastDate)}</span>
          </div>}
        </div>
      </header>

      {error && model.insights.length > 0 && <div className={styles.notice} role="alert"><p>{error}</p><button type="button" onClick={retry} disabled={pending}>{pending ? "Loading…" : "Try again"}</button></div>}
      {model.omittedCount > 0 && <p className={styles.dataNote} data-insight-omitted>{model.omittedCount} {model.omittedCount === 1 ? "memory was" : "memories were"} omitted due to incomplete data, an invalid date, or duplication.</p>}

      {model.insights.length > 0 && <>
        <div className={styles.toolbar}>
          <div className={styles.filters} role="group" aria-label="Pattern type">
            {filters.map(option => <button type="button" key={option.value} data-insight-filter={option.value} aria-pressed={filter === option.value}
              onClick={() => { setFilter(option.value); setLimit(12); }}>
              {option.label}<span>{option.value === "all" ? model.insights.length : model.insights.filter(item => item.type === option.value).length}</span>
            </button>)}
          </div>
          <label className={styles.sort}><span className={styles.srOnly}>Sort patterns</span><select data-insight-sort value={sort} onChange={event => { setSort(event.target.value); setLimit(12); }}><option value="newest">Newest</option><option value="oldest">Oldest</option></select></label>
        </div>
        <p className={styles.resultCount} role="status">{visible.length} of {filtered.length} {filtered.length === 1 ? "pattern" : "patterns"}{filter !== "all" ? ` · ${labels[filter]}` : ""}</p>
      </>}

      {visible.length > 0 ? <div className={styles.patterns}>
        {visible.map(insight => <article key={insight.id} className={styles.pattern} data-insight-row={insight.id} data-insight-type={insight.type} data-insight-date={insight.sortDate}>
          <div className={styles.identity}>
            <p className={styles.type}>{labels[insight.type]}<span>{insight.kindLabel}</span></p>
            <h2>{insight.label}</h2>
            <p className={styles.period}>{insight.period}</p>
          </div>
          <div className={styles.story}>
            <p className={styles.description}>{insight.description}</p>
            {insight.comparison ? <div className={styles.comparison} aria-label="Memory count comparison">
              {[{ label: insight.comparison.previousLabel, count: insight.comparison.previousCount }, { label: insight.comparison.currentLabel, count: insight.comparison.currentCount }].map((point, index) => <div key={index} className={styles.comparisonRow}>
                <span>{point.label}</span><span className={styles.barTrack} aria-hidden="true"><span style={{ width: `${point.count / Math.max(1, insight.comparison!.previousCount, insight.comparison!.currentCount) * 100}%` }} /></span><strong>{point.count}<span className={styles.srOnly}> memories</span></strong>
              </div>)}
              <p>Monthly memory counts; the most recent month may still be in progress.</p>
            </div> : insight.evidence[0]?.snippet && <blockquote className={styles.excerpt}>{insight.evidence[0].snippet}</blockquote>}
            <button type="button" className={styles.sourcesButton} data-insight-source onClick={() => setSelected(insight)} aria-label={`Open source memories for ${insight.label}, ${insight.period}`}>
              <span>{insight.sourceCount} related {insight.sourceCount === 1 ? "memory" : "memories"}</span><span>View memories <ArrowUpRight size={16} aria-hidden="true" /></span>
            </button>
          </div>
        </article>)}
      </div> : <section className={styles.empty} data-insight-empty={emptyKind} role={emptyKind === "error" ? "alert" : undefined}>
        <h2>{emptyKind === "error" ? "Patterns could not be displayed" : emptyKind === "archive" ? "Stories will form patterns" : emptyKind === "patterns" ? "No patterns are visible yet" : "No patterns of this type yet"}</h2>
        <p>{emptyKind === "error" ? error : emptyKind === "archive" ? "Patterns emerge from completed memories. Start by recording a day you want to remember." : emptyKind === "patterns" ? "Your memories are saved. Recurring patterns appear when the same entity is recorded at least three times in a month. First recorded patterns require 20 completed memories and an initial entry at least 21 days old." : "Select another filter to explore available patterns."}</p>
        {emptyKind === "error" ? <button type="button" onClick={retry} disabled={pending}>{pending ? "Loading…" : "Try again"}</button> : emptyKind === "filter" ? <button type="button" onClick={() => { setFilter("all"); setLimit(12); }}>View all patterns</button> : <Link href={timelineHref}>Open timeline <ArrowUpRight size={16} aria-hidden="true" /></Link>}
      </section>}

      {filtered.length > visible.length && <button type="button" className={styles.more} data-insight-more onClick={() => setLimit(value => value + 12)}>Show more <ArrowDown size={16} aria-hidden="true" /></button>}
      {model.insights.length > 0 && <p className={styles.footnote}>Patterns reflect what is recorded in your archive. “First recorded” marks the earliest appearance here.</p>}
      {selected && <InsightsSources insight={selected} demo={demo} onClose={() => setSelected(null)} />}
    </main>
  );
}
