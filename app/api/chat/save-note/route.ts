import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { extractActivities } from "@/lib/ai/gemini-extractor";
import { addDaysToDate } from "@/lib/utils/dates";
import { isGenericPlace, normalizeEntityName, normalizeTopicName } from "@/lib/utils/normalization";
import { logger } from "@/lib/logger";
import type { TimelineItem } from "@/lib/queries/activities";

const saveNoteSchema = z.object({
  text: z.string().trim().min(1, "Text cannot be empty").max(10_000),
  date: z.string().optional(),
  demo: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json().catch(() => null);
    const parsed = saveNoteSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { text, demo } = parsed.data;
    const isDemo = demo === "jimmy";
    const today = new Date().toISOString().slice(0, 10);
    const date = parsed.data.date || today;

    // Run extraction using Gemini
    const extraction = await extractActivities(text, date);
    const firstActivity = extraction.activities[0] || {
      summary: text,
      source_text: text,
      category: "other" as const,
      day_offset: 0,
      time_of_day: "unknown" as const,
      time_hint: null,
      event_status: "completed" as const,
      people: [],
      places: [],
      topics: [],
      is_first_time: false,
    };

    if (isDemo) {
      // In demo mode, construct a full TimelineItem to return to client
      const demoItem: TimelineItem = {
        id: `demo-note-${Date.now()}`,
        activityId: `demo-act-${Date.now()}`,
        rawText: text,
        summary: firstActivity.summary,
        sourceText: firstActivity.source_text,
        occurredAt: addDaysToDate(date, firstActivity.day_offset),
        category: firstActivity.category,
        status: "RESOLVED",
        eventStatus: firstActivity.event_status,
        timeOfDay: firstActivity.time_of_day,
        timeHint: firstActivity.time_hint,
        isFirstTime: firstActivity.is_first_time,
        needsReview: false,
        reviewReasons: [],
        people: firstActivity.people.map((name) => ({
          id: `p-${normalizeEntityName(name)}`,
          user_id: "demo",
          name,
          normalized_name: normalizeEntityName(name),
          aliases: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })),
        places: firstActivity.places.map((name) => ({
          id: `pl-${normalizeEntityName(name)}`,
          user_id: "demo",
          name,
          normalized_name: normalizeEntityName(name),
          aliases: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })),
        topics: firstActivity.topics.map((name) => ({
          id: `t-${normalizeTopicName(name)}`,
          user_id: "demo",
          name,
          normalized_name: normalizeTopicName(name),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })),
      };

      return NextResponse.json({
        success: true,
        isDemo: true,
        item: demoItem,
        summary: firstActivity.summary,
        category: firstActivity.category,
      });
    }

    // Authenticated live mode: Save directly to Supabase
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const userId = userData.user.id;

    // 1. Insert main activity
    const { data: activity, error: actError } = await supabase
      .from("activities")
      .insert({
        user_id: userId,
        raw_text: text,
        client_entry_date: date,
        status: "RESOLVED",
      })
      .select("id")
      .single();

    if (actError || !activity) {
      throw new Error(actError?.message || "Could not insert activity");
    }

    // 2. Insert activity details
    const occurredAt = addDaysToDate(date, firstActivity.day_offset);
    const { data: detail, error: detailError } = await supabase
      .from("activity_details")
      .insert({
        activity_id: activity.id,
        user_id: userId,
        summary: firstActivity.summary,
        source_text: firstActivity.source_text || text,
        category: firstActivity.category,
        occurred_at: occurredAt,
        day_offset: firstActivity.day_offset,
        time_of_day: firstActivity.time_of_day,
        time_hint: firstActivity.time_hint,
        event_status: firstActivity.event_status,
        is_first_time: firstActivity.is_first_time,
        needs_review: false,
        review_reasons: [],
      })
      .select("id")
      .single();

    if (detailError || !detail) {
      throw new Error(detailError?.message || "Could not insert activity details");
    }

    // 3. Insert and link entities
    for (const [kind, names, table, junction, fKey] of [
      ["people", firstActivity.people, "people", "activity_people", "person_id"],
      ["places", firstActivity.places, "places", "activity_places", "place_id"],
      ["topics", firstActivity.topics, "topics", "activity_topics", "topic_id"],
    ] as const) {
      for (const name of names) {
        const normalized = kind === "topics" ? normalizeTopicName(name) : normalizeEntityName(name);
        if (kind === "places" && isGenericPlace(normalized)) continue;

        const { data: entity } = await supabase
          .from(table)
          .upsert(
            { user_id: userId, name, normalized_name: normalized, aliases: [] },
            { onConflict: "user_id,normalized_name" }
          )
          .select("id")
          .single();

        if (entity) {
          await supabase.from(junction).insert({
            activity_detail_id: detail.id,
            [fKey]: entity.id,
            user_id: userId,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      isDemo: false,
      activityId: activity.id,
      detailId: detail.id,
      summary: firstActivity.summary,
      category: firstActivity.category,
    });
  } catch (error) {
    logger.error("Save note from chat error:", { error: String(error) });
    return NextResponse.json(
      { error: "Could not save note to timeline", details: String(error) },
      { status: 500 }
    );
  }
}
