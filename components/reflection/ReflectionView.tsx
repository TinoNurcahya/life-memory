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

const categoryLabels: Record<string, string> = { career: "Karier", social: "Sosial", health: "Kesehatan", learning: "Belajar", leisure: "Waktu luang", routine: "Rutinitas", other: "Lainnya" };
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
      if (number && footnotes.has(number)) return <a key={index} className={styles.citation} data-reflection-citation={number} href={`#reflection-source-${number}`} aria-label={`Ke catatan sumber ${number}`}>[{number}]</a>;
      return <span key={index}>{part}</span>;
    })}</p>
    <div className={styles.paragraphSources} aria-label="Catatan untuk paragraf ini">
      {paragraph.footnotes.map(source => <button type="button" key={source.globalIndex} data-reflection-source={source.globalIndex}
        onClick={() => onSource(source)} aria-label={`Buka catatan sumber ${source.globalIndex}`}>
        Catatan {source.globalIndex}<ArrowUpRight size={14} aria-hidden="true" />
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
        setMessage(retainedPrevious ? "Refleksi belum berhasil disusun ulang. Refleksi sebelumnya tetap tersedia." : response.data.notice ?? (response.data.saved ? "Refleksi tersimpan." : "Refleksi sudah disusun."));
        setFailed(!response.data.saved);
      } else {
        setMessage(response.error || "Refleksi belum bisa disusun. Coba lagi sebentar lagi."); setFailed(true);
      }
    } catch {
      if (mounted.current && currentRequest === request.current) { setMessage("Refleksi belum bisa disusun. Catatanmu tetap bisa dibaca; coba lagi sebentar lagi."); setFailed(true); }
    } finally {
      if (mounted.current && currentRequest === request.current) { busy.current = false; setGenerating(false); }
    }
  }

  const retry = () => startTransition(() => router.refresh());
  return <main className={styles.page} data-reflection-page lang="id">
    <header className={styles.intro}>
      <div className={styles.heading}><h1>Reflection</h1><span>Catatan bulanan</span></div>
      <p>Satu bulan, dibaca kembali.</p>
    </header>
    <div className={styles.toolbar}>
      <nav className={styles.monthNav} aria-label="Navigasi bulan">
        {validReflectionMonth(previous) ? <Link href={href(previous)} aria-label="Bulan sebelumnya"><ChevronLeft size={20} aria-hidden="true" /></Link> : <button type="button" disabled aria-label="Bulan sebelumnya"><ChevronLeft size={20} aria-hidden="true" /></button>}
        <form onSubmit={event => { event.preventDefault(); if (validReflectionMonth(draftMonth) && draftMonth <= data.currentMonth) startTransition(() => router.push(href(draftMonth))); }}>
          <input type="month" aria-label="Pilih bulan" data-reflection-month value={draftMonth} min="0001-01" max={data.currentMonth} required onChange={event => setDraftMonth(event.target.value)} />
          <button type="submit" aria-label="Tampilkan bulan" data-reflection-month-submit disabled={refreshing}><ArrowRight size={17} aria-hidden="true" /></button>
        </form>
        {data.month < data.currentMonth ? <Link href={href(next)} aria-label="Bulan berikutnya"><ChevronRight size={20} aria-hidden="true" /></Link> : <button type="button" disabled aria-label="Bulan berikutnya"><ChevronRight size={20} aria-hidden="true" /></button>}
      </nav>
      {essay && !demo && <button type="button" className={styles.generate} data-reflection-generate disabled={generating || refreshing || Boolean(data.error)} onClick={handleGenerate}>
        {generating ? "Menyusun…" : saved || essay.source === "gemini" ? "Susun ulang" : "Susun refleksi"}
      </button>}
    </div>
    <div className={styles.monthMeta}>
      <p>{monthName}{data.month === data.currentMonth && <span> · Bulan berjalan</span>}</p>
      {!data.error && <p>{data.completedCount} memori selesai{essay && ` · ${uniqueSources} catatan sumber`}</p>}
    </div>

    {data.notice && <div className={styles.notice} data-reflection-notice><p>{data.notice}</p><button type="button" data-reflection-retry disabled={refreshing || generating} onClick={retry}>{refreshing ? "Memuat…" : "Coba lagi"}</button></div>}
    {(generating || message) && <div className={styles.notice} data-reflection-notice role={failed ? "alert" : "status"}>
      <p>{generating ? "Sedang menyusun refleksi. Kamu tetap bisa membaca catatan di bawah." : message}</p>
    </div>}

    {data.error ? <section className={styles.empty} data-reflection-empty="error" role="alert"><h2>Refleksi belum bisa dimuat</h2><p>{data.error}</p><button type="button" data-reflection-retry onClick={retry} disabled={refreshing}>{refreshing ? "Memuat…" : "Coba lagi"}</button></section>
      : !essay ? <section className={styles.empty} data-reflection-empty="empty"><h2>Belum ada cerita untuk {monthName}</h2><p>Belum ada memori selesai pada bulan ini. Pilih bulan lain atau buka timeline untuk membaca catatanmu.</p>
        <div className={styles.emptyActions}>{data.availableMonths[0] && data.availableMonths[0] !== data.month && <Link href={href(data.availableMonths[0])}>Ke {formatReflectionMonth(data.availableMonths[0])}<ArrowRight size={16} aria-hidden="true" /></Link>}<Link href={demo ? "/timeline?demo=jimmy" : "/timeline"}>Buka timeline<ArrowUpRight size={16} aria-hidden="true" /></Link></div>
      </section>
      : <article className={styles.essay} data-reflection-essay data-reflection-essay-month={data.month} aria-busy={generating}>
        <header className={styles.essayHeader}>
          <p className={styles.essayType}>{essay.source === "gemini" ? "Refleksi dari catatanmu" : "Ringkasan catatan"}{demo ? " · Demo" : saved ? " · Tersimpan" : ""}</p>
          <h2>{essay.title}</h2>
          {themes.length > 0 && <p className={styles.themes}><span>Tema</span>{themes.join(" · ")}</p>}
        </header>
        <div className={styles.prose}>{essay.paragraphs.map((paragraph, index) => <Paragraph key={index} paragraph={paragraph} onSource={setSource} />)}</div>
        <footer className={styles.essayFooter}><p>{essay.source === "gemini" ? "Disusun dengan bantuan AI dari catatan bulan ini. Buka sumber untuk membaca kembali peristiwanya." : demo ? "Ringkasan ini memakai catatan contoh Jimmy." : "Ringkasan ini merangkai catatan yang tersedia. Pilih “Susun refleksi” untuk membacanya sebagai esai dengan bantuan AI."}</p></footer>
        {essay.bibliography.length > 0 && <section className={styles.sources} aria-labelledby="reflection-sources-title">
          <h2 id="reflection-sources-title">Catatan sumber <span>{uniqueSources} memori</span></h2>
          <ol>{essay.bibliography.map(item => <li key={item.globalIndex} id={`reflection-source-${item.globalIndex}`} tabIndex={-1}>
            <span className={styles.sourceIndex}>[{item.globalIndex}]</span><div>
              <p className={styles.sourceMeta}><time dateTime={item.evidence.date}>{formatReflectionDate(item.evidence.date)}</time><span>{categoryLabels[item.evidence.category] ?? item.evidence.category}</span></p>
              <p className={styles.sourceSummary}>{item.evidence.summary}</p>
              <Link href={timelineHref(item.evidenceId, demo)}>Buka di timeline<ArrowUpRight size={15} aria-hidden="true" /></Link>
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
