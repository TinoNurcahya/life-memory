import { completedActivities, monthKey, type ActivityCategory, type AnalyticsActivity, type MonthlyStats } from "./types.ts";

export function aggregateMonthlyStats(activities: AnalyticsActivity[], month?: string): MonthlyStats[] {
  const completed = completedActivities(activities);
  const months = month ? [month] : [...new Set(completed.map((item) => monthKey(item.occurredAt)))].sort();
  const categories: ActivityCategory[] = ["career", "social", "health", "learning", "leisure", "routine", "other"];
  return months.map((currentMonth) => {
    const rows = completed.filter((item) => monthKey(item.occurredAt) === currentMonth);
    const byCategory = Object.fromEntries(categories.map((category) => [category, rows.filter((item) => item.category === category).length])) as Record<ActivityCategory, number>;
    return {
      month: currentMonth,
      total: rows.length,
      byCategory,
      firstTimes: rows.filter((item) => item.isFirstTime).length,
      people: new Set(rows.flatMap((item) => (item.people ?? []).map((value) => value.id))).size,
      places: new Set(rows.flatMap((item) => (item.places ?? []).map((value) => value.id))).size,
      topics: new Set(rows.flatMap((item) => (item.topics ?? []).map((value) => value.id))).size,
    };
  });
}

export * from "./types.ts";
