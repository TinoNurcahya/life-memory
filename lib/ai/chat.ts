import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { logger } from "../logger.ts";
import type { TimelineItem } from "../queries/activities.ts";

export interface ChatHistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponseResult {
  content: string;
  modelUsed: string;
  latencyMs: number;
}

export function buildMemoryContext(items: TimelineItem[]): string {
  if (!items || items.length === 0) {
    return "Belum ada catatan memori yang tersimpan.";
  }

  // Format into compact, chronological reference lines
  const sorted = [...items].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  const lines = sorted.map((item) => {
    const peopleStr = item.people && item.people.length ? ` | Orang: ${item.people.map((p) => p.name).join(", ")}` : "";
    const placesStr = item.places && item.places.length ? ` | Tempat: ${item.places.map((p) => p.name).join(", ")}` : "";
    const topicsStr = item.topics && item.topics.length ? ` | Topik: ${item.topics.map((t) => t.name).join(", ")}` : "";
    const firstTimeStr = item.isFirstTime ? " [PERTAMA KALI]" : "";
    return `- [${item.occurredAt}] (${item.category}${firstTimeStr}) ${item.summary}${peopleStr}${placesStr}${topicsStr}`;
  });

  return lines.join("\n");
}

const SYSTEM_INSTRUCTION = `Kamu adalah Sahabat Jurnal Interaktif Dua Arah di Life Memory.
Tugasmu adalah berbincang dengan pengguna mengenai perjalanan hidup, aktivitas, dan kenangannya berdasarkan catatan memori yang disediakan.

Prinsip & Persona:
1. Nada Suara: Hangat, empatik, introspektif, dan alami dalam bahasa Indonesia. Jangan terdengar seperti robot korporat atau asisten yang kaku.
2. Grounding Memori:
   - Gunakan HANYA informasi yang benar-benar tercantum di daftar memori pengguna.
   - Cantumkan rujukan tanggal konkret dan konteks nyata (misal: "Berdasarkan catatanmu pada 15 Oktober 2026, kamu...").
   - Jangan pernah mengarang peristiwa, orang, atau tempat yang tidak ada di catatan.
3. Keterbatasan Informasi:
   - Jika pengguna menanyakan sesuatu yang tidak ada di catatan, katakan dengan ramah dan jujur: "Aku belum melihat catatan tentang itu di Life Memory-mu. Apakah kamu ingin mencatat momen itu sekarang?"
4. Fitur Introspektif Dua Arah:
   - Setelah menjawab pertanyaan pengguna, WAJIB akhiri dengan 1 pertanyaan reflektif yang hangat dan relevan.
   - Pertanyaan ini bertujuan mengajak pengguna merenungkan makna dari momen tersebut, merasakan emosinya, atau memancing mereka bercerita lebih banyak.`;

export async function generateChatResponse(params: {
  message: string;
  history?: ChatHistoryMessage[];
  items: TimelineItem[];
}): Promise<ChatResponseResult> {
  const { message, history = [], items } = params;
  const memoryContext = buildMemoryContext(items);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    logger.warn("Missing GEMINI_API_KEY, using deterministic fallback response.");
    return buildDeterministicFallback(message, items);
  }

  const ai = new GoogleGenAI({ apiKey });
  const models = ["gemini-3.5-flash-lite", "gemini-3.8-flash"];
  const started = Date.now();

  const conversationContext = history.length > 0
    ? history.slice(-6).map((h) => `${h.role === "user" ? "Pengguna" : "Sahabat Memori"}: ${h.content}`).join("\n")
    : "";

  const prompt = `Konteks Riwayat Memori Pengguna:
${memoryContext}

${conversationContext ? `Riwayat Percakapan Sebelumnya:\n${conversationContext}\n` : ""}
Pesan Terkini dari Pengguna:
"${message}"

Tolong jawab dengan gaya Sahabat Jurnal Interaktif Dua Arah. Ingat untuk menyertakan pertanyaan refleksi balik di akhir.`;

  let lastError: unknown = null;

  for (const model of models) {
    try {
      logger.info(`Sending chat query to model ${model}`, { messageLength: message.length });
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
          maxOutputTokens: 1024,
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
        },
      });

      const text = response.text?.trim();
      if (text) {
        return {
          content: text,
          modelUsed: model,
          latencyMs: Date.now() - started,
        };
      }
    } catch (err) {
      lastError = err;
      logger.warn(`Model ${model} failed for chat query:`, { error: String(err) });
    }
  }

  logger.error("All Gemini models failed for chat, using deterministic fallback:", { error: String(lastError) });
  return buildDeterministicFallback(message, items);
}

function buildDeterministicFallback(message: string, items: TimelineItem[]): ChatResponseResult {
  const query = message.toLowerCase();
  const matched = items.filter((item) =>
    item.summary.toLowerCase().includes(query) ||
    item.people.some((p) => query.includes(p.name.toLowerCase())) ||
    item.places.some((p) => query.includes(p.name.toLowerCase())) ||
    item.topics.some((t) => query.includes(t.name.toLowerCase()))
  );

  if (matched.length > 0) {
    const latest = matched[matched.length - 1];
    return {
      content: `Aku menemukan catatan yang relevan: pada tanggal ${latest.occurredAt}, kamu mencatat: "${latest.summary}". Apa hal yang paling berkesan bagimu saat momen itu terjadi?`,
      modelUsed: "deterministic-fallback",
      latencyMs: 15,
    };
  }

  const latestAny = items[items.length - 1];
  const refText = latestAny ? `Catatan terakhirmu adalah tentang "${latestAny.summary}" pada ${latestAny.occurredAt}.` : "";
  return {
    content: `Aku telah memeriksa catatanmu, namun belum menemukan detail khusus tentang hal itu. ${refText} Bagaimana harimu hari ini, ada yang ingin kamu bagikan atau renungkan bersama?`,
    modelUsed: "deterministic-fallback",
    latencyMs: 10,
  };
}
