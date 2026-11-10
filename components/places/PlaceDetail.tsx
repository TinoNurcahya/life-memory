import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { DirectoryEntity } from "@/lib/queries/entities";
import type { TimelineItem } from "@/lib/queries/activities";
import { formatPlacesDate, groupPlacesMemories, PLACES_CATEGORIES } from "@/lib/places/model";
import { VaultShell } from "@/components/layout/VaultShell";
import { PlacesFeedback } from "./PlacesFeedback";
import { PlacesManagement } from "./PlacesManagement";
import { PlacesPhoto } from "./PlacesMedia";
import styles from "./Places.module.css";

export function PlaceDetail({
  place, memories, candidates, demo, memoriesError = false,
}: {
  place: DirectoryEntity;
  memories: TimelineItem[];
  candidates: DirectoryEntity[];
  demo: boolean;
  memoriesError?: boolean;
}) {
  const suffix = demo ? "?demo=jimmy" : "";
  const groups = groupPlacesMemories(memories);
  const aliases = "aliases" in place
    ? (place.aliases ?? []).filter(alias => alias.toLocaleLowerCase() !== place.name.toLocaleLowerCase())
    : [];

  return (
    <VaultShell title={place.name} isDemo={demo}>
      <main className={styles.page} data-place-detail>
        <Link href={"/places" + suffix} className={styles.backLink}>
          <ArrowLeft size={16} aria-hidden="true" /> All places
        </Link>
        <header className={styles.placeIntro}>
          <p className={styles.eyebrow}>Places</p>
          <h1>{place.name}</h1>
          {aliases.length > 0 && <p className={styles.aliases}>Also recorded as {aliases.join(", ")}</p>}
          <div className={styles.placeStats}>
            <span><strong>{place.activity_count}</strong> {place.activity_count === 1 ? "memory" : "memories"}</span>
            <span>First recorded <time dateTime={place.first_seen_at ?? undefined}>{formatPlacesDate(place.first_seen_at)}</time></span>
            <span>Latest <time dateTime={place.last_seen_at ?? undefined}>{formatPlacesDate(place.last_seen_at)}</time></span>
          </div>
        </header>

        {memoriesError ? (
          <PlacesFeedback>Memories for this place could not be loaded. Place details remain available.</PlacesFeedback>
        ) : groups.length ? (
          <div className={styles.monthGroups}>
            {groups.map(group => (
              <section key={group.key} className={styles.monthGroup} aria-label={group.label}>
                <h2>{group.label}</h2>
                <div className={styles.memories}>
                  {group.memories.map(memory => (
                    <article key={memory.id} className={styles.memory} data-place-memory={memory.id}>
                      <div className={styles.memoryMeta}>
                        <time dateTime={memory.occurredAt}>{formatPlacesDate(memory.occurredAt)}</time>
                        <span>{PLACES_CATEGORIES[memory.category ?? "other"] ?? "Other"}</span>
                      </div>
                      <div className={styles.memoryContent} data-has-photo={Boolean(memory.imageUrls?.length)}>
                        {!!memory.imageUrls?.length && (
                          <PlacesPhoto images={memory.imageUrls} summary={memory.summary} date={formatPlacesDate(memory.occurredAt)} />
                        )}
                        <div className={styles.memoryCopy}>
                          <p className={styles.memorySummary}>{memory.summary}</p>
                          {memory.sourceText && memory.sourceText !== memory.summary && (
                            <blockquote className={styles.sourceText}>{memory.sourceText}</blockquote>
                          )}
                          <Link href={"/timeline" + suffix + "#" + encodeURIComponent(memory.id)} className={styles.timelineLink}>
                            View in timeline <ArrowUpRight size={15} aria-hidden="true" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <h2>{place.activity_count ? "Memory excerpts unavailable." : "No completed memories yet."}</h2>
            <p>Completed memories mentioning {place.name} will appear here.</p>
          </div>
        )}
        <PlacesManagement place={place} candidates={candidates} demo={demo} />
      </main>
    </VaultShell>
  );
}
