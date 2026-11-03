"use client";

import Link from "next/link";
import { ArrowUpRight, Clock, MapPin, Sparkles, Users } from "lucide-react";
import type { ForgottenCandidate } from "@/lib/queries/forgotten";
import { formatArchiveDate } from "@/lib/utils/dates";
import styles from "./Forgotten.module.css";

interface ForgottenClientProps {
  candidates: ForgottenCandidate[];
  demo?: boolean;
}

export function ForgottenClient({ candidates, demo = false }: ForgottenClientProps) {
  const spotlight = candidates[0] ?? null;
  const moreCandidates = candidates.slice(1);

  const timelineHref = (id: string) =>
    "/timeline" + (demo ? "?demo=jimmy" : "") + "#" + encodeURIComponent(id);
  const personHref = (id: string) =>
    "/people/" + encodeURIComponent(id) + (demo ? "?demo=jimmy" : "");
  const placeHref = (id: string) =>
    "/places/" + encodeURIComponent(id) + (demo ? "?demo=jimmy" : "");

  return (
    <main className={styles.page} data-forgotten-page lang="en">
      <header className={styles.intro}>
        <div className={styles.heading}>
          <h1>Forgotten Memory</h1>
          {candidates.length > 0 && (
            <span>
              {candidates.length} {candidates.length === 1 ? "quiet memory" : "quiet memories"} surfaced
            </span>
          )}
        </div>
        <div className={styles.introBottom}>
          <p>
            Authentic moments from your archive dormant for over 21 days surfaced to rekindle long-term perspective.
          </p>
          <div className={styles.leadMeta}>
            <span>S-14 Dormancy Algorithm</span>
            <span>Anchor dormancy threshold &ge; 21 days</span>
          </div>
        </div>
      </header>

      {spotlight ? (
        <>
          <section className={styles.spotlightSection} aria-label="Surfaced Memory Spotlight">
            <div className={styles.spotlightHeader}>
              <span className={styles.spotlightLabel}>
                <Sparkles size={14} aria-hidden="true" /> Primary Revisit Candidate
              </span>
              <span className={styles.date}>Surfaced via S-14 deterministic selection</span>
            </div>

            <article className={styles.spotlightCard}>
              <div className={styles.cardTop}>
                <div className={styles.cardPills}>
                  <span className={styles.dormantBadge}>
                    <Clock size={12} aria-hidden="true" /> Quiet for {spotlight.daysAgo} days
                  </span>
                  {spotlight.category && (
                    <span className={styles.categoryBadge}>#{spotlight.category}</span>
                  )}
                  {spotlight.isFirstTime && (
                    <span className={styles.firstTimeBadge}>
                      <Sparkles size={11} aria-hidden="true" /> First Time
                    </span>
                  )}
                </div>
                <time className={styles.date} dateTime={spotlight.occurredAt}>
                  Recorded on {formatArchiveDate(spotlight.occurredAt)}
                </time>
              </div>

              <blockquote className={styles.quote}>
                &ldquo;{spotlight.summary}&rdquo;
              </blockquote>

              <div className={styles.cardFooter}>
                <div className={styles.context}>
                  <div className={styles.entities}>
                    {spotlight.people.length > 0 && (
                      <div className={styles.entityGroup}>
                        <Users size={14} aria-hidden="true" />
                        <span>With </span>
                        {spotlight.people.map((person, index) => (
                          <span key={person.id}>
                            {index > 0 && ", "}
                            <Link href={personHref(person.id)} className={styles.entityLink}>
                              {person.name}
                            </Link>
                          </span>
                        ))}
                      </div>
                    )}
                    {spotlight.places.length > 0 && (
                      <div className={styles.entityGroup}>
                        <MapPin size={14} aria-hidden="true" />
                        <span>At </span>
                        {spotlight.places.map((place, index) => (
                          <span key={place.id}>
                            {index > 0 && ", "}
                            <Link href={placeHref(place.id)} className={styles.entityLink}>
                              {place.name}
                            </Link>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <Link
                  href={timelineHref(spotlight.id)}
                  className={styles.timelineLink}
                  aria-label={`View memory from ${formatArchiveDate(spotlight.occurredAt)} in timeline`}
                >
                  View in timeline <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </article>
          </section>

          {moreCandidates.length > 0 && (
            <section className={styles.secondarySection} aria-label="Additional quiet memories">
              <div className={styles.sectionHeading}>
                <h2>More quiet memories</h2>
                <span>{moreCandidates.length} other {moreCandidates.length === 1 ? "memory" : "memories"} dormant &ge; 21 days</span>
              </div>

              <div className={styles.grid}>
                {moreCandidates.map((item) => (
                  <article key={item.id} className={styles.card}>
                    <div>
                      <div className={styles.cardTopSmall}>
                        <span className={styles.dormantBadge}>
                          <Clock size={11} aria-hidden="true" /> {item.daysAgo}d quiet
                        </span>
                        <time className={styles.date} dateTime={item.occurredAt}>
                          {formatArchiveDate(item.occurredAt)}
                        </time>
                      </div>
                      <p className={styles.cardExcerpt}>
                        &ldquo;{item.summary}&rdquo;
                      </p>
                    </div>

                    <div className={styles.cardFooterSmall}>
                      <span className={styles.categoryBadge}>#{item.category ?? "archive"}</span>
                      <Link
                        href={timelineHref(item.id)}
                        className={styles.smallTimelineLink}
                        aria-label={`View memory from ${formatArchiveDate(item.occurredAt)} in timeline`}
                      >
                        View in timeline <ArrowUpRight size={13} aria-hidden="true" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </>
      ) : (
        <div className={styles.empty} role="status">
          <h2>No quiet memories yet</h2>
          <p>
            No completed memory has an anchor that has stayed dormant for 21 days yet. Continue adding memories to discover quiet moments.
          </p>
          <Link href={"/timeline" + (demo ? "?demo=jimmy" : "")}>
            Open timeline <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
      )}
    </main>
  );
}

