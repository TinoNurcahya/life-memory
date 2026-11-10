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
          <ArrowLeft size={16} aria-hidden="true" /> All topics
        </Link>
        <header className={styles.topicIntro}>
          <p className={styles.eyebrow}>Topics</p>
          <h1>{topic.name}</h1>
          <div className={styles.topicStats}>
            <span><strong>{topic.activity_count}</strong> {topic.activity_count === 1 ? "memory" : "memories"}</span>
            <span>First recorded <time dateTime={topic.first_seen_at ?? undefined}>{formatTopicsDate(topic.first_seen_at)}</time></span>
            <span>Latest <time dateTime={topic.last_seen_at ?? undefined}>{formatTopicsDate(topic.last_seen_at)}</time></span>
          </div>
        </header>

        {memoriesError ? (
          <TopicsFeedback>Memories for this topic could not be loaded. Topic details remain available.</TopicsFeedback>
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
                        <span>{TOPICS_CATEGORIES[memory.category ?? "other"] ?? "Other"}</span>
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
                          View in timeline <ArrowUpRight size={15} aria-hidden="true" />
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
            <h2>{topic.activity_count ? "Memory excerpts unavailable." : "No completed memories yet."}</h2>
            <p>Completed memories mentioning {topic.name} will appear here.</p>
          </div>
        )}
        <TopicsManagement topic={topic} candidates={candidates} demo={demo} />
      </main>
    </VaultShell>
  );
}
