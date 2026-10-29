"use client";

import { useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search, X } from "lucide-react";
import { VaultShell } from "@/components/layout/VaultShell";
import { TopicsFeedback } from "./TopicsFeedback";
import { filterAndSortTopics, formatTopicsDate, type TopicsRowData, type TopicsSort } from "@/lib/topics/model";
import styles from "./Topics.module.css";

function TopicRow({ item, demo, memoriesError }: { item: TopicsRowData; demo: boolean; memoriesError: boolean }) {
  const nameId = useId();
  const { topic, latestMemory } = item;
  return (
    <Link href={"/topics/" + encodeURIComponent(topic.id) + (demo ? "?demo=jimmy" : "")}
      className={styles.row} aria-labelledby={nameId} data-topic-row={topic.id}>
      <div className={styles.rowIdentity}>
        <h2 id={nameId}>{topic.name}</h2>
        <div className={styles.rowContext}>
          <span>{topic.activity_count} memori</span>
          <span>{topic.last_seen_at ? "Terakhir " : ""}<time dateTime={topic.last_seen_at ?? undefined}>{formatTopicsDate(topic.last_seen_at)}</time></span>
        </div>
      </div>
      <div className={styles.rowStory}>
        {latestMemory ? (
          <p className={styles.excerpt}>{latestMemory.summary}</p>
        ) : (
          <p className={styles.excerptEmpty}>{memoriesError || topic.activity_count > 0
            ? "Cuplikan memori belum tersedia."
            : "Belum ada memori selesai untuk topik ini."}</p>
        )}
        <ArrowUpRight size={22} strokeWidth={1.5} aria-hidden="true" />
      </div>
    </Link>
  );
}

export function TopicsDirectory({
  topics, demo = false, directoryError = false, memoriesError = false,
}: {
  topics: TopicsRowData[];
  demo?: boolean;
  directoryError?: boolean;
  memoriesError?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<TopicsSort>("recent");
  const searchInput = useRef<HTMLInputElement>(null);
  const clearSearch = () => { setQuery(""); searchInput.current?.focus(); };
  const visible = useMemo(() => filterAndSortTopics(topics, query, sort), [topics, query, sort]);
  return (
    <VaultShell title="Topics" isDemo={demo}>
      <main className={styles.page} data-topics-directory>
        <header className={styles.intro}>
          <div className={styles.heading}>
            <h1>Topics</h1>
            {!directoryError && <span>{topics.length} topik</span>}
          </div>
          <p>Benang cerita dari catatan sehari-hari.</p>
        </header>
        {directoryError ? (
          <TopicsFeedback>Daftar topik belum bisa dimuat. Coba muat ulang halaman ini.</TopicsFeedback>
        ) : (
          <>
            {memoriesError && <TopicsFeedback>Cuplikan memori belum bisa dimuat. Nama topik dan jumlah memori tetap tersedia.</TopicsFeedback>}
            {topics.length > 0 ? (
              <>
                <div className={styles.toolbar}>
                  <div className={styles.search}>
                    <label className="sr-only" htmlFor="topics-search">Cari topik</label>
                    <Search size={18} aria-hidden="true" />
                    <input id="topics-search" ref={searchInput} type="search" placeholder="Cari topik" value={query} onChange={event => setQuery(event.target.value)} />
                    {query && <button type="button" aria-label="Hapus pencarian" onClick={clearSearch}><X size={17} aria-hidden="true" /></button>}
                  </div>
                  <label className={styles.sort}>
                    <span className="sr-only">Urutkan topik</span>
                    <select value={sort} onChange={event => setSort(event.target.value as TopicsSort)}>
                      <option value="recent">Terbaru</option>
                      <option value="name">Nama A–Z</option>
                      <option value="count">Jumlah memori</option>
                    </select>
                  </label>
                </div>
                <p className={styles.resultCount} role="status" aria-live="polite">
                  {query.trim() ? visible.length + " dari " + topics.length + " topik ditemukan" : "Berdasarkan memori yang sudah terjadi"}
                </p>
                {visible.length ? (
                  <div className={styles.directoryList}>
                    {visible.map(item => <TopicRow key={item.topic.id} item={item} demo={demo} memoriesError={memoriesError} />)}
                  </div>
                ) : (
                  <div className={styles.empty}>
                    <h2>Topik itu belum ditemukan.</h2>
                    <p>Coba kata lain dari nama topik yang kamu cari.</p>
                    <button type="button" onClick={clearSearch}>Hapus pencarian</button>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.empty}>
                <h2>Belum ada topik yang tercatat.</h2>
                <p>Topik yang disebut dalam memori selesai akan muncul di sini.</p>
                <Link href={demo ? "/timeline?demo=jimmy" : "/timeline"}>Buka timeline <ArrowUpRight size={16} aria-hidden="true" /></Link>
              </div>
            )}
          </>
        )}
      </main>
    </VaultShell>
  );
}
