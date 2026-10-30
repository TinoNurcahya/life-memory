"use server";

import type { ActionResult } from "@/types/database";
import { createClient } from "@/lib/supabase/server";
import { JIMMY_DEMO_ITEMS } from "@/lib/demo/jimmy";
import { getArchiveData } from "@/lib/queries/activities";
import { validReflectionMonth } from "@/lib/reflection/monthly";
import { generateReflectionFromData, type GeneratedReflectionData } from "@/lib/reflection/service";

export async function generateReflection(month: string, demo = false): Promise<ActionResult<GeneratedReflectionData>> {
  if (!validReflectionMonth(month)) return { success: false, error: "Pilih bulan yang valid.", code: "INVALID_INPUT" };
  if (demo) return generateReflectionFromData(month, true, { readArchive: async () => ({ items: JIMMY_DEMO_ITEMS, error: null }) });
  try {
    const supabase = await createClient();
    const { data: auth, error } = await supabase.auth.getUser();
    if (error || !auth.user) return { success: false, error: "Masuk kembali untuk menyusun refleksi.", code: "UNAUTHORIZED" };
    const userId = auth.user.id;
    return await generateReflectionFromData(month, false, {
      readArchive: getArchiveData,
      generate: process.env.GEMINI_API_KEY ? async payload => {
        const { generateMonthlyReflection } = await import("@/lib/ai/reflection");
        return generateMonthlyReflection(payload);
      } : undefined,
      save: async (targetMonth, essay) => {
        const { error: saveError } = await supabase.from("insights").insert({
          user_id: userId, type: "reflection", title: essay.title,
          description: essay.paragraphs.map(paragraph => paragraph.text).join("\n\n"),
          evidence: essay.bibliography.map(footnote => ({ activity_detail_id: footnote.evidenceId, occurred_at: footnote.evidence.date, snippet: footnote.evidence.summary })),
          metadata: { month: targetMonth, formatted: essay, modelUsed: essay.modelUsed ?? "deterministic" },
        });
        return { error: saveError?.message ?? null };
      },
    });
  } catch {
    return { success: false, error: "Refleksi belum bisa disusun. Coba lagi sebentar lagi.", code: "DATABASE_ERROR" };
  }
}
