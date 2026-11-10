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
    return "No memories have been saved yet.";
  }

  // Format into compact, chronological reference lines
  const sorted = [...items].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  const lines = sorted.map((item) => {
    const peopleStr = item.people && item.people.length ? ` | People: ${item.people.map((p) => p.name).join(", ")}` : "";
    const placesStr = item.places && item.places.length ? ` | Places: ${item.places.map((p) => p.name).join(", ")}` : "";
    const topicsStr = item.topics && item.topics.length ? ` | Topics: ${item.topics.map((t) => t.name).join(", ")}` : "";
    const firstTimeStr = item.isFirstTime ? " [FIRST TIME]" : "";
    return `- [${item.occurredAt}] (${item.category}${firstTimeStr}) ${item.summary}${peopleStr}${placesStr}${topicsStr}`;
  });

  return lines.join("\n");
}

const SYSTEM_INSTRUCTION = `You are the Interactive Two-Way Journal Companion for Life Memory.
Your role is to converse with the user about their life journey, activities, and memories grounded strictly in the provided memory archive.

Principles & Persona:
1. Voice & Tone: Warm, empathetic, introspective, and natural in English. Never sound like a corporate robot or a stiff assistant.
2. Memory Grounding:
   - Use ONLY information explicitly present in the user's memory archive.
   - Cite concrete dates and real context (e.g., "Based on your memory from 15 October 2026, you...").
   - Never invent events, people, or places that are not in the archive.
3. Handling Missing Information:
   - If the user asks about something not in the archive, say warmly and honestly: "I don't see a memory about that in your Life Memory archive yet. Would you like to record that moment now?"
4. Two-Way Introspective Prompt:
   - After answering the user's question, ALWAYS conclude with 1 warm, relevant reflective question.
   - This question should invite the user to reflect on the meaning of that moment, revisit how it felt, or share more of the story.`;

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
    ? history.slice(-6).map((h) => `${h.role === "user" ? "User" : "Memory Companion"}: ${h.content}`).join("\n")
    : "";

  const prompt = `User Memory Archive Context:
${memoryContext}

${conversationContext ? `Previous Conversation History:\n${conversationContext}\n` : ""}
Latest Message from User:
"${message}"

Please reply in the voice of the Interactive Two-Way Journal Companion in English. Remember to conclude with a reflective follow-up question.`;

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
      content: `I found a relevant memory: on ${latest.occurredAt}, you recorded: "${latest.summary}". What stands out most to you about that moment?`,
      modelUsed: "deterministic-fallback",
      latencyMs: 15,
    };
  }

  const latestAny = items[items.length - 1];
  const refText = latestAny ? `Your most recent memory is "${latestAny.summary}" on ${latestAny.occurredAt}.` : "";
  return {
    content: `I looked through your archive, but didn't find specific details about that yet. ${refText} How has your day been—is there something you'd like to share or reflect on together?`,
    modelUsed: "deterministic-fallback",
    latencyMs: 10,
  };
}
