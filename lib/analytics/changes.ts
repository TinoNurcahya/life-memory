import { completedActivities, evidenceFor, monthKey, type ActivityCategory, type AnalyticsActivity, type ChangePattern } from "./types.ts";

export function detectChanges(activities: AnalyticsActivity[], options: { previousMonth?: string; currentMonth?: string; minimumDelta?: number; minimumRatio?: number } = {}): ChangePattern[] {
  const completed = completedActivities(activities);
  const months = [...new Set(completed.map((item) => monthKey(item.occurredAt)))].sort();
  const currentMonth = options.currentMonth ?? months.at(-1);
  const previousMonth = options.previousMonth ?? months.at(-2);
  if (!currentMonth || !previousMonth) return [];
  const minimumDelta = options.minimumDelta ?? 3;
  const minimumRatio = options.minimumRatio ?? 0.5;
  const categories: ActivityCategory[] = ["career", "social", "health", "learning", "leisure", "routine", "other"];
  return categories.flatMap((category) => {
    const previous = completed.filter((item) => monthKey(item.occurredAt) === previousMonth && item.category === category);
    const current = completed.filter((item) => monthKey(item.occurredAt) === currentMonth && item.category === category);
    const previousCount = previous.length;
    const currentCount = current.length;
    const absoluteDelta = Math.abs(currentCount - previousCount);
    const ratio = previousCount === 0 ? (currentCount > 0 ? null : 0) : absoluteDelta / previousCount;
    if (absoluteDelta < minimumDelta || (ratio !== null && ratio <= minimumRatio)) return [];
    const evidence = [...previous, ...current].slice(-8).map(evidenceFor);
    return [{ key: category, label: category, previousMonth, currentMonth, previousCount, currentCount, absoluteDelta, ratio, direction: currentCount >= previousCount ? "up" : "down", evidence }];
  });
}
