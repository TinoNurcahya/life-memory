import { completedActivities, evidenceFor, type AnalyticsActivity, type FirstTimePattern, type PatternEntityKind } from "./types.ts";

const entityEntries = (activity: AnalyticsActivity, kind: PatternEntityKind) => {
  if (kind === "category") return activity.category ? [{ key: activity.category, label: activity.category }] : [];
  if (kind === "person") return (activity.people ?? []).map((value) => ({ key: value.id, label: value.name }));
  if (kind === "place") return (activity.places ?? []).map((value) => ({ key: value.id, label: value.name }));
  return (activity.topics ?? []).map((value) => ({ key: value.id, label: value.name }));
};

export function detectFirstTimes(
  activities: AnalyticsActivity[],
  options: { asOf?: string; minimumDays?: number; minimumActivities?: number } = {},
): FirstTimePattern[] {
  const completed = completedActivities(activities).sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  const asOf = options.asOf ?? new Date().toISOString().slice(0, 10);
  const minimumDays = options.minimumDays ?? 21;
  const minimumActivities = options.minimumActivities ?? 20;
  const age = Math.floor((Date.parse(`${asOf}T00:00:00Z`) - Date.parse(`${completed[0]?.occurredAt ?? asOf}T00:00:00Z`)) / 86_400_000);
  if (completed.length < minimumActivities || age < minimumDays) return [];

  const seen = new Set<string>();
  const output: FirstTimePattern[] = [];
  for (const activity of completed) {
    for (const kind of ["topic", "category", "person", "place"] as PatternEntityKind[]) {
      for (const entity of entityEntries(activity, kind)) {
        const key = `${kind}:${entity.key}`;
        if (seen.has(key)) continue;
        seen.add(key);
        if (activity.isFirstTime || kind === "person" || kind === "place" || kind === "topic") {
          output.push({ kind, key: entity.key, label: entity.label, activityDetailId: activity.id, occurredAt: activity.occurredAt, evidence: evidenceFor(activity) });
        }
      }
    }
  }
  return output;
}
