import assert from "node:assert/strict";
import { GROUND_TRUTH_ACTIVITIES } from "../lib/analytics/ground-truth.ts";
import { detectFirstTimes } from "../lib/analytics/first-time.ts";
import { detectRecurrence } from "../lib/analytics/recurrence.ts";
import { detectChanges } from "../lib/analytics/changes.ts";
import { aggregateMonthlyStats } from "../lib/analytics/stats.ts";
import { completedActivities } from "../lib/analytics/types.ts";

const asOf = "2026-10-19";
const previousMonth = "2026-09";
const currentMonth = "2026-10";
assert.equal(GROUND_TRUTH_ACTIVITIES.length, 50);
assert.equal(completedActivities(GROUND_TRUTH_ACTIVITIES).length, 48);
assert.equal(GROUND_TRUTH_ACTIVITIES.filter((item) => item.eventStatus !== "completed").length, 2);

const firstTimes = detectFirstTimes(GROUND_TRUTH_ACTIVITIES, { asOf });
assert.equal(firstTimes.length, 20);
assert.ok(firstTimes.every((item) => item.evidence.activityDetailId && item.evidence.occurredAt && item.evidence.snippet));

const recurrence = detectRecurrence(GROUND_TRUTH_ACTIVITIES);
const recurrenceCounts = new Map(recurrence.map((item) => [`${item.kind}:${item.label}:${item.month}`, item.count]));
assert.equal(recurrenceCounts.get(`topic:Research:${previousMonth}`), 5);
assert.equal(recurrenceCounts.get(`category:career:${previousMonth}`), 6);
assert.equal(recurrenceCounts.get(`topic:Writing:${currentMonth}`), 3);
assert.equal(recurrenceCounts.get(`topic:Running:${currentMonth}`), 3);
assert.ok(recurrence.every((item) => item.count >= 3 && item.evidence.every((evidence) => evidence.activityDetailId && evidence.occurredAt && evidence.snippet)));

const monthly = aggregateMonthlyStats(GROUND_TRUTH_ACTIVITIES);
assert.deepEqual(monthly.map(({ month, total }) => ({ month, total })), [{ month: previousMonth, total: 29 }, { month: currentMonth, total: 19 }]);
assert.deepEqual(monthly[0].byCategory, { career: 6, social: 5, health: 5, learning: 5, leisure: 4, routine: 4, other: 0 });
assert.deepEqual(monthly[1].byCategory, { career: 5, social: 3, health: 3, learning: 5, leisure: 3, routine: 0, other: 0 });

const changes = detectChanges(GROUND_TRUTH_ACTIVITIES, { previousMonth, currentMonth, minimumDelta: 1, minimumRatio: 0 });
assert.deepEqual(changes.map(({ key, previousCount, currentCount, absoluteDelta, direction }) => ({ key, previousCount, currentCount, absoluteDelta, direction })), [
  { key: "career", previousCount: 6, currentCount: 5, absoluteDelta: 1, direction: "down" },
  { key: "social", previousCount: 5, currentCount: 3, absoluteDelta: 2, direction: "down" },
  { key: "health", previousCount: 5, currentCount: 3, absoluteDelta: 2, direction: "down" },
  { key: "leisure", previousCount: 4, currentCount: 3, absoluteDelta: 1, direction: "down" },
  { key: "routine", previousCount: 4, currentCount: 0, absoluteDelta: 4, direction: "down" },
]);
assert.ok(changes.every((item) => item.evidence.every((evidence) => evidence.activityDetailId && evidence.occurredAt && evidence.snippet)));
console.log("Analytics ground-truth checks passed: 50 activities, 48 completed, explicit first-time/recurrence/change/monthly outputs, and mixed-status filtering.");
