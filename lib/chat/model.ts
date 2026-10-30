import type { TimelineItem } from "@/lib/queries/activities";

export interface MessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface ChatSessionSummary {
  id: string;
  title: string;
  updatedAt: string;
}

export function isMessage(value: unknown): value is MessageItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<MessageItem>;
  return typeof item.id === "string" && item.id.length > 0
    && (item.role === "user" || item.role === "assistant")
    && typeof item.content === "string"
    && typeof item.createdAt === "string" && Number.isFinite(Date.parse(item.createdAt));
}

export function parseMessages(raw: string | null): MessageItem[] | null {
  if (raw === null) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value) || !value.every(isMessage)) return null;
    const seen = new Set<string>();
    return value.filter(item => !seen.has(item.id) && Boolean(seen.add(item.id)));
  } catch { return null; }
}

export function parseSessions(raw: string | null): ChatSessionSummary[] | null {
  if (raw === null) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value) || !value.every(item => item && typeof item === "object"
      && typeof item.id === "string" && item.id.length > 0
      && typeof item.title === "string" && typeof item.updatedAt === "string"
      && Number.isFinite(Date.parse(item.updatedAt)))) return null;
    const seen = new Set<string>();
    return sortSessions(value.filter(item => !seen.has(item.id) && Boolean(seen.add(item.id))));
  } catch { return null; }
}

export function sortSessions(sessions: ChatSessionSummary[]) {
  return [...sessions].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt) || a.id.localeCompare(b.id));
}

export function chatHref(demo: boolean, sessionId?: string | null, newChat = false) {
  const query = new URLSearchParams();
  if (demo) query.set("demo", "jimmy");
  if (newChat) query.set("new", "1");
  else if (sessionId) query.set("session", sessionId);
  return "/chat" + (query.size ? "?" + query.toString() : "");
}

export function formatChatTime(value: string) {
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" }).format(date)
    : "";
}

export function buildDemoChat(items: TimelineItem[]) {
  const latest = items.filter(item => item.eventStatus === "completed" && item.people.some(person => person.normalized_name === "ethan"))
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt) || b.id.localeCompare(a.id))[0];
  if (!latest) return { sessions: [] as ChatSessionSummary[], messages: [] as MessageItem[] };
  const createdAt = latest.occurredAt + "T09:00:00.000Z";
  const date = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(createdAt));
  return {
    sessions: [{ id: "demo-session-ethan", title: "Catatan bersama Ethan", updatedAt: createdAt }],
    messages: [
      { id: "demo-msg-1", role: "user" as const, content: "Apa catatan terbaruku bersama Ethan?", createdAt },
      { id: "demo-msg-2", role: "assistant" as const, content: "Catatan terbaru yang menyebut Ethan bertanggal **" + date + "**:\n\n> " + latest.summary + "\n\nApa yang ingin kamu ingat dari momen itu?", createdAt },
    ],
  };
}

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
