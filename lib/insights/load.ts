import type { TimelineItem } from "../queries/activities";
import { buildInsightsModel } from "./model.ts";

// Read-only derivation; injectable so failures can be checked without a live account.
export async function loadInsightsData(
  loader: () => Promise<{ items: TimelineItem[]; error: string | null }>,
  asOf: string,
) {
  let items: TimelineItem[] = [];
  let error: string | null = null;
  try {
    const archive = await loader();
    items = archive.items;
    if (archive.error) error = "Sebagian arsip belum berhasil dimuat. Pola yang terlihat mungkin belum lengkap.";
  } catch {
    error = "Arsip belum berhasil dimuat. Coba lagi untuk melihat polanya.";
  }
  const activities = items.map(item => ({
    id: item.id, occurredAt: item.occurredAt, category: item.category, eventStatus: item.eventStatus,
    summary: item.summary, people: item.people, places: item.places, topics: item.topics, isFirstTime: item.isFirstTime,
  }));
  return { items, model: buildInsightsModel(activities, asOf), error };
}
