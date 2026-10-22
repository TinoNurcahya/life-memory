import { createClient } from "@/lib/supabase/server";
import type {
  ActivityCategory,
  ActivityStatus,
  EventStatus,
  Person,
  Place,
  Topic,
  TimeOfDay,
} from "@/types/database";

export interface TimelineItem {
  id: string;
  activityId: string;
  rawText: string;
  summary: string;
  sourceText: string | null;
  occurredAt: string;
  category: ActivityCategory | null;
  status: ActivityStatus;
  eventStatus: EventStatus | null;
  timeOfDay: TimeOfDay | null;
  timeHint: string | null;
  isFirstTime: boolean;
  needsReview: boolean;
  reviewReasons: string[];
  people: Person[];
  places: Place[];
  topics: Topic[];
  imageUrls?: string[];
}

export interface ArchiveStats {
  activities: number;
  people: number;
  places: number;
  topics: number;
  firstTimes: number;
}

export interface ArchiveData {
  items: TimelineItem[];
  stats: ArchiveStats;
  error: string | null;
}

type ActivityRow = {
  id: string;
  raw_text: string;
  client_entry_date: string;
  status: ActivityStatus;
  created_at: string;
};

type DetailRow = {
  id: string;
  activity_id: string;
  summary: string;
  source_text: string;
  category: ActivityCategory;
  occurred_at: string;
  event_status: EventStatus;
  time_of_day: TimeOfDay | null;
  time_hint: string | null;
  is_first_time: boolean;
  needs_review: boolean;
  review_reasons: string[];
  image_urls?: string[];
};

type RelationRow<T> = {
  activity_detail_id: string;
  relation: T | T[] | null;
};

function oneRelation<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

function relationMap<T extends { id: string }>(rows: RelationRow<T>[]) {
  const map = new Map<string, T[]>();
  for (const row of rows) {
    const value = oneRelation(row.relation);
    if (!value) continue;
    const current = map.get(row.activity_detail_id) ?? [];
    if (!current.some((item) => item.id === value.id)) current.push(value);
    map.set(row.activity_detail_id, current);
  }
  return map;
}

export async function getArchiveData(): Promise<ArchiveData> {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return {
      items: [],
      stats: { activities: 0, people: 0, places: 0, topics: 0, firstTimes: 0 },
      error: "Your session expired. Please sign in again.",
    };
  }

  const userId = userData.user.id;
  const [activitiesResult, detailsResult, peopleResult, placesResult, topicsResult] = await Promise.all([
    supabase
      .from("activities")
      .select("id, raw_text, client_entry_date, status, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("activity_details")
      .select("id, activity_id, summary, source_text, category, occurred_at, event_status, time_of_day, time_hint, is_first_time, needs_review, review_reasons, image_urls")
      .eq("user_id", userId)
      .order("occurred_at", { ascending: false }),
    supabase
      .from("activity_people")
      .select("activity_detail_id, relation:people(id, user_id, name, normalized_name, aliases, created_at, updated_at)")
      .eq("user_id", userId),
    supabase
      .from("activity_places")
      .select("activity_detail_id, relation:places(id, user_id, name, normalized_name, aliases, created_at, updated_at)")
      .eq("user_id", userId),
    supabase
      .from("activity_topics")
      .select("activity_detail_id, relation:topics(id, user_id, name, normalized_name, created_at, updated_at)")
      .eq("user_id", userId),
  ]);

  const firstError = [
    activitiesResult.error,
    detailsResult.error,
    peopleResult.error,
    placesResult.error,
    topicsResult.error,
  ].find(Boolean);

  if (firstError) {
    return {
      items: [],
      stats: { activities: 0, people: 0, places: 0, topics: 0, firstTimes: 0 },
      error: firstError.message,
    };
  }

  const activities = (activitiesResult.data ?? []) as ActivityRow[];
  const details = (detailsResult.data ?? []) as DetailRow[];
  const activityById = new Map(activities.map((activity) => [activity.id, activity]));
  const peopleByDetail = relationMap((peopleResult.data ?? []) as RelationRow<Person>[]);
  const placesByDetail = relationMap((placesResult.data ?? []) as RelationRow<Place>[]);
  const topicsByDetail = relationMap((topicsResult.data ?? []) as RelationRow<Topic>[]);

  const resolvedItems: TimelineItem[] = details.map((detail) => {
    const activity = activityById.get(detail.activity_id);
    return {
      id: detail.id,
      activityId: detail.activity_id,
      rawText: activity?.raw_text ?? detail.source_text,
      summary: detail.summary,
      sourceText: detail.source_text,
      occurredAt: detail.occurred_at,
      category: detail.category,
      status: activity?.status ?? "RESOLVED",
      eventStatus: detail.event_status,
      timeOfDay: detail.time_of_day,
      timeHint: detail.time_hint,
      isFirstTime: detail.is_first_time,
      needsReview: detail.needs_review,
      reviewReasons: detail.review_reasons ?? [],
      people: peopleByDetail.get(detail.id) ?? [],
      places: placesByDetail.get(detail.id) ?? [],
      topics: topicsByDetail.get(detail.id) ?? [],
      imageUrls: detail.image_urls ?? [],
    };
  });

  const detailedActivityIds = new Set(details.map((detail) => detail.activity_id));
  const pendingItems: TimelineItem[] = activities
    .filter((activity) => !detailedActivityIds.has(activity.id))
    .map((activity) => ({
      id: activity.id,
      activityId: activity.id,
      rawText: activity.raw_text,
      summary: activity.raw_text,
      sourceText: null,
      occurredAt: activity.client_entry_date,
      category: null,
      status: activity.status,
      eventStatus: null,
      timeOfDay: null,
      timeHint: null,
      isFirstTime: false,
      needsReview: false,
      reviewReasons: [],
      people: [],
      places: [],
      topics: [],
      imageUrls: [],
    }));

  const items = [...resolvedItems, ...pendingItems].sort((a, b) =>
    `${b.occurredAt}-${b.id}`.localeCompare(`${a.occurredAt}-${a.id}`),
  );
  const completed = resolvedItems.filter((item) => item.eventStatus === "completed");
  const people = new Set(completed.flatMap((item) => item.people.map((person) => person.id)));
  const places = new Set(completed.flatMap((item) => item.places.map((place) => place.id)));
  const topics = new Set(completed.flatMap((item) => item.topics.map((topic) => topic.id)));

  return {
    items,
    stats: {
      activities: completed.length,
      people: people.size,
      places: places.size,
      topics: topics.size,
      firstTimes: completed.filter((item) => item.isFirstTime).length,
    },
    error: null,
  };
}

