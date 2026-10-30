import { createClient } from "@/lib/supabase/server";
import { ChatClient, type MessageItem } from "@/components/chat/ChatClient";
import type { ChatSessionSummary } from "@/components/chat/ChatSidebar";
import { VaultShell } from "@/components/layout/VaultShell";
import { getJimmyDemoItems } from "@/lib/demo/jimmy";
import { buildDemoChat } from "@/lib/chat/model";
import styles from "@/components/chat/Chat.module.css";

export default async function ChatPage({ searchParams }: {
  searchParams: Promise<{ demo?: string; session?: string; new?: string }>;
}) {
  const params = await searchParams;
  const isDemo = params.demo === "jimmy";
  const startNew = params.new === "1";
  const requestedSessionId = startNew ? null : params.session || null;
  let initialSessions: ChatSessionSummary[] = [];
  let initialMessages: MessageItem[] = [];
  let initialSessionId: string | null = requestedSessionId;
  let initialSessionsError: string | null = null;
  let initialMessagesError: string | null = null;
  let initialHasOlderMessages = false;

  if (isDemo) {
    const seed = buildDemoChat(getJimmyDemoItems());
    initialSessions = seed.sessions;
    initialSessionId = startNew ? null : requestedSessionId || seed.sessions[0]?.id || null;
    initialMessages = initialSessionId === seed.sessions[0]?.id ? seed.messages : [];
  } else {
    try {
      const supabase = await createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        initialSessionsError = "Sesi masuk belum tersedia. Muat ulang untuk membuka percakapan.";
      } else {
        const { data: rows, error } = await supabase.from("chat_sessions")
          .select("id, title, updated_at").eq("user_id", user.id)
          .order("updated_at", { ascending: false });
        if (error) {
          initialSessionsError = "Riwayat percakapan belum bisa dimuat.";
        } else {
          initialSessions = (rows ?? []).map(row => ({ id: row.id, title: row.title, updatedAt: row.updated_at }));
          initialSessionId = startNew ? null : requestedSessionId || initialSessions[0]?.id || null;
          if (initialSessionId && !initialSessions.some(session => session.id === initialSessionId)) {
            initialMessagesError = "Percakapan ini tidak ditemukan. Pilih percakapan lain dari riwayat.";
          } else if (initialSessionId) {
            try {
              const { data: messages, error: messagesError } = await supabase.from("chat_messages")
                .select("id, role, content, created_at").eq("user_id", user.id)
                .eq("session_id", initialSessionId).order("created_at", { ascending: false })
                // Both turns are inserted together and can share a timestamp.
                // Query assistant before user so reversing restores question/answer order.
                .order("role", { ascending: true }).order("id", { ascending: false }).limit(51);
              if (messagesError) {
                initialMessagesError = "Pesan percakapan ini belum bisa dimuat.";
              } else {
                initialHasOlderMessages = (messages?.length ?? 0) > 50;
                initialMessages = (messages ?? []).slice(0, 50).reverse().map(message => ({
                  id: message.id, role: message.role as "user" | "assistant",
                  content: message.content, createdAt: message.created_at,
                }));
              }
            } catch {
              initialMessagesError = "Pesan percakapan ini belum bisa dimuat.";
            }
          }
        }
      }
    } catch {
      initialSessionsError = "Riwayat percakapan belum bisa dimuat.";
    }
  }

  return (
    <VaultShell title="Ask Memory" isDemo={isDemo} className={styles.shell}>
      <ChatClient
        key={(isDemo ? "demo:" : "live:") + (startNew ? "new" : initialSessionId ?? "empty") + ":" + (initialSessionsError ?? "") + ":" + (initialMessagesError ?? "")}
        isDemo={isDemo} initialSessions={initialSessions} initialMessages={initialMessages}
        initialSessionId={initialSessionId} requestedSessionId={requestedSessionId} startNew={startNew}
        initialSessionsError={initialSessionsError} initialMessagesError={initialMessagesError}
        initialHasOlderMessages={initialHasOlderMessages}
      />
    </VaultShell>
  );
}
