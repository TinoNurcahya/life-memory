import assert from "node:assert/strict";
import { getJimmyDemoItems } from "../lib/demo/jimmy.ts";
import { selectForgottenCandidate } from "../lib/queries/forgotten.ts";
import type { TimelineItem } from "../lib/queries/activities.ts";

const referenceDate = new Date("2026-10-19T00:00:00Z");
const items = getJimmyDemoItems(referenceDate);
const candidate = selectForgottenCandidate(items, referenceDate);
assert.equal(candidate?.id, "demo-01");
assert.equal(candidate?.daysAgo, 29);
assert.equal(candidate?.anchorLastOccurredAt, candidate?.occurredAt);

const base = (overrides: Partial<TimelineItem>): TimelineItem => ({ id: "candidate", activityId: "candidate", rawText: "memory", summary: "memory", sourceText: "memory", occurredAt: "2026-09-29", category: "social", status: "RESOLVED", eventStatus: "completed", timeOfDay: "unknown", timeHint: null, isFirstTime: false, needsReview: false, reviewReasons: [], people: [{ id: "p1", user_id: "u", name: "Ari", normalized_name: "ari", aliases: [], created_at: "", updated_at: "" }], places: [], topics: [], ...overrides });
assert.equal(selectForgottenCandidate([base({}), base({ id: "recent", activityId: "recent", occurredAt: "2026-10-12" })], new Date("2026-10-19T00:00:00Z")), null);
assert.equal(selectForgottenCandidate([base({ places: [{ id: "home", user_id: "u", name: "Home", normalized_name: "home", aliases: [], created_at: "", updated_at: "" }], people: [] })], new Date("2026-10-19T00:00:00Z")), null);
console.log("S-14 selector checks passed: completed/14-day/anchor/dormancy rules and daysAgo.");
