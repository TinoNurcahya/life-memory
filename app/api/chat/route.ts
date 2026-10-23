import { NextResponse } from "next/server";
import { z } from "zod";
import { generateChatResponse } from "@/lib/ai/chat";
import { extractActivities } from "@/lib/ai/gemini-extractor";
import { getJimmyDemoItems } from "@/lib/demo/jimmy";
import { getArchiveData, type TimelineItem } from "@/lib/queries/activities";
import { createClient } from "@/lib/supabase/server";
import { addDaysToDate } from "@/lib/utils/dates";
import { isGenericPlace, normalizeEntityName, normalizeTopicName } from "@/lib/utils/normalization";
import { logger } from "@/lib/logger";

const ChatRequestSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .optional()
    .default([]),
  demo: z.string().optional(),
  sessionId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = ChatRequestSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request format", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { message, history, demo, sessionId } = parsed.data;
    const isDemo = demo === "jimmy";

    let items: TimelineItem[];
    let userId: string | null = null;
    let supabase;
    let targetSessionId = sessionId;

    if (isDemo) {
      items = getJimmyDemoItems();
    } else {
      supabase = await createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return NextResponse.json(
          { error: "Authentication required to chat in personal archive" },
          { status: 401 }
        );
      }
      userId = user.id;
      const archiveData = await getArchiveData();
      items = archiveData.items;

      // Handle session persistence
      if (!targetSessionId) {
        const title = message.slice(0, 36).trim();
        const { data: newSession } = await supabase
          .from("chat_sessions")
          .insert({ user_id: userId, title: title || "Percakapan Baru" })
          .select("id")
          .single();
        if (newSession) targetSessionId = newSession.id;
      } else {
        await supabase
          .from("chat_sessions")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", targetSessionId)
          .eq("user_id", userId);
      }
    }

    // Auto-Save Intent Detection
    const saveIntentPattern = /(?:catat(?:kan)?|tolong catat|simpan ke catatan|buat(?:kan)? catatan|jadikan catatan)\s*[:,\-]?\s*(.+)/i;
    const saveMatch = message.match(saveIntentPattern);
    let savedItem: TimelineItem | null = null;
    let savedSummary: string | null = null;

    if (saveMatch && saveMatch[1]?.trim()) {
      const noteText = saveMatch[1].trim();
      const today = new Date().toISOString().slice(0, 10);
      try {
        const extraction = await extractActivities(noteText, today);
        const firstAct = extraction.activities[0] || {
          summary: noteText,
          source_text: noteText,
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
        savedSummary = firstAct.summary;

        if (isDemo) {
          savedItem = {
            id: `demo-note-${Date.now()}`,
            activityId: `demo-act-${Date.now()}`,
            rawText: noteText,
            summary: firstAct.summary,
            sourceText: firstAct.source_text,
            occurredAt: addDaysToDate(today, firstAct.day_offset),
            category: firstAct.category,
            status: "RESOLVED",
            eventStatus: firstAct.event_status,
            timeOfDay: firstAct.time_of_day,
            timeHint: firstAct.time_hint,
            isFirstTime: firstAct.is_first_time,
            needsReview: false,
            reviewReasons: [],
            people: firstAct.people.map((name) => ({
              id: `p-${normalizeEntityName(name)}`,
              user_id: "demo",
              name,
              normalized_name: normalizeEntityName(name),
              aliases: [],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })),
            places: firstAct.places.map((name) => ({
              id: `pl-${normalizeEntityName(name)}`,
              user_id: "demo",
              name,
              normalized_name: normalizeEntityName(name),
              aliases: [],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })),
            topics: firstAct.topics.map((name) => ({
              id: `t-${normalizeTopicName(name)}`,
              user_id: "demo",
              name,
              normalized_name: normalizeTopicName(name),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })),
            imageUrls: [],
          };
          if (savedItem) items = [savedItem, ...items];
        } else if (supabase && userId) {
          const { data: act } = await supabase.from("activities").insert({
            user_id: userId,
            raw_text: noteText,
            client_entry_date: today,
            status: "RESOLVED",
          }).select("id").single();

          if (act) {
            const occurredAt = addDaysToDate(today, firstAct.day_offset);
            const { data: det } = await supabase.from("activity_details").insert({
              activity_id: act.id,
              user_id: userId,
              summary: firstAct.summary,
              source_text: firstAct.source_text || noteText,
              category: firstAct.category,
              occurred_at: occurredAt,
              day_offset: firstAct.day_offset,
              time_of_day: firstAct.time_of_day,
              time_hint: firstAct.time_hint,
              event_status: firstAct.event_status,
              is_first_time: firstAct.is_first_time,
              needs_review: false,
              review_reasons: [],
            }).select("id").single();

            if (det) {
              for (const [kind, names, table, junction, fKey] of [
                ["people", firstAct.people, "people", "activity_people", "person_id"],
                ["places", firstAct.places, "places", "activity_places", "place_id"],
                ["topics", firstAct.topics, "topics", "activity_topics", "topic_id"],
              ] as const) {
                for (const name of names) {
                  const normalized = kind === "topics" ? normalizeTopicName(name) : normalizeEntityName(name);
                  if (kind === "places" && isGenericPlace(normalized)) continue;
                  const { data: ent } = await supabase.from(table).upsert(
                    { user_id: userId, name, normalized_name: normalized, aliases: [] },
                    { onConflict: "user_id,normalized_name" }
                  ).select("id").single();
                  if (ent) {
                    await supabase.from(junction).insert({
                      activity_detail_id: det.id,
                      [fKey]: ent.id,
                      user_id: userId,
                    });
                  }
                }
              }
            }
          }
        }
      } catch (saveErr) {
        logger.warn("Could not auto-save note from chat:", { error: String(saveErr) });
      }
    }

    const result = await generateChatResponse({
      message,
      history,
      items,
    });

    let finalContent = result.content;
    if (savedSummary) {
      finalContent = `[Catatan berhasil disimpan ke Timeline]\nRingkasan: "${savedSummary}"\n\n` + result.content;
    }

    // In authenticated live mode, save both user and assistant turns
    if (supabase && userId && !isDemo) {
      try {
        await supabase.from("chat_messages").insert([
          { session_id: targetSessionId, user_id: userId, role: "user", content: message },
          { session_id: targetSessionId, user_id: userId, role: "assistant", content: finalContent },
        ]);
      } catch (dbErr) {
        logger.warn("Could not persist chat message to Supabase:", { error: String(dbErr) });
      }
    }

    return NextResponse.json({
      success: true,
      sessionId: targetSessionId || null,
      savedItem,
      message: {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: finalContent,
        modelUsed: result.modelUsed,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error("Chat API route error:", { error: String(error) });
    return NextResponse.json(
      {
        error: "Failed to generate chat response",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
