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
        <span>{person.activity_count} {person.activity_count === 1 ? "memory" : "memories"}</span>
        <span>{latestMemory ? "Memory · " : person.last_seen_at ? "Last recorded " : ""}<time dateTime={latestMemory?.occurredAt ?? person.last_seen_at ?? undefined}>{formatPeopleDate(latestMemory?.occurredAt ?? person.last_seen_at)}</time></span>
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
            {!directoryError && <span>{people.length} {people.length === 1 ? "person" : "people"}</span>}
          </div>
          <p>People who appear across your memories.</p>
        </header>

        {directoryError ? (
          <PeopleFeedback>The people directory could not be loaded. Try reloading this page.</PeopleFeedback>
        ) : (
          <>
            {memoriesError && <PeopleFeedback>Memory excerpts could not be loaded. Names and memory counts remain available.</PeopleFeedback>}
            {people.length > 0 ? (
              <>
                <div className={styles.toolbar}>
                  <label className={styles.search}>
                    <span className="sr-only">Search name or alias</span>
                    <Search size={18} aria-hidden="true" />
                    <input ref={searchInput} type="search" placeholder="Search name or alias…" value={query} onChange={event => setQuery(event.target.value)} />
                    {query && <button type="button" aria-label="Clear search" onClick={clearSearch}><X size={17} aria-hidden="true" /></button>}
                  </label>
                  <label className={styles.sort}>
                    <span className="sr-only">Sort people</span>
                    <select value={sort} onChange={event => setSort(event.target.value as PeopleSort)}>
                      <option value="recent">Most recent</option>
                      <option value="name">Name A–Z</option>
                      <option value="count">Most memories</option>
                    </select>
                  </label>
                </div>
                <p className={styles.resultCount} role="status" aria-live="polite">
                  {query.trim() ? visible.length + " of " + people.length + " people found" : "Based on completed memories"}
                </p>
                {visible.length ? (
                  <div className={styles.grid}>
                    {visible.map(item => <PersonCard key={item.person.id} item={item} demo={demo} memoriesError={memoriesError} />)}
                  </div>
                ) : (
                  <div className={styles.empty}>
                    <h2>No matching person found.</h2>
                    <p>Try another name or an alias you have recorded.</p>
                    <button type="button" onClick={clearSearch}>Clear search</button>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.empty}>
                <h2>No people recorded yet.</h2>
                <p>People mentioned in completed memories will appear here.</p>
                <Link href={demo ? "/timeline?demo=jimmy" : "/timeline"}>Open timeline <ArrowUpRight size={16} aria-hidden="true" /></Link>
              </div>
            )}
          </>
        )}
      </main>
    </VaultShell>
  );
}
