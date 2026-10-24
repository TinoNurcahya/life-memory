import assert from "node:assert/strict";
import { getFullArchiveExport } from "../lib/export/archive.ts";

console.log("=== LIFE MEMORY — FULL ARCHIVE EXPORT TESTS ===");

console.log("1. Testing full archive generation in Demo Mode…");
const exportPayload = await getFullArchiveExport({ isDemo: true });

// 1. Metadata check
assert.ok(exportPayload.metadata, "Export payload must contain metadata");
assert.equal(exportPayload.metadata.exportVersion, "1.0.0");
assert.equal(exportPayload.metadata.app, "Life Memory");
assert.equal(exportPayload.metadata.user.isDemo, true);
assert.equal(exportPayload.metadata.user.id, "demo-jimmy");
console.log(`   ✓ Metadata verified: version ${exportPayload.metadata.exportVersion}, user: ${exportPayload.metadata.user.fullName}`);

// 2. Counts check
const counts = exportPayload.metadata.counts;
console.log("2. Record counts verification:");
console.log(`   - Activities:       ${counts.activities}`);
console.log(`   - Activity Details: ${counts.activityDetails}`);
console.log(`   - People:           ${counts.people}`);
console.log(`   - Places:           ${counts.places}`);
console.log(`   - Topics:           ${counts.topics}`);
console.log(`   - Junctions:        ${counts.junctions}`);
console.log(`   - Insights:         ${counts.insights}`);

assert.equal(counts.activities, 48, "Demo mode must export all 48 Jimmy activities");
assert.equal(counts.activityDetails, 48, "Demo mode must export all 48 details");
assert.equal(counts.activities, exportPayload.activities.length);
assert.equal(counts.activityDetails, exportPayload.activity_details.length);
assert.equal(counts.people, exportPayload.people.length);
assert.equal(counts.places, exportPayload.places.length);
assert.equal(counts.topics, exportPayload.topics.length);
assert.equal(counts.insights, exportPayload.insights.length);

assert.ok(counts.people > 0, "Must contain people records");
assert.ok(counts.places > 0, "Must contain places records");
assert.ok(counts.topics > 0, "Must contain topics records");
assert.ok(counts.junctions > 0, "Must contain junction associations");
assert.ok(counts.insights > 0, "Must contain generated insights");

// 3. Schema integrity
console.log("3. Schema & attribute verification…");
assert.ok(exportPayload.profile, "Must contain profile object");
assert.equal(exportPayload.profile.id, "demo-jimmy");

for (const act of exportPayload.activities) {
  assert.ok(act.id, "Activity must have id");
  assert.ok(act.user_id, "Activity must have user_id");
  assert.ok(act.raw_text, "Activity must have raw_text");
  assert.ok(act.status, "Activity must have status");
}

for (const det of exportPayload.activity_details) {
  assert.ok(det.id, "Detail must have id");
  assert.ok(det.activity_id, "Detail must have activity_id");
  assert.ok(det.summary, "Detail must have summary");
  assert.ok(det.occurred_at, "Detail must have occurred_at");
  assert.ok(det.category, "Detail must have category");
}

assert.ok(Array.isArray(exportPayload.junctions.activity_people), "Must have activity_people array");
assert.ok(Array.isArray(exportPayload.junctions.activity_places), "Must have activity_places array");
assert.ok(Array.isArray(exportPayload.junctions.activity_topics), "Must have activity_topics array");
console.log("   ✓ All records meet schema requirements");

// 4. JSON Serialization check
console.log("4. Testing JSON serialization round-trip…");
const jsonString = JSON.stringify(exportPayload, null, 2);
assert.ok(jsonString.length > 1000, "Serialized JSON must be substantial");
const parsed = JSON.parse(jsonString);
assert.equal(parsed.metadata.exportVersion, "1.0.0");
assert.equal(parsed.activities.length, 48);
console.log(`   ✓ Serialized JSON size: ${(jsonString.length / 1024).toFixed(1)} KB`);

console.log("\n=== ALL FULL ARCHIVE EXPORT TESTS PASSED ===");
