import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { logger } from "../logger.ts";

export interface ReflectionEvidenceItem {
  id: string;
  date: string;
  summary: string;
  category: string;
  people: string[];
  places: string[];
  topics?: string[];
  is_first_time?: boolean;
}

export interface ReflectionInputPayload {
  month: string; // e.g. "October 2026"
  stats: {
    total_activities: number;
    unique_people_count: number;
    unique_places_count: number;
    first_times_count: number;
  };
  top_categories: Array<{ category: string; count: number; delta?: string }>;
  evidence_pool: ReflectionEvidenceItem[];
}

export interface ReflectionParagraph {
  theme: "rhythm_and_focus" | "relationships_and_places" | "shifts_and_firsts";
  text: string;
  evidence_ids: string[];
}

export interface GeneratedMonthlyReflection {
  title: string;
  paragraphs: ReflectionParagraph[];
  key_themes: string[];
}

export interface MonthlyReflectionResult {
  reflection: GeneratedMonthlyReflection;
  modelUsed: string;
  latencyMs: number;
}

const MonthlyReflectionSchema = {
  type: "OBJECT",
  properties: {
    title: {
      type: "STRING",
      description: "Evocative, factual title for the month reflecting the overall theme.",
    },
    paragraphs: {
      type: "ARRAY",
      description: "List of thematic reflection paragraphs. Every paragraph MUST substantiate its text with at least one evidence_id.",
      items: {
        type: "OBJECT",
        properties: {
          theme: {
            type: "STRING",
            enum: ["rhythm_and_focus", "relationships_and_places", "shifts_and_firsts"],
          },
          text: {
            type: "STRING",
            description: "Narrative paragraph containing sequential citation markers [1], [2] corresponding to evidence_ids.",
          },
          evidence_ids: {
            type: "ARRAY",
            items: { type: "STRING" },
            description: "Array of evidence_pool IDs corresponding directly to the sequential citation markers [1]..[N] in this paragraph.",
          },
        },
        required: ["theme", "text", "evidence_ids"],
      },
    },
    key_themes: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "3-4 concise thematic tags directly drawn from top categories and active entities.",
    },
  },
  required: ["title", "paragraphs", "key_themes"],
};

const SYSTEM_INSTRUCTION = `You are the thoughtful, literary chronicler for Life Memory.
Your task is to write a warm, reflective monthly essay grounded strictly in the provided evidence pool of completed user memories.
Write the title, paragraphs, and key themes in Indonesian. Preserve names and quoted source text in their original language.

Strict Grounding Rules:
1. Non-Judgmental Voice: Be observant, empathetic, and objective. Never moralize, lecture, give unsolicited productivity advice, or infer unstated moods.
2. Zero Hallucination: Cite ONLY facts from the evidence_pool. Never invent events, names, dates, or places.
3. Footnote Citation Integrity:
   - In each paragraph, every key assertion about an activity must include a sequential citation marker: [1], [2], etc., starting at [1] in that paragraph.
   - The "evidence_ids" array for that paragraph must contain the exact IDs from the evidence pool matching each citation marker in order.
   - Every paragraph MUST have at least one citation.
4. Themes:
   - "rhythm_and_focus": Daily cadence, work milestones, craft, or learning.
   - "relationships_and_places": Shared meals, conversations, encounters, and meaningful places.
   - "shifts_and_firsts": First-time experiences, changes in habits, or transitions.
5. Return strictly valid JSON adhering to the provided schema.`;

export async function generateMonthlyReflection(
  payload: ReflectionInputPayload
): Promise<MonthlyReflectionResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY in environment.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = JSON.stringify(payload, null, 2);

  const models = ["gemini-3.8-flash", "gemini-3.5-flash-lite"];
  let lastError: unknown = null;

  for (const model of models) {
    const started = Date.now();
    try {
      logger.info(`Requesting Monthly Reflection using model: ${model}`);
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: MonthlyReflectionSchema,
          temperature: 0.3,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 4096,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      const raw = response.text?.trim();
      if (!raw) {
        throw new Error(`Empty response from model ${model}`);
      }

      const parsed = JSON.parse(raw) as GeneratedMonthlyReflection;
      const latencyMs = Date.now() - started;
      logger.info(`Monthly Reflection generated successfully with ${model} in ${latencyMs}ms`);

      return {
        reflection: parsed,
        modelUsed: model,
        latencyMs,
      };
    } catch (err) {
      lastError = err;
      logger.warn(`Model ${model} failed for reflection generation: ${err instanceof Error ? err.message : String(err)}. Trying fallback…`);
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Failed to generate reflection with available Gemini models.");
}
