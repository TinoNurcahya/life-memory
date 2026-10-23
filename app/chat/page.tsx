import { createClient } from "@/lib/supabase/server";
import { ChatClient, type MessageItem } from "@/components/chat/ChatClient";
import type { ChatSessionSummary } from "@/components/chat/ChatSidebar";
import { VaultShell } from "@/components/layout/VaultShell";

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string; session?: string }>;
}) {
  const params = await searchParams;
  const isDemo = params.demo === "jimmy";

  let initialSessions: ChatSessionSummary[] = [];
  let initialMessages: MessageItem[] = [];
  let initialSessionId: string | null = params.session || null;

  if (!isDemo) {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // 1. Fetch sessions
        const { data: sessionRows } = await supabase
          .from("chat_sessions")
          .select("id, title, updated_at")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false });

        if (sessionRows && sessionRows.length > 0) {
          initialSessions = sessionRows.map((s) => ({
            id: s.id,
            title: s.title,
            updatedAt: s.updated_at,
          }));

          if (!initialSessionId) {
            initialSessionId = initialSessions[0].id;
          }
        }

        // 2. Fetch messages for initial session
        if (initialSessionId) {
          const { data: rows } = await supabase
            .from("chat_messages")
            .select("id, role, content, created_at")
            .eq("user_id", user.id)
            .eq("session_id", initialSessionId)
            .order("created_at", { ascending: true })
            .limit(50);

          if (rows) {
            initialMessages = rows.map((r) => ({
              id: r.id,
              role: r.role as "user" | "assistant",
              content: r.content,
              createdAt: r.created_at,
            }));
          }
        }
      }
    } catch {
      initialSessions = [];
      initialMessages = [];
    }
  }

  return (
    <VaultShell title="Tanya AI" isDemo={isDemo} showHeader={false}>
      <div className="h-full w-full overflow-hidden">
        <ChatClient
          isDemo={isDemo}
          initialSessions={initialSessions}
          initialMessages={initialMessages}
          initialSessionId={initialSessionId}
        />
      </div>
    </VaultShell>
  );
}
