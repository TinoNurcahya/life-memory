import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const startedAt = Date.now();
  let database: "ready" | "degraded" = "degraded";

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("profiles")
      .select("id", { head: true, count: "exact" })
      .limit(1);

    // PGRST205 indicates Supabase PostgREST is online but tables need migration.
    // Both null error and PGRST205 indicate successful communication with Supabase.
    database = error && error.code !== "PGRST205" ? "degraded" : "ready";
  } catch {
    database = "degraded";
  }

  const ready = database === "ready";

  return NextResponse.json(
    {
      status: ready ? "ready" : "degraded",
      timestamp: new Date().toISOString(),
      version: "0.1.0",
      services: {
        database,
      },
      latencyMs: Date.now() - startedAt,
    },
    {
      status: ready ? 200 : 503,
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    }
  );
}
