import type { TimelineItem } from "@/lib/queries/activities";
import type { DirectoryEntity } from "@/lib/queries/entities";

export type TopicsSort = "recent" | "name" | "count";
export type TopicMemoryPreview = Pick<TimelineItem, "id" | "summary" | "occurredAt">;
export interface TopicsRowData {
  topic: DirectoryEntity;
  latestMemory: TopicMemoryPreview | null;
}

export const TOPICS_CATEGORIES: Record<string, string> = {
  career: "Karier", social: "Sosial", health: "Kesehatan", learning: "Belajar",
  leisure: "Waktu luang", routine: "Rutinitas", other: "Lainnya",
};

function validDate(value: string | null | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(value + "T12:00:00Z");
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value ? date : null;
}

export function formatTopicsDate(value: string | null | undefined) {
  const date = validDate(value);
  return date ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(date) : "Belum tercatat";
}

export function sortMemories(memories: TimelineItem[]) {
  return [...memories].sort((a, b) => {
    const aDate = validDate(a.occurredAt) ? a.occurredAt : "";
    const bDate = validDate(b.occurredAt) ? b.occurredAt : "";
    return bDate.localeCompare(aDate) || b.id.localeCompare(a.id);
  });
}

export function groupTopicsMemories(memories: TimelineItem[]) {
  const groups = new Map<string, { key: string; label: string; memories: TimelineItem[] }>();
  for (const memory of sortMemories(memories)) {
    const date = validDate(memory.occurredAt);
    const key = date ? memory.occurredAt.slice(0, 7) : "undated";
    const group = groups.get(key) ?? {
      key,
      label: date ? new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric", timeZone: "UTC" }).format(date) : "Tanggal belum tercatat",
      memories: [],
    };
    group.memories.push(memory);
    groups.set(key, group);
  }
  return [...groups.values()];
}

export function buildTopicsData(directory: DirectoryEntity[], memories: TimelineItem[]) {
  const memoriesByTopic = new Map<string, TimelineItem[]>(directory.map(topic => [topic.id, []]));
  const seenMemories = new Set<string>();
  for (const memory of sortMemories(memories)) {
    if (memory.eventStatus !== "completed" || seenMemories.has(memory.id)) continue;
    seenMemories.add(memory.id);
    for (const topicId of new Set(memory.topics.map(topic => topic.id))) {
      memoriesByTopic.get(topicId)?.push(memory);
    }
  }
  const topics: TopicsRowData[] = directory.map(topic => {
    const latest = memoriesByTopic.get(topic.id)?.[0];
    return {
      topic,
      latestMemory: latest ? { id: latest.id, summary: latest.summary, occurredAt: latest.occurredAt } : null,
    };
  });
  return { topics, memoriesByTopic };
}

function fold(value: string) {
  return value.normalize("NFKD").replace(/\p{M}/gu, "").toLocaleLowerCase("id-ID").trim();
}

export function filterAndSortTopics(topics: TopicsRowData[], query: string, sort: TopicsSort) {
  const term = fold(query);
  return topics.filter(({ topic }) => {
    return [topic.name, topic.normalized_name].some(value => fold(value).includes(term));
  }).sort((a, b) => {
    const byName = a.topic.name.localeCompare(b.topic.name, "id-ID", { sensitivity: "base", numeric: true }) || a.topic.id.localeCompare(b.topic.id);
    if (sort === "name") return byName;
    if (sort === "count") return b.topic.activity_count - a.topic.activity_count || byName;
    const aDate = validDate(a.topic.last_seen_at) ? a.topic.last_seen_at ?? "" : "";
    const bDate = validDate(b.topic.last_seen_at) ? b.topic.last_seen_at ?? "" : "";
    return bDate.localeCompare(aDate) || byName;
  });
}
