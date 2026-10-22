import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({ raw_text: z.string().trim().min(1).max(10_000), client_entry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional() });

// Compatibility endpoint for non-React clients. The caller must then POST /api/extract with the returned id.
export async function POST(request: Request) {
  const body = schema.safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "raw_text is required" }, { status: 400 });
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  const { data, error } = await supabase.from("activities").insert({ user_id: userData.user.id, raw_text: body.data.raw_text, client_entry_date: body.data.client_entry_date ?? new Date().toISOString().slice(0, 10), status: "PENDING" }).select("id").single();
  if (error || !data) return NextResponse.json({ error: error?.message ?? "Could not save activity" }, { status: 500 });
  return NextResponse.json({ success: true, activityId: data.id, status: "PENDING", next: "/api/extract" }, { status: 202 });
}
