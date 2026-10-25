import type { TimelineItem } from "@/lib/queries/activities";
import type { DirectoryEntity } from "@/lib/queries/entities";

export type PeopleSort = "recent" | "name" | "count";
export type PersonMemoryPreview = Pick<TimelineItem, "id" | "summary" | "occurredAt" | "imageUrls">;
export interface PeopleCardData {
  person: DirectoryEntity;
  latestMemory: PersonMemoryPreview | null;
}

export const PEOPLE_CATEGORIES: Record<string, string> = {
  career: "Karier", social: "Sosial", health: "Kesehatan", learning: "Belajar",
  leisure: "Waktu luang", routine: "Rutinitas", other: "Lainnya",
};

function validDate(value: string | null | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(value + "T12:00:00Z");
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value ? date : null;
}

export function formatPeopleDate(value: string | null | undefined) {
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

export function groupPeopleMemories(memories: TimelineItem[]) {
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

export function buildPeopleData(directory: DirectoryEntity[], memories: TimelineItem[]) {
  const memoriesByPerson = new Map<string, TimelineItem[]>(directory.map(person => [person.id, []]));
  const seenMemories = new Set<string>();
  for (const memory of sortMemories(memories)) {
    if (memory.eventStatus !== "completed" || seenMemories.has(memory.id)) continue;
    seenMemories.add(memory.id);
    for (const personId of new Set(memory.people.map(person => person.id))) {
      memoriesByPerson.get(personId)?.push(memory);
    }
  }
  const people: PeopleCardData[] = directory.map(person => {
    const latest = memoriesByPerson.get(person.id)?.[0];
    return {
      person,
      latestMemory: latest ? { id: latest.id, summary: latest.summary, occurredAt: latest.occurredAt, imageUrls: latest.imageUrls ?? [] } : null,
    };
  });
  return { people, memoriesByPerson };
}

function fold(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("id-ID").trim();
}

export function filterAndSortPeople(people: PeopleCardData[], query: string, sort: PeopleSort) {
  const term = fold(query);
  return people.filter(({ person }) => {
    const aliases = "aliases" in person ? person.aliases ?? [] : [];
    return [person.name, person.normalized_name, ...aliases].some(value => fold(value).includes(term));
  }).sort((a, b) => {
    const byName = a.person.name.localeCompare(b.person.name, "id-ID", { sensitivity: "base", numeric: true }) || a.person.id.localeCompare(b.person.id);
    if (sort === "name") return byName;
    if (sort === "count") return b.person.activity_count - a.person.activity_count || byName;
    return (b.person.last_seen_at ?? "").localeCompare(a.person.last_seen_at ?? "") || byName;
  });
}
