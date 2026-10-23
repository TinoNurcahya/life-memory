import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

const createSessionSchema = z.object({
  title: z.string().trim().max(100).optional(),
  demo: z.string().optional(),
});

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const isDemo = url.searchParams.get("demo") === "jimmy";

    if (isDemo) {
      // Return pre-seeded sample session for Jimmy
      return NextResponse.json({
        success: true,
        sessions: [
          {
            id: "demo-session-ethan",
            user_id: "demo",
            title: "Refleksi Kolaborasi Capstone & Ethan",
            created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
            updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
          },
        ],
      });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: sessions, error } = await supabase
      .from("chat_sessions")
      .select("id, user_id, title, created_at, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, sessions: sessions || [] });
  } catch (error) {
    logger.error("Error fetching chat sessions:", { error: String(error) });
    return NextResponse.json({ error: "Failed to fetch chat sessions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json().catch(() => ({}));
    const parsed = createSessionSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { title = "Percakapan Baru", demo } = parsed.data;
    const isDemo = demo === "jimmy";

    if (isDemo) {
      const now = new Date().toISOString();
      return NextResponse.json({
        success: true,
        session: {
          id: `demo-session-${Date.now()}`,
          user_id: "demo",
          title,
          created_at: now,
          updated_at: now,
        },
      });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: session, error } = await supabase
      .from("chat_sessions")
      .insert({ user_id: user.id, title })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, session });
  } catch (error) {
    logger.error("Error creating chat session:", { error: String(error) });
    return NextResponse.json({ error: "Failed to create chat session" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const isDemo = url.searchParams.get("demo") === "jimmy";

    if (!id) {
      return NextResponse.json({ error: "Missing session ID" }, { status: 400 });
    }

    if (isDemo) {
      return NextResponse.json({ success: true });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { error } = await supabase
      .from("chat_sessions")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Error deleting chat session:", { error: String(error) });
    return NextResponse.json({ error: "Failed to delete chat session" }, { status: 500 });
  }
}
