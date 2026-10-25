import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { DirectoryEntity } from "@/lib/queries/entities";
import type { TimelineItem } from "@/lib/queries/activities";
import { formatPeopleDate, groupPeopleMemories, PEOPLE_CATEGORIES } from "@/lib/people/model";
import { VaultShell } from "@/components/layout/VaultShell";
import { PeopleFeedback } from "./PeopleFeedback";
import { PeopleManagement } from "./PeopleManagement";
import { PeoplePhoto } from "./PeopleMedia";
import styles from "./People.module.css";

export function PersonDetail({
  person, memories, candidates, demo, memoriesError = false,
}: {
  person: DirectoryEntity;
  memories: TimelineItem[];
  candidates: DirectoryEntity[];
  demo: boolean;
  memoriesError?: boolean;
}) {
  const suffix = demo ? "?demo=jimmy" : "";
  const groups = groupPeopleMemories(memories);
  const aliases = "aliases" in person ? person.aliases.filter(alias => alias.toLocaleLowerCase() !== person.name.toLocaleLowerCase()) : [];
  return (
    <VaultShell title={person.name} isDemo={demo}>
      <main className={[styles.page, styles.personPage].join(" ")} data-person-detail>
        <Link href={"/people" + suffix} className={styles.backLink}><ArrowLeft size={16} aria-hidden="true" /> Semua orang</Link>
        <header className={styles.personIntro}>
          <p className={styles.eyebrow}>People</p>
          <h1>{person.name}</h1>
          {aliases.length > 0 && <p className={styles.aliases}>Juga tercatat sebagai {aliases.join(", ")}</p>}
          <div className={styles.personStats}>
            <span><strong>{person.activity_count}</strong> memori</span>
            <span>Pertama tercatat <time dateTime={person.first_seen_at ?? undefined}>{formatPeopleDate(person.first_seen_at)}</time></span>
            <span>Terakhir <time dateTime={person.last_seen_at ?? undefined}>{formatPeopleDate(person.last_seen_at)}</time></span>
          </div>
        </header>

        {memoriesError ? (
          <PeopleFeedback>Memori orang ini belum bisa dimuat. Informasi orang tetap tersedia.</PeopleFeedback>
        ) : groups.length ? (
          <div className={styles.monthGroups}>
            {groups.map(group => (
              <section key={group.key} className={styles.monthGroup} aria-label={group.label}>
                <h2>{group.label}</h2>
                <div className={styles.memories}>
                  {group.memories.map(memory => (
                    <article key={memory.id} className={styles.memory} data-person-memory={memory.id}>
                      <div className={styles.memoryMeta}>
                        <time dateTime={memory.occurredAt}>{formatPeopleDate(memory.occurredAt)}</time>
                        <span>{PEOPLE_CATEGORIES[memory.category ?? "other"] ?? "Lainnya"}</span>
                      </div>
                      <div className={styles.memoryContent} data-has-photo={Boolean(memory.imageUrls?.length)}>
                        {!!memory.imageUrls?.length && <PeoplePhoto images={memory.imageUrls} summary={memory.summary} date={formatPeopleDate(memory.occurredAt)} />}
                        <div className={styles.memoryCopy}>
                          <p className={styles.memorySummary}>{memory.summary}</p>
                          {memory.sourceText && memory.sourceText !== memory.summary && <blockquote className={styles.sourceText}>{memory.sourceText}</blockquote>}
                          <Link href={"/timeline" + suffix + "#" + encodeURIComponent(memory.id)} className={styles.timelineLink}>Lihat di timeline <ArrowUpRight size={15} aria-hidden="true" /></Link>
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
            <h2>{person.activity_count ? "Cuplikan memori belum tersedia." : "Belum ada memori selesai."}</h2>
            <p>Memori yang sudah terjadi dan menyebut {person.name} akan tampil di sini.</p>
          </div>
        )}
        <PeopleManagement person={person} candidates={candidates} demo={demo} />
      </main>
    </VaultShell>
  );
}
