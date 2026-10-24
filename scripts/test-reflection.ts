import assert from "node:assert/strict";
import {
  curateReflectionEvidence,
  ValidateReflection,
  buildDeterministicMonthlyReflection,
  renumberGlobalFootnotes,
} from "../lib/reflection/monthly.ts";
import type { GeneratedMonthlyReflection, ReflectionInputPayload } from "../lib/ai/reflection.ts";
import type { AnalyticsActivity } from "../lib/analytics/types.ts";

console.log("=== LIFE MEMORY — MONTHLY REFLECTION ENGINE TESTS ===");

// 1. Setup mock activities
const person = (name: string) => ({ id: `p_${name}`, name });
const place = (name: string) => ({ id: `pl_${name}`, name });
const topic = (name: string) => ({ id: `t_${name}`, name });

const mockActivities: AnalyticsActivity[] = [
  { id: "act_1", occurredAt: "2026-10-02", category: "career", eventStatus: "completed", summary: "Shipped the recommendation API", people: [person("Ethan")], places: [place("Lab")], topics: [topic("API")], isFirstTime: false },
  { id: "act_2", occurredAt: "2026-10-05", category: "social", eventStatus: "completed", summary: "Coffee with Lena discussing design systems", people: [person("Lena")], places: [place("Cafe")], topics: [], isFirstTime: false },
  { id: "act_3", occurredAt: "2026-10-12", category: "learning", eventStatus: "completed", summary: "First time trying Rust language", people: [], places: [place("Library")], topics: [topic("Rust")], isFirstTime: true },
  { id: "act_4", occurredAt: "2026-10-15", category: "career", eventStatus: "completed", summary: "Presented capstone project", people: [person("Noah")], places: [place("Campus")], topics: [], isFirstTime: true },
  { id: "act_5", occurredAt: "2026-10-20", category: "health", eventStatus: "cancelled", summary: "Cancelled morning run", people: [], places: [place("Park")], topics: [], isFirstTime: false },
  { id: "act_6", occurredAt: "2026-09-25", category: "social", eventStatus: "completed", summary: "Past month activity", people: [person("Lena")], places: [], topics: [], isFirstTime: false },
];

// Test 1: Evidence Curation
const payload = curateReflectionEvidence(mockActivities, "2026-10");
console.log("1. Evidence curation check:");
assert.equal(payload.stats.total_activities, 4); // Only completed activities in Oct 2026
assert.equal(payload.stats.first_times_count, 2);
assert.equal(payload.evidence_pool.length, 4);
assert.ok(payload.evidence_pool.every((e) => e.date.startsWith("2026-10")));
console.log("   ✓ Curated evidence pool excludes cancelled/out-of-month entries and respects limits.");

// Test 2: Deterministic Fallback Generation & Validation
console.log("\n2. Deterministic fallback generation check:");
const deterministic = buildDeterministicMonthlyReflection(payload);
assert.ok(deterministic.paragraphs.length > 0);
assert.ok(ValidateReflection(payload, deterministic), "Deterministic reflection must pass ValidateReflection");
console.log("   ✓ Deterministic reflection is strictly grounded and passes validation.");

// Test 3: ValidateReflection Edge Cases
console.log("\n3. ValidateReflection integrity checks:");

// Case A: Valid AI response
const validAiResponse: GeneratedMonthlyReflection = {
  title: "A Month of Milestone and Craft",
  paragraphs: [
    {
      theme: "rhythm_and_focus",
      text: "October was marked by key technical progress, notably shipping the recommendation API [1].",
      evidence_ids: ["act_1"],
    },
    {
      theme: "relationships_and_places",
      text: "Social moments were anchored by coffee with Lena [1] and learning Rust for the first time [2].",
      evidence_ids: ["act_2", "act_3"],
    },
  ],
  key_themes: ["career", "learning"],
};
assert.ok(ValidateReflection(payload, validAiResponse), "Valid AI response must pass validation");
console.log("   ✓ Valid response with proper sequential citations [1]..[N] passed.");

// Case B: Hallucinated ID
const hallucinatedResponse: GeneratedMonthlyReflection = {
  ...validAiResponse,
  paragraphs: [
    {
      theme: "rhythm_and_focus",
      text: "Worked on an imaginary project [1].",
      evidence_ids: ["hallucinated_id_999"],
    },
  ],
};
assert.equal(ValidateReflection(payload, hallucinatedResponse), false, "Hallucinated ID must be rejected");
console.log("   ✓ Rejects hallucinated evidence ID.");

// Case C: Mismatched / Non-sequential citation markers
const nonSequentialResponse: GeneratedMonthlyReflection = {
  ...validAiResponse,
  paragraphs: [
    {
      theme: "rhythm_and_focus",
      text: "Worked on milestone [2] without citing [1].",
      evidence_ids: ["act_1"],
    },
  ],
};
assert.equal(ValidateReflection(payload, nonSequentialResponse), false, "Non-sequential markers must be rejected");
console.log("   ✓ Rejects non-sequential or mismatched citation markers.");

// Case D: Empty citations in paragraph
const uncitedParagraphResponse: GeneratedMonthlyReflection = {
  ...validAiResponse,
  paragraphs: [
    {
      theme: "rhythm_and_focus",
      text: "A speculative statement with zero citations.",
      evidence_ids: [],
    },
  ],
};
assert.equal(ValidateReflection(payload, uncitedParagraphResponse), false, "Uncited paragraph must be rejected");
console.log("   ✓ Rejects uncited paragraphs.");

// Test 4: Global Footnote Renumbering
console.log("\n4. Global footnote renumbering check:");
const { formattedParagraphs, bibliography } = renumberGlobalFootnotes(
  validAiResponse.paragraphs,
  payload.evidence_pool
);

assert.equal(bibliography.length, 3);
assert.equal(bibliography[0].globalIndex, 1);
assert.equal(bibliography[1].globalIndex, 2);
assert.equal(bibliography[2].globalIndex, 3);
assert.ok(formattedParagraphs[0].text.includes("[1]"));
assert.ok(formattedParagraphs[1].text.includes("[2]"));
assert.ok(formattedParagraphs[1].text.includes("[3]"));
console.log("   ✓ Global continuous numbering [1]..[Total] across paragraphs successfully generated.");

console.log("\n=== ALL MONTHLY REFLECTION TESTS PASSED ===");
