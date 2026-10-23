import { GoogleGenAI, ThinkingLevel, type Schema } from "@google/genai";
import { z } from "zod";
import { logger } from "../logger.ts";
import type { ActivityCategory, EventStatus, TimeOfDay } from "../../types/database.ts";

export interface ExtractedActivityItem {
  summary: string;
  source_text: string;
  category: ActivityCategory;
  day_offset: number;
  time_of_day: TimeOfDay;
  time_hint: string | null;
  event_status: EventStatus;
  people: string[];
  places: string[];
  topics: string[];
  is_first_time: boolean;
}

export interface ActivityExtractionResult {
  activities: ExtractedActivityItem[];
  rawText: string;
  modelUsed: string;
}

const ActivityExtractionSchema = {
  type: "OBJECT",
  properties: {
    activities: {
      type: "ARRAY",
      description: "Discrete activity records extracted from the log. If text describes multiple actions, split them into separate items.",
      items: {
        type: "OBJECT",
        properties: {
          summary: {
            type: "STRING",
            description: "Concise summary of the activity in the user's primary language.",
          },
          source_text: {
            type: "STRING",
            description: "Exact verbatim substring from the raw log representing this activity.",
          },
          category: {
            type: "STRING",
            description: "Core taxonomy category matching the UI design system tokens.",
            enum: ["career", "social", "health", "learning", "leisure", "routine", "other"],
          },
          day_offset: {
            type: "INTEGER",
            description: "Relative day offset from reference_date. 0 for base entry date, -1 for yesterday, -2 for two days ago, etc.",
          },
          time_of_day: {
            type: "STRING",
            description: "Time phase of the activity.",
            enum: ["morning", "afternoon", "evening", "night", "exact", "unknown"],
          },
          time_hint: {
            type: "STRING",
            nullable: true,
            description: "Explicit clock time if mentioned (e.g., '14:30', '10 AM') or time phrase ('sore', 'subuh').",
          },
          event_status: {
            type: "STRING",
            description: "Execution status of the event.",
            enum: ["completed", "planned", "cancelled"],
          },
          people: {
            type: "ARRAY",
            items: { type: "STRING" },
            description: "Proper names of people mentioned, stripped of honorifics (e.g. ['Ethan', 'Lena']).",
          },
          places: {
            type: "ARRAY",
            items: { type: "STRING" },
            description: "Specific public venues, commercial establishments, parks, or cities. Exclude private dwellings like home/kos.",
          },
          topics: {
            type: "ARRAY",
            items: { type: "STRING" },
            description: "1-3 key subjects, skills, technical tools, or project themes mentioned explicitly in the text (e.g. ['Next.js', 'Interview Prep']).",
          },
          is_first_time: {
            type: "BOOLEAN",
            description: "True ONLY if user explicitly states or unmistakably declares this was their first time doing it.",
          },
        },
        required: [
          "summary",
          "source_text",
          "category",
          "day_offset",
          "time_of_day",
          "event_status",
          "people",
          "places",
          "topics",
          "is_first_time",
        ],
      },
    },
  },
  required: ["activities"],
};

export const ParsedExtractionSchema = z.object({
  activities: z.array(z.object({
    summary: z.string().trim().min(1),
    source_text: z.string().min(1),
    category: z.enum(["career", "social", "health", "learning", "leisure", "routine", "other"]),
    day_offset: z.number().int(),
    time_of_day: z.enum(["morning", "afternoon", "evening", "night", "exact", "unknown"]),
    time_hint: z.string().nullable().optional().default(null),
    event_status: z.enum(["completed", "planned", "cancelled"]),
    people: z.array(z.string().trim().min(1)),
    places: z.array(z.string().trim().min(1)),
    topics: z.array(z.string().trim().min(1)).max(3),
    is_first_time: z.boolean(),
  })),
});

export class ExtractionError extends Error {
  code: "quota_blocked" | "invalid_response" | "failed";
  constructor(code: ExtractionError["code"], message: string) {
    super(message);
    this.name = "ExtractionError";
    this.code = code;
  }
}

export function parseExtractionResponse(text: string, rawText: string): ExtractedActivityItem[] {
  try {
    const { activities } = ParsedExtractionSchema.parse(JSON.parse(text));
    if (activities.some((item) => !rawText.includes(item.source_text))) {
      throw new Error("source_text must be an exact substring of the log");
    }
    return activities;
  } catch {
    throw new ExtractionError("invalid_response", "Gemini returned invalid JSON, fields, or source_text.");
  }
}

export async function extractActivities(
  rawText: string,
  referenceDate: string = new Date().toISOString().split("T")[0]
): Promise<ActivityExtractionResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY in environment");
  }

  const ai = new GoogleGenAI({ apiKey, httpOptions: { timeout: 45_000 } });

  const systemPrompt = `You are the Activity Extraction Engine for Life Memory, an intimate personal intelligence system.
Your responsibility is to analyze natural language micro-logs and extract discrete, structured activity records.

### RUNTIME CONTEXT:
- reference_date: "${referenceDate}" (ISO format YYYY-MM-DD)
- Strict rules:
  1. Extract only explicitly stated facts. Do not invent emotions or unexpressed sentiment.
  2. Split multi-part sentences into separate discrete activities.
  3. Categorize into: career, social, health, learning, leisure, routine, other.
  4. Only mark is_first_time as true if explicitly stated ("pertama kali", "first time", "never before").
  5. Extract people, places, and topics accurately. Keep kinship terms used as names (Mama), remove personal honorifics (Mas Dimas -> Dimas), but keep full venue names (Warung Bu Kris).
  6. Use event_status planned for future intentions and cancelled for negated/cancelled actions. Never treat either as completed.
  7. Resolve kmrn/kemarin/semalem/yesterday to -1, besok/tomorrow to +1, lusa to +2. Sore is afternoon, malem/malam is night.
  8. Filter generic home/kos/kosan/kantor/office/kampus/campus from places. Never invent a named venue.
  9. Topics are 0-3 explicitly named subjects, skills, tools, or projects, not inferred generic actions like dinner, shopping, meeting or coffee. Empty arrays are valid.
 10. source_text must be an exact, unmodified substring of the log, including its original slang and spelling.
 11. Return activities: [] for empty, punctuation-only, or meaningless text. Keep all real actions in long entries; do not invent activities from background descriptions.
 12. Use career for professional work, learning for study, health for exercise, leisure for recreation, routine for chores/shopping, social for time with others.`;

  const modelsToTry = ["gemini-3.5-flash-lite", "gemini-3.8-flash"];
  let lastError: unknown = null;

  for (const model of modelsToTry) {
    try {
      logger.info(`Extracting activities with model ${model}`, { rawLength: rawText.length });

      const response = await ai.models.generateContent({
        model,
        contents: [
          { role: "user", parts: [{ text: `${systemPrompt}\n\nLog text to analyze:\n"${rawText}"` }] },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: ActivityExtractionSchema as Schema,
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          temperature: 0.1,
          maxOutputTokens: 4096,
        },
      });

      const responseText = response.text?.trim();
      if (!responseText) {
        throw new ExtractionError("invalid_response", "Empty response returned from Gemini API");
      }

      const activities = parseExtractionResponse(responseText, rawText);

      logger.info(`Extraction successful with ${model}`, { extractedCount: activities.length });
      return {
        activities,
        rawText,
        modelUsed: model,
      };
    } catch (err: unknown) {
      if (/429|quota|resource.?exhausted|rate.?limit/i.test(String(err))) {
        throw new ExtractionError("quota_blocked", "Gemini quota or rate limit reached.");
      }
      lastError = err;
      logger.warn(`Model ${model} extraction failed, trying fallback...`, {}, err);
    }
  }

  if (lastError instanceof ExtractionError) throw lastError;
  throw new ExtractionError("failed", "Extraction failed across all configured models.");
}
