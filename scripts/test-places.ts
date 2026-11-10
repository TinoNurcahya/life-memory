import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import {
  buildPlacesData,
  filterAndSortPlaces,
  formatPlacesDate,
  groupPlacesMemories,
  sortMemories,
  type PlacesCardData,
} from "../lib/places/model.ts";
import type { TimelineItem } from "../lib/queries/activities.ts";
import type { DirectoryEntity } from "../lib/queries/entities.ts";
import type { Place } from "../types/database.ts";

type DirectoryPlace = Place & Pick<DirectoryEntity, "activity_count" | "first_seen_at" | "last_seen_at">;

function place(id: string, name: string, overrides: Partial<DirectoryPlace> = {}): DirectoryPlace {
  return {
    id, user_id: "places-test", name, normalized_name: name.toLowerCase(), aliases: [],
    activity_count: 0, first_seen_at: null, last_seen_at: null,
    created_at: "2026-01-01", updated_at: "2026-01-01", ...overrides,
  };
}

function memory(id: string, overrides: Partial<TimelineItem> = {}): TimelineItem {
  return {
    id, activityId: "activity-" + id, rawText: "Original note " + id,
    summary: "Summary " + id, sourceText: null, occurredAt: "2026-10-01",
    category: "leisure", status: "RESOLVED", eventStatus: "completed",
    timeOfDay: null, timeHint: null, isFirstTime: false, needsReview: false,
    reviewReasons: [], people: [], places: [], topics: [], imageUrls: [], ...overrides,
  };
}

function card(value: DirectoryPlace): PlacesCardData {
  return { place: value, latestMemory: null };
}

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object") {
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

const ids = (cards: PlacesCardData[]) => cards.map(value => value.place.id);
let passed = 0;
async function check(name: string, run: () => void | Promise<void>) {
  await run();
  passed += 1;
  console.log("PASS", name);
}

await check("Latest completed text memory does not borrow an older photo", () => {
  const bandung = place("bandung", "Bandung", { activity_count: 9 });
  const result = buildPlacesData([bandung], [
    memory("older-photo", { places: [bandung], imageUrls: ["/older-photo.jpg"], occurredAt: "2026-10-02" }),
    memory("future-plan", { places: [bandung], eventStatus: "planned", occurredAt: "2026-12-01" }),
    memory("latest-note", { places: [bandung], summary: "The latest actual note.", imageUrls: undefined, occurredAt: "2026-10-19" }),
    memory("cancelled", { places: [bandung], eventStatus: "cancelled", occurredAt: "2026-10-22" }),
    memory("unresolved", { places: [bandung], eventStatus: null, status: "PENDING", occurredAt: "2026-10-23" }),
  ]);
  assert.deepEqual(result.places[0].latestMemory, {
    id: "latest-note", summary: "The latest actual note.", occurredAt: "2026-10-19", imageUrls: [],
  });
  assert.deepEqual(result.memoriesByPlace.get(bandung.id)?.map(item => item.id), ["latest-note", "older-photo"]);
  assert.equal(result.places[0].place.activity_count, 9, "Directory statistics remain authoritative");
});

await check("Photo, excerpt, and date come from the same latest memory", () => {
  const taman = place("taman", "Taman Kota");
  const result = buildPlacesData([taman], [
    memory("older", { places: [taman], summary: "An older story.", imageUrls: ["/older.jpg"] }),
    memory("latest", { places: [taman], summary: "A different, later story.", occurredAt: "2026-10-20", imageUrls: ["/latest-1.jpg", "/latest-2.jpg"] }),
  ]);
  assert.deepEqual(result.places[0].latestMemory, {
    id: "latest", summary: "A different, later story.", occurredAt: "2026-10-20", imageUrls: ["/latest-1.jpg", "/latest-2.jpg"],
  });
});

await check("Place IDs distinguish namesakes, deduplicate relations, and support shared memories", () => {
  const first = place("cafe-1", "Cafe");
  const second = place("cafe-2", "Cafe");
  const absent = place("no-memories", "No memories");
  const unknown = place("outside-directory", "Outside");
  const shared = memory("shared", { occurredAt: "2026-10-20", places: [first, first, second, unknown] });
  const result = buildPlacesData([first, second, absent], [
    shared, structuredClone(shared), memory("first-only", { places: [first] }),
    memory("name-is-not-an-id", { occurredAt: "2026-10-25", places: [place("another-cafe", "Cafe")] }),
    memory("person-is-not-a-place", { occurredAt: "2026-10-26", people: [first] }),
  ]);
  assert.deepEqual(result.memoriesByPlace.get(first.id)?.map(item => item.id), ["shared", "first-only"]);
  assert.deepEqual(result.memoriesByPlace.get(second.id)?.map(item => item.id), ["shared"]);
  assert.deepEqual(result.memoriesByPlace.get(absent.id), []);
  assert.equal(result.memoriesByPlace.has(unknown.id), false);
  assert.equal(result.places.find(value => value.place.id === absent.id)?.latestMemory, null);
});

await check("Same-date latest selection is deterministic regardless of input order", () => {
  const rumah = place("rumah", "Rumah");
  const first = memory("same-day-a", { places: [rumah] });
  const second = memory("same-day-z", { places: [rumah] });
  const forward = buildPlacesData([rumah], [first, second]);
  const reverse = buildPlacesData([rumah], [second, first]);
  assert.equal(forward.places[0].latestMemory?.id, "same-day-z");
  assert.deepEqual(forward.memoriesByPlace.get(rumah.id), reverse.memoriesByPlace.get(rumah.id));
});

await check("Search matches names, normalized names, and aliases without case or diacritic sensitivity", () => {
  const places = [
    card(place("cafe", "Caf\u00e9 \u00c9toile", { aliases: ["Kedai D\u00e9d\u00e9"], normalized_name: "coffee-archive" })),
    card(place("taman", "Taman Kota")),
  ];
  for (const query of [" CAFE ", "etoile", "D\u00c9D\u00c9", "dede", "archive"]) {
    assert.deepEqual(ids(filterAndSortPlaces(places, query, "name")), ["cafe"], query);
  }
  assert.deepEqual(ids(filterAndSortPlaces(places, "   ", "name")), ["cafe", "taman"]);
  assert.deepEqual(filterAndSortPlaces(places, "not-present", "recent"), []);
  const { aliases: _aliases, ...withoutAliases } = place("no-alias", "No Alias");
  assert.deepEqual(ids(filterAndSortPlaces([{ place: withoutAliases, latestMemory: null }], "no alias", "name")), ["no-alias"]);
});

await check("Sorts use directory metadata, stable name/ID ties, and put unknown recent dates last", () => {
  const places = [
    card(place("cafe-z", "Cafe", { activity_count: 4, last_seen_at: "2026-10-20" })),
    card(place("rumah", "Rumah", { activity_count: 7, first_seen_at: "2026-10-25", last_seen_at: null })),
    card(place("taman", "Taman", { activity_count: 1, last_seen_at: "2026-10-21" })),
    card(place("cafe-a", "cafe", { activity_count: 4, last_seen_at: "2026-10-20" })),
  ];
  assert.deepEqual(ids(filterAndSortPlaces(places, "", "recent")), ["taman", "cafe-a", "cafe-z", "rumah"]);
  assert.deepEqual(ids(filterAndSortPlaces(places, "", "count")), ["rumah", "cafe-a", "cafe-z", "taman"]);
  assert.deepEqual(ids(filterAndSortPlaces(places, "", "name")), ["cafe-a", "cafe-z", "rumah", "taman"]);
  assert.deepEqual(ids(filterAndSortPlaces([card(place("ten", "Cafe 10")), card(place("two", "Cafe 2"))], "", "name")), ["two", "ten"]);
  assert.deepEqual(ids(filterAndSortPlaces([
    card(place("invalid", "A invalid", { last_seen_at: "not-a-date" })),
    card(place("impossible", "B impossible", { last_seen_at: "2026-02-30" })),
    card(place("valid", "Z valid", { last_seen_at: "2025-01-01" })),
  ], "", "recent")), ["valid", "invalid", "impossible"]);
});

await check("Memories and month groups are chronological across months and years", () => {
  const items = [
    memory("december", { occurredAt: "2026-12-31" }),
    memory("january-early", { occurredAt: "2027-01-01" }),
    memory("previous-year", { occurredAt: "2025-11-30" }),
    memory("january-late", { occurredAt: "2027-01-20" }),
  ];
  assert.deepEqual(sortMemories(items).map(item => item.id), ["january-late", "january-early", "december", "previous-year"]);
  const groups = groupPlacesMemories(items);
  assert.deepEqual(groups.map(group => group.key), ["2027-01", "2026-12", "2025-11"]);
  assert.equal(groups[0].label, "January 2027");
  assert.deepEqual(groups[0].memories.map(item => item.id), ["january-late", "january-early"]);
});

await check("Invalid dates are displayed safely and cannot displace a dated latest memory", () => {
  assert.equal(formatPlacesDate("2026-10-19"), "19 Oct 2026");
  assert.equal(formatPlacesDate("2028-02-29"), "29 Feb 2028");
  for (const value of [null, undefined, "", "not-a-date", "2027-02-29", "2026-04-31", "2026-13-01", "2026-00-01", "2026-01-00", "2026-2-03", "2026-10-19T00:00:00Z"]) {
    assert.equal(formatPlacesDate(value), "Not recorded", String(value));
  }
  const tujuan = place("tujuan", "Tujuan");
  const items = [
    memory("missing", { occurredAt: "", places: [tujuan] }),
    memory("impossible", { occurredAt: "2026-02-30", places: [tujuan] }),
    memory("malformed", { occurredAt: "unknown", places: [tujuan] }),
    memory("valid-old", { occurredAt: "2025-11-30", places: [tujuan] }),
    memory("valid-latest", { occurredAt: "2026-10-19", places: [tujuan] }),
  ];
  assert.deepEqual(groupPlacesMemories(items).map(group => group.key), ["2026-10", "2025-11", "undated"]);
  const undated = groupPlacesMemories(items)[2];
  assert.equal(undated.label, "Date not recorded");
  assert.deepEqual(new Set(undated.memories.map(item => item.id)), new Set(["missing", "impossible", "malformed"]));
  assert.equal(buildPlacesData([tujuan], items).places[0].latestMemory?.id, "valid-latest");
});

await check("Date-only labels do not shift with the process timezone", () => {
  const previousTimezone = process.env.TZ;
  try {
    for (const timezone of ["Pacific/Kiritimati", "America/Los_Angeles", "Asia/Jakarta"]) {
      process.env.TZ = timezone;
      assert.equal(formatPlacesDate("2026-01-01"), "1 Jan 2026", timezone);
      assert.equal(groupPlacesMemories([memory("new-year", { occurredAt: "2026-01-01" })])[0].label, "January 2026", timezone);
    }
  } finally {
    if (previousTimezone === undefined) delete process.env.TZ;
    else process.env.TZ = previousTimezone;
  }
});

await check("Empty collections and places with no completed memories remain usable", () => {
  const empty = buildPlacesData([], []);
  assert.deepEqual(empty.places, []);
  assert.equal(empty.memoriesByPlace.size, 0);
  assert.deepEqual(groupPlacesMemories([]), []);
  for (const order of ["recent", "name", "count"] as const) assert.deepEqual(filterAndSortPlaces([], "", order), []);
  const result = buildPlacesData([place("empty", "Empty", { activity_count: 5 })], []);
  assert.equal(result.places[0].latestMemory, null);
  assert.equal(result.places[0].place.activity_count, 5);
  assert.deepEqual(result.memoriesByPlace.get("empty"), []);
});

await check("Selection, filtering, sorting, and grouping do not mutate source data", () => {
  const directory = deepFreeze([
    place("z", "Zoo", { aliases: ["Kebun binatang"], activity_count: 2, last_seen_at: "2026-10-20" }),
    place("a", "Alun-alun", { aliases: ["Lapangan"], activity_count: 1, last_seen_at: "2026-10-01" }),
  ]);
  const items = deepFreeze([
    memory("earlier", { places: [directory[0]], imageUrls: ["/earlier.jpg"] }),
    memory("later", { places: [directory[0], directory[1]], occurredAt: "2026-10-20", imageUrls: ["/later.jpg"] }),
  ]);
  const directoryBefore = structuredClone(directory);
  const itemsBefore = structuredClone(items);
  const result = buildPlacesData(directory, items);
  const cards = deepFreeze(result.places);
  const cardsBefore = structuredClone(cards);
  for (const order of ["recent", "name", "count"] as const) filterAndSortPlaces(cards, "", order);
  sortMemories(items);
  groupPlacesMemories(items);
  assert.deepEqual(directory, directoryBefore);
  assert.deepEqual(items, itemsBefore);
  assert.deepEqual(cards, cardsBefore);
});

type QueryResult<T> = { items: T[]; error: string | null };
type QueryMocks = {
  directory: (kind: string, demo: boolean) => Promise<QueryResult<DirectoryEntity>>;
  archive: () => Promise<QueryResult<TimelineItem>>;
  demoItems?: TimelineItem[];
};

// Execute the actual query module with in-memory dependencies; no auth, DB, or network access.
const querySource = readFileSync(new URL("../lib/queries/places.ts", import.meta.url), "utf8");
const queryCode = ts.transpileModule(querySource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
function loadQuery(mocks: QueryMocks) {
  const exports: { getPlacesData?: typeof import("../lib/queries/places.ts").getPlacesData } = {};
  const modules: Record<string, unknown> = {
    "@/lib/queries/entities": { getEntityDirectory: mocks.directory },
    "@/lib/queries/activities": { getArchiveData: mocks.archive },
    "@/lib/demo/jimmy": { JIMMY_DEMO_ITEMS: mocks.demoItems ?? [] },
    "@/lib/places/model": { buildPlacesData },
  };
  runInNewContext(queryCode, {
    exports,
    require: (id: string) => {
      assert.ok(id in modules, "Unexpected query dependency: " + id);
      return modules[id];
    },
  }, { filename: "lib/queries/places.ts" });
  assert.ok(exports.getPlacesData);
  return exports.getPlacesData;
}

await check("Live data uses one directory query and one archive batch for all places", async () => {
  const directory = [place("one", "One"), place("two", "Two"), place("three", "Three")];
  const items = [memory("shared", { places: directory })];
  const calls: string[] = [];
  const getPlacesData = loadQuery({
    directory: async (kind, demo) => {
      calls.push("directory");
      assert.equal(kind, "places");
      assert.equal(demo, false);
      return { items: directory, error: null };
    },
    archive: async () => {
      calls.push("archive");
      return { items, error: null };
    },
  });
  const result = await getPlacesData();
  assert.deepEqual(calls, ["directory", "archive"]);
  assert.equal(result.directoryError, false);
  assert.equal(result.memoriesError, false);
  assert.deepEqual(ids(result.places), ["one", "two", "three"]);
  assert.equal(result.memoriesByPlace.get("two")?.[0].id, "shared");
});

await check("Demo uses the fixture and never calls the live archive loader", async () => {
  const target = place("demo-place", "Demo");
  const demoItems = [memory("demo-memory", { places: [target] })];
  const getPlacesData = loadQuery({
    directory: async (kind, demo) => {
      assert.equal(kind, "places");
      assert.equal(demo, true);
      return { items: [target], error: null };
    },
    archive: async () => { throw new Error("Live archive must not be called in demo"); },
    demoItems,
  });
  const result = await getPlacesData(true);
  assert.equal(result.directoryError, false);
  assert.equal(result.memoriesError, false);
  assert.equal(result.places[0].latestMemory?.id, "demo-memory");
});

await check("Archive errors preserve directory rows and counts while discarding unreliable previews", async () => {
  const target = place("retained", "Retained", { activity_count: 8 });
  for (const reject of [false, true]) {
    const getPlacesData = loadQuery({
      directory: async () => ({ items: [target], error: null }),
      archive: async () => {
        if (reject) throw new Error("Archive unavailable");
        return { items: [memory("unreliable", { places: [target] })], error: "Archive unavailable" };
      },
    });
    const result = await getPlacesData();
    assert.equal(result.directoryError, false);
    assert.equal(result.memoriesError, true);
    assert.equal(result.places[0].place.activity_count, 8);
    assert.equal(result.places[0].latestMemory, null);
    assert.deepEqual(result.memoriesByPlace.get(target.id), []);
  }
});

await check("Directory errors stay distinct from a successful empty directory", async () => {
  const target = place("unreliable", "Unreliable");
  for (const reject of [false, true]) {
    const getPlacesData = loadQuery({
      directory: async () => {
        if (reject) throw new Error("Directory unavailable");
        return { items: [target], error: "Directory unavailable" };
      },
      archive: async () => ({ items: [memory("existing", { places: [target] })], error: null }),
    });
    const result = await getPlacesData();
    assert.equal(result.directoryError, true);
    assert.equal(result.memoriesError, false);
    assert.equal(result.places.length, 0);
    assert.equal(result.memoriesByPlace.size, 0);
  }
  const getEmpty = loadQuery({
    directory: async () => ({ items: [], error: null }),
    archive: async () => ({ items: [], error: null }),
  });
  const empty = await getEmpty();
  assert.equal(empty.directoryError, false);
  assert.equal(empty.memoriesError, false);
  assert.equal(empty.places.length, 0);
});

await check("Both failed requests settle into explicit errors instead of throwing", async () => {
  const getPlacesData = loadQuery({
    directory: async () => { throw new Error("Directory unavailable"); },
    archive: async () => { throw new Error("Archive unavailable"); },
  });
  const result = await getPlacesData();
  assert.equal(result.directoryError, true);
  assert.equal(result.memoriesError, true);
  assert.equal(result.places.length, 0);
  assert.equal(result.memoriesByPlace.size, 0);
});

console.log("Places model and query: " + passed + " checks passed.");
