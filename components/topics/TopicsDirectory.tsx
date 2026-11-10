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
          <span>{topic.activity_count} {topic.activity_count === 1 ? "memory" : "memories"}</span>
          <span>{topic.last_seen_at ? "Latest " : ""}<time dateTime={topic.last_seen_at ?? undefined}>{formatTopicsDate(topic.last_seen_at)}</time></span>
        </div>
      </div>
      <div className={styles.rowStory}>
        {latestMemory ? (
          <p className={styles.excerpt}>{latestMemory.summary}</p>
        ) : (
          <p className={styles.excerptEmpty}>{memoriesError || topic.activity_count > 0
            ? "Memory excerpt unavailable."
            : "No completed memories for this topic yet."}</p>
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
            {!directoryError && <span>{topics.length} {topics.length === 1 ? "topic" : "topics"}</span>}
          </div>
          <p>Themes and threads woven through your daily memories.</p>
        </header>
        {directoryError ? (
          <TopicsFeedback>The topics directory could not be loaded. Try reloading this page.</TopicsFeedback>
        ) : (
          <>
            {memoriesError && <TopicsFeedback>Memory excerpts could not be loaded. Topic names and memory counts remain available.</TopicsFeedback>}
            {topics.length > 0 ? (
              <>
                <div className={styles.toolbar}>
                  <div className={styles.search}>
                    <label className="sr-only" htmlFor="topics-search">Search topics</label>
                    <Search size={18} aria-hidden="true" />
                    <input id="topics-search" ref={searchInput} type="search" placeholder="Search topics…" value={query} onChange={event => setQuery(event.target.value)} />
                    {query && <button type="button" aria-label="Clear search" onClick={clearSearch}><X size={17} aria-hidden="true" /></button>}
                  </div>
                  <label className={styles.sort}>
                    <span className="sr-only">Sort topics</span>
                    <select value={sort} onChange={event => setSort(event.target.value as TopicsSort)}>
                      <option value="recent">Most recent</option>
                      <option value="name">Name A–Z</option>
                      <option value="count">Most memories</option>
                    </select>
                  </label>
                </div>
                <p className={styles.resultCount} role="status" aria-live="polite">
                  {query.trim() ? visible.length + " of " + topics.length + " topics found" : "Based on completed memories"}
                </p>
                {visible.length ? (
                  <div className={styles.directoryList}>
                    {visible.map(item => <TopicRow key={item.topic.id} item={item} demo={demo} memoriesError={memoriesError} />)}
                  </div>
                ) : (
                  <div className={styles.empty}>
                    <h2>No matching topic found.</h2>
                    <p>Try another word from the topic you are looking for.</p>
                    <button type="button" onClick={clearSearch}>Clear search</button>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.empty}>
                <h2>No topics recorded yet.</h2>
                <p>Topics mentioned in completed memories will appear here.</p>
                <Link href={demo ? "/timeline?demo=jimmy" : "/timeline"}>Open timeline <ArrowUpRight size={16} aria-hidden="true" /></Link>
              </div>
            )}
          </>
        )}
      </main>
    </VaultShell>
  );
}
