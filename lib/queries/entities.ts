import { createClient } from "@/lib/supabase/server";
import { JIMMY_DEMO_ITEMS } from "@/lib/demo/jimmy";
import type { Person, Place, Topic } from "@/types/database";

export type EntityKind = "people" | "places" | "topics";
export type DirectoryEntity = (Person | Place | Topic) & { activity_count: number; first_seen_at: string | null; last_seen_at: string | null };

function demoEntities(kind: EntityKind): DirectoryEntity[] {
  const map = new Map<string, DirectoryEntity>();
  for (const item of JIMMY_DEMO_ITEMS.filter((value) => value.eventStatus === "completed")) {
    const values = kind === "people" ? item.people : kind === "places" ? item.places : item.topics;
    for (const value of values) {
      const existing = map.get(value.id);
      if (existing) {
        existing.activity_count += 1;
        existing.first_seen_at = existing.first_seen_at && existing.first_seen_at < item.occurredAt ? existing.first_seen_at : item.occurredAt;
        existing.last_seen_at = existing.last_seen_at && existing.last_seen_at > item.occurredAt ? existing.last_seen_at : item.occurredAt;
      } else {
        map.set(value.id, { ...value, activity_count: 1, first_seen_at: item.occurredAt, last_seen_at: item.occurredAt });
      }
    }
  }
  return [...map.values()].sort((a, b) => b.activity_count - a.activity_count || a.name.localeCompare(b.name));
}

export async function getEntityDirectory(kind: EntityKind, demo = false): Promise<{ items: DirectoryEntity[]; error: string | null }> {
  if (demo) return { items: demoEntities(kind), error: null };
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { items: [], error: "Your session expired. Please sign in again." };
  const view = kind === "people" ? "v_people_with_stats" : kind === "places" ? "v_places_with_stats" : "v_topics_with_stats";
  const orderColumn = kind === "people" ? "interaction_count" : kind === "places" ? "visit_count" : "activity_count";
  const { data, error } = await supabase.from(view).select("*").eq("user_id", userData.user.id).order(orderColumn, { ascending: false });
  if (error) return { items: [], error: error.message };
  return { items: (data ?? []).map((row) => ({ ...row, activity_count: row.activity_count ?? row.interaction_count ?? row.visit_count ?? 0, first_seen_at: row.first_seen_at ?? row.first_visit_at ?? null, last_seen_at: row.last_seen_at ?? row.last_visit_at ?? null })) as DirectoryEntity[], error: null };
}

export async function getEntityDetail(kind: EntityKind, id: string, demo = false) {
  const directory = await getEntityDirectory(kind, demo);
  const entity = directory.items.find((item) => item.id === id) ?? null;
  if (!entity) return { entity: null, memories: [], error: directory.error };
  if (demo) {
    const memories = JIMMY_DEMO_ITEMS.filter((item) => item.eventStatus === "completed" && (kind === "people" ? item.people : kind === "places" ? item.places : item.topics).some((value) => value.id === id));
    return { entity, memories, error: null };
  }
  const supabase = await createClient();
  const relation = kind === "people" ? "activity_people" : kind === "places" ? "activity_places" : "activity_topics";
  const foreignKey = kind === "people" ? "person_id" : kind === "places" ? "place_id" : "topic_id";
  const { data, error } = await supabase.from(relation).select("activity_detail_id, activity_details!inner(id, summary, source_text, occurred_at, category, event_status)").eq(foreignKey, id).eq("user_id", entity.user_id).eq("activity_details.event_status", "completed").order("activity_details(occurred_at)", { ascending: false });
  if (error) return { entity, memories: [], error: error.message };
  return { entity, memories: (data ?? []).map((row) => row.activity_details).filter(Boolean) as unknown as Array<{ id: string; summary: string; source_text: string; occurred_at: string; category: string; event_status: string }>, error: null };
}
