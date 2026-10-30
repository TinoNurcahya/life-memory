import { detectChanges } from "../analytics/changes.ts";
import { detectFirstTimes } from "../analytics/first-time.ts";
import { detectRecurrence } from "../analytics/recurrence.ts";
import type { AnalyticsActivity, EvidenceReference, PatternEntityKind } from "../analytics/types.ts";

export interface InsightView {
  id: string;
  type: "first_time" | "recurring" | "change";
  label: string;
  kindLabel: string;
  description: string;
  period: string;
  sortDate: string;
  evidence: EvidenceReference[];
  /** Total contributing memories, which can exceed the displayed evidence sample. */
  sourceCount: number;
  comparison?: {
    previousLabel: string;
    currentLabel: string;
    previousCount: number;
    currentCount: number;
  };
}

export interface InsightsModel {
  insights: InsightView[];
  completedCount: number;
  firstDate: string | null;
  lastDate: string | null;
  /** Invalid or duplicate completed rows only; planned/pending rows are not errors. */
  omittedCount: number;
}

const categories: Record<string, string> = {
  career: "Karier", social: "Sosial", health: "Kesehatan", learning: "Belajar",
  leisure: "Waktu luang", routine: "Rutinitas", other: "Lainnya",
};
const kinds: Record<PatternEntityKind, string> = {
  category: "Kategori", person: "Orang", place: "Tempat", topic: "Topik",
};
const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
});
const monthFormatter = new Intl.DateTimeFormat("id-ID", {
  month: "long", year: "numeric", timeZone: "UTC",
});

function validDate(value: string | null | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? date : null;
}

export function formatInsightDate(value: string | null | undefined): string {
  const date = validDate(value);
  return date ? dateFormatter.format(date) : "Tanggal belum tersedia";
}

export function formatInsightMonth(value: string | null | undefined): string {
  const date = value && /^\d{4}-\d{2}$/.test(value) ? validDate(`${value}-01`) : null;
  return date ? monthFormatter.format(date) : "Bulan belum tersedia";
}

export function insightTimelineHref(id: string, demo = false): string {
  return `/timeline${demo ? "?demo=jimmy" : ""}#${encodeURIComponent(id)}`;
}

function sortEvidence(evidence: EvidenceReference[]): EvidenceReference[] {
  const seen = new Set<string>();
  return [...evidence]
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt) || a.activityDetailId.localeCompare(b.activityDetailId))
    .filter(item => {
      if (seen.has(item.activityDetailId)) return false;
      seen.add(item.activityDetailId);
      return true;
    });
}

function labelFor(kind: PatternEntityKind, label: string): string {
  return kind === "category" ? (categories[label] ?? label) : label;
}

function patternId(...parts: string[]): string {
  return parts.map(encodeURIComponent).join(":");
}

/** Read-only presentation adapter. Detection thresholds and shared analytics stay unchanged. */
export function buildInsightsModel(activities: AnalyticsActivity[], asOf: string): InsightsModel {
  if (!validDate(asOf)) throw new RangeError("Insights requires a valid YYYY-MM-DD reference date.");

  let omittedCount = 0;
  const seen = new Set<string>();
  const completed = activities.filter(item => {
    if (item.eventStatus !== "completed") return false;
    if (!item.id.trim() || !validDate(item.occurredAt)) {
      omittedCount += 1;
      return false;
    }
    return true;
  }).sort((a, b) =>
    b.occurredAt.localeCompare(a.occurredAt) || a.id.localeCompare(b.id) ||
    a.summary.localeCompare(b.summary) || JSON.stringify(a).localeCompare(JSON.stringify(b)),
  ).filter(item => {
    if (seen.has(item.id)) {
      omittedCount += 1;
      return false;
    }
    seen.add(item.id);
    return true;
  }).sort((a, b) => a.occurredAt.localeCompare(b.occurredAt) || a.id.localeCompare(b.id));

  const insights: InsightView[] = [];
  for (const item of detectFirstTimes(completed, { asOf })) {
    insights.push({
      id: patternId("first_time", item.kind, item.key),
      type: "first_time",
      label: labelFor(item.kind, item.label),
      kindLabel: kinds[item.kind],
      description: `Pertama tercatat dalam arsip pada ${formatInsightDate(item.occurredAt)}.`,
      period: formatInsightDate(item.occurredAt),
      sortDate: item.occurredAt,
      evidence: [item.evidence],
      sourceCount: 1,
    });
  }

  for (const item of detectRecurrence(completed)) {
    const evidence = sortEvidence(item.evidence);
    insights.push({
      id: patternId("recurring", item.kind, item.key, item.month),
      type: "recurring",
      label: labelFor(item.kind, item.label),
      kindLabel: kinds[item.kind],
      description: `Muncul dalam ${item.count} memori pada ${formatInsightMonth(item.month)}.`,
      period: formatInsightMonth(item.month),
      sortDate: evidence[0]?.occurredAt ?? `${item.month}-01`,
      evidence,
      sourceCount: item.count,
    });
  }

  // Detectors receive chronological input so the existing last-eight sample is
  // deterministic. Its length is never used as the full monthly activity count.
  for (const item of detectChanges(completed)) {
    const previousLabel = formatInsightMonth(item.previousMonth);
    const currentLabel = formatInsightMonth(item.currentMonth);
    const currentPeriodLastDate = completed.findLast(activity => activity.occurredAt.startsWith(item.currentMonth))?.occurredAt;
    insights.push({
      id: patternId("change", "category", item.key, item.previousMonth, item.currentMonth),
      type: "change",
      label: labelFor("category", item.label),
      kindLabel: kinds.category,
      description: `${item.previousCount} memori pada ${previousLabel}, menjadi ${item.currentCount} pada ${currentLabel}.`,
      period: `${previousLabel} – ${currentLabel}`,
      sortDate: currentPeriodLastDate ?? `${item.currentMonth}-01`,
      evidence: sortEvidence(item.evidence),
      sourceCount: item.previousCount + item.currentCount,
      comparison: { previousLabel, currentLabel, previousCount: item.previousCount, currentCount: item.currentCount },
    });
  }

  insights.sort((a, b) => b.sortDate.localeCompare(a.sortDate) || a.id.localeCompare(b.id));
  return {
    insights,
    completedCount: completed.length,
    firstDate: completed[0]?.occurredAt ?? null,
    lastDate: completed.at(-1)?.occurredAt ?? null,
    omittedCount,
  };
}
