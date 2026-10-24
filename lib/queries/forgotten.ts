import type { SupabaseClient } from "@supabase/supabase-js";
import type { TimelineItem } from "./activities.ts";
import { isGenericPlace } from "../utils/normalization.ts";

export type ForgottenCandidate = TimelineItem & { daysAgo: number; anchorLastOccurredAt: string };

const dateOnly = (value: Date) => { const date = new Date(value); date.setUTCHours(0, 0, 0, 0); return date; };
const daysBetween = (newer: Date, older: string) => Math.floor((newer.getTime() - Date.parse(`${older}T00:00:00Z`)) / 86_400_000);
const anchorKeys = (item: TimelineItem) => [
  ...item.people.map((person) => `person:${person.id}`),
  ...item.places.filter((place) => !isGenericPlace(place.name)).map((place) => `place:${place.id}`),
  ...(item.isFirstTime ? [`first-time:${item.id}`] : []),
];
const hasAnchor = (item: TimelineItem) => anchorKeys(item).length > 0;
const matchesAnchor = (item: TimelineItem, anchors: Set<string>) => anchorKeys(item).some((anchor) => anchors.has(anchor));

export function selectForgottenCandidate(items: TimelineItem[], asOf = new Date()): ForgottenCandidate | null {
  const today = dateOnly(asOf);
  const candidates = items
    .filter((item) => item.eventStatus === "completed" && daysBetween(today, item.occurredAt) >= 14 && hasAnchor(item))
    .sort((a, b) => Number(b.isFirstTime) - Number(a.isFirstTime) || a.occurredAt.localeCompare(b.occurredAt) || a.id.localeCompare(b.id))
    .map((candidate) => {
      const anchors = new Set(anchorKeys(candidate));
      const anchorMentions = items.filter((item) => item.eventStatus === "completed" && item.occurredAt >= candidate.occurredAt && matchesAnchor(item, anchors));
      const anchorLastOccurredAt = anchorMentions.reduce((latest, item) => item.occurredAt > latest ? item.occurredAt : latest, candidate.occurredAt);
      return { candidate, anchorLastOccurredAt };
    });
  const match = candidates.find(({ anchorLastOccurredAt }) => daysBetween(today, anchorLastOccurredAt) >= 21);
  return match ? { ...match.candidate, daysAgo: daysBetween(today, match.anchorLastOccurredAt), anchorLastOccurredAt: match.anchorLastOccurredAt } : null;
}

export async function getForgottenMemory(supabase: SupabaseClient, userId: string, asOf = new Date()) {
  const { data, error } = await supabase.from("activity_details").select("id, activity_id, summary, source_text, category, occurred_at, event_status, time_of_day, time_hint, is_first_time, needs_review, review_reasons, activity_people(people(id,name)), activity_places(places(id,name))").eq("user_id", userId).eq("event_status", "completed").order("occurred_at", { ascending: true }).limit(500);
  if (error) throw error;
  const items = ((data ?? []) as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id), activityId: String(row.activity_id), rawText: String(row.source_text ?? row.summary), summary: String(row.summary), sourceText: row.source_text ? String(row.source_text) : null,
    occurredAt: String(row.occurred_at), category: (row.category as TimelineItem["category"]) ?? null, status: "RESOLVED" as const, eventStatus: "completed" as const,
    timeOfDay: (row.time_of_day as TimelineItem["timeOfDay"]) ?? null, timeHint: row.time_hint ? String(row.time_hint) : null, isFirstTime: Boolean(row.is_first_time), needsReview: Boolean(row.needs_review), reviewReasons: Array.isArray(row.review_reasons) ? row.review_reasons.map(String) : [],
    people: Array.isArray(row.activity_people) ? row.activity_people.flatMap((link) => { const value = (link as { people?: { id: string; name: string } | null }).people; return value ? [{ id: value.id, user_id: userId, name: value.name, normalized_name: value.name.toLowerCase(), aliases: [], created_at: "", updated_at: "" }] : []; }) : [],
    places: Array.isArray(row.activity_places) ? row.activity_places.flatMap((link) => { const value = (link as { places?: { id: string; name: string } | null }).places; return value ? [{ id: value.id, user_id: userId, name: value.name, normalized_name: value.name.toLowerCase(), aliases: [], created_at: "", updated_at: "" }] : []; }) : [], topics: [],
  } satisfies TimelineItem));
  return selectForgottenCandidate(items, asOf);
}
