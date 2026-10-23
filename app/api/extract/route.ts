import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { extractActivities } from "@/lib/ai/gemini-extractor";
import { generateMemoryIllustration } from "@/lib/ai/image-generator";
import { addDaysToDate } from "@/lib/utils/dates";
import { isGenericPlace, normalizeEntityName, normalizeTopicName, uniqueClean } from "@/lib/utils/normalization";
import { logger } from "@/lib/logger";

const requestSchema = z.object({
  activityId: z.string().uuid(),
  imageUrls: z.array(z.string()).max(4).optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const body = requestSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "activityId is required" }, { status: 400 });

  const { data: activity, error: activityError } = await supabase
    .from("activities")
    .select("id, raw_text, client_entry_date, status")
    .eq("id", body.data.activityId)
    .eq("user_id", userData.user.id)
    .single();
  if (activityError || !activity) return NextResponse.json({ error: "Activity not found" }, { status: 404 });

  try {
    // Retries are idempotent: remove an earlier partial resolution before rebuilding it.
    await supabase.from("activity_details").delete().eq("activity_id", activity.id).eq("user_id", userData.user.id);
    const extraction = await extractActivities(activity.raw_text, activity.client_entry_date);
    const resolvedItems = extraction.activities.length ? extraction.activities : [{
      summary: activity.raw_text,
      source_text: activity.raw_text,
      category: "other" as const,
      day_offset: 0,
      time_of_day: "unknown" as const,
      time_hint: null,
      event_status: "completed" as const,
      people: [],
      places: [],
      topics: [],
      is_first_time: false,
    }];

    for (const item of resolvedItems) {
      const people = uniqueClean(item.people, normalizeEntityName);
      const places = uniqueClean(item.places, normalizeEntityName).filter((place) => !isGenericPlace(place));
      const topics = uniqueClean(item.topics, normalizeTopicName).slice(0, 3);
      const reviewReasons: string[] = [];
      const sourceText = activity.raw_text.includes(item.source_text) ? item.source_text : activity.raw_text;
      if (sourceText !== item.source_text) reviewReasons.push("source_text_not_found");
      if (!item.summary.trim()) reviewReasons.push("missing_summary");
      let finalImages = body.data.imageUrls && body.data.imageUrls.length > 0 ? body.data.imageUrls : [];
      if (finalImages.length === 0) {
        try {
          const generated = await generateMemoryIllustration(item.summary, item.category);
          finalImages = [generated.url];
        } catch {
          finalImages = [];
        }
      }

      const { data: detail, error: detailError } = await supabase.from("activity_details").insert({
        activity_id: activity.id,
        user_id: userData.user.id,
        summary: item.summary,
        source_text: sourceText,
        category: item.category,
        occurred_at: addDaysToDate(activity.client_entry_date, item.day_offset),
        day_offset: item.day_offset,
        time_of_day: item.time_of_day,
        time_hint: item.time_hint,
        event_status: item.event_status,
        is_first_time: item.is_first_time,
        needs_review: reviewReasons.length > 0,
        review_reasons: reviewReasons,
        image_urls: finalImages,
      }).select("id").single();
      if (detailError || !detail) throw detailError ?? new Error("Could not save extracted activity");

      for (const name of people) {
        const normalized = normalizeEntityName(name);
        const { data: entity, error } = await supabase.from("people").upsert({ user_id: userData.user.id, name, normalized_name: normalized }, { onConflict: "user_id,normalized_name" }).select("id").single();
        if (error || !entity) throw error ?? new Error("Could not resolve person");
        const link = await supabase.from("activity_people").insert({ activity_detail_id: detail.id, person_id: entity.id, user_id: userData.user.id });
        if (link.error) throw link.error;
      }
      for (const name of places) {
        const normalized = normalizeEntityName(name);
        const { data: entity, error } = await supabase.from("places").upsert({ user_id: userData.user.id, name, normalized_name: normalized }, { onConflict: "user_id,normalized_name" }).select("id").single();
        if (error || !entity) throw error ?? new Error("Could not resolve place");
        const link = await supabase.from("activity_places").insert({ activity_detail_id: detail.id, place_id: entity.id, user_id: userData.user.id });
        if (link.error) throw link.error;
      }
      for (const name of topics) {
        const normalized = normalizeTopicName(name);
        const { data: entity, error } = await supabase.from("topics").upsert({ user_id: userData.user.id, name, normalized_name: normalized }, { onConflict: "user_id,normalized_name" }).select("id").single();
        if (error || !entity) throw error ?? new Error("Could not resolve topic");
        const link = await supabase.from("activity_topics").insert({ activity_detail_id: detail.id, topic_id: entity.id, user_id: userData.user.id });
        if (link.error) throw link.error;
      }
    }

    const { error: updateError } = await supabase.from("activities").update({ status: "RESOLVED", ai_raw_response: extraction }).eq("id", activity.id).eq("user_id", userData.user.id);
    if (updateError) throw updateError;
    return NextResponse.json({ success: true, activityId: activity.id, extracted: resolvedItems });
  } catch (error) {
    logger.error("Activity extraction failed", error);
    await supabase.from("activities").update({ status: "FAILED" }).eq("id", activity.id).eq("user_id", userData.user.id);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Extraction failed", activityId: activity.id }, { status: 500 });
  }
}
