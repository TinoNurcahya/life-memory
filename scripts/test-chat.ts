import assert from "node:assert/strict";
import { getJimmyDemoItems } from "../lib/demo/jimmy.ts";
import { buildMemoryContext, generateChatResponse } from "../lib/ai/chat.ts";

console.log("================================================================================");
console.log("            LIFE MEMORY — MEMORY CHAT ASSISTANT TEST SUITE                      ");
console.log("================================================================================");

const today = new Date();
const jimmyItems = getJimmyDemoItems(today);
console.log(`Loaded ${jimmyItems.length} demo memories for context building.\n`);

// 1. Context Builder Verification
console.log("▶ [CHECK 1/2] Verifying Memory Context Builder formatting…");
const memoryContext = buildMemoryContext(jimmyItems);
assert.ok(memoryContext.length > 500, "Memory context must be substantially populated");
assert.ok(memoryContext.includes("Ethan"), "Context must contain Ethan mentions");
assert.ok(memoryContext.includes("Blank Street Coffee"), "Context must contain venue mentions");
console.log(`   ✓ Formatted context length: ${memoryContext.length} characters across 48 lines.\n`);

// 2. Chat Response & Two-Way Introspective Persona Verification
console.log("▶ [CHECK 2/2] Verifying Live Two-Way Introspective Journal Query…");
const testQuery = "Kapan terakhir kali aku ketemu Ethan dan apa yang kita bicarakan?";
console.log(`   User Query: "${testQuery}"`);

const start = Date.now();
const result = await generateChatResponse({
  message: testQuery,
  history: [],
  items: jimmyItems,
});
const duration = Date.now() - start;

console.log(`   Model Used: ${result.modelUsed} (${duration}ms)`);
console.log("\n--- AI Response Preview ---");
console.log(result.content);
console.log("---------------------------\n");

assert.ok(result.content.length > 30, "Response must not be empty");
assert.ok(
  result.content.toLowerCase().includes("ethan"),
  "Response must ground answer in Ethan's memory records"
);
assert.ok(
  result.content.includes("?"),
  "Two-Way Interactive Journal persona must conclude with an introspective question mark"
);

console.log("================================================================================");
console.log("               ✓ MEMORY CHAT TEST COMPLETED SUCCESSFULLY!                      ");
console.log("================================================================================");
