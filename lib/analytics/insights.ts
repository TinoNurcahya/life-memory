import { detectChanges } from "./changes.ts";
import { detectFirstTimes } from "./first-time.ts";
import { detectRecurrence } from "./recurrence.ts";
import type { AnalyticsActivity } from "./types.ts";
import type { Insight, InsightType } from "../../types/database.ts";
import { formatArchiveDate } from "../utils/dates.ts";

function dbEvidence(item: { activityDetailId: string; occurredAt: string; snippet: string }) {
  return { activity_detail_id: item.activityDetailId, occurred_at: item.occurredAt, snippet: item.snippet };
}

export function generateDeterministicInsights(activities: AnalyticsActivity[], asOf = new Date().toISOString().slice(0, 10)): Array<Pick<Insight, "type" | "title" | "description" | "category" | "evidence" | "metadata">> {
  const output: Array<Pick<Insight, "type" | "title" | "description" | "category" | "evidence" | "metadata">> = [];
  for (const item of detectFirstTimes(activities, { asOf })) {
    output.push({
      type: "first_time",
      title: `First time: ${item.label}`,
      description: `First recorded on ${formatArchiveDate(item.evidence.occurredAt)} — “${item.evidence.snippet}”`,
      category: item.kind === "category" ? (item.label as Insight["category"]) : null,
      evidence: [dbEvidence(item.evidence)],
      metadata: { key: item.key, kind: item.kind, label: item.label, highlightTerm: item.label },
    });
  }
  for (const item of detectRecurrence(activities)) {
    output.push({
      type: "recurring",
      title: `${item.label} kept returning`,
      description: `${item.label} appeared ${item.count} times during ${item.month}.`,
      category: item.kind === "category" ? (item.label as Insight["category"]) : null,
      evidence: item.evidence.map(dbEvidence),
      metadata: { key: item.key, kind: item.kind, month: item.month, label: item.label, highlightTerm: item.label },
    });
  }
  for (const item of detectChanges(activities)) {
    output.push({
      type: "change",
      title: `${item.label} shifted ${item.direction}`,
      description: `${item.label} moved from ${item.previousCount} activities in ${item.previousMonth} to ${item.currentCount} in ${item.currentMonth}.`,
      category: item.label as Insight["category"],
      evidence: item.evidence.map(dbEvidence),
      metadata: { key: item.key, ratio: item.ratio, label: item.label, highlightTerm: item.label },
    });
  }
  const seen = new Set<string>();
  return output.filter((item) => {
    const key = `${item.type}:${item.metadata?.key}:${item.metadata?.month ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function insightToRecord(item: ReturnType<typeof generateDeterministicInsights>[number], index: number): Pick<Insight, "id" | "user_id" | "type" | "title" | "description" | "category" | "evidence" | "is_read" | "is_suppressed" | "metadata" | "created_at"> {
  return { id: `demo-insight-${index + 1}`, user_id: "demo", type: item.type as InsightType, title: item.title, description: item.description, category: item.category, evidence: item.evidence, is_read: false, is_suppressed: false, metadata: item.metadata, created_at: new Date().toISOString() };
}
