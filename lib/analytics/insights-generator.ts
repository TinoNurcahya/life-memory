import { generateDeterministicInsights, insightToRecord } from "./insights.ts";
import type { AnalyticsActivity } from "./types.ts";
import type { Insight } from "../../types/database.ts";
import { createClient } from "../supabase/server.ts";

export interface GetInsightsOptions {
  userId?: string;
  isDemo?: boolean;
  asOf?: string;
}

/**
 * Derives and synchronizes deterministic insights for a user.
 * In demo mode, returns 100% in-memory records with zero DB writes.
 * In authenticated mode, deduplicates and persists new patterns to Supabase 'insights'.
 */
export async function getOrGenerateInsights(
  activities: AnalyticsActivity[],
  options: GetInsightsOptions = {}
): Promise<Insight[]> {
  const { userId = "demo", isDemo = false, asOf = new Date().toISOString().slice(0, 10) } = options;

  // 1. Generate fresh deterministic insights
  const derived = generateDeterministicInsights(activities, asOf);

  // 2. In demo mode, return in-memory mapped records
  if (isDemo || userId === "demo") {
    return derived.map((item, index) => insightToRecord(item, index) as Insight);
  }

  // 3. In authenticated mode, synchronize with Supabase
  try {
    const supabase = await createClient();

    // Query existing pattern insights
    const { data: existing, error: queryError } = await supabase
      .from("insights")
      .select("*")
      .eq("user_id", userId)
      .in("type", ["first_time", "recurring", "change"])
      .order("created_at", { ascending: false });

    if (queryError) {
      console.warn("[InsightsGenerator] Supabase query warning, falling back to derived:", queryError.message);
      return derived.map((item, index) => insightToRecord(item, index) as Insight);
    }

    // Build deduplication index from existing records
    const existingKeys = new Set<string>();
    for (const row of existing || []) {
      const meta = (row.metadata as Record<string, unknown>) || {};
      const key = `${row.type}:${meta.key ?? ""}:${meta.month ?? ""}`;
      existingKeys.add(key);
    }

    // Identify novel insights to persist
    const novelInsights = derived.filter((item) => {
      const key = `${item.type}:${item.metadata?.key ?? ""}:${item.metadata?.month ?? ""}`;
      return !existingKeys.has(key);
    });

    if (novelInsights.length > 0) {
      const insertRows = novelInsights.map((item) => ({
        user_id: userId,
        type: item.type,
        title: item.title,
        description: item.description,
        category: item.category,
        evidence: item.evidence,
        is_read: false,
        is_suppressed: false,
        metadata: item.metadata || {},
      }));

      const { data: inserted, error: insertError } = await supabase
        .from("insights")
        .insert(insertRows)
        .select("*");

      if (insertError) {
        console.warn("[InsightsGenerator] Failed to persist novel insights:", insertError.message);
      } else if (inserted) {
        return [...inserted, ...(existing || [])] as Insight[];
      }
    }

    return (existing && existing.length > 0
      ? existing
      : derived.map((item, index) => insightToRecord(item, index))) as Insight[];
  } catch (err) {
    console.warn("[InsightsGenerator] Fallback to in-memory on error:", err);
    return derived.map((item, index) => insightToRecord(item, index) as Insight);
  }
}
