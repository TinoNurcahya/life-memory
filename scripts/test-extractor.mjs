import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

const prompt = `You are the Activity Extraction Engine for Life Memory.
Extract discrete activity records from this log:
"Dinner with Ethan and Lena at Thai place on Bedford Ave. Celebrated wrapping up freelance client milestone."

Respond with JSON:
{
  "activities": [
    {
      "summary": "...",
      "source_text": "...",
      "category": "social",
      "people": ["Ethan", "Lena"],
      "places": ["Thai place Bedford"],
      "topics": ["Freelance"],
      "is_first_time": false
    }
  ]
}`;

try {
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      temperature: 0.1,
    },
  });
  console.log("=== GEMINI EXTRACTION TEST PASSED ===");
  console.log(response.text);
} catch (err) {
  console.error("Test failed:", err);
}
