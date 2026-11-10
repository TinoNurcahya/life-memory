import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import { parseMessages, parseSessions, sortSessions, chatHref, formatChatTime, buildDemoChat, isUuid, type MessageItem, type ChatSessionSummary } from "../lib/chat/model.ts";
import type { TimelineItem } from "../lib/queries/activities.ts";

let passed = 0;
async function check(name: string, run: () => void | Promise<void>) { await run(); passed++; console.log("PASS", name); }
const message = (id: string, content = "Isi catatan"): MessageItem => ({ id, role: "assistant", content, createdAt: "2026-10-28T03:00:00.000Z" });
const session = (id: string, updatedAt = "2026-10-28T03:00:00.000Z"): ChatSessionSummary => ({ id, title: "Percakapan " + id, updatedAt });

await check("Demo storage distinguishes missing or malformed data from an explicitly empty history", () => {
  for (const parser of [parseMessages, parseSessions]) {
    assert.equal(parser(null), null); assert.equal(parser("{bad"), null); assert.equal(parser("{}"), null);
    assert.deepEqual(parser("[]"), []);
  }
});
await check("Storage rejects invalid message roles, timestamps, and structures", () => {
  for (const invalid of [null, {}, { ...message("one"), role: "system" }, { ...message("one"), createdAt: "unknown" }, { ...message("one"), content: 20 }, { ...message("one"), id: "" }]) {
    assert.equal(parseMessages(JSON.stringify([invalid])), null);
  }
  assert.deepEqual(parseMessages(JSON.stringify([message("one"), message("one"), message("two")])), [message("one"), message("two")]);
});
await check("Session parsing validates, deduplicates, and sorts without mutating input", () => {
  assert.equal(parseSessions(JSON.stringify([{ ...session("bad"), updatedAt: "unknown" }])), null);
  assert.equal(parseSessions(JSON.stringify([{ ...session("bad"), title: null }])), null);
  const rows = [session("old", "2026-01-01T03:00:00.000Z"), session("new"), session("new")];
  const before = JSON.stringify(rows);
  assert.deepEqual(parseSessions(JSON.stringify(rows))?.map(s => s.id), ["new", "old"]);
  assert.equal(sortSessions(rows)[0].id, "new"); assert.equal(JSON.stringify(rows), before);
});
await check("Chat links preserve demo, encode IDs, and distinguish a new conversation", () => {
  assert.equal(chatHref(false), "/chat");
  assert.equal(chatHref(true, "a b&c"), "/chat?demo=jimmy&session=a+b%26c");
  assert.equal(chatHref(true, "ignored", true), "/chat?demo=jimmy&new=1");
  assert.equal(chatHref(false, "live-id"), "/chat?session=live-id");
});
await check("Time labels are deterministic in Jakarta and invalid dates stay safe", () => {
  assert.equal(formatChatTime("2026-10-28T03:04:00.000Z"), "10:04");
  assert.equal(formatChatTime("bad"), "");
  assert.equal(isUuid("0d773dbe-e622-4da6-8e8f-7409359af7f4"), true);
  for (const id of [null, "", "sess-123", "demo-session-ethan", "0d773dbe-e622-4da6-8e8f-7409359af7f4-extra"]) assert.equal(isUuid(id), false);
});
function memory(id: string, occurredAt: string, eventStatus: TimelineItem["eventStatus"] = "completed", ethan = true): TimelineItem {
  return { id, activityId: id, rawText: id, summary: "Memory " + id, sourceText: null, occurredAt, eventStatus,
    category: "social", status: "RESOLVED", timeOfDay: null, timeHint: null, isFirstTime: false, needsReview: false, reviewReasons: [],
    people: ethan ? [{ id: "ethan", user_id: "demo", name: "Ethan", normalized_name: "ethan", aliases: [], created_at: "2026-01-01", updated_at: "2026-01-01" }] : [], places: [], topics: [], imageUrls: [] };
}
await check("Demo seed is grounded in the latest completed Ethan fixture, with stable dates", () => {
  const items = [memory("old", "2026-09-01"), memory("planned", "2026-12-01", "planned"), memory("latest", "2026-10-28"), memory("unrelated", "2026-11-01", "completed", false)];
  const before = JSON.stringify(items), seed = buildDemoChat(items);
  assert.equal(seed.sessions[0].id, "demo-session-ethan");
  assert.match(seed.messages[1].content, /28 October 2026/); assert.match(seed.messages[1].content, /Memory latest/);
  assert.doesNotMatch(seed.messages[1].content, /Memory planned|Memory unrelated/);
  assert.deepEqual(buildDemoChat(items), seed); assert.equal(JSON.stringify(items), before);
  assert.deepEqual(buildDemoChat([]), { sessions: [], messages: [] });
});

function moduleCode(relative: string) {
  return ts.transpileModule(readFileSync(new URL(relative, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
}
const markdownExports: { ChatMessageContent?: (props: { content: string }) => React.ReactNode } = {};
const markdownModules: Record<string, unknown> = { react: React, "react/jsx-runtime": jsxRuntime, "./Chat.module.css": { default: { richText: "richText" } } };
runInNewContext(moduleCode("../components/chat/ChatMessageContent.tsx"), { exports: markdownExports, URL, require: (name: string) => {
  assert.ok(name in markdownModules, "Unexpected Markdown dependency: " + name); return markdownModules[name];
} });
assert.ok(markdownExports.ChatMessageContent);
const renderMarkdown = (content: string) => renderToStaticMarkup(React.createElement(markdownExports.ChatMessageContent!, { content }));
await check("Message formatting renders paragraphs, emphasis, lists, quotes, and code", () => {
  const markup = renderMarkdown("**tebal** dan *miring* serta `kode`\n\n- satu\n- dua\n\n> sumber\n\n```txt\nx < y\n```\n\n# Judul");
  for (const expected of ["<strong>tebal</strong>", "<em>miring</em>", "<code>kode</code>", "<ul>", "<li>satu</li>", "<blockquote>sumber</blockquote>", "<pre", "x &lt; y", "<h3>Judul</h3>"]) assert.ok(markup.includes(expected), expected);
});
await check("Message content escapes raw HTML and rejects unsafe link protocols", () => {
  const markup = renderMarkdown('<img src=x onerror="alert(1)">\n\n[bahaya](javascript:alert) [data](data:text/html,unsafe) [aman](https://example.com) [lokal](/timeline)');
  assert.ok(markup.includes("&lt;img")); assert.ok(!markup.includes("<img"));
  assert.ok(!markup.includes('href="javascript:')); assert.ok(!markup.includes('href="data:'));
  assert.ok(markup.includes('href="https://example.com/"')); assert.ok(markup.includes('rel="noopener noreferrer"')); assert.ok(markup.includes('href="/timeline"'));
});

type MockRow = Record<string, unknown>;
type LoaderScenario = { sessions?: MockRow[]; messages?: MockRow[]; authError?: boolean; sessionsError?: boolean; messagesError?: boolean; throwSessions?: boolean; throwMessages?: boolean };
type PageResult = { type: string; props: { children: { props: Record<string, unknown> } } };
async function loadPage(params: { demo?: string; session?: string; new?: string }, scenario: LoaderScenario = {}) {
  const calls: Array<{ table: string; op: string; args: unknown[] }> = [];
  const user = { id: "current-user" };
  const client = { auth: { getUser: async () => ({ data: { user: scenario.authError ? null : user }, error: scenario.authError ? new Error("auth") : null }) }, from(table: string) {
    const chain = { select(...args: unknown[]) { calls.push({ table, op: "select", args }); return chain; }, eq(...args: unknown[]) { calls.push({ table, op: "eq", args }); return chain; }, order(...args: unknown[]) { calls.push({ table, op: "order", args }); return chain; }, limit(...args: unknown[]) { calls.push({ table, op: "limit", args }); return chain; },
      then(resolve: (value: unknown) => unknown, reject: (error: Error) => unknown) {
        if ((table === "chat_sessions" && scenario.throwSessions) || (table === "chat_messages" && scenario.throwMessages)) return Promise.reject(new Error("loader threw")).then(resolve, reject);
        return Promise.resolve({ data: table === "chat_sessions" ? scenario.sessions ?? [] : scenario.messages ?? [], error: (table === "chat_sessions" ? scenario.sessionsError : scenario.messagesError) ? new Error("loader error") : null }).then(resolve, reject);
      } };
    return chain;
  } };
  const modules: Record<string, unknown> = {
    "react/jsx-runtime": { jsx: (type: string, props: Record<string, unknown>) => ({ type, props }) },
    "@/lib/supabase/server": { createClient: async () => client },
    "@/components/chat/ChatClient": { ChatClient: "client" },
    "@/components/layout/VaultShell": { VaultShell: "shell" },
    "@/lib/demo/jimmy": { getJimmyDemoItems: () => [memory("demo-latest", "2026-10-28")] },
    "@/lib/chat/model": { buildDemoChat },
    "@/components/chat/Chat.module.css": { default: { shell: "shell" } },
  };
  const exports: { default?: (props: { searchParams: Promise<typeof params> }) => Promise<PageResult> } = {};
  runInNewContext(moduleCode("../app/chat/page.tsx"), { exports, require: (name: string) => { assert.ok(name in modules, "Unexpected page dependency: " + name); return modules[name]; } });
  assert.ok(exports.default);
  return { props: (await exports.default({ searchParams: Promise.resolve(params) })).props.children.props, calls };
}
const liveSession = { id: "live-one", title: "Percakapan satu", updated_at: "2026-10-28T03:00:00.000Z" };
await check("Live session selection loads only the requested owned session", async () => {
  const result = await loadPage({ session: liveSession.id }, { sessions: [liveSession], messages: [{ id: "m", role: "assistant", content: "Milik sesi", created_at: "2026-10-28T03:00:00.000Z" }] });
  assert.equal(result.props.initialSessionId, liveSession.id);
  assert.equal((result.props.initialMessages as MessageItem[])[0].content, "Milik sesi");
  assert.ok(result.calls.some(c => c.table === "chat_messages" && c.op === "eq" && c.args[0] === "session_id" && c.args[1] === liveSession.id));
  for (const table of ["chat_sessions", "chat_messages"]) assert.ok(result.calls.some(c => c.table === table && c.op === "eq" && c.args[0] === "user_id" && c.args[1] === "current-user"));
});
await check("Unknown session does not fetch messages or impersonate an empty conversation", async () => {
  const result = await loadPage({ session: "unknown" }, { sessions: [liveSession] });
  assert.match(result.props.initialMessagesError as string, /could not be found/);
  assert.equal(result.calls.some(c => c.table === "chat_messages"), false);
});
await check("New-chat URL stays empty even when an older live session exists", async () => {
  const result = await loadPage({ new: "1", session: liveSession.id }, { sessions: [liveSession] });
  assert.equal(result.props.initialSessionId, null); assert.equal(result.props.startNew, true);
  assert.equal(result.calls.some(c => c.table === "chat_messages"), false);
});
await check("Latest 50 messages are returned chronologically and older history is disclosed", async () => {
  const rows = Array.from({ length: 51 }, (_, index) => ({ id: "m" + (51 - index), role: "assistant", content: String(51 - index), created_at: "2026-10-28T03:00:00.000Z" }));
  const result = await loadPage({}, { sessions: [liveSession], messages: rows });
  const messages = result.props.initialMessages as MessageItem[];
  assert.equal(messages.length, 50); assert.equal(messages[0].content, "2"); assert.equal(messages.at(-1)?.content, "51");
  assert.equal(result.props.initialHasOlderMessages, true);
  assert.ok(result.calls.some(c => c.table === "chat_messages" && c.op === "limit" && c.args[0] === 51));
});
await check("Turns with the same database timestamp still show the question before the answer", async () => {
  const timestamp = "2026-10-28T03:00:00.000Z";
  const result = await loadPage({}, { sessions: [liveSession], messages: [
    { id: "a", role: "assistant", content: "Jawaban", created_at: timestamp },
    { id: "z", role: "user", content: "Pertanyaan", created_at: timestamp },
  ] });
  assert.deepEqual((result.props.initialMessages as MessageItem[]).map(message => message.role), ["user", "assistant"]);
  const orders = result.calls.filter(call => call.table === "chat_messages" && call.op === "order");
  assert.deepEqual(orders.map(call => call.args[0]), ["created_at", "role", "id"]);
  assert.equal((orders[1].args[1] as { ascending: boolean }).ascending, true);
});
await check("Session and message loader failures remain separate from valid empty states", async () => {
  for (const scenario of [{ sessionsError: true }, { throwSessions: true }, { authError: true }]) {
    const result = await loadPage({}, scenario);
    assert.ok(result.props.initialSessionsError); assert.equal(result.calls.some(c => c.table === "chat_messages"), false);
  }
  for (const scenario of [{ messagesError: true }, { throwMessages: true }]) {
    const result = await loadPage({}, { sessions: [liveSession], ...scenario });
    assert.equal(result.props.initialSessionsError, null); assert.ok(result.props.initialMessagesError);
    assert.equal((result.props.initialSessions as ChatSessionSummary[]).length, 1);
  }
  const empty = await loadPage({}); assert.equal(empty.props.initialSessionsError, null); assert.equal(empty.props.initialMessagesError, null);
});
await check("Demo route obtains deterministic fixture data without database queries", async () => {
  const result = await loadPage({ demo: "jimmy" });
  assert.equal(result.calls.length, 0); assert.equal(result.props.isDemo, true);
  assert.equal(result.props.initialSessionId, "demo-session-ethan");
  assert.match((result.props.initialMessages as MessageItem[])[1].content, /demo-latest/);
});
console.log("Chat UI models, formatting, and route: " + passed + " checks passed.");
