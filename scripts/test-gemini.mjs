import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

console.log("=== LIFE MEMORY -- GEMINI API CONNECTIVITY TEST ===");
console.log("API Key Present:", Boolean(apiKey));
console.log("API Key preview:", apiKey ? `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}` : "none");

if (!apiKey || apiKey === "placeholder-gemini-api-key") {
  console.error("Error: Missing or placeholder GEMINI_API_KEY in environment");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

try {
  const start = Date.now();
  console.log("\nPinging Google Gemini API (model: gemini-3.8-flash)...");
  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: "Balas dengan tepat satu kata: 'CONNECTED'",
  });
  const latency = Date.now() - start;
  console.log(`Status: SUCCESS (${latency}ms)`);
  console.log("Response:", response.text?.trim());
  console.log("\n=== TEST PASSED ===");
} catch (err) {
  console.error("\nStatus: FAILED");
  console.error("Error details:", err.message);
}
