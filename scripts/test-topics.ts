import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import {
  buildTopicsData,
  filterAndSortTopics,
  formatTopicsDate,
  groupTopicsMemories,
  sortMemories,
  type TopicsRowData,
} from "../lib/topics/model.ts";
import type { TimelineItem } from "../lib/queries/activities.ts";
import type { DirectoryEntity } from "../lib/queries/entities.ts";
import type { Topic } from "../types/database.ts";

type DirectoryTopic = Topic & Pick<DirectoryEntity, "activity_count" | "first_seen_at" | "last_seen_at">;

function topic(id: string, name: string, overrides: Partial<DirectoryTopic> = {}): DirectoryTopic {
  return {
    id, user_id: "topics-test", name, normalized_name: name.toLowerCase(),
    activity_count: 0, first_seen_at: null, last_seen_at: null,
    created_at: "2026-01-01", updated_at: "2026-01-01", ...overrides,
  };
}

function memory(id: string, overrides: Partial<TimelineItem> = {}): TimelineItem {
  return {
    id, activityId: "activity-" + id, rawText: "Original note " + id,
    summary: "Summary " + id, sourceText: null, occurredAt: "2026-10-01",
    category: "learning", status: "RESOLVED", eventStatus: "completed",
    timeOfDay: null, timeHint: null, isFirstTime: false, needsReview: false,
    reviewReasons: [], people: [], places: [], topics: [], imageUrls: [], ...overrides,
  };
}

function row(value: DirectoryTopic): TopicsRowData {
  return { topic: value, latestMemory: null };
}

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object") {
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

const ids = (rows: TopicsRowData[]) => rows.map(value => value.topic.id);
let passed = 0;
async function check(name: string, run: () => void | Promise<void>) {
  await run();
  passed += 1;
  console.log("PASS", name);
}

await check("Preview uses the latest completed memory and contains only its ID, excerpt, and date", () => {
  const writing = topic("writing", "Writing", { activity_count: 9 });
  const result = buildTopicsData([writing], [
    memory("older-photo", { topics: [writing], imageUrls: ["/older.jpg"], occurredAt: "2026-10-02" }),
    memory("planned", { topics: [writing], eventStatus: "planned", occurredAt: "2026-12-01" }),
    memory("latest", { topics: [writing], summary: "Latest completed note.", occurredAt: "2026-10-19", imageUrls: ["/latest.jpg"] }),
    memory("cancelled", { topics: [writing], eventStatus: "cancelled", occurredAt: "2026-10-22" }),
    memory("pending", { topics: [writing], eventStatus: null, status: "PENDING", occurredAt: "2026-10-23" }),
  ]);
  assert.deepEqual(result.topics[0].latestMemory, { id: "latest", summary: "Latest completed note.", occurredAt: "2026-10-19" });
  assert.deepEqual(result.memoriesByTopic.get(writing.id)?.map(item => item.id), ["latest", "older-photo"]);
  assert.deepEqual(result.memoriesByTopic.get(writing.id)?.[0].imageUrls, ["/latest.jpg"], "Detail memories retain their own photos");
  assert.equal(result.topics[0].topic.activity_count, 9, "Directory counts remain authoritative");
});

await check("Latest text-only memory remains the preview even when an older memory has a photo", () => {
  const research = topic("research", "Research");
  const result = buildTopicsData([research], [
    memory("older-photo", { topics: [research], imageUrls: ["/older.jpg"] }),
    memory("latest-note", { topics: [research], summary: "Newer note without an image.", occurredAt: "2026-10-20", imageUrls: undefined }),
  ]);
  assert.deepEqual(result.topics[0].latestMemory, { id: "latest-note", summary: "Newer note without an image.", occurredAt: "2026-10-20" });
});

await check("Topic associations use IDs, deduplicate records and relations, and support shared memories", () => {
  const first = topic("rust-1", "Rust");
  const second = topic("rust-2", "Rust");
  const absent = topic("empty", "Empty");
  const unknown = topic("outside", "Outside");
  const shared = memory("shared", { occurredAt: "2026-10-20", topics: [first, first, second, unknown] });
  const result = buildTopicsData([first, second, absent], [
    shared, structuredClone(shared), memory("first-only", { topics: [first] }),
    memory("same-name", { occurredAt: "2026-10-25", topics: [topic("another-rust", "Rust")] }),
    memory("place-is-not-topic", { occurredAt: "2026-10-26", places: [{ ...first, aliases: [] }] }),
  ]);
  assert.deepEqual(result.memoriesByTopic.get(first.id)?.map(item => item.id), ["shared", "first-only"]);
  assert.deepEqual(result.memoriesByTopic.get(second.id)?.map(item => item.id), ["shared"]);
  assert.deepEqual(result.memoriesByTopic.get(absent.id), []);
  assert.equal(result.memoriesByTopic.has(unknown.id), false);
  assert.equal(result.topics[2].latestMemory, null);
});

await check("Same-date latest selection is deterministic regardless of input order", () => {
  const rust = topic("rust", "Rust");
  const items = [memory("same-day-a", { topics: [rust] }), memory("same-day-z", { topics: [rust] })];
  const forward = buildTopicsData([rust], items);
  const reverse = buildTopicsData([rust], [...items].reverse());
  assert.equal(forward.topics[0].latestMemory?.id, "same-day-z");
  assert.deepEqual(forward.memoriesByTopic.get(rust.id), reverse.memoriesByTopic.get(rust.id));
});

await check("Search matches only names and normalized names, ignoring case and diacritics", () => {
  const rows = [
    row(topic("cafe", "Caf\u00e9 \u00c9tudes", { normalized_name: "coffee-research" })),
    row(topic("writing", "Writing")),
  ];
  for (const query of [" CAFE ", "\u00c9TUDES", "etudes", "research"]) {
    assert.deepEqual(ids(filterAndSortTopics(rows, query, "name")), ["cafe"], query);
  }
  assert.deepEqual(ids(filterAndSortTopics(rows, "   ", "name")), ["cafe", "writing"]);
  assert.deepEqual(filterAndSortTopics(rows, "not-present", "recent"), []);
  assert.deepEqual(ids(filterAndSortTopics([row(topic("extended", "Ca\u1ab0fe\u1dc0"))], "cafe", "name")), ["extended"]);
  assert.equal("aliases" in rows[0].topic, false);
  const extraFields = { ...rows[0].topic, aliases: ["Hidden alias"], description: "Invented description" };
  const withPreview: TopicsRowData[] = [{ topic: extraFields, latestMemory: { id: "m", summary: "Incidental memory phrase", occurredAt: "2026-10-01" } }];
  for (const query of ["hidden alias", "invented description", "incidental memory"]) {
    assert.deepEqual(filterAndSortTopics(withPreview, query, "name"), []);
  }
});

await check("Sorts use directory metadata with stable name/ID ties and natural name order", () => {
  const rows = [
    row(topic("api-z", "API", { activity_count: 4, last_seen_at: "2026-10-20" })),
    row(topic("writing", "Writing", { activity_count: 7, first_seen_at: "2026-10-25", last_seen_at: null })),
    row(topic("rust", "Rust", { activity_count: 1, last_seen_at: "2026-10-21" })),
    row(topic("api-a", "api", { activity_count: 4, last_seen_at: "2026-10-20" })),
  ];
  assert.deepEqual(ids(filterAndSortTopics(rows, "", "recent")), ["rust", "api-a", "api-z", "writing"]);
  assert.deepEqual(ids(filterAndSortTopics(rows, "", "count")), ["writing", "api-a", "api-z", "rust"]);
  assert.deepEqual(ids(filterAndSortTopics(rows, "", "name")), ["api-a", "api-z", "rust", "writing"]);
  assert.deepEqual(ids(filterAndSortTopics([row(topic("ten", "Chapter 10")), row(topic("two", "Chapter 2"))], "", "name")), ["two", "ten"]);
  assert.deepEqual(ids(filterAndSortTopics([
    row(topic("invalid", "A invalid", { last_seen_at: "not-a-date" })),
    row(topic("impossible", "B impossible", { last_seen_at: "2026-02-30" })),
    row(topic("valid", "Z valid", { last_seen_at: "2025-01-01" })),
  ], "", "recent")), ["valid", "invalid", "impossible"]);
});

await check("Month groups are chronological across years and retain detail memory data", () => {
  const items = [
    memory("december", { occurredAt: "2026-12-31" }),
    memory("january-early", { occurredAt: "2027-01-01" }),
    memory("previous-year", { occurredAt: "2025-11-30" }),
    memory("january-late", { occurredAt: "2027-01-20", sourceText: "A source excerpt", imageUrls: ["/memory.jpg"] }),
  ];
  assert.deepEqual(sortMemories(items).map(item => item.id), ["january-late", "january-early", "december", "previous-year"]);
  const groups = groupTopicsMemories(items);
  assert.deepEqual(groups.map(group => group.key), ["2027-01", "2026-12", "2025-11"]);
  assert.equal(groups[0].label, "January 2027");
  assert.deepEqual(groups[0].memories.map(item => item.id), ["january-late", "january-early"]);
  assert.equal(groups[0].memories[0].sourceText, "A source excerpt");
  assert.deepEqual(groups[0].memories[0].imageUrls, ["/memory.jpg"]);
});

await check("Invalid dates have safe labels and cannot displace a dated latest memory", () => {
  assert.equal(formatTopicsDate("2026-10-19"), "19 Oct 2026");
  assert.equal(formatTopicsDate("2028-02-29"), "29 Feb 2028");
  for (const value of [null, undefined, "", "unknown", "2027-02-29", "2026-04-31", "2026-13-01", "2026-00-01", "2026-01-00", "2026-2-03", "2026-10-19T00:00:00Z"]) {
    assert.equal(formatTopicsDate(value), "Not recorded", String(value));
  }
  const subject = topic("subject", "Subject");
  const items = [
    memory("missing", { occurredAt: "", topics: [subject] }),
    memory("impossible", { occurredAt: "2026-02-30", topics: [subject] }),
    memory("malformed", { occurredAt: "unknown", topics: [subject] }),
    memory("valid-old", { occurredAt: "2025-11-30", topics: [subject] }),
    memory("valid-latest", { occurredAt: "2026-10-19", topics: [subject] }),
  ];
  const groups = groupTopicsMemories(items);
  assert.deepEqual(groups.map(group => group.key), ["2026-10", "2025-11", "undated"]);
  assert.equal(groups[2].label, "Date not recorded");
  assert.deepEqual(new Set(groups[2].memories.map(item => item.id)), new Set(["missing", "impossible", "malformed"]));
  assert.equal(buildTopicsData([subject], items).topics[0].latestMemory?.id, "valid-latest");
});

await check("Date-only labels stay unchanged across process timezones", () => {
  const previousTimezone = process.env.TZ;
  try {
    for (const timezone of ["Pacific/Kiritimati", "America/Los_Angeles", "Asia/Jakarta"]) {
      process.env.TZ = timezone;
      assert.equal(formatTopicsDate("2026-01-01"), "1 Jan 2026", timezone);
      assert.equal(groupTopicsMemories([memory("new-year", { occurredAt: "2026-01-01" })])[0].label, "January 2026", timezone);
    }
  } finally {
    if (previousTimezone === undefined) delete process.env.TZ;
    else process.env.TZ = previousTimezone;
  }
});

await check("Empty collections and topics without completed memories keep usable metadata", () => {
  const empty = buildTopicsData([], []);
  assert.deepEqual(empty.topics, []);
  assert.equal(empty.memoriesByTopic.size, 0);
  assert.deepEqual(groupTopicsMemories([]), []);
  for (const order of ["recent", "name", "count"] as const) assert.deepEqual(filterAndSortTopics([], "", order), []);
  const result = buildTopicsData([topic("empty", "Empty", { activity_count: 5 })], []);
  assert.equal(result.topics[0].latestMemory, null);
  assert.equal(result.topics[0].topic.activity_count, 5);
  assert.deepEqual(result.memoriesByTopic.get("empty"), []);
});

await check("Selection, filtering, sorting, and grouping do not mutate source data", () => {
  const directory = deepFreeze([
    topic("z", "Zoology", { activity_count: 2, last_seen_at: "2026-10-20" }),
    topic("a", "Architecture", { activity_count: 1, last_seen_at: "2026-10-01" }),
  ]);
  const items = deepFreeze([
    memory("earlier", { topics: [directory[0]], imageUrls: ["/earlier.jpg"] }),
    memory("later", { topics: directory, occurredAt: "2026-10-20", imageUrls: ["/later.jpg"] }),
  ]);
  const before = { directory: structuredClone(directory), items: structuredClone(items) };
  const rows = deepFreeze(buildTopicsData(directory, items).topics);
  const rowsBefore = structuredClone(rows);
  for (const order of ["recent", "name", "count"] as const) filterAndSortTopics(rows, "", order);
  sortMemories(items);
  groupTopicsMemories(items);
  assert.deepEqual(directory, before.directory);
  assert.deepEqual(items, before.items);
  assert.deepEqual(rows, rowsBefore);
});

type QueryResult<T> = { items: T[]; error: string | null };
type QueryMocks = {
  directory: (kind: string, demo: boolean) => Promise<QueryResult<DirectoryEntity>>;
  archive: () => Promise<QueryResult<TimelineItem>>;
  demoItems?: TimelineItem[];
};

// Run the actual query module with in-memory dependencies; no auth, DB, or network access.
const querySource = readFileSync(new URL("../lib/queries/topics.ts", import.meta.url), "utf8");
const queryCode = ts.transpileModule(querySource, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
function loadQuery(mocks: QueryMocks) {
  const exports: { getTopicsData?: typeof import("../lib/queries/topics.ts").getTopicsData } = {};
  const modules: Record<string, unknown> = {
    "@/lib/queries/entities": { getEntityDirectory: mocks.directory },
    "@/lib/queries/activities": { getArchiveData: mocks.archive },
    "@/lib/demo/jimmy": { JIMMY_DEMO_ITEMS: mocks.demoItems ?? [] },
    "@/lib/topics/model": { buildTopicsData },
  };
  runInNewContext(queryCode, {
    exports,
    require: (id: string) => {
      assert.ok(id in modules, "Unexpected query dependency: " + id);
      return modules[id];
    },
  }, { filename: "lib/queries/topics.ts" });
  assert.ok(exports.getTopicsData);
  return exports.getTopicsData;
}

await check("Live data uses one directory request and one archive batch for all topics", async () => {
  const directory = [topic("one", "One"), topic("two", "Two"), topic("three", "Three")];
  const calls: string[] = [];
  const getTopicsData = loadQuery({
    directory: async (kind, demo) => {
      calls.push("directory");
      assert.equal(kind, "topics");
      assert.equal(demo, false);
      return { items: directory, error: null };
    },
    archive: async () => {
      calls.push("archive");
      return { items: [memory("shared", { topics: directory })], error: null };
    },
  });
  const result = await getTopicsData();
  assert.deepEqual(calls, ["directory", "archive"]);
  assert.equal(result.directoryError, false);
  assert.equal(result.memoriesError, false);
  assert.deepEqual(ids(result.topics), ["one", "two", "three"]);
  assert.equal(result.memoriesByTopic.get("two")?.[0].id, "shared");
});

await check("Demo uses the fixture without calling the live archive loader", async () => {
  const target = topic("demo-topic", "Demo");
  let archiveCalls = 0;
  const getTopicsData = loadQuery({
    directory: async (kind, demo) => {
      assert.equal(kind, "topics");
      assert.equal(demo, true);
      return { items: [target], error: null };
    },
    archive: async () => { archiveCalls += 1; throw new Error("Live archive must not be called in demo"); },
    demoItems: [memory("demo-memory", { topics: [target] })],
  });
  const result = await getTopicsData(true);
  assert.equal(archiveCalls, 0);
  assert.equal(result.directoryError, false);
  assert.equal(result.memoriesError, false);
  assert.equal(result.topics[0].latestMemory?.id, "demo-memory");
});

await check("Archive failures preserve directory rows and counts but discard unreliable previews", async () => {
  const target = topic("retained", "Retained", { activity_count: 8 });
  for (const reject of [false, true]) {
    const getTopicsData = loadQuery({
      directory: async () => ({ items: [target], error: null }),
      archive: async () => {
        if (reject) throw new Error("Archive unavailable");
        return { items: [memory("unreliable", { topics: [target] })], error: "Archive unavailable" };
      },
    });
    const result = await getTopicsData();
    assert.equal(result.directoryError, false);
    assert.equal(result.memoriesError, true);
    assert.equal(result.topics[0].topic.activity_count, 8);
    assert.equal(result.topics[0].latestMemory, null);
    assert.deepEqual(result.memoriesByTopic.get(target.id), []);
  }
});

await check("Directory failures stay distinct from a successful empty directory", async () => {
  const target = topic("unreliable", "Unreliable");
  for (const reject of [false, true]) {
    const getTopicsData = loadQuery({
      directory: async () => {
        if (reject) throw new Error("Directory unavailable");
        return { items: [target], error: "Directory unavailable" };
      },
      archive: async () => ({ items: [memory("existing", { topics: [target] })], error: null }),
    });
    const result = await getTopicsData();
    assert.equal(result.directoryError, true);
    assert.equal(result.memoriesError, false);
    assert.equal(result.topics.length, 0);
    assert.equal(result.memoriesByTopic.size, 0);
  }
  const getEmpty = loadQuery({
    directory: async () => ({ items: [], error: null }),
    archive: async () => ({ items: [], error: null }),
  });
  const empty = await getEmpty();
  assert.equal(empty.directoryError, false);
  assert.equal(empty.memoriesError, false);
  assert.equal(empty.topics.length, 0);
});

await check("Both rejected requests produce explicit errors instead of throwing", async () => {
  const getTopicsData = loadQuery({
    directory: async () => { throw new Error("Directory unavailable"); },
    archive: async () => { throw new Error("Archive unavailable"); },
  });
  const result = await getTopicsData();
  assert.equal(result.directoryError, true);
  assert.equal(result.memoriesError, true);
  assert.equal(result.topics.length, 0);
  assert.equal(result.memoriesByTopic.size, 0);
});

await check("Detail route distinguishes failed directory, missing ID, and partial archive", async () => {
  const routeSource = readFileSync(new URL("../app/topics/[id]/page.tsx", import.meta.url), "utf8");
  const routeCode = ts.transpileModule(routeSource, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const subject = topic("known", "Known topic", { activity_count: 8 });
  const notFoundError = new Error("expected-not-found");
  for (const state of ["directory-error", "missing", "partial"] as const) {
    let calls = 0;
    const modules: Record<string, unknown> = {
      "react/jsx-runtime": { jsx: (type: string, props: Record<string, unknown>) => ({ type, props }) },
      "next/navigation": { notFound: () => { throw notFoundError; } },
      "@/components/topics/TopicDetail": { TopicDetail: "detail" },
      "@/components/topics/TopicsUnavailable": { TopicsUnavailable: "unavailable" },
      "@/lib/queries/topics": { getTopicsData: async (demo: boolean) => {
        calls += 1;
        assert.equal(demo, true);
        return {
          topics: state === "partial" ? [row(subject)] : [],
          memoriesByTopic: new Map(),
          directoryError: state === "directory-error", memoriesError: true,
        };
      } },
    };
    type Result = { type: string; props: { demo: boolean; topic?: DirectoryEntity; memoriesError?: boolean } };
    const exports: { default?: (args: { params: Promise<{ id: string }>; searchParams: Promise<{ demo: string }> }) => Promise<Result> } = {};
    runInNewContext(routeCode, { exports, require: (id: string) => {
      assert.ok(id in modules, "Unexpected route dependency: " + id);
      return modules[id];
    } });
    assert.ok(exports.default);
    const result = exports.default({ params: Promise.resolve({ id: "known" }), searchParams: Promise.resolve({ demo: "jimmy" }) });
    if (state === "missing") {
      await assert.rejects(result, error => error === notFoundError);
    } else {
      const page = await result;
      assert.equal(page.type, state === "partial" ? "detail" : "unavailable");
      assert.equal(page.props.demo, true);
      if (state === "partial") {
        assert.equal(page.props.topic?.activity_count, 8);
        assert.equal(page.props.memoriesError, true);
      }
    }
    assert.equal(calls, 1);
  }
});

console.log("Topics model, query, and route: " + passed + " checks passed.");
