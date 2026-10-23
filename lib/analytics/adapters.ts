import type { TimelineItem } from "@/lib/queries/activities";
import type { AnalyticsActivity } from "./types";

export function timelineToAnalytics(items: TimelineItem[]): AnalyticsActivity[] {
  return items.map((item) => ({ id: item.id, occurredAt: item.occurredAt, category: item.category, eventStatus: item.eventStatus, summary: item.summary, people: item.people, places: item.places, topics: item.topics, isFirstTime: item.isFirstTime }));
}
