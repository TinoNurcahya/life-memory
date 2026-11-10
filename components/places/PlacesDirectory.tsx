"use client";

import { useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search, X } from "lucide-react";
import { VaultShell } from "@/components/layout/VaultShell";
import { PlacesFeedback } from "./PlacesFeedback";
import { PlacesCover } from "./PlacesMedia";
import { filterAndSortPlaces, formatPlacesDate, type PlacesCardData, type PlacesSort } from "@/lib/places/model";
import styles from "./Places.module.css";

function PlaceCard({ item, demo, memoriesError }: { item: PlacesCardData; demo: boolean; memoriesError: boolean }) {
  const nameId = useId();
  const { place, latestMemory } = item;
  return (
    <Link href={"/places/" + encodeURIComponent(place.id) + (demo ? "?demo=jimmy" : "")}
      className={styles.card} aria-labelledby={nameId} data-place-card={place.id}>
      <figure className={styles.cardVisual}>
        <PlacesCover memory={latestMemory} unavailable={memoriesError || (!latestMemory && place.activity_count > 0)} />
        {latestMemory && <figcaption className={styles.coverCaption}>Memory · <time dateTime={latestMemory.occurredAt}>{formatPlacesDate(latestMemory.occurredAt)}</time></figcaption>}
      </figure>
      <div className={styles.cardBody}>
        <div className={styles.cardHeading}>
          <h2 id={nameId}>{place.name}</h2>
          <ArrowUpRight size={23} strokeWidth={1.5} aria-hidden="true" />
        </div>
        <div className={styles.cardContext}>
          <span>{place.activity_count} {place.activity_count === 1 ? "memory" : "memories"}</span>
          <span>{place.last_seen_at ? "Last recorded " : ""}<time dateTime={place.last_seen_at ?? undefined}>{formatPlacesDate(place.last_seen_at)}</time></span>
        </div>
        {latestMemory && <p className={styles.excerpt}>{latestMemory.summary}</p>}
      </div>
    </Link>
  );
}

export function PlacesDirectory({
  places, demo = false, directoryError = false, memoriesError = false,
}: {
  places: PlacesCardData[];
  demo?: boolean;
  directoryError?: boolean;
  memoriesError?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<PlacesSort>("recent");
  const searchInput = useRef<HTMLInputElement>(null);
  const clearSearch = () => { setQuery(""); searchInput.current?.focus(); };
  const visible = useMemo(() => filterAndSortPlaces(places, query, sort), [places, query, sort]);
  return (
    <VaultShell title="Places" isDemo={demo}>
      <main className={styles.page} data-places-directory>
        <header className={styles.intro}>
          <div className={styles.heading}>
            <h1>Places</h1>
            {!directoryError && <span>{places.length} {places.length === 1 ? "place" : "places"}</span>}
          </div>
          <p>Places that form the backdrop of your memories.</p>
        </header>
        {directoryError ? (
          <PlacesFeedback>The places directory could not be loaded. Try reloading this page.</PlacesFeedback>
        ) : (
          <>
            {memoriesError && <PlacesFeedback>Memory excerpts could not be loaded. Place names and memory counts remain available.</PlacesFeedback>}
            {places.length > 0 ? (
              <>
                <div className={styles.toolbar}>
                  <div className={styles.search}>
                    <label className="sr-only" htmlFor="places-search">Search place name or alias</label>
                    <Search size={18} aria-hidden="true" />
                    <input id="places-search" ref={searchInput} type="search" placeholder="Search place name or alias…" value={query} onChange={event => setQuery(event.target.value)} />
                    {query && <button type="button" aria-label="Clear search" onClick={clearSearch}><X size={17} aria-hidden="true" /></button>}
                  </div>
                  <label className={styles.sort}>
                    <span className="sr-only">Sort places</span>
                    <select value={sort} onChange={event => setSort(event.target.value as PlacesSort)}>
                      <option value="recent">Most recent</option>
                      <option value="name">Name A–Z</option>
                      <option value="count">Most memories</option>
                    </select>
                  </label>
                </div>
                <p className={styles.resultCount} role="status" aria-live="polite">
                  {query.trim() ? visible.length + " of " + places.length + " places found" : "Based on completed memories"}
                </p>
                {visible.length ? (
                  <div className={styles.directoryList}>
                    {visible.map(item => <PlaceCard key={item.place.id} item={item} demo={demo} memoriesError={memoriesError} />)}
                  </div>
                ) : (
                  <div className={styles.empty}>
                    <h2>No matching place found.</h2>
                    <p>Try another name or an alias you have recorded.</p>
                    <button type="button" onClick={clearSearch}>Clear search</button>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.empty}>
                <h2>No places recorded yet.</h2>
                <p>Places mentioned in completed memories will appear here.</p>
                <Link href={demo ? "/timeline?demo=jimmy" : "/timeline"}>Open timeline <ArrowUpRight size={16} aria-hidden="true" /></Link>
              </div>
            )}
          </>
        )}
      </main>
    </VaultShell>
  );
}

