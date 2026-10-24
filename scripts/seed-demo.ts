import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { JIMMY_DEMO_ITEMS } from "../lib/demo/jimmy.ts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const userId = process.env.JIMMY_DEMO_USER_ID;

if (!url || !serviceKey || !userId) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and JIMMY_DEMO_USER_ID before seeding.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
const prefix = "Jimmy demo · ";

async function main() {
  const { data: profile } = await supabase.from("profiles").select("id").eq("id", userId).maybeSingle();
  if (!profile) throw new Error(`No profile exists for ${userId}. Create the demo account first.`);
  const { data: oldRows, error: oldError } = await supabase.from("activities").select("id").eq("user_id", userId).like("raw_text", `${prefix}%`);
  if (oldError) throw oldError;
  if (oldRows?.length) {
    const { error } = await supabase.from("activities").delete().in("id", oldRows.map((row) => row.id));
    if (error) throw error;
  }

  const entityIds = new Map<string, string>();
  for (const item of JIMMY_DEMO_ITEMS) {
    const activityId = randomUUID();
    const { error: activityError } = await supabase.from("activities").insert({ id: activityId, user_id: userId, raw_text: prefix + item.summary, client_entry_date: item.occurredAt, status: "RESOLVED" });
    if (activityError) throw activityError;
    const detailId = randomUUID();
    const { error: detailError } = await supabase.from("activity_details").insert({ id: detailId, activity_id: activityId, user_id: userId, summary: item.summary, source_text: item.sourceText, category: item.category, occurred_at: item.occurredAt, day_offset: 0, time_of_day: item.timeOfDay, event_status: item.eventStatus, is_first_time: item.isFirstTime, needs_review: false, review_reasons: [] });
    if (detailError) throw detailError;
    for (const [kind, values] of [["people", item.people], ["places", item.places], ["topics", item.topics]] as const) {
      const table = kind;
      const junction = kind === "people" ? "activity_people" : kind === "places" ? "activity_places" : "activity_topics";
      const foreignKey = kind === "people" ? "person_id" : kind === "places" ? "place_id" : "topic_id";
      for (const value of values) {
        const key = `${kind}:${value.normalized_name}`;
        let entityId = entityIds.get(key);
        if (!entityId) {
          const { data: entity, error: entityError } = await supabase.from(table).upsert({ user_id: userId, name: value.name, normalized_name: value.normalized_name, aliases: "aliases" in value ? value.aliases : undefined }, { onConflict: "user_id,normalized_name" }).select("id").single();
          if (entityError) throw entityError;
          entityId = entity.id;
          entityIds.set(key, entity.id);
        }
        const { error: relationError } = await supabase.from(junction).insert({ activity_detail_id: detailId, [foreignKey]: entityId, user_id: userId });
        if (relationError) throw relationError;
      }
    }
  }
  console.log(`Seeded ${JIMMY_DEMO_ITEMS.length} deterministic Jimmy activities for ${userId}.`);
}

main().catch((error) => { console.error(error); process.exit(1); });
