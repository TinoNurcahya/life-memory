import { GoogleGenAI } from "@google/genai";
import { logger } from "../logger";
import { getThematicPhotoForMemory } from "./thematic-photos";

export interface GeneratedImageResult {
  url: string;
  source: "ai" | "curated";
}

/**
 * Generates or assigns exactly 1 high-quality nostalgic 35mm film photo for a memory entry.
 * Uses Imagen 3 / Gemini if available, with a 100% resilient fallback to curated analog photography.
 */
export async function generateMemoryIllustration(
  summary: string,
  category: string = "other"
): Promise<GeneratedImageResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `A nostalgic, warm 35mm film photograph, candid memory snapshot of "${summary}", golden hour soft natural lighting, subtle analog grain, Leica M6 aesthetic, authentic autobiographical journal moment, highly atmospheric, cinematic depth of field, no text, no watermark, no words, photorealistic vintage color tone.`;

      // Attempt generation with Imagen 3
      const modelsApi = (ai as unknown as {
        models?: {
          generateImages?: (args: {
            model: string;
            prompt: string;
            config: { numberOfImages: number; aspectRatio: string; outputMimeType: string };
          }) => Promise<{ generatedImages?: Array<{ image?: { imageBytes?: string } }> }>;
        };
      }).models;

      if (modelsApi?.generateImages) {
        const response = await modelsApi.generateImages({
          model: "imagen-3.0-generate-002",
          prompt,
          config: {
            numberOfImages: 1,
            aspectRatio: "4:3",
            outputMimeType: "image/jpeg",
          },
        });

        const imageBytes = response?.generatedImages?.[0]?.image?.imageBytes;
        if (imageBytes) {
          logger.info("Successfully generated memory illustration with Imagen 3:", { summary });
          return {
            url: `data:image/jpeg;base64,${imageBytes}`,
            source: "ai",
          };
        }
      }
    } catch (err) {
      logger.warn("Imagen generation skipped or rate-limited, applying curated thematic photo fallback:", {
        error: String(err),
      });
    }
  }

  // Resilient Curated Fallback (Zero Quota Usage, Instant Response)
  const thematicUrl = getThematicPhotoForMemory(summary, category);
  return {
    url: thematicUrl,
    source: "curated",
  };
}
