import assert from "node:assert/strict";
import {
  buildDeterministicMonthlyReflection,
  curateReflectionEvidence,
  formatReflectionMonth,
  normalizeCachedReflection,
  normalizeReflectionMonth,
  renumberGlobalFootnotes,
  sanitizeReflectionActivities,
  ValidateReflection,
  validReflectionMonth,
  type FormattedMonthlyEssay,
} from "../lib/reflection/monthly.ts";
import type { AnalyticsActivity } from "../lib/analytics/types.ts";
import type { GeneratedMonthlyReflection } from "../lib/ai/reflection.ts";
import type { TimelineItem } from "../lib/queries/activities.ts";
import { generateReflectionFromData, loadReflectionPage, type ReflectionDependencies } from "../lib/reflection/service.ts";

let passed = 0;
async function check(name: string, run: () => void | Promise<void>) {
  await run();
  passed += 1;
  console.log("PASS", name);
}

function activity(id: string, overrides: Partial<AnalyticsActivity> = {}): AnalyticsActivity {
  return {
    id, occurredAt: "2026-10-19", eventStatus: "completed", category: "learning",
    summary: `Catatan ${id}`, people: [], places: [], topics: [], ...overrides,
  };
}

const sourceActivities = [activity("a", { occurredAt: "2026-10-01", summary: "A" }), activity("b", { summary: "B" }), activity("c", { summary: "C" })];
const payload = curateReflectionEvidence(sourceActivities, "2026-10");
const evidence = payload.evidence_pool;
const generated: GeneratedMonthlyReflection = {
  title: "Catatan Oktober", key_themes: ["learning"],
  paragraphs: [
    { theme: "rhythm_and_focus", text: "A [1]", evidence_ids: ["a"] },
    { theme: "relationships_and_places", text: "B [1] C [2]", evidence_ids: ["b", "c"] },
  ],
};

function cachedEssay(): FormattedMonthlyEssay {
  const formatted = renumberGlobalFootnotes(generated.paragraphs, evidence);
  return {
    month: "October 2026", title: generated.title, paragraphs: formatted.formattedParagraphs,
    key_themes: generated.key_themes, source: "gemini", modelUsed: "test-model",
    bibliography: formatted.bibliography,
  };
}

await check("Months are exact calendar values, and malformed route months fall back safely", () => {
  assert.equal(validReflectionMonth("2026-10"), true);
  for (const month of ["2026", "2026-1", "2026-00", "2026-13", "2026-10-01", "", null, undefined]) {
    assert.equal(validReflectionMonth(month), false, String(month));
  }
  assert.deepEqual(normalizeReflectionMonth(undefined, "2026-10"), { month: "2026-10", invalid: false });
  assert.deepEqual(normalizeReflectionMonth("2026-13", "2026-10"), { month: "2026-10", invalid: true });
  assert.deepEqual(normalizeReflectionMonth("2025-12", "2026-10"), { month: "2025-12", invalid: false });
  assert.equal(formatReflectionMonth("2026-10"), "October 2026");
  assert.throws(() => curateReflectionEvidence(sourceActivities, "2026"));
});

await check("Only valid completed unique memories enter the evidence pool", () => {
  const inputs = [
    activity("valid"), activity("valid"), activity("planned", { eventStatus: "planned" }),
    activity("cancelled", { eventStatus: "cancelled" }), activity("pending", { eventStatus: null }),
    activity("bad", { occurredAt: "2026-02-30" }), activity("timestamp", { occurredAt: "2026-10-19T00:00:00Z" }),
    activity(""), activity("other-month", { occurredAt: "2026-09-19" }),
  ];
  const original = structuredClone(inputs);
  assert.equal(sanitizeReflectionActivities(inputs).length, 2);
  const curated = curateReflectionEvidence(inputs, "2026-10");
  assert.equal(curated.stats.total_activities, 1);
  assert.deepEqual(curated.evidence_pool.map(item => item.id), ["valid"]);
  assert.deepEqual(inputs, original, "Input archive must not be mutated");
});

await check("Evidence curation stays deterministic and capped without confusing total memories with the sample", () => {
  const inputs = Array.from({ length: 14 }, (_, i) => activity(`many-${i}`, {
    occurredAt: `2026-10-${String(i + 1).padStart(2, "0")}`,
    category: i % 2 ? "social" : "learning", isFirstTime: i < 2,
    people: i % 2 ? [{ id: "person", name: "Nara" }] : [],
  }));
  const first = curateReflectionEvidence(inputs, "2026-10");
  assert.equal(first.stats.total_activities, 14);
  assert.equal(first.evidence_pool.length, 8);
  assert.equal(new Set(first.evidence_pool.map(item => item.id)).size, 8);
  assert.deepEqual(curateReflectionEvidence([...inputs].reverse(), "2026-10"), first);
});

await check("Conflicting duplicate records resolve consistently even when date and summary are equal", () => {
  const inputs = [activity("duplicate", { category: "social" }), activity("duplicate", { category: "learning" })];
  assert.deepEqual(sanitizeReflectionActivities(inputs), sanitizeReflectionActivities([...inputs].reverse()));
});

await check("Global citations preserve exact source order when local and inserted numbers collide", () => {
  const { formattedParagraphs, bibliography } = renumberGlobalFootnotes(generated.paragraphs, evidence);
  assert.equal(formattedParagraphs[0].text, "A [1]");
  assert.equal(formattedParagraphs[1].text, "B [2] C [3]");
  assert.deepEqual(formattedParagraphs[1].footnotes.map(item => [item.globalIndex, item.evidenceId]), [[2, "b"], [3, "c"]]);
  assert.deepEqual(bibliography.map(item => item.evidenceId), ["a", "b", "c"]);
});

await check("Citation validation rejects fabricated IDs and malformed structures without inventing placeholder sources", () => {
  assert.equal(ValidateReflection(payload, generated), true);
  const bad = { ...generated, paragraphs: [{ ...generated.paragraphs[0], evidence_ids: ["missing"] }] };
  assert.equal(ValidateReflection(payload, bad), false);
  assert.throws(() => renumberGlobalFootnotes(bad.paragraphs, evidence));
  assert.equal(ValidateReflection(payload, { ...generated, paragraphs: [{ ...generated.paragraphs[0], text: "A [2]" }] }), false);
  assert.equal(ValidateReflection(payload, { ...generated, paragraphs: [{ ...generated.paragraphs[0], evidence_ids: [] }] }), false);
});

await check("Deterministic summaries retain the original stories and valid references without invented emotional claims", () => {
  const summary = buildDeterministicMonthlyReflection(payload);
  assert.ok(ValidateReflection(payload, summary));
  assert.ok(summary.title.includes("October"));
  const prose = summary.paragraphs.map(paragraph => paragraph.text).join(" ");
  assert.doesNotMatch(prose, /meaningful connections|key transitions|notable rhythm|hubungan yang bermakna/i);
  for (const paragraph of summary.paragraphs) {
    for (const id of paragraph.evidence_ids) assert.ok(paragraph.text.includes(evidence.find(item => item.id === id)!.summary));
  }
});

await check("Numeric brackets in original notes cannot turn into extra citation controls", () => {
  const source = activity("bracketed", { summary: "Reading chapter [1] and note [20]." });
  const input = curateReflectionEvidence([source], "2026-10");
  const summary = buildDeterministicMonthlyReflection(input);
  assert.equal(ValidateReflection(input, summary), true);
  assert.equal(summary.paragraphs[0].text.match(/\[\d+\]/g)?.length, 1);
  assert.ok(summary.paragraphs[0].text.includes("\u201CReading chapter \uFF3B1\uFF3D and note \uFF3B20\uFF3D.\u201D"));
  const formatted = renumberGlobalFootnotes(summary.paragraphs, input.evidence_pool);
  assert.equal(formatted.bibliography[0].evidence.summary, source.summary);
});

await check("Legacy cached citation collisions are repaired from the ordered stored source references", () => {
  const old = cachedEssay();
  old.paragraphs[1].text = "B [3] C [2]";
  const before = structuredClone(old);
  const normalized = normalizeCachedReflection(old, evidence, "2026-10");
  assert.ok(normalized);
  assert.equal(normalized.paragraphs[1].text, "B [2] C [3]");
  assert.deepEqual(normalized.paragraphs[1].footnotes.map(item => item.evidenceId), ["b", "c"]);
  assert.equal(normalized.month, "October 2026");
  assert.equal(normalized.modelUsed, "test-model");
  assert.deepEqual(old, before);
});

await check("Cached prose is rejected when a source is deleted, edited, or belongs to another month", () => {
  const old = cachedEssay();
  assert.equal(normalizeCachedReflection(old, evidence.filter(item => item.id !== "b"), "2026-10"), null);
  const edited = evidence.map(item => item.id === "b" ? { ...item, summary: "A completely different memory" } : item);
  assert.equal(normalizeCachedReflection(old, edited, "2026-10"), null);
  const moved = evidence.map(item => item.id === "b" ? { ...item, date: "2026-09-19" } : item);
  assert.equal(normalizeCachedReflection(old, moved, "2026-10"), null);
  const firstTimeChanged = evidence.map(item => item.id === "b" ? { ...item, is_first_time: true } : item);
  assert.equal(normalizeCachedReflection(old, firstTimeChanged, "2026-10"), null);
});

await check("Malformed cache rows and incomplete marker/source mappings safely fall back", () => {
  const old = cachedEssay();
  for (const value of [null, {}, [], { ...old, title: 7 }, { ...old, paragraphs: [] }, { ...old, key_themes: [7] }]) {
    assert.equal(normalizeCachedReflection(value, evidence, "2026-10"), null);
  }
  const wrongCount = cachedEssay(); wrongCount.paragraphs[1].text = "B [2] and C without a marker";
  assert.equal(normalizeCachedReflection(wrongCount, evidence, "2026-10"), null);
  const missingRef = cachedEssay(); missingRef.paragraphs[1].footnotes[0].evidenceId = "absent";
  assert.equal(normalizeCachedReflection(missingRef, evidence, "2026-10"), null);
  const duplicateMarkers = cachedEssay(); duplicateMarkers.paragraphs[1].text = "B [2] and B again [2]";
  assert.equal(normalizeCachedReflection(duplicateMarkers, evidence, "2026-10"), null);
});

function timeline(item: AnalyticsActivity): TimelineItem {
  return {
    id: item.id, activityId: `activity-${item.id}`, occurredAt: item.occurredAt,
    rawText: item.summary, summary: item.summary, sourceText: item.summary,
    category: item.category, status: "RESOLVED", eventStatus: item.eventStatus,
    timeOfDay: null, timeHint: null, isFirstTime: item.isFirstTime ?? false,
    needsReview: false, reviewReasons: [], people: [], places: [], topics: [], imageUrls: [],
  };
}
const archiveItems = sourceActivities.map(timeline);

function mockDependencies(overrides: Partial<ReflectionDependencies> = {}) {
  const calls = { archive: 0, cache: 0, generate: 0, save: 0 };
  const deps: ReflectionDependencies = {
    readArchive: async () => { calls.archive += 1; return { items: archiveItems, error: null }; },
    readCached: async () => { calls.cache += 1; return { value: null, error: null }; },
    generate: async () => { calls.generate += 1; return { reflection: generated, modelUsed: "test-model", latencyMs: 0 }; },
    save: async () => { calls.save += 1; return { error: null }; },
    ...overrides,
  };
  return { calls, deps };
}

await check("Reading an uncached month reads the archive once and never invokes AI or persistence", async () => {
  const { calls, deps } = mockDependencies();
  const result = await loadReflectionPage("2026-10", false, deps, "2026-10");
  assert.equal(result.month, "2026-10");
  assert.equal(result.error, null);
  assert.equal(result.essay?.source, "deterministic");
  assert.equal(result.completedCount, 3);
  assert.equal(result.hasSavedReflection, false);
  assert.deepEqual(result.availableMonths, ["2026-10"]);
  assert.equal(result.items, archiveItems);
  assert.deepEqual(calls, { archive: 1, cache: 1, generate: 0, save: 0 });
});

await check("Reading a cached month repairs legacy citations without generating or writing", async () => {
  const old = cachedEssay(); old.paragraphs[1].text = "B [3] C [2]";
  const { calls, deps } = mockDependencies({ readCached: async () => ({ value: old, error: null }) });
  const result = await loadReflectionPage("2026-10", false, deps, "2026-10");
  assert.equal(result.hasSavedReflection, true);
  assert.equal(result.essay?.source, "gemini");
  assert.equal(result.essay?.paragraphs[1].text, "B [2] C [3]");
  assert.equal(calls.archive, 1);
  assert.equal(calls.generate, 0);
  assert.equal(calls.save, 0);
});

await check("Demo reading and explicit demo generation remain offline even with AI and save dependencies supplied", async () => {
  const read = mockDependencies();
  const page = await loadReflectionPage("2026-10", true, read.deps, "2026-10");
  assert.equal(page.essay?.source, "deterministic");
  assert.deepEqual(read.calls, { archive: 1, cache: 0, generate: 0, save: 0 });
  const generate = mockDependencies();
  const result = await generateReflectionFromData("2026-10", true, generate.deps);
  assert.ok(result.success);
  assert.equal(result.data.essay.source, "deterministic");
  assert.equal(result.data.saved, false);
  assert.deepEqual(generate.calls, { archive: 1, cache: 0, generate: 0, save: 0 });
});

await check("An empty archive remains distinct from an archive read failure", async () => {
  const empty = mockDependencies({ readArchive: async () => ({ items: [], error: null }) });
  const page = await loadReflectionPage("2026-10", false, empty.deps, "2026-10");
  assert.equal(page.error, null);
  assert.equal(page.essay, null);
  assert.equal(page.completedCount, 0);
  for (const readArchive of [
    async () => ({ items: archiveItems, error: "private upstream error" }),
    async () => { throw new Error("private upstream error"); },
  ]) {
    const failure = mockDependencies({ readArchive });
    const result = await loadReflectionPage("2026-10", false, failure.deps, "2026-10");
    assert.ok(result.error);
    assert.ok(!result.error.includes("private upstream error"));
    assert.equal(result.essay, null);
    assert.equal(failure.calls.generate, 0);
    assert.equal(failure.calls.save, 0);
  }
});

await check("Cache failures and stale cached sources fall back to a readable summary with a notice", async () => {
  const stale = cachedEssay(); stale.paragraphs[0].footnotes[0].evidenceId = "deleted";
  for (const readCached of [
    async () => ({ value: null, error: "private cache failure" }),
    async () => { throw new Error("private cache failure"); },
    async () => ({ value: stale, error: null }),
  ]) {
    const { calls, deps } = mockDependencies({ readCached });
    const result = await loadReflectionPage("2026-10", false, deps, "2026-10");
    assert.equal(result.error, null);
    assert.equal(result.essay?.source, "deterministic");
    assert.equal(result.hasSavedReflection, false);
    assert.ok(result.notice);
    assert.ok(!result.notice.includes("private cache failure"));
    assert.equal(calls.generate, 0);
    assert.equal(calls.save, 0);
  }
});

await check("Invalid route months normalize before reads, while invalid generation months are rejected before any work", async () => {
  let requestedMonth = "";
  const { deps } = mockDependencies({ readCached: async month => { requestedMonth = month; return { value: null, error: null }; } });
  const page = await loadReflectionPage("2026", false, deps, "2026-10");
  assert.equal(page.month, "2026-10");
  assert.equal(requestedMonth, "2026-10");
  assert.ok(page.notice);
  const action = mockDependencies();
  const result = await generateReflectionFromData("2026", false, action.deps);
  assert.equal(result.success, false);
  if (!result.success) assert.equal(result.code, "INVALID_INPUT");
  assert.deepEqual(action.calls, { archive: 0, cache: 0, generate: 0, save: 0 });
});

await check("Explicit generation validates sources, writes once, and reports successful persistence accurately", async () => {
  let savedMonth = "", savedEssay: FormattedMonthlyEssay | null = null, saves = 0;
  const { calls, deps } = mockDependencies({ save: async (month, essay) => { saves += 1; savedMonth = month; savedEssay = essay; return { error: null }; } });
  const result = await generateReflectionFromData("2026-10", false, deps);
  assert.ok(result.success);
  assert.equal(result.data.saved, true);
  assert.equal(result.data.essay.source, "gemini");
  assert.equal(result.data.essay.paragraphs[1].text, "B [2] C [3]");
  assert.equal(result.data.essay, savedEssay);
  assert.equal(savedMonth, "2026-10");
  assert.equal(saves, 1);
  assert.equal(calls.archive, 1);
  assert.equal(calls.generate, 1);
  assert.equal(calls.cache, 0);
});

await check("Failed persistence leaves the new essay readable without claiming it was saved", async () => {
  for (const save of [async () => ({ error: "private write failure" }), async () => { throw new Error("private write failure"); }]) {
    const { deps } = mockDependencies({ save });
    const result = await generateReflectionFromData("2026-10", false, deps);
    assert.ok(result.success);
    assert.equal(result.data.essay.source, "gemini");
    assert.equal(result.data.saved, false);
    assert.ok(result.data.notice);
    assert.ok(!result.data.notice.includes("private write failure"));
  }
});

await check("Unavailable or ungrounded AI results use a deterministic summary and never overwrite a saved reflection", async () => {
  for (const generate of [
    async () => { throw new Error("private model failure"); },
    async () => ({ reflection: { ...generated, paragraphs: [{ ...generated.paragraphs[0], evidence_ids: ["fabricated-id"] }] }, modelUsed: "test-model", latencyMs: 0 }),
  ]) {
    const { calls, deps } = mockDependencies({ generate });
    const result = await generateReflectionFromData("2026-10", false, deps);
    assert.ok(result.success);
    assert.equal(result.data.essay.source, "deterministic");
    assert.equal(result.data.saved, false);
    assert.ok(result.data.notice);
    assert.equal(calls.save, 0);
  }
});

await check("Generation with no completed memories or a failed archive never reaches AI or persistence", async () => {
  for (const readArchive of [async () => ({ items: [], error: null }), async () => ({ items: [], error: "failed" })]) {
    const { calls, deps } = mockDependencies({ readArchive });
    const result = await generateReflectionFromData("2026-10", false, deps);
    assert.equal(result.success, false);
    assert.equal(calls.generate, 0);
    assert.equal(calls.save, 0);
  }
});

console.log(`Reflection UI model and service: ${passed} checks passed.`);
