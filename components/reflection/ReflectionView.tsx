"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { generateReflection } from "@/app/actions/reflection";
import { formatReflectionDate, formatReflectionMonth, validReflectionMonth, type FormattedFootnote, type FormattedParagraph } from "@/lib/reflection/monthly";
import type { GeneratedReflectionData, ReflectionPageData } from "@/lib/reflection/service";
import { ReflectionSources } from "./ReflectionSources";
import styles from "./Reflection.module.css";

const categoryLabels: Record<string, string> = { career: "Career", social: "Social", health: "Health", learning: "Learning", leisure: "Leisure", routine: "Routine", other: "Other" };
const timelineHref = (id: string, demo: boolean) => `/timeline${demo ? "?demo=jimmy" : ""}#${encodeURIComponent(id)}`;

function monthOffset(month: string, offset: number) {
  const date = new Date(`${month}-01T12:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + offset);
  return date.toISOString().slice(0, 7);
}

function Paragraph({ paragraph, onSource }: { paragraph: FormattedParagraph; onSource: (source: FormattedFootnote) => void }) {
  const footnotes = new Map(paragraph.footnotes.map(source => [source.globalIndex, source]));
  return <div className={styles.paragraph}>
    <p>{paragraph.text.split(/(\[\d+\])/g).map((part, index) => {
      const match = part.match(/^\[(\d+)\]$/);
      const number = match ? Number(match[1]) : null;
      if (number && footnotes.has(number)) return <a key={index} className={styles.citation} data-reflection-citation={number} href={`#reflection-source-${number}`} aria-label={`Jump to source memory ${number}`}>[{number}]</a>;
      return <span key={index}>{part}</span>;
    })}</p>
    <div className={styles.paragraphSources} aria-label="Sources for this paragraph">
      {paragraph.footnotes.map(source => <button type="button" key={source.globalIndex} data-reflection-source={source.globalIndex}
        onClick={() => onSource(source)} aria-label={`Open source memory ${source.globalIndex}`}>
        Source {source.globalIndex}<ArrowUpRight size={14} aria-hidden="true" />
      </button>)}
    </div>
  </div>;
}

function ReflectionContent({ data, demo }: { data: ReflectionPageData; demo: boolean }) {
  const router = useRouter();
  const [draftMonth, setDraftMonth] = useState(data.month);
  const [result, setResult] = useState<GeneratedReflectionData | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [refreshing, startTransition] = useTransition();
  const [source, setSource] = useState<FormattedFootnote | null>(null);
  const request = useRef(0);
  const busy = useRef(false);
  const mounted = useRef(false);
  const essay = result?.essay ?? data.essay;
  const saved = result?.saved ?? data.hasSavedReflection;
  const monthName = formatReflectionMonth(data.month);
  const previous = monthOffset(data.month, -1);
  const next = monthOffset(data.month, 1);
  const href = (month: string) => `/reflection?month=${encodeURIComponent(month)}${demo ? "&demo=jimmy" : ""}`;
  const uniqueSources = new Set(essay?.bibliography.map(item => item.evidenceId)).size;
  const themes = [...new Set(essay?.key_themes.map(theme => categoryLabels[theme] ?? theme) ?? [])];

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; request.current += 1; };
  }, []);

  async function handleGenerate() {
    if (busy.current || demo) return;
    busy.current = true;
    const currentRequest = ++request.current;
    setGenerating(true); setMessage(null); setFailed(false);
    try {
      const response = await generateReflection(data.month, false);
      if (!mounted.current || currentRequest !== request.current) return;
      if (response.success) {
        // A failed regeneration must leave an existing AI essay available to read.
        const retainedPrevious = response.data.essay.source === "deterministic" && essay?.source === "gemini";
        if (!retainedPrevious) { setSource(null); setResult(response.data); }
        setMessage(retainedPrevious ? "The reflection could not be regenerated. Your previous reflection remains available." : response.data.notice ?? (response.data.saved ? "Reflection saved." : "Reflection generated."));
        setFailed(!response.data.saved);
      } else {
        setMessage(response.error || "The reflection could not be generated right now. Try again shortly."); setFailed(true);
      }
    } catch {
      if (mounted.current && currentRequest === request.current) { setMessage("The reflection could not be generated right now. Your memories remain readable; try again shortly."); setFailed(true); }
    } finally {
      if (mounted.current && currentRequest === request.current) { busy.current = false; setGenerating(false); }
    }
  }

  const retry = () => startTransition(() => router.refresh());
  return <main className={styles.page} data-reflection-page lang="en">
    <header className={styles.intro}>
      <div className={styles.heading}><h1>Reflection</h1><span>Monthly chronicle</span></div>
      <p>One month, revisited.</p>
    </header>
    <div className={styles.toolbar}>
      <nav className={styles.monthNav} aria-label="Month navigation">
        {validReflectionMonth(previous) ? <Link href={href(previous)} aria-label="Previous month"><ChevronLeft size={20} aria-hidden="true" /></Link> : <button type="button" disabled aria-label="Previous month"><ChevronLeft size={20} aria-hidden="true" /></button>}
        <form onSubmit={event => { event.preventDefault(); if (validReflectionMonth(draftMonth) && draftMonth <= data.currentMonth) startTransition(() => router.push(href(draftMonth))); }}>
          <input type="month" aria-label="Select month" data-reflection-month value={draftMonth} min="0001-01" max={data.currentMonth} required onChange={event => setDraftMonth(event.target.value)} />
          <button type="submit" aria-label="Show month" data-reflection-month-submit disabled={refreshing}><ArrowRight size={17} aria-hidden="true" /></button>
        </form>
        {data.month < data.currentMonth ? <Link href={href(next)} aria-label="Next month"><ChevronRight size={20} aria-hidden="true" /></Link> : <button type="button" disabled aria-label="Next month"><ChevronRight size={20} aria-hidden="true" /></button>}
      </nav>
      {essay && !demo && <button type="button" className={styles.generate} data-reflection-generate disabled={generating || refreshing || Boolean(data.error)} onClick={handleGenerate}>
        {generating ? "Generating…" : saved || essay.source === "gemini" ? "Regenerate" : "Generate reflection"}
      </button>}
    </div>
    <div className={styles.monthMeta}>
      <p>{monthName}{data.month === data.currentMonth && <span> · Current month</span>}</p>
      {!data.error && <p>{data.completedCount} completed {data.completedCount === 1 ? "memory" : "memories"}{essay && ` · ${uniqueSources} source ${uniqueSources === 1 ? "memory" : "memories"}`}</p>}
    </div>

    {data.notice && <div className={styles.notice} data-reflection-notice><p>{data.notice}</p><button type="button" data-reflection-retry disabled={refreshing || generating} onClick={retry}>{refreshing ? "Loading…" : "Try again"}</button></div>}
    {(generating || message) && <div className={styles.notice} data-reflection-notice role={failed ? "alert" : "status"}>
      <p>{generating ? "Generating your reflection. You can continue reading your memories below." : message}</p>
    </div>}

    {data.error ? <section className={styles.empty} data-reflection-empty="error" role="alert"><h2>Reflection could not be loaded</h2><p>{data.error}</p><button type="button" data-reflection-retry onClick={retry} disabled={refreshing}>{refreshing ? "Loading…" : "Try again"}</button></section>
      : !essay ? <section className={styles.empty} data-reflection-empty="empty"><h2>No stories for {monthName} yet</h2><p>There are no completed memories for this month yet. Select another month or open your timeline to explore your archive.</p>
        <div className={styles.emptyActions}>{data.availableMonths[0] && data.availableMonths[0] !== data.month && <Link href={href(data.availableMonths[0])}>Go to {formatReflectionMonth(data.availableMonths[0])}<ArrowRight size={16} aria-hidden="true" /></Link>}<Link href={demo ? "/timeline?demo=jimmy" : "/timeline"}>Open timeline<ArrowUpRight size={16} aria-hidden="true" /></Link></div>
      </section>
      : <article className={styles.essay} data-reflection-essay data-reflection-essay-month={data.month} aria-busy={generating}>
        <header className={styles.essayHeader}>
          <p className={styles.essayType}>{essay.source === "gemini" ? "Reflection from your memories" : "Memory summary"}{demo ? " · Demo" : saved ? " · Saved" : ""}</p>
          <h2>{essay.title}</h2>
          {themes.length > 0 && <p className={styles.themes}><span>Themes</span>{themes.join(" · ")}</p>}
        </header>
        <div className={styles.prose}>{essay.paragraphs.map((paragraph, index) => <Paragraph key={index} paragraph={paragraph} onSource={setSource} />)}</div>
        <footer className={styles.essayFooter}><p>{essay.source === "gemini" ? "Composed with AI from this month’s memories. Open any source to revisit the original moment." : demo ? "This summary is woven from Jimmy’s sample memories." : "This summary weaves together your available memories. Select “Generate reflection” to read it as an AI-assisted essay."}</p></footer>
        {essay.bibliography.length > 0 && <section className={styles.sources} aria-labelledby="reflection-sources-title">
          <h2 id="reflection-sources-title">Source memories <span>{uniqueSources} {uniqueSources === 1 ? "memory" : "memories"}</span></h2>
          <ol>{essay.bibliography.map(item => <li key={item.globalIndex} id={`reflection-source-${item.globalIndex}`} tabIndex={-1}>
            <span className={styles.sourceIndex}>[{item.globalIndex}]</span><div>
              <p className={styles.sourceMeta}><time dateTime={item.evidence.date}>{formatReflectionDate(item.evidence.date)}</time><span>{categoryLabels[item.evidence.category] ?? item.evidence.category}</span></p>
              <p className={styles.sourceSummary}>{item.evidence.summary}</p>
              <Link href={timelineHref(item.evidenceId, demo)}>Open in timeline<ArrowUpRight size={15} aria-hidden="true" /></Link>
            </div>
          </li>)}</ol>
        </section>}
      </article>}
    {source && <ReflectionSources footnote={source} demo={demo} onClose={() => setSource(null)} />}
  </main>;
}

export function ReflectionView({ data, demo = false }: { data: ReflectionPageData; demo?: boolean }) {
  return <ReflectionContent key={data.month} data={data} demo={demo} />;
}
