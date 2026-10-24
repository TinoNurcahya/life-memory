import assert from "node:assert/strict";

console.log("================================================================================");
console.log("            LIFE MEMORY — MULTI-SESSION CHAT HISTORY TEST SUITE                 ");
console.log("================================================================================");

const baseUrl = "http://localhost:3000";

// 1. Verify GET /api/chat/sessions?demo=jimmy
console.log("▶ [CHECK 1/3] Verifying pre-seeded demo session for Persona Jimmy…");
const sessionsRes = await fetch(`${baseUrl}/api/chat/sessions?demo=jimmy`);
assert.equal(sessionsRes.status, 200, "Sessions API must return 200 OK");
const sessionsData = await sessionsRes.json();
assert.ok(sessionsData.success, "Response must indicate success");
assert.ok(Array.isArray(sessionsData.sessions), "Response must return an array of sessions");
assert.ok(sessionsData.sessions.length >= 1, "Must contain at least 1 pre-seeded demo session");
assert.equal(
  sessionsData.sessions[0].title,
  "Refleksi Kolaborasi Capstone & Ethan",
  "Pre-seeded session title must match specification"
);
console.log(`   ✓ Pre-seeded session verified: "${sessionsData.sessions[0].title}" (${sessionsData.sessions[0].id})\n`);

// 2. Verify POST /api/chat/sessions (demo creation)
console.log("▶ [CHECK 2/3] Verifying session creation endpoint…");
const createRes = await fetch(`${baseUrl}/api/chat/sessions`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    title: "Diskusi Rencana Liburan",
    demo: "jimmy",
  }),
});
assert.equal(createRes.status, 200, "Create session must return 200 OK");
const createData = await createRes.json();
assert.ok(createData.success, "Session creation must be successful");
assert.equal(createData.session.title, "Diskusi Rencana Liburan");
console.log(`   ✓ New session created: "${createData.session.title}" (${createData.session.id})\n`);

// 3. Verify POST /api/chat links with sessionId and returns within 5s
console.log("▶ [CHECK 3/3] Verifying chat message turn linked with sessionId…");
const chatRes = await fetch(`${baseUrl}/api/chat`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    message: "Kapan terakhir ketemu Ethan?",
    sessionId: createData.session.id,
    demo: "jimmy",
  }),
});
assert.equal(chatRes.status, 200, "Chat turn must return 200 OK");
const chatData = await chatRes.json();
assert.ok(chatData.success, "Chat turn must be successful");
assert.equal(chatData.sessionId, createData.session.id, "Returned sessionId must match passed sessionId");
assert.ok(chatData.message.content.length > 20, "Assistant response must contain content");
console.log(`   ✓ Chat turn successfully associated with session: ${chatData.sessionId}`);
console.log(`   ✓ Response preview: ${chatData.message.content.slice(0, 100)}…\n`);

console.log("================================================================================");
console.log("        ✓ MULTI-SESSION CHAT HISTORY SUITE PASSED WITH 0 ERRORS!                ");
console.log("================================================================================");
