"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import type { InsightsModel, InsightView } from "@/lib/insights/model";
import { formatInsightDate } from "@/lib/insights/model";
import { InsightsSources } from "./InsightsSources";
import styles from "./Insights.module.css";

const labels = { first_time: "Pertama tercatat", recurring: "Berulang", change: "Perubahan" };
type Filter = "all" | InsightView["type"];
const filters: { value: Filter; label: string }[] = [
  { value: "all", label: "Semua" },
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
    <main className={styles.page} data-insights-page lang="id">
      <header className={styles.intro}>
        <div className={styles.heading}><h1>Insights</h1>{!error && <span>{model.insights.length} pola dalam catatan</span>}</div>
        <div className={styles.introBottom}>
          <p>Yang baru, yang berulang, dan yang berubah dalam arsipmu.</p>
          {model.completedCount > 0 && <div className={styles.coverage}>
            <span>{model.completedCount} memori selesai{error ? " yang berhasil dimuat" : ""}</span>
            <span>{formatInsightDate(model.firstDate)} — {formatInsightDate(model.lastDate)}</span>
          </div>}
        </div>
      </header>

      {error && model.insights.length > 0 && <div className={styles.notice} role="alert"><p>{error}</p><button type="button" onClick={retry} disabled={pending}>{pending ? "Memuat…" : "Coba lagi"}</button></div>}
      {model.omittedCount > 0 && <p className={styles.dataNote} data-insight-omitted>{model.omittedCount} catatan tidak dihitung karena datanya belum lengkap, tanggal tidak valid, atau merupakan duplikat.</p>}

      {model.insights.length > 0 && <>
        <div className={styles.toolbar}>
          <div className={styles.filters} role="group" aria-label="Jenis pola">
            {filters.map(option => <button type="button" key={option.value} data-insight-filter={option.value} aria-pressed={filter === option.value}
              onClick={() => { setFilter(option.value); setLimit(12); }}>
              {option.label}<span>{option.value === "all" ? model.insights.length : model.insights.filter(item => item.type === option.value).length}</span>
            </button>)}
          </div>
          <label className={styles.sort}><span className={styles.srOnly}>Urutan pola</span><select data-insight-sort value={sort} onChange={event => { setSort(event.target.value); setLimit(12); }}><option value="newest">Terbaru</option><option value="oldest">Terlama</option></select></label>
        </div>
        <p className={styles.resultCount} role="status">{visible.length} dari {filtered.length} pola{filter !== "all" ? ` · ${labels[filter]}` : ""}</p>
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
            {insight.comparison ? <div className={styles.comparison} aria-label="Perbandingan jumlah memori">
              {[{ label: insight.comparison.previousLabel, count: insight.comparison.previousCount }, { label: insight.comparison.currentLabel, count: insight.comparison.currentCount }].map((point, index) => <div key={index} className={styles.comparisonRow}>
                <span>{point.label}</span><span className={styles.barTrack} aria-hidden="true"><span style={{ width: `${point.count / Math.max(1, insight.comparison!.previousCount, insight.comparison!.currentCount) * 100}%` }} /></span><strong>{point.count}<span className={styles.srOnly}> memori</span></strong>
              </div>)}
              <p>Jumlah catatan per bulan; bulan terakhir bisa belum lengkap.</p>
            </div> : insight.evidence[0]?.snippet && <blockquote className={styles.excerpt}>{insight.evidence[0].snippet}</blockquote>}
            <button type="button" className={styles.sourcesButton} data-insight-source onClick={() => setSelected(insight)} aria-label={`Buka catatan sumber untuk ${insight.label}, ${insight.period}`}>
              <span>{insight.sourceCount} memori terkait</span><span>Lihat catatan <ArrowUpRight size={16} aria-hidden="true" /></span>
            </button>
          </div>
        </article>)}
      </div> : <section className={styles.empty} data-insight-empty={emptyKind} role={emptyKind === "error" ? "alert" : undefined}>
        <h2>{emptyKind === "error" ? "Pola belum bisa ditampilkan" : emptyKind === "archive" ? "Cerita akan membentuk pola" : emptyKind === "patterns" ? "Belum ada pola yang cukup terlihat" : "Belum ada pola jenis ini"}</h2>
        <p>{emptyKind === "error" ? error : emptyKind === "archive" ? "Pola akan muncul dari memori yang sudah selesai. Mulai dengan mencatat hari yang ingin kamu ingat." : emptyKind === "patterns" ? "Catatanmu sudah tersimpan. Pola berulang muncul saat hal yang sama tercatat setidaknya tiga kali dalam satu bulan. Pertama tercatat memerlukan 20 memori selesai dan catatan pertama yang berusia minimal 21 hari." : "Pilih jenis lain untuk membaca pola yang sudah tersedia."}</p>
        {emptyKind === "error" ? <button type="button" onClick={retry} disabled={pending}>{pending ? "Memuat…" : "Coba lagi"}</button> : emptyKind === "filter" ? <button type="button" onClick={() => { setFilter("all"); setLimit(12); }}>Lihat semua pola</button> : <Link href={timelineHref}>Buka timeline <ArrowUpRight size={16} aria-hidden="true" /></Link>}
      </section>}

      {filtered.length > visible.length && <button type="button" className={styles.more} data-insight-more onClick={() => setLimit(value => value + 12)}>Tampilkan lebih banyak <ArrowDown size={16} aria-hidden="true" /></button>}
      {model.insights.length > 0 && <p className={styles.footnote}>Pola merujuk pada yang tercatat di arsip. “Pertama tercatat” berarti kemunculan paling awal di sini.</p>}
      {selected && <InsightsSources insight={selected} demo={demo} onClose={() => setSelected(null)} />}
    </main>
  );
}
