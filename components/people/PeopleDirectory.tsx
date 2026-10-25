"use client";

import { useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search, X } from "lucide-react";
import { VaultShell } from "@/components/layout/VaultShell";
import { PeopleFeedback } from "./PeopleFeedback";
import { PeopleCover } from "./PeopleMedia";
import { filterAndSortPeople, formatPeopleDate, type PeopleCardData, type PeopleSort } from "@/lib/people/model";
import styles from "./People.module.css";

function PersonCard({ item, demo, memoriesError }: { item: PeopleCardData; demo: boolean; memoriesError: boolean }) {
  const nameId = useId();
  const { person, latestMemory } = item;
  return (
    <Link
      href={"/people/" + encodeURIComponent(person.id) + (demo ? "?demo=jimmy" : "")}
      className={styles.card}
      aria-labelledby={nameId}
      data-person-card={person.id}
    >
      <div className={styles.cardHeading}>
        <h2 id={nameId}>{person.name}</h2>
        <ArrowUpRight size={21} strokeWidth={1.5} aria-hidden="true" />
      </div>
      <PeopleCover memory={latestMemory} unavailable={memoriesError || (!latestMemory && person.activity_count > 0)} />
      <div className={styles.cardContext}>
        <span>{person.activity_count} memori</span>
        <span>{latestMemory ? "Memori · " : person.last_seen_at ? "Terakhir tercatat " : ""}<time dateTime={latestMemory?.occurredAt ?? person.last_seen_at ?? undefined}>{formatPeopleDate(latestMemory?.occurredAt ?? person.last_seen_at)}</time></span>
      </div>
      {latestMemory && (
        <div className={styles.cardStory}>
          <p className={styles.excerpt}>{latestMemory.summary}</p>
        </div>
      )}
    </Link>
  );
}

export function PeopleDirectory({
  people,
  demo = false,
  directoryError = false,
  memoriesError = false,
}: {
  people: PeopleCardData[];
  demo?: boolean;
  directoryError?: boolean;
  memoriesError?: boolean;
}) {
  const [query, setQuery] = useState("");
  const searchInput = useRef<HTMLInputElement>(null);
  const [sort, setSort] = useState<PeopleSort>("recent");
  const clearSearch = () => {
    setQuery("");
    searchInput.current?.focus();
  };
  const visible = useMemo(() => filterAndSortPeople(people, query, sort), [people, query, sort]);
  return (
    <VaultShell title="People" isDemo={demo}>
      <main className={styles.page} data-people-directory>
        <header className={styles.intro}>
          <div className={styles.heading}>
            <h1>People</h1>
            {!directoryError && <span>{people.length} orang</span>}
          </div>
          <p>Orang-orang dalam catatanmu.</p>
        </header>

        {directoryError ? (
          <PeopleFeedback>Daftar orang belum bisa dimuat. Coba muat ulang halaman ini.</PeopleFeedback>
        ) : (
          <>
            {memoriesError && <PeopleFeedback>Cuplikan memori belum bisa dimuat. Nama dan jumlah memori tetap tersedia.</PeopleFeedback>}
            {people.length > 0 ? (
              <>
                <div className={styles.toolbar}>
                  <label className={styles.search}>
                    <span className="sr-only">Cari nama atau alias</span>
                    <Search size={18} aria-hidden="true" />
                    <input ref={searchInput} type="search" placeholder="Cari nama atau alias…" value={query} onChange={event => setQuery(event.target.value)} />
                    {query && <button type="button" aria-label="Hapus pencarian" onClick={clearSearch}><X size={17} aria-hidden="true" /></button>}
                  </label>
                  <label className={styles.sort}>
                    <span className="sr-only">Urutkan orang</span>
                    <select value={sort} onChange={event => setSort(event.target.value as PeopleSort)}>
                      <option value="recent">Terbaru</option>
                      <option value="name">Nama A–Z</option>
                      <option value="count">Jumlah memori</option>
                    </select>
                  </label>
                </div>
                <p className={styles.resultCount} role="status" aria-live="polite">
                  {query.trim() ? visible.length + " dari " + people.length + " orang ditemukan" : "Berdasarkan memori yang sudah terjadi"}
                </p>
                {visible.length ? (
                  <div className={styles.grid}>
                    {visible.map(item => <PersonCard key={item.person.id} item={item} demo={demo} memoriesError={memoriesError} />)}
                  </div>
                ) : (
                  <div className={styles.empty}>
                    <h2>Nama itu belum ditemukan.</h2>
                    <p>Coba nama lain atau alias yang pernah kamu catat.</p>
                    <button type="button" onClick={clearSearch}>Hapus pencarian</button>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.empty}>
                <h2>Belum ada orang yang tercatat.</h2>
                <p>Orang yang disebut dalam memori selesai akan muncul di sini.</p>
                <Link href={demo ? "/timeline?demo=jimmy" : "/timeline"}>Buka timeline <ArrowUpRight size={16} aria-hidden="true" /></Link>
              </div>
            )}
          </>
        )}
      </main>
    </VaultShell>
  );
}
