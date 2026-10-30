"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ActivityCategory, ActionResult } from "@/types/database";

const categorySchema = z.enum(["career", "social", "health", "learning", "leisure", "routine", "other"]);
const createSchema = z.object({
  rawText: z.string().trim().min(1).max(10_000),
  clientEntryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
const entityKindSchema = z.enum(["people", "places", "topics"]);
const entityNameSchema = z.string().trim().min(1).max(120);

export async function createPendingActivity(input: unknown): Promise<ActionResult<{ activityId: string; rawText: string; clientEntryDate: string }>> {
  const parsed = createSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Enter a valid memory and date.", code: "INVALID_INPUT" };

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { success: false, error: "Please sign in to save a memory.", code: "UNAUTHORIZED" };

  const { data, error } = await supabase
    .from("activities")
    .insert({ user_id: userData.user.id, raw_text: parsed.data.rawText, client_entry_date: parsed.data.clientEntryDate, status: "PENDING" })
    .select("id")
    .single();

  if (error || !data) return { success: false, error: error?.message ?? "Could not save this memory.", code: "DATABASE_ERROR" };
  return { success: true, data: { activityId: data.id, rawText: parsed.data.rawText, clientEntryDate: parsed.data.clientEntryDate } };
}

export async function updateActivityCategory(detailId: string, category: ActivityCategory): Promise<ActionResult> {
  const parsed = categorySchema.safeParse(category);
  if (!parsed.success) return { success: false, error: "Invalid category.", code: "INVALID_INPUT" };
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { success: false, error: "Please sign in again.", code: "UNAUTHORIZED" };
  const { error } = await supabase.from("activity_details").update({ category: parsed.data }).eq("id", detailId).eq("user_id", userData.user.id);
  return error ? { success: false, error: error.message, code: "DATABASE_ERROR" } : { success: true, data: undefined };
}

export async function removeActivityEntity(detailId: string, kind: "people" | "places" | "topics", entityId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { success: false, error: "Please sign in again.", code: "UNAUTHORIZED" };
  const table = kind === "people" ? "activity_people" : kind === "places" ? "activity_places" : "activity_topics";
  const key = kind === "people" ? "person_id" : kind === "places" ? "place_id" : "topic_id";
  const { error } = await supabase.from(table).delete().eq("activity_detail_id", detailId).eq(key, entityId).eq("user_id", userData.user.id);
  return error ? { success: false, error: error.message, code: "DATABASE_ERROR" } : { success: true, data: undefined };
}

export async function addActivityEntity(detailId: string, kind: "people" | "places" | "topics", entityName: string): Promise<ActionResult<{ entityId: string }>> {
  const parsedKind = entityKindSchema.safeParse(kind);
  const parsedName = entityNameSchema.safeParse(entityName);
  if (!parsedKind.success || !parsedName.success) return { success: false, error: "Enter a valid entity name.", code: "INVALID_INPUT" };
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { success: false, error: "Please sign in again.", code: "UNAUTHORIZED" };
  const { data: detail } = await supabase.from("activity_details").select("id").eq("id", detailId).eq("user_id", userData.user.id).maybeSingle();
  if (!detail) return { success: false, error: "Memory not found.", code: "NOT_FOUND" };
  const table = parsedKind.data;
  const key = parsedKind.data === "people" ? "person_id" : parsedKind.data === "places" ? "place_id" : "topic_id";
  const normalizedName = parsedName.data.toLowerCase().replace(/\s+/g, " ");
  const { data: entity, error: entityError } = await supabase.from(table).upsert({ user_id: userData.user.id, name: parsedName.data, normalized_name: normalizedName }, { onConflict: "user_id,normalized_name" }).select("id").single();
  if (entityError || !entity) return { success: false, error: entityError?.message ?? "Could not create entity.", code: "DATABASE_ERROR" };
  const junction = parsedKind.data === "people" ? "activity_people" : parsedKind.data === "places" ? "activity_places" : "activity_topics";
  const { error: relationError } = await supabase.from(junction).upsert({ activity_detail_id: detailId, [key]: entity.id, user_id: userData.user.id }, { onConflict: `activity_detail_id,${key}` });
  return relationError ? { success: false, error: relationError.message, code: "DATABASE_ERROR" } : { success: true, data: { entityId: entity.id } };
}

export async function mergeEntity(kind: "people" | "places" | "topics", sourceId: string, targetId: string): Promise<ActionResult> {
  const parsedKind = entityKindSchema.safeParse(kind);
  if (!parsedKind.success || sourceId === targetId) return { success: false, error: "Choose two different entities.", code: "INVALID_INPUT" };
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { success: false, error: "Please sign in again.", code: "UNAUTHORIZED" };
  const table = parsedKind.data;
  const junction = parsedKind.data === "people" ? "activity_people" : parsedKind.data === "places" ? "activity_places" : "activity_topics";
  const key = parsedKind.data === "people" ? "person_id" : parsedKind.data === "places" ? "place_id" : "topic_id";
  const [{ data: source }, { data: target }] = await Promise.all([
    supabase.from(table).select("id").eq("id", sourceId).eq("user_id", userData.user.id).maybeSingle(),
    supabase.from(table).select("id").eq("id", targetId).eq("user_id", userData.user.id).maybeSingle(),
  ]);
  if (!source || !target) return { success: false, error: "Source or target entity not found.", code: "NOT_FOUND" };
  const { data: sourceRows, error: sourceError } = await supabase.from(junction).select("activity_detail_id").eq(key, sourceId).eq("user_id", userData.user.id);
  if (sourceError) return { success: false, error: sourceError.message, code: "DATABASE_ERROR" };
  if ((sourceRows ?? []).length) {
    const rows = sourceRows.map((row) => ({ activity_detail_id: row.activity_detail_id, [key]: targetId, user_id: userData.user.id }));
    const { error: upsertError } = await supabase.from(junction).upsert(rows, { onConflict: `activity_detail_id,${key}` });
    if (upsertError) return { success: false, error: upsertError.message, code: "DATABASE_ERROR" };
  }
  const { error: deleteRelationsError } = await supabase.from(junction).delete().eq(key, sourceId).eq("user_id", userData.user.id);
  if (deleteRelationsError) return { success: false, error: deleteRelationsError.message, code: "DATABASE_ERROR" };
  const { error } = await supabase.from(table).delete().eq("id", sourceId).eq("user_id", userData.user.id);
  return error ? { success: false, error: error.message, code: "DATABASE_ERROR" } : { success: true, data: undefined };
}

export async function getOrGenerateMonthlyReflection(
  targetMonth: string,
  isDemo = false,
  forceRegenerate = false
): Promise<ActionResult<import("@/lib/reflection/monthly").FormattedMonthlyEssay>> {
  // Legacy callers retain their result contract. Reading never generates or writes.
  if (!forceRegenerate) {
    const { getReflectionData } = await import("@/lib/queries/reflection");
    const result = await getReflectionData(targetMonth, isDemo);
    if (result.error) return { success: false, error: result.error, code: "DATABASE_ERROR" };
    if (!result.essay) return { success: false, error: "Belum ada memori selesai pada bulan ini.", code: "NOT_FOUND" };
    return { success: true, data: result.essay };
  }
  const { generateReflection } = await import("@/app/actions/reflection");
  const result = await generateReflection(targetMonth, isDemo);
  return result.success ? { success: true, data: result.data.essay } : result;
}

export async function deleteUserAccountAndMemories(confirmationWord: string): Promise<ActionResult> {
  if (confirmationWord !== "DELETE") {
    return {
      success: false,
      error: "Please type DELETE to confirm account deletion.",
      code: "INVALID_CONFIRMATION",
    };
  }

  const supabase = await createClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData?.user) {
    return { success: false, error: "Unauthorized. Please sign in first.", code: "UNAUTHORIZED" };
  }

  const userId = userData.user.id;
  if (userId === "demo" || userId === "demo-jimmy") {
    return { success: false, error: "Demo persona Jimmy cannot be deleted.", code: "FORBIDDEN_DEMO" };
  }

  // Delete profile which triggers CASCADE deletes across activities, details, entities, and insights
  const { error: deleteProfileError } = await supabase.from("profiles").delete().eq("id", userId);

  if (deleteProfileError) {
    // Fallback: delete activities and entities individually
    await supabase.from("activities").delete().eq("user_id", userId);
    await supabase.from("people").delete().eq("user_id", userId);
    await supabase.from("places").delete().eq("user_id", userId);
    await supabase.from("topics").delete().eq("user_id", userId);
    await supabase.from("insights").delete().eq("user_id", userId);
  }

  await supabase.auth.signOut();
  return { success: true, data: undefined };
}

