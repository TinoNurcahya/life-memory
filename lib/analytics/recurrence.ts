import { completedActivities, evidenceFor, monthKey, type AnalyticsActivity, type PatternEntityKind, type RecurrencePattern } from "./types.ts";

function entities(activity: AnalyticsActivity, kind: PatternEntityKind) {
  if (kind === "category") return activity.category ? [{ key: activity.category, label: activity.category }] : [];
  if (kind === "person") return (activity.people ?? []).map((value) => ({ key: value.id, label: value.name }));
  if (kind === "place") return (activity.places ?? []).map((value) => ({ key: value.id, label: value.name }));
  return (activity.topics ?? []).map((value) => ({ key: value.id, label: value.name }));
}

export function detectRecurrence(activities: AnalyticsActivity[], minimumCount = 3): RecurrencePattern[] {
  const buckets = new Map<string, { kind: PatternEntityKind; key: string; label: string; month: string; activities: AnalyticsActivity[] }>();
  for (const activity of completedActivities(activities)) {
    const month = monthKey(activity.occurredAt);
    for (const kind of ["topic", "category", "person", "place"] as PatternEntityKind[]) {
      for (const entity of entities(activity, kind)) {
        const bucketKey = `${month}:${kind}:${entity.key}`;
        const bucket = buckets.get(bucketKey) ?? { kind, key: entity.key, label: entity.label, month, activities: [] };
        if (!bucket.activities.some((item) => item.id === activity.id)) bucket.activities.push(activity);
        buckets.set(bucketKey, bucket);
      }
    }
  }
  return [...buckets.values()]
    .filter((bucket) => bucket.activities.length >= minimumCount)
    .map((bucket) => ({ kind: bucket.kind, key: bucket.key, label: bucket.label, count: bucket.activities.length, month: bucket.month, evidence: bucket.activities.map(evidenceFor) }));
}
