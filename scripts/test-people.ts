import assert from "node:assert/strict";
import {
  buildPeopleData,
  filterAndSortPeople,
  formatPeopleDate,
  groupPeopleMemories,
  sortMemories,
  type PeopleCardData,
} from "../lib/people/model.ts";
import type { TimelineItem } from "../lib/queries/activities.ts";
import type { DirectoryEntity } from "../lib/queries/entities.ts";
import type { Person } from "../types/database.ts";

type DirectoryPerson = Person & Pick<DirectoryEntity, "activity_count" | "first_seen_at" | "last_seen_at">;

function person(id: string, name: string, overrides: Partial<DirectoryPerson> = {}): DirectoryPerson {
  return {
    id, user_id: "people-test", name, normalized_name: name.toLowerCase(), aliases: [],
    activity_count: 0, first_seen_at: null, last_seen_at: null,
    created_at: "2026-01-01", updated_at: "2026-01-01", ...overrides,
  };
}

function memory(id: string, overrides: Partial<TimelineItem> = {}): TimelineItem {
  return {
    id, activityId: "activity-" + id, rawText: "Original note " + id,
    summary: "Summary " + id, sourceText: null, occurredAt: "2026-10-01",
    category: "social", status: "RESOLVED", eventStatus: "completed",
    timeOfDay: null, timeHint: null, isFirstTime: false, needsReview: false,
    reviewReasons: [], people: [], places: [], topics: [], imageUrls: [], ...overrides,
  };
}

function card(value: DirectoryPerson): PeopleCardData {
  return { person: value, latestMemory: null };
}

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object") {
    for (const child of Object.values(value as Record<string, unknown>)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
}

const ids = (cards: PeopleCardData[]) => cards.map(value => value.person.id);
let passed = 0;
function check(name: string, run: () => void) {
  run();
  passed += 1;
  console.log("PASS", name);
}

check("Latest completed text memory does not borrow an older photo", () => {
  const alex = person("alex", "Alex", { activity_count: 9 });
  const items = [
    memory("older-photo", { people: [alex], imageUrls: ["/older-photo.jpg"], occurredAt: "2026-10-02" }),
    memory("future-plan", { people: [alex], eventStatus: "planned", occurredAt: "2026-12-01" }),
    memory("latest-note", { people: [alex], summary: "The latest actual note.", imageUrls: undefined, occurredAt: "2026-10-19" }),
    memory("cancelled", { people: [alex], eventStatus: "cancelled", occurredAt: "2026-10-22" }),
    memory("unresolved", { people: [alex], eventStatus: null, status: "PENDING", occurredAt: "2026-10-23" }),
  ];
  const result = buildPeopleData([alex], items);
  assert.deepEqual(result.people[0].latestMemory, {
    id: "latest-note", summary: "The latest actual note.", occurredAt: "2026-10-19", imageUrls: [],
  });
  assert.deepEqual(result.memoriesByPerson.get("alex")?.map(item => item.id), ["latest-note", "older-photo"]);
  assert.equal(result.people[0].person.activity_count, 9, "Directory statistics remain authoritative");
});

check("Photo, summary, and date all come from the selected memory", () => {
  const lena = person("lena", "Lena");
  const result = buildPeopleData([lena], [
    memory("older", { people: [lena], summary: "An older story.", imageUrls: ["/older.jpg"] }),
    memory("latest", { people: [lena], summary: "A different, later story.", occurredAt: "2026-10-20", imageUrls: ["/latest-1.jpg", "/latest-2.jpg"] }),
  ]);
  assert.deepEqual(result.people[0].latestMemory, {
    id: "latest", summary: "A different, later story.", occurredAt: "2026-10-20",
    imageUrls: ["/latest-1.jpg", "/latest-2.jpg"],
  });
});

check("Associations use IDs, deduplicate records and repeated relations, and support shared memories", () => {
  const first = person("alex-1", "Alex");
  const second = person("alex-2", "Alex");
  const absent = person("no-memories", "No memories");
  const unknown = person("outside-directory", "Outside");
  const shared = memory("shared", { occurredAt: "2026-10-20", people: [first, first, second, unknown] });
  const firstOnly = memory("first-only", { people: [first] });
  const result = buildPeopleData([first, second, absent], [
    shared, structuredClone(shared), firstOnly,
    memory("name-is-not-an-id", { occurredAt: "2026-10-25", people: [person("another-alex", "Alex")] }),
  ]);
  assert.deepEqual(result.memoriesByPerson.get(first.id)?.map(item => item.id), ["shared", "first-only"]);
  assert.deepEqual(result.memoriesByPerson.get(second.id)?.map(item => item.id), ["shared"]);
  assert.deepEqual(result.memoriesByPerson.get(absent.id), []);
  assert.equal(result.memoriesByPerson.has(unknown.id), false);
  assert.equal(result.people.find(value => value.person.id === absent.id)?.latestMemory, null);
});

check("Same-date latest selection is deterministic regardless of input order", () => {
  const maya = person("maya", "Maya");
  const first = memory("same-day-a", { people: [maya] });
  const second = memory("same-day-z", { people: [maya] });
  const forward = buildPeopleData([maya], [first, second]);
  const reverse = buildPeopleData([maya], [second, first]);
  assert.equal(forward.people[0].latestMemory?.id, reverse.people[0].latestMemory?.id);
  assert.deepEqual(forward.memoriesByPerson.get(maya.id), reverse.memoriesByPerson.get(maya.id));
});

check("Search matches names, normalized names, and aliases without case or diacritic sensitivity", () => {
  const people = [
    card(person("elodie", "Élodie Åström", { aliases: ["Dédé"], normalized_name: "elodie-archive" })),
    card(person("maya", "Maya")),
  ];
  for (const query of [" ELODIE ", "astrom", "DÉDÉ", "dede", "archive"]) {
    assert.deepEqual(ids(filterAndSortPeople(people, query, "name")), ["elodie"], query);
  }
  assert.deepEqual(ids(filterAndSortPeople(people, "   ", "name")), ["elodie", "maya"]);
  assert.deepEqual(filterAndSortPeople(people, "not-present", "recent"), []);

  // DirectoryEntity is shared with entities that do not expose aliases.
  const { aliases: _aliases, ...withoutAliases } = person("no-alias", "No Alias");
  assert.deepEqual(ids(filterAndSortPeople([{ person: withoutAliases, latestMemory: null }], "no alias", "name")), ["no-alias"]);
});

check("Sorts use requested metadata, stable name/ID ties, and put null recent dates last", () => {
  const people = [
    card(person("alex-z", "Alex", { activity_count: 4, last_seen_at: "2026-10-20" })),
    card(person("charlie", "Charlie", { activity_count: 7, first_seen_at: "2026-10-25", last_seen_at: null })),
    card(person("bea", "Beatrice", { activity_count: 1, last_seen_at: "2026-10-21" })),
    card(person("alex-a", "alex", { activity_count: 4, last_seen_at: "2026-10-20" })),
  ];
  assert.deepEqual(ids(filterAndSortPeople(people, "", "recent")), ["bea", "alex-a", "alex-z", "charlie"]);
  assert.deepEqual(ids(filterAndSortPeople(people, "", "count")), ["charlie", "alex-a", "alex-z", "bea"]);
  assert.deepEqual(ids(filterAndSortPeople(people, "", "name")), ["alex-a", "alex-z", "bea", "charlie"]);
  assert.deepEqual(ids(filterAndSortPeople([card(person("ten", "Person 10")), card(person("two", "Person 2"))], "", "name")), ["two", "ten"]);
});

check("Memories and month groups are chronological across months and years", () => {
  const items = [
    memory("december", { occurredAt: "2026-12-31" }),
    memory("january-early", { occurredAt: "2027-01-01" }),
    memory("previous-year", { occurredAt: "2025-11-30" }),
    memory("january-late", { occurredAt: "2027-01-20" }),
  ];
  assert.deepEqual(sortMemories(items).map(item => item.id), ["january-late", "january-early", "december", "previous-year"]);
  const groups = groupPeopleMemories(items);
  assert.deepEqual(groups.map(group => group.key), ["2027-01", "2026-12", "2025-11"]);
  assert.equal(groups[0].label, "January 2027");
  assert.deepEqual(groups[0].memories.map(item => item.id), ["january-late", "january-early"]);
});

check("Invalid dates are displayed safely and grouped after dated memories", () => {
  assert.equal(formatPeopleDate("2026-10-19"), "19 Oct 2026");
  assert.equal(formatPeopleDate("2028-02-29"), "29 Feb 2028");
  for (const value of [null, undefined, "", "not-a-date", "2027-02-29", "2026-04-31", "2026-13-01", "2026-00-01", "2026-01-00", "2026-2-03", "2026-10-19T00:00:00Z"]) {
    assert.equal(formatPeopleDate(value), "Not recorded", String(value));
  }
  const invalid = [memory("missing", { occurredAt: "" }), memory("impossible", { occurredAt: "2026-02-30" }), memory("malformed", { occurredAt: "unknown" })];
  const groups = groupPeopleMemories(invalid);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].key, "undated");
  assert.equal(groups[0].label, "Date not recorded");
  assert.deepEqual(new Set(groups[0].memories.map(item => item.id)), new Set(["missing", "impossible", "malformed"]));
  const mixed = [
    ...invalid,
    memory("valid-old", { occurredAt: "2025-11-30" }),
    memory("valid-latest", { occurredAt: "2026-10-19" }),
  ];
  assert.deepEqual(sortMemories(mixed).slice(0, 2).map(item => item.id), ["valid-latest", "valid-old"]);
  assert.deepEqual(groupPeopleMemories(mixed).map(group => group.key), ["2026-10", "2025-11", "undated"]);
});

check("Date-only labels do not shift with the process timezone", () => {
  const previousTimezone = process.env.TZ;
  try {
    for (const timezone of ["Pacific/Kiritimati", "America/Los_Angeles", "Asia/Jakarta"]) {
      process.env.TZ = timezone;
      assert.equal(formatPeopleDate("2026-01-01"), "1 Jan 2026", timezone);
      assert.equal(groupPeopleMemories([memory("new-year", { occurredAt: "2026-01-01" })])[0].label, "January 2026", timezone);
    }
  } finally {
    if (previousTimezone === undefined) delete process.env.TZ;
    else process.env.TZ = previousTimezone;
  }
});

check("Empty collections and people with no completed memories remain usable", () => {
  const empty = buildPeopleData([], []);
  assert.deepEqual(empty.people, []);
  assert.equal(empty.memoriesByPerson.size, 0);
  assert.deepEqual(groupPeopleMemories([]), []);
  for (const order of ["recent", "name", "count"] as const) assert.deepEqual(filterAndSortPeople([], "", order), []);
  const result = buildPeopleData([person("empty", "Empty", { activity_count: 5 })], []);
  assert.equal(result.people[0].latestMemory, null);
  assert.equal(result.people[0].person.activity_count, 5);
  assert.deepEqual(result.memoriesByPerson.get("empty"), []);
});

check("Selection, filtering, sorting, and grouping do not mutate source data", () => {
  const directory = deepFreeze([
    person("z", "Zoë", { aliases: ["Z"], activity_count: 2, last_seen_at: "2026-10-20" }),
    person("a", "Ari", { aliases: ["A"], activity_count: 1, last_seen_at: "2026-10-01" }),
  ]);
  const items = deepFreeze([
    memory("earlier", { people: [directory[0]], imageUrls: ["/earlier.jpg"] }),
    memory("later", { people: [directory[0], directory[1]], occurredAt: "2026-10-20", imageUrls: ["/later.jpg"] }),
  ]);
  const directoryBefore = structuredClone(directory);
  const itemsBefore = structuredClone(items);
  const result = buildPeopleData(directory, items);
  const cards = deepFreeze(result.people);
  const cardsBefore = structuredClone(cards);
  for (const order of ["recent", "name", "count"] as const) filterAndSortPeople(cards, "", order);
  sortMemories(items);
  groupPeopleMemories(items);
  assert.deepEqual(directory, directoryBefore);
  assert.deepEqual(items, itemsBefore);
  assert.deepEqual(cards, cardsBefore);
});

console.log("People model: " + passed + " checks passed.");
