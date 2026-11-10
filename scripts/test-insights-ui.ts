import assert from "node:assert/strict";
import {
  buildInsightsModel, formatInsightDate, formatInsightMonth, insightTimelineHref,
} from "../lib/insights/model.ts";
import { GROUND_TRUTH_ACTIVITIES } from "../lib/analytics/ground-truth.ts";
import type { AnalyticsActivity } from "../lib/analytics/types.ts";
import { loadInsightsData } from "../lib/insights/load.ts";
import type { TimelineItem } from "../lib/queries/activities.ts";

function memory(id: string, overrides: Partial<AnalyticsActivity> = {}): AnalyticsActivity {
  return {
    id, occurredAt: "2026-09-01", category: null, eventStatus: "completed",
    summary: `Catatan ${id}`, people: [], places: [], topics: [], ...overrides,
  };
}

const asOf = "2026-10-28";
let passed = 0;
function check(name: string, run: () => void) {
  run();
  passed += 1;
  console.log("PASS", name);
}

check("Empty archives and non-completed memories produce no patterns or false error counts", () => {
  const empty = { insights: [], completedCount: 0, firstDate: null, lastDate: null, omittedCount: 0 };
  assert.deepEqual(buildInsightsModel([], asOf), empty);
  assert.deepEqual(buildInsightsModel([
    memory("planned", { eventStatus: "planned" }), memory("pending", { eventStatus: null }),
    memory("cancelled", { eventStatus: "cancelled" }),
  ], asOf), empty);
});

check("Strict dates reject impossible dates, timestamps, missing IDs, and duplicate rows", () => {
  const result = buildInsightsModel([
    memory("valid"), memory("valid"), memory("bad", { occurredAt: "not-a-date" }),
    memory("rollover", { occurredAt: "2026-02-30" }), memory("non-leap", { occurredAt: "2026-02-29" }),
    memory("timestamp", { occurredAt: "2026-09-02T00:00:00Z" }), memory(" "),
    memory("leap", { occurredAt: "2024-02-29" }),
  ], asOf);
  assert.equal(result.completedCount, 2);
  assert.equal(result.omittedCount, 6);
  assert.equal(result.firstDate, "2024-02-29");
  assert.equal(result.lastDate, "2026-09-01");
  assert.throws(() => buildInsightsModel([], "2026-02-30"), RangeError);
});

check("First recorded means the earliest archive mention and preserves 20 memories / 21 days thresholds", () => {
  const memories = Array.from({ length: 20 }, (_, i) => memory(`m-${i}`, {
    occurredAt: `2026-09-${String(i + 1).padStart(2, "0")}`,
    topics: [{ id: "writing", name: "Writing" }],
  }));
  assert.equal(buildInsightsModel(memories.slice(1), asOf).insights.filter(item => item.type === "first_time").length, 0);
  assert.equal(buildInsightsModel(memories, "2026-09-21").insights.filter(item => item.type === "first_time").length, 0);
  const first = buildInsightsModel([...memories].reverse(), "2026-09-22").insights.find(item => item.type === "first_time");
  assert.equal(first?.evidence[0].activityDetailId, "m-0");
  assert.equal(first?.description, "First recorded in your archive on 1 Sept 2026.");
  assert.equal(first?.sourceCount, 1);
});

check("Entity identity uses both kind and ID, retaining namesakes and cross-kind ID collisions", () => {
  const memories = Array.from({ length: 20 }, (_, i) => memory(`identity-${i}`, {
    occurredAt: `2026-09-${String(i + 1).padStart(2, "0")}`,
    topics: [{ id: "same", name: "Bali" }, { id: "another", name: "Bali" }, { id: "same", name: "Bali" }],
    places: [{ id: "same", name: "Bali" }],
  }));
  const result = buildInsightsModel(memories, asOf);
  assert.equal(result.insights.filter(item => item.type === "first_time").length, 3);
  const repeated = result.insights.filter(item => item.type === "recurring");
  assert.equal(repeated.length, 3);
  assert.ok(repeated.every(item => item.sourceCount === 20 && item.evidence.length === 20));
  assert.equal(new Set(result.insights.map(item => item.id)).size, result.insights.length);
});

check("Recurrence is monthly, needs three completed memories, and never counts duplicate relations or IDs", () => {
  const topic = { id: "writing", name: "Writing" };
  const result = buildInsightsModel([
    memory("september-a", { topics: [topic, topic] }),
    memory("september-b", { topics: [topic], occurredAt: "2026-09-02" }),
    memory("september-b", { topics: [topic], occurredAt: "2026-09-02" }),
    memory("october-a", { topics: [topic], occurredAt: "2026-10-01" }),
    memory("october-b", { topics: [topic], occurredAt: "2026-10-02" }),
    memory("october-c", { topics: [topic], occurredAt: "2026-10-03" }),
    memory("october-planned", { topics: [topic], occurredAt: "2026-10-04", eventStatus: "planned" }),
  ], asOf);
  const repeated = result.insights.filter(item => item.type === "recurring");
  assert.equal(repeated.length, 1);
  assert.equal(repeated[0].sourceCount, 3);
  assert.equal(repeated[0].description, "Appeared in 3 memories in October 2026.");
  assert.deepEqual(repeated[0].evidence.map(item => item.activityDetailId), ["october-c", "october-b", "october-a"]);
});

check("Monthly comparisons retain full counts while exposing only eight latest source notes", () => {
  const previous = Array.from({ length: 4 }, (_, i) => memory(`september-${i}`, {
    occurredAt: `2026-09-0${i + 1}`, category: "career",
  }));
  const current = Array.from({ length: 10 }, (_, i) => memory(`october-${i}`, {
    occurredAt: `2026-10-${String(i + 1).padStart(2, "0")}`, category: "career",
  }));
  const change = buildInsightsModel([...current].reverse().concat(previous), asOf).insights.find(item => item.type === "change");
  assert.deepEqual(change?.comparison, {
    previousLabel: "September 2026", currentLabel: "October 2026", previousCount: 4, currentCount: 10,
  });
  assert.equal(change?.sourceCount, 14);
  assert.equal(change?.evidence.length, 8);
  assert.equal(change?.evidence[0].activityDetailId, "october-9");
  assert.equal(change?.evidence.at(-1)?.activityDetailId, "october-2");
  assert.equal(change?.label, "Career");
});

check("Changes use the latest two recorded months even when nonconsecutive and include a zero-count category", () => {
  const result = buildInsightsModel([
    ...Array.from({ length: 4 }, (_, i) => memory(`older-${i}`, { occurredAt: "2026-07-15", category: "routine" })),
    memory("new-period", { occurredAt: "2026-10-19", category: "health" }),
  ], asOf);
  const change = result.insights.find(item => item.type === "change");
  assert.equal(change?.period, "July 2026 – October 2026");
  assert.equal(change?.comparison?.previousCount, 4);
  assert.equal(change?.comparison?.currentCount, 0);
  assert.equal(change?.sourceCount, 4);
  assert.equal(change?.sortDate, "2026-10-19", "Comparison belongs to the latest observed period, even with no current category sources");
});

check("Monthly change thresholds remain delta >=3 and ratio strictly above 50 percent", () => {
  function categoryCounts(previousCount: number, currentCount: number) {
    return [
      ...Array.from({ length: previousCount }, (_, i) => memory(`previous-${i}`, { category: "learning" })),
      ...Array.from({ length: currentCount }, (_, i) => memory(`current-${i}`, { occurredAt: "2026-10-01", category: "learning" })),
    ];
  }
  assert.equal(buildInsightsModel(categoryCounts(6, 3), asOf).insights.filter(item => item.type === "change").length, 0);
  assert.equal(buildInsightsModel(categoryCounts(2, 4), asOf).insights.filter(item => item.type === "change").length, 0);
  assert.equal(buildInsightsModel(categoryCounts(3, 6), asOf).insights.filter(item => item.type === "change").length, 1);
});

check("Ordering and same-date source selection are deterministic without mutating inputs", () => {
  const memories = ["z", "a", "m"].map(id => memory(id, {
    category: "career", topics: [{ id: "testing", name: "Testing" }],
  }));
  const frozen = memories.map(item => Object.freeze({ ...item, topics: Object.freeze(item.topics) })) as unknown as AnalyticsActivity[];
  Object.freeze(frozen);
  const forward = buildInsightsModel(frozen, asOf);
  const reverse = buildInsightsModel([...memories].reverse(), asOf);
  assert.deepEqual(forward, reverse);
  assert.ok(forward.insights.every(item => item.evidence.map(e => e.activityDetailId).join() === "a,m,z"));
  const duplicate = memory("a", { occurredAt: "2026-10-01", category: "career" });
  assert.deepEqual(buildInsightsModel([...memories, duplicate], asOf), buildInsightsModel([duplicate, ...memories].reverse(), asOf));
});

check("Patterns are sorted by source or comparison date, not the generation timestamp", () => {
  const result = buildInsightsModel(GROUND_TRUTH_ACTIVITIES, asOf);
  assert.equal(result.completedCount, 48);
  assert.equal(result.insights.filter(item => item.type === "first_time").length, 20);
  const dates = result.insights.map(item => item.sortDate);
  assert.deepEqual(dates, [...dates].sort().reverse());
  assert.ok(result.insights.every(item => item.evidence.length > 0 && item.evidence.length <= item.sourceCount));
  const sourceIds = new Set(GROUND_TRUTH_ACTIVITIES.filter(item => item.eventStatus === "completed").map(item => item.id));
  assert.ok(result.insights.every(item => item.evidence.every(source => sourceIds.has(source.activityDetailId))));
});

check("Dates use English calendar labels and reject invalid values safely", () => {
  assert.equal(formatInsightDate("2026-10-19"), "19 Oct 2026");
  assert.equal(formatInsightDate("2026-02-30"), "Date unavailable");
  assert.equal(formatInsightDate(null), "Date unavailable");
  assert.equal(formatInsightMonth("2026-10"), "October 2026");
  assert.equal(formatInsightMonth("2026-13"), "Month unavailable");
  assert.equal(formatInsightMonth("2026-10-19"), "Month unavailable");
});

check("Timeline links target the exact encoded memory ID and retain demo mode", () => {
  assert.equal(insightTimelineHref("demo-48", true), "/timeline?demo=jimmy#demo-48");
  assert.equal(insightTimelineHref("record-id"), "/timeline#record-id");
  assert.equal(insightTimelineHref("source / #? &"), "/timeline#source%20%2F%20%23%3F%20%26");
});

function timelineMemory(id: string): TimelineItem {
  return {
    id, activityId: `activity-${id}`, rawText: `Raw note ${id}`, summary: `Summary ${id}`,
    sourceText: null, occurredAt: "2026-10-19", category: "learning", status: "RESOLVED",
    eventStatus: "completed", timeOfDay: null, timeHint: null, isFirstTime: false,
    needsReview: false, reviewReasons: [], people: [], places: [], topics: [], imageUrls: [],
  };
}

async function checkLoader(name: string, run: () => Promise<void>) {
  await run();
  passed += 1;
  console.log("PASS", name);
}

await checkLoader("The loader reads the archive once and retains source items for the shell", async () => {
  let calls = 0;
  const items = [timelineMemory("one"), timelineMemory("two"), timelineMemory("three")];
  const result = await loadInsightsData(async () => { calls += 1; return { items, error: null }; }, asOf);
  assert.equal(calls, 1);
  assert.equal(result.items, items);
  assert.equal(result.error, null);
  assert.equal(result.model.completedCount, 3);
  assert.equal(result.model.insights.find(item => item.type === "recurring")?.label, "Learning");
});

await checkLoader("A thrown loader failure returns an error state without exposing internal details", async () => {
  let calls = 0;
  const result = await loadInsightsData(async () => { calls += 1; throw new Error("private database detail"); }, asOf);
  assert.equal(calls, 1);
  assert.deepEqual(result.items, []);
  assert.equal(result.model.completedCount, 0);
  assert.ok(result.error);
  assert.ok(!result.error.includes("private database detail"));
});

await checkLoader("A partial archive error preserves available notes and their derived patterns", async () => {
  const items = [timelineMemory("one"), timelineMemory("two"), timelineMemory("three")];
  const result = await loadInsightsData(async () => ({ items, error: "upstream failed" }), asOf);
  assert.equal(result.items, items);
  assert.equal(result.model.completedCount, 3);
  assert.equal(result.model.insights.length, 1);
  assert.ok(result.error);
  assert.ok(result.error.includes("incomplete"));
  assert.ok(!result.error.includes("upstream failed"));
});

await checkLoader("A successfully loaded empty archive differs from a failed archive", async () => {
  const result = await loadInsightsData(async () => ({ items: [], error: null }), asOf);
  assert.equal(result.error, null);
  assert.deepEqual(result.model, { insights: [], completedCount: 0, firstDate: null, lastDate: null, omittedCount: 0 });
});

console.log(`Insights UI model: ${passed} checks passed.`);
