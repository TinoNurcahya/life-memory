import assert from "node:assert/strict";
import { JIMMY_DEMO_ITEMS } from "../lib/demo/jimmy.ts";
import { timelineToAnalytics } from "../lib/analytics/adapters.ts";
import { generateDeterministicInsights, insightToRecord } from "../lib/analytics/insights.ts";

console.log("=== LIFE MEMORY — AUTOMATED INSIGHTS & EVIDENCE TESTS ===");

const analyticsActivities = timelineToAnalytics(JIMMY_DEMO_ITEMS);

// 1. Pipeline execution on ground-truth demo dataset
console.log("1. Testing deterministic insights generation on Jimmy dataset…");
const insights = generateDeterministicInsights(analyticsActivities, "2026-10-20");

assert.ok(insights.length > 0, "Should generate at least one insight from Jimmy's 48 activities");
console.log(`   ✓ Successfully generated ${insights.length} deterministic insights`);

// 2. Check structure, evidence linkage, and highlight terms
console.log("2. Testing evidence grounding & source highlight metadata…");
const validTypes = new Set(["first_time", "recurring", "change"]);
const seenKeys = new Set<string>();

for (const insight of insights) {
  // Validate type
  assert.ok(validTypes.has(insight.type), `Insight type '${insight.type}' must be valid`);

  // Validate non-empty title & description
  assert.ok(insight.title && insight.title.length > 0, "Title must not be empty");
  assert.ok(insight.description && insight.description.length > 0, "Description must not be empty");

  // Validate non-empty evidence array
  assert.ok(Array.isArray(insight.evidence), "Evidence must be an array");
  assert.ok(insight.evidence.length > 0, `Insight '${insight.title}' must contain at least 1 evidence item`);

  for (const ev of insight.evidence) {
    assert.ok(ev.activity_detail_id, "Evidence must have activity_detail_id");
    assert.ok(ev.occurred_at, "Evidence must have occurred_at timestamp");
    assert.ok(ev.snippet && ev.snippet.length > 0, "Evidence must have non-empty snippet");
  }

  // Validate highlightTerm in metadata
  const meta = (insight.metadata || {}) as Record<string, unknown>;
  assert.ok(meta.highlightTerm || meta.label, `Insight '${insight.title}' must have highlightTerm or label for source highlighting`);

  // Validate deduplication key uniqueness
  const key = `${insight.type}:${meta.key ?? ""}:${meta.month ?? ""}`;
  assert.ok(!seenKeys.has(key), `Duplicate insight key encountered: ${key}`);
  seenKeys.add(key);
}
console.log("   ✓ All insights are strictly grounded with non-empty evidence and highlight terms");
console.log("   ✓ No duplicate composite keys found");

// 3. Category distribution
const firstTimes = insights.filter((i) => i.type === "first_time");
const recurring = insights.filter((i) => i.type === "recurring");
const changes = insights.filter((i) => i.type === "change");

console.log("3. Insight category distribution:");
console.log(`   - First-Times: ${firstTimes.length}`);
console.log(`   - Recurring:   ${recurring.length}`);
console.log(`   - Shifts:      ${changes.length}`);

assert.ok(firstTimes.length > 0, "Must detect first-time milestones");
assert.ok(recurring.length > 0, "Must detect recurring patterns");
assert.ok(changes.length > 0, "Must detect monthly category shifts");

// 4. Test demo record mapping
console.log("4. Testing demo record conversion (insightToRecord)…");
const demoRecord = insightToRecord(insights[0], 0);
assert.equal(demoRecord.id, "demo-insight-1");
assert.equal(demoRecord.user_id, "demo");
assert.equal(demoRecord.is_read, false);
assert.equal(demoRecord.is_suppressed, false);
assert.ok(demoRecord.created_at);
console.log("   ✓ Demo record correctly mapped with zero DB mutation requirement");

console.log("\n=== ALL INSIGHTS & EVIDENCE DRAWER TESTS PASSED ===");
