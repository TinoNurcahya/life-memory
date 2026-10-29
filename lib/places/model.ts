import type { TimelineItem } from "@/lib/queries/activities";
import type { DirectoryEntity } from "@/lib/queries/entities";

export type PlacesSort = "recent" | "name" | "count";
export type PlaceMemoryPreview = Pick<TimelineItem, "id" | "summary" | "occurredAt" | "imageUrls">;
export interface PlacesCardData {
  place: DirectoryEntity;
  latestMemory: PlaceMemoryPreview | null;
}

export const PLACES_CATEGORIES: Record<string, string> = {
  career: "Karier", social: "Sosial", health: "Kesehatan", learning: "Belajar",
  leisure: "Waktu luang", routine: "Rutinitas", other: "Lainnya",
};

function validDate(value: string | null | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(value + "T12:00:00Z");
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value ? date : null;
}

export function formatPlacesDate(value: string | null | undefined) {
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

export function groupPlacesMemories(memories: TimelineItem[]) {
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

export function buildPlacesData(directory: DirectoryEntity[], memories: TimelineItem[]) {
  const memoriesByPlace = new Map<string, TimelineItem[]>(directory.map(place => [place.id, []]));
  const seenMemories = new Set<string>();
  for (const memory of sortMemories(memories)) {
    if (memory.eventStatus !== "completed" || seenMemories.has(memory.id)) continue;
    seenMemories.add(memory.id);
    for (const placeId of new Set(memory.places.map(place => place.id))) {
      memoriesByPlace.get(placeId)?.push(memory);
    }
  }
  const places: PlacesCardData[] = directory.map(place => {
    const latest = memoriesByPlace.get(place.id)?.[0];
    return {
      place,
      latestMemory: latest ? { id: latest.id, summary: latest.summary, occurredAt: latest.occurredAt, imageUrls: latest.imageUrls ?? [] } : null,
    };
  });
  return { places, memoriesByPlace };
}

function fold(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("id-ID").trim();
}

export function filterAndSortPlaces(places: PlacesCardData[], query: string, sort: PlacesSort) {
  const term = fold(query);
  return places.filter(({ place }) => {
    const aliases = "aliases" in place ? place.aliases ?? [] : [];
    return [place.name, place.normalized_name, ...aliases].some(value => fold(value).includes(term));
  }).sort((a, b) => {
    const byName = a.place.name.localeCompare(b.place.name, "id-ID", { sensitivity: "base", numeric: true }) || a.place.id.localeCompare(b.place.id);
    if (sort === "name") return byName;
    if (sort === "count") return b.place.activity_count - a.place.activity_count || byName;
    const aDate = validDate(a.place.last_seen_at) ? a.place.last_seen_at! : "";
    const bDate = validDate(b.place.last_seen_at) ? b.place.last_seen_at! : "";
    return bDate.localeCompare(aDate) || byName;
  });
}
