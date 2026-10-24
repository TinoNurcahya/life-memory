import { JIMMY_DEMO_ITEMS } from "../demo/jimmy.ts";
import { timelineToAnalytics } from "../analytics/adapters.ts";
import { generateDeterministicInsights, insightToRecord } from "../analytics/insights.ts";
import type {
  Profile,
  Activity,
  ActivityDetail,
  Person,
  Place,
  Topic,
  Insight,
} from "../../types/database.ts";

export interface FullArchiveExportPayload {
  metadata: {
    exportVersion: string;
    exportedAt: string;
    app: string;
    user: {
      id: string;
      email: string | null;
      fullName: string | null;
      isDemo: boolean;
    };
    counts: {
      activities: number;
      activityDetails: number;
      people: number;
      places: number;
      topics: number;
      junctions: number;
      insights: number;
    };
  };
  profile: Partial<Profile> | null;
  activities: Partial<Activity>[];
  activity_details: Partial<ActivityDetail>[];
  people: Partial<Person>[];
  places: Partial<Place>[];
  topics: Partial<Topic>[];
  junctions: {
    activity_people: Array<{ activity_detail_id: string; person_id: string }>;
    activity_places: Array<{ activity_detail_id: string; place_id: string }>;
    activity_topics: Array<{ activity_detail_id: string; topic_id: string }>;
  };
  insights: Partial<Insight>[];
}

export async function getFullArchiveExport(options: {
  userId?: string;
  isDemo?: boolean;
}): Promise<FullArchiveExportPayload> {
  const { userId, isDemo = false } = options;

  // 1. Demo Mode: Generate complete export from Jimmy's 48-item fixture
  if (isDemo || userId === "demo" || !userId) {
    const demoItems = JIMMY_DEMO_ITEMS;
    const now = new Date().toISOString();

    const peopleMap = new Map<string, Person>();
    const placesMap = new Map<string, Place>();
    const topicsMap = new Map<string, Topic>();

    const activityPeopleJunction: Array<{ activity_detail_id: string; person_id: string }> = [];
    const activityPlacesJunction: Array<{ activity_detail_id: string; place_id: string }> = [];
    const activityTopicsJunction: Array<{ activity_detail_id: string; topic_id: string }> = [];

    const activities: Partial<Activity>[] = [];
    const activityDetails: Partial<ActivityDetail>[] = [];

    for (const item of demoItems) {
      activities.push({
        id: item.activityId,
        user_id: "demo-jimmy",
        raw_text: item.rawText,
        client_entry_date: item.occurredAt.slice(0, 10),
        status: item.status,
        created_at: item.occurredAt,
      });

      activityDetails.push({
        id: item.id,
        activity_id: item.activityId,
        summary: item.summary,
        source_text: item.sourceText || item.rawText,
        category: item.category || "other",
        occurred_at: item.occurredAt,
        time_of_day: item.timeOfDay || "afternoon",
        time_hint: item.timeHint || null,
        is_first_time: item.isFirstTime,
        event_status: item.eventStatus || "completed",
        needs_review: item.needsReview,
        review_reasons: item.reviewReasons,
        created_at: item.occurredAt,
      });

      for (const p of item.people) {
        if (!peopleMap.has(p.id)) peopleMap.set(p.id, p);
        activityPeopleJunction.push({ activity_detail_id: item.id, person_id: p.id });
      }

      for (const pl of item.places) {
        if (!placesMap.has(pl.id)) placesMap.set(pl.id, pl);
        activityPlacesJunction.push({ activity_detail_id: item.id, place_id: pl.id });
      }

      for (const t of item.topics) {
        if (!topicsMap.has(t.id)) topicsMap.set(t.id, t);
        activityTopicsJunction.push({ activity_detail_id: item.id, topic_id: t.id });
      }
    }

    const analytics = timelineToAnalytics(demoItems);
    const deterministicInsights = generateDeterministicInsights(analytics);
    const insights = deterministicInsights.map((ins, idx) => insightToRecord(ins, idx));

    const totalJunctions =
      activityPeopleJunction.length +
      activityPlacesJunction.length +
      activityTopicsJunction.length;

    return {
      metadata: {
        exportVersion: "1.0.0",
        exportedAt: now,
        app: "Life Memory",
        user: {
          id: "demo-jimmy",
          email: "jimmy.demo@example.com",
          fullName: "Jimmy (Demo Archive)",
          isDemo: true,
        },
        counts: {
          activities: activities.length,
          activityDetails: activityDetails.length,
          people: peopleMap.size,
          places: placesMap.size,
          topics: topicsMap.size,
          junctions: totalJunctions,
          insights: insights.length,
        },
      },
      profile: {
        id: "demo-jimmy",
        full_name: "Jimmy",
        email: "jimmy.demo@example.com",
        created_at: "2026-08-01T00:00:00.000Z",
      },
      activities,
      activity_details: activityDetails,
      people: Array.from(peopleMap.values()),
      places: Array.from(placesMap.values()),
      topics: Array.from(topicsMap.values()),
      junctions: {
        activity_people: activityPeopleJunction,
        activity_places: activityPlacesJunction,
        activity_topics: activityTopicsJunction,
      },
      insights,
    };
  }

  // 2. Authenticated Mode: Query all tables from Supabase with RLS
  const { createClient } = await import("../supabase/server.ts");
  const supabase = await createClient();
  const now = new Date().toISOString();

  const [
    profileRes,
    activitiesRes,
    detailsRes,
    peopleRes,
    placesRes,
    topicsRes,
    actPeopleRes,
    actPlacesRes,
    actTopicsRes,
    insightsRes,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("activities").select("*").eq("user_id", userId),
    supabase.from("activity_details").select("*").order("occurred_at", { ascending: false }),
    supabase.from("people").select("*").eq("user_id", userId),
    supabase.from("places").select("*").eq("user_id", userId),
    supabase.from("topics").select("*").eq("user_id", userId),
    supabase.from("activity_people").select("*"),
    supabase.from("activity_places").select("*"),
    supabase.from("activity_topics").select("*"),
    supabase.from("insights").select("*").eq("user_id", userId),
  ]);

  const profile = profileRes.data || null;
  const activities = activitiesRes.data || [];
  const details = detailsRes.data || [];
  const people = peopleRes.data || [];
  const places = placesRes.data || [];
  const topics = topicsRes.data || [];
  const actPeople = actPeopleRes.data || [];
  const actPlaces = actPlacesRes.data || [];
  const actTopics = actTopicsRes.data || [];
  const insights = insightsRes.data || [];

  const totalJunctions = actPeople.length + actPlaces.length + actTopics.length;

  return {
    metadata: {
      exportVersion: "1.0.0",
      exportedAt: now,
      app: "Life Memory",
      user: {
        id: userId,
        email: profile?.email || null,
        fullName: profile?.full_name || null,
        isDemo: false,
      },
      counts: {
        activities: activities.length,
        activityDetails: details.length,
        people: people.length,
        places: places.length,
        topics: topics.length,
        junctions: totalJunctions,
        insights: insights.length,
      },
    },
    profile,
    activities,
    activity_details: details,
    people,
    places,
    topics,
    junctions: {
      activity_people: actPeople,
      activity_places: actPlaces,
      activity_topics: actTopics,
    },
    insights,
  };
}
