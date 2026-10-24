import type { TimelineItem } from "../queries/activities.ts";
import type { Person, Place, Topic } from "../../types/database.ts";
import { getThematicPhotoForMemory } from "../ai/thematic-photos.ts";

export interface JimmyDemoActivity {
  id: string;
  offset: number;
  summary: string;
  category: NonNullable<TimelineItem["category"]>;
  people?: string[];
  places?: string[];
  topics?: string[];
  isFirstTime?: boolean;
  eventStatus?: TimelineItem["eventStatus"];
  imageUrls?: string[];
}

const day = (offset: number, referenceDate: Date = new Date()) => {
  const date = new Date(referenceDate);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() - offset);
  return date.toISOString().slice(0, 10);
};

const people = new Map<string, Person>();
const places = new Map<string, Place>();
const topics = new Map<string, Topic>();

function entityId(kind: string, value: string) {
  return `demo-${kind}-${value.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function person(name: string, date: string): Person {
  const id = entityId("person", name);
  const existing = people.get(id);
  if (existing) return existing;
  const value: Person = { id, user_id: "demo", name, normalized_name: name.toLowerCase(), aliases: [], created_at: date, updated_at: date };
  people.set(id, value);
  return value;
}

function place(name: string, date: string): Place {
  const id = entityId("place", name);
  const existing = places.get(id);
  if (existing) return existing;
  const value: Place = { id, user_id: "demo", name, normalized_name: name.toLowerCase(), aliases: [], created_at: date, updated_at: date };
  places.set(id, value);
  return value;
}

function topic(name: string, date: string): Topic {
  const id = entityId("topic", name);
  const existing = topics.get(id);
  if (existing) return existing;
  const value: Topic = { id, user_id: "demo", name, normalized_name: name.toLowerCase(), created_at: date, updated_at: date };
  topics.set(id, value);
  return value;
}

const PEOPLE = ["Ethan", "Lena", "Maya", "Noah", "Sofia", "Raka"];
const PLACES = ["Blank Street Coffee", "Brooklyn Flea Market", "Campus Library", "Prospect Park", "Home Studio", "Capstone Lab"];
const TOPICS = ["API", "Backend", "Interview prep", "Rust", "Research", "Running", "Writing", "Photography"];
const CATEGORIES: JimmyDemoActivity["category"][] = ["career", "learning", "social", "health", "leisure", "routine"];

const seed: JimmyDemoActivity[] = [
  { id: "demo-01", offset: 29, summary: "Long conversation with a stranger about graduate school at the library.", category: "social", places: ["Library"], topics: ["Research"], isFirstTime: true },
  { id: "demo-02", offset: 28, summary: "Mapped the capstone recommendation API with Ethan.", category: "career", people: ["Ethan"], topics: ["API"] },
  { id: "demo-03", offset: 27, summary: "Morning run through Prospect Park before class.", category: "health", places: ["Prospect Park"], topics: ["Running"] },
  { id: "demo-04", offset: 26, summary: "Rewrote the introduction to the research notes.", category: "learning", topics: ["Writing", "Research"] },
  { id: "demo-05", offset: 25, summary: "Coffee and interview preparation with Lena.", category: "social", people: ["Lena"], places: ["Blank Street Coffee"], topics: ["Interview prep"] },
  { id: "demo-06", offset: 24, summary: "Cooked dinner at home and called Maya.", category: "routine", people: ["Maya"] },
  { id: "demo-07", offset: 23, summary: "First visit to the Brooklyn Flea Market with Lena.", category: "leisure", people: ["Lena"], places: ["Brooklyn Flea Market"], isFirstTime: true },
  { id: "demo-08", offset: 22, summary: "Fixed a late-night backend query problem in the capstone.", category: "career", people: ["Ethan"], topics: ["Backend"] },
  { id: "demo-09", offset: 21, summary: "Read three papers at the library and highlighted a useful method.", category: "learning", places: ["Campus Library"], topics: ["Research"] },
  { id: "demo-10", offset: 20, summary: "Short recovery run after a long day in the lab.", category: "health", places: ["Prospect Park"], topics: ["Running"] },
  { id: "demo-11", offset: 19, summary: "Reviewed API error handling with Ethan.", category: "career", people: ["Ethan"], topics: ["API"] },
  { id: "demo-12", offset: 18, summary: "Took photographs of storefronts on the walk home.", category: "leisure", topics: ["Photography"] },
  { id: "demo-13", offset: 17, summary: "Outlined a small chapter about memory and place.", category: "learning", topics: ["Writing"] },
  { id: "demo-14", offset: 16, summary: "Breakfast and a long catch-up with Noah.", category: "social", people: ["Noah"], places: ["Blank Street Coffee"] },
  { id: "demo-15", offset: 15, summary: "Ran the first integration check for the recommendation API.", category: "career", topics: ["API", "Backend"] },
  { id: "demo-16", offset: 14, summary: "Quiet evening editing photographs from the market.", category: "leisure", topics: ["Photography"] },
  { id: "demo-17", offset: 13, summary: "Made a study plan for the next two weeks.", category: "learning", topics: ["Research"] },
  { id: "demo-18", offset: 12, summary: "Walked around Prospect Park with Sofia.", category: "health", people: ["Sofia"], places: ["Prospect Park"], topics: ["Running"] },
  { id: "demo-19", offset: 11, summary: "Shipped the backend cleanup branch.", category: "career", topics: ["Backend"] },
  { id: "demo-20", offset: 10, summary: "Wrote a thank-you note to the interview panel.", category: "career", topics: ["Interview prep", "Writing"] },
  { id: "demo-21", offset: 9, summary: "Lunch with Lena between seminars.", category: "social", people: ["Lena"], places: ["Campus Library"] },
  { id: "demo-22", offset: 8, summary: "Explored Rust examples after class.", category: "learning", places: ["Blank Street Coffee"], topics: ["Rust"] },
  { id: "demo-23", offset: 7, summary: "Evening run and a reflection on energy levels.", category: "health", places: ["Prospect Park"], topics: ["Running"] },
  { id: "demo-24", offset: 6, summary: "Photographed the first snow near campus.", category: "leisure", places: ["Campus Library"], topics: ["Photography"] },
  { id: "demo-25", offset: 5, summary: "Pair-debugged a timeout with Ethan.", category: "career", people: ["Ethan"], topics: ["Backend"] },
  { id: "demo-26", offset: 4, summary: "Finished a writing sprint at the home studio.", category: "learning", places: ["Home Studio"], topics: ["Writing"] },
  { id: "demo-27", offset: 3, summary: "Dinner with Maya after the lab meeting.", category: "social", people: ["Maya"], places: ["Capstone Lab"] },
  { id: "demo-28", offset: 2, summary: "Practiced a Rust parser and noted two questions.", category: "learning", topics: ["Rust"] },
  { id: "demo-29", offset: 1, summary: "Morning run, then planned the next capstone milestone.", category: "health", places: ["Prospect Park"], topics: ["Running", "API"] },
  { id: "demo-30", offset: 0, summary: "Presented the capstone progress update to Noah and Sofia.", category: "career", people: ["Noah", "Sofia"], places: ["Capstone Lab"], topics: ["API", "Research"] },
];

for (let index = 0; index < 18; index += 1) {
  const offset = 31 + index;
  const category = CATEGORIES[index % CATEGORIES.length];
  const personName = PEOPLE[index % PEOPLE.length];
  const placeName = PLACES[index % PLACES.length];
  const topicName = TOPICS[index % TOPICS.length];
  seed.push({
    id: `demo-${String(seed.length + 1).padStart(2, "0")}`,
    offset,
    summary: `${category === "career" ? "Worked on" : category === "health" ? "Moved through" : "Spent time with"} ${topicName.toLowerCase()} at ${placeName}.`,
    category,
    people: index % 2 === 0 ? [personName] : undefined,
    places: [placeName],
    topics: [topicName],
  });
}

export function getJimmyDemoItems(referenceDate: Date = new Date()): TimelineItem[] {
  return seed.map((entry) => {
    const date = day(entry.offset, referenceDate);
    return {
      id: entry.id,
      activityId: entry.id,
      rawText: entry.summary,
      summary: entry.summary,
      sourceText: entry.summary,
      occurredAt: date,
      category: entry.category,
      status: "RESOLVED",
      eventStatus: entry.eventStatus ?? "completed",
      timeOfDay: "unknown",
      timeHint: null,
      isFirstTime: entry.isFirstTime ?? false,
      needsReview: false,
      reviewReasons: [],
      people: (entry.people ?? []).map((name) => person(name, date)),
      places: (entry.places ?? []).map((name) => place(name, date)),
      topics: (entry.topics ?? []).map((name) => topic(name, date)),
      imageUrls: entry.imageUrls || [getThematicPhotoForMemory(entry.summary, entry.category)],
    };
  });
}

export const JIMMY_DEMO_ITEMS: TimelineItem[] = getJimmyDemoItems();

export const JIMMY_DEMO_STATS = {
  activities: JIMMY_DEMO_ITEMS.filter((item) => item.eventStatus === "completed").length,
  people: new Set(JIMMY_DEMO_ITEMS.flatMap((item) => item.people.map((value) => value.id))).size,
  places: new Set(JIMMY_DEMO_ITEMS.flatMap((item) => item.places.map((value) => value.id))).size,
  topics: new Set(JIMMY_DEMO_ITEMS.flatMap((item) => item.topics.map((value) => value.id))).size,
  firstTimes: JIMMY_DEMO_ITEMS.filter((item) => item.isFirstTime).length,
};

export const JIMMY_DEMO_ENTITIES = { people, places, topics };

export function getJimmyDemoActivityRows() {
  return JIMMY_DEMO_ITEMS.map((item) => ({ ...item, clientEntryDate: item.occurredAt }));
}
