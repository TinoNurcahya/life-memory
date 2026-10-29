import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { DirectoryEntity } from "@/lib/queries/entities";
import type { TimelineItem } from "@/lib/queries/activities";
import { formatTopicsDate, groupTopicsMemories, TOPICS_CATEGORIES } from "@/lib/topics/model";
import { VaultShell } from "@/components/layout/VaultShell";
import { TopicsFeedback } from "./TopicsFeedback";
import { TopicsManagement } from "./TopicsManagement";
import { TopicsPhoto } from "./TopicsMedia";
import styles from "./Topics.module.css";

export function TopicDetail({
  topic, memories, candidates, demo, memoriesError = false,
}: {
  topic: DirectoryEntity;
  memories: TimelineItem[];
  candidates: DirectoryEntity[];
  demo: boolean;
  memoriesError?: boolean;
}) {
  const suffix = demo ? "?demo=jimmy" : "";
  const groups = groupTopicsMemories(memories);

  return (
    <VaultShell title={topic.name} isDemo={demo}>
      <main className={styles.page} data-topics-detail>
        <Link href={"/topics" + suffix} className={styles.backLink}>
          <ArrowLeft size={16} aria-hidden="true" /> Semua topik
        </Link>
        <header className={styles.topicIntro}>
          <p className={styles.eyebrow}>Topics</p>
          <h1>{topic.name}</h1>
          <div className={styles.topicStats}>
            <span><strong>{topic.activity_count}</strong> memori</span>
            <span>Pertama tercatat <time dateTime={topic.first_seen_at ?? undefined}>{formatTopicsDate(topic.first_seen_at)}</time></span>
            <span>Terakhir <time dateTime={topic.last_seen_at ?? undefined}>{formatTopicsDate(topic.last_seen_at)}</time></span>
          </div>
        </header>

        {memoriesError ? (
          <TopicsFeedback>Memori topik ini belum bisa dimuat. Informasi topik tetap tersedia.</TopicsFeedback>
        ) : groups.length ? (
          <div className={styles.monthGroups}>
            {groups.map(group => (
              <section key={group.key} className={styles.monthGroup} aria-label={group.label} data-topic-month={group.key}>
                <h2>{group.label}</h2>
                <div className={styles.memories}>
                  {group.memories.map(memory => (
                    <article key={memory.id} className={styles.memory} data-topic-memory={memory.id}>
                      <div className={styles.memoryMeta}>
                        <time dateTime={memory.occurredAt}>{formatTopicsDate(memory.occurredAt)}</time>
                        <span>{TOPICS_CATEGORIES[memory.category ?? "other"] ?? "Lainnya"}</span>
                      </div>
                      <div className={styles.memoryContent} data-has-photo={Boolean(memory.imageUrls?.length)}>
                        <div className={styles.memoryCopy}>
                          <p className={styles.memorySummary}>{memory.summary}</p>
                          {memory.sourceText && memory.sourceText !== memory.summary && (
                            <blockquote className={styles.sourceText}>{memory.sourceText}</blockquote>
                          )}
                        </div>
                        {!!memory.imageUrls?.length && (
                          <TopicsPhoto images={memory.imageUrls} summary={memory.summary} date={formatTopicsDate(memory.occurredAt)} />
                        )}
                        <Link href={"/timeline" + suffix + "#" + encodeURIComponent(memory.id)} className={styles.timelineLink}>
                          Lihat di timeline <ArrowUpRight size={15} aria-hidden="true" />
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <h2>{topic.activity_count ? "Cuplikan memori belum tersedia." : "Belum ada memori selesai."}</h2>
            <p>Memori yang sudah terjadi dan menyebut topik {topic.name} akan tampil di sini.</p>
          </div>
        )}
        <TopicsManagement topic={topic} candidates={candidates} demo={demo} />
      </main>
    </VaultShell>
  );
}
