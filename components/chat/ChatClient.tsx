"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MessageSquare,
  Loader2,
  Send,
  Bot,
  User,
  Sun,
  Moon,
  BookmarkPlus,
  PanelLeft,
} from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/lib/experience/theme-context";
import { ChatSidebar, type ChatSessionSummary } from "./ChatSidebar";

export interface MessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

const QUICK_PROMPTS = [
  "Kapan terakhir ketemu Ethan dan di mana?",
  "Rangkum ritme aktivitasku minggu ini",
  "Apa hal baru yang pertama kali aku coba bulan ini?",
  "Catat ini: Ngopi sore santai sambil baca buku",
];

const PRE_SEEDED_DEMO_SESSION: ChatSessionSummary = {
  id: "demo-session-ethan",
  title: "Refleksi Kolaborasi Capstone & Ethan",
  updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
};

const PRE_SEEDED_DEMO_MESSAGES: MessageItem[] = [
  {
    id: "demo-msg-1",
    role: "user",
    content: "Kapan terakhir ketemu Ethan dan apa yang kita bicarakan?",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "demo-msg-2",
    role: "assistant",
    content:
      "Berdasarkan catatanmu pada **15 Oktober 2026**, kamu terakhir kali bertemu dan berkolaborasi dengan Ethan saat kalian melakukan *pair-debugging* untuk mengatasi masalah *timeout* pada bagian *backend*.\n\nMomen membedah dan menyelesaikan kendala teknis bersama rekan setim seperti itu sering kali terasa intens sekaligus melegakan. Bagaimana dinamika kerjamu dengan Ethan waktu itu—apakah kolaborasi tersebut membuat proses pemecahan masalah terasa lebih ringan?",
    createdAt: new Date(Date.now() - 3600000 * 2 + 2000).toISOString(),
  },
];

function makeUserMessage(content: string): MessageItem {
  return {
    id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role: "user",
    content,
    createdAt: new Date().toISOString(),
  };
}

function createNewSession(isDemo: boolean, query: string): ChatSessionSummary {
  const currentSessionId = isDemo ? `demo-session-${Date.now()}` : `sess-${Date.now()}`;
  const title = query.length > 36 ? query.slice(0, 36) + "…" : query;
  return {
    id: currentSessionId,
    title,
    updatedAt: new Date().toISOString(),
  };
}

export function ChatClient({
  isDemo,
  initialSessions = [],
  initialMessages = [],
  initialSessionId = null,
}: {
  isDemo: boolean;
  initialSessions?: ChatSessionSummary[];
  initialMessages?: MessageItem[];
  initialSessionId?: string | null;
}) {
  const router = useRouter();
  const { theme, mounted, toggleTheme } = useTheme();

  // Sidebar toggle state
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Sessions state
  const [sessions, setSessions] = useState<ChatSessionSummary[]>(() => {
    if (isDemo && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("jimmy_chat_sessions");
        if (stored) {
          const parsed = JSON.parse(stored) as ChatSessionSummary[];
          if (parsed.length > 0) return parsed;
        }
      } catch {
        // ignore
      }
      return [PRE_SEEDED_DEMO_SESSION];
    }
    return initialSessions.length ? initialSessions : [];
  });

  // Active session
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() => {
    if (isDemo) {
      if (initialSessionId) return initialSessionId;
      return PRE_SEEDED_DEMO_SESSION.id;
    }
    return initialSessionId || (initialSessions[0]?.id ?? null);
  });

  // Active messages
  const [messages, setMessages] = useState<MessageItem[]>(() => {
    if (isDemo) {
      if (initialSessionId === "demo-session-ethan" || (!initialSessionId && sessions[0]?.id === "demo-session-ethan")) {
        return PRE_SEEDED_DEMO_MESSAGES;
      }
      if (typeof window !== "undefined" && initialSessionId) {
        try {
          const stored = localStorage.getItem(`jimmy_chat_msg_${initialSessionId}`);
          if (stored) return JSON.parse(stored);
        } catch {
          // ignore
        }
      }
      return PRE_SEEDED_DEMO_MESSAGES;
    }
    return initialMessages;
  });

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [savingMsgId, setSavingMsgId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const backLink = isDemo ? "/dashboard?demo=jimmy" : "/dashboard";

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Persist demo sessions to localStorage
  useEffect(() => {
    if (isDemo && typeof window !== "undefined") {
      try {
        localStorage.setItem("jimmy_chat_sessions", JSON.stringify(sessions));
      } catch {
        // ignore
      }
    }
  }, [sessions, isDemo]);

  // Persist demo messages for active session
  useEffect(() => {
    if (isDemo && activeSessionId && typeof window !== "undefined") {
      try {
        localStorage.setItem(`jimmy_chat_msg_${activeSessionId}`, JSON.stringify(messages));
      } catch {
        // ignore
      }
    }
  }, [messages, activeSessionId, isDemo]);

  const handleSelectSession = useCallback((sessionId: string) => {
    setActiveSessionId(sessionId);
    if (isDemo) {
      if (sessionId === "demo-session-ethan") {
        setMessages(PRE_SEEDED_DEMO_MESSAGES);
      } else if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem(`jimmy_chat_msg_${sessionId}`);
          setMessages(stored ? JSON.parse(stored) : []);
        } catch {
          setMessages([]);
        }
      }
    }
  }, [isDemo]);

  const handleNewChat = useCallback(() => {
    setActiveSessionId(null);
    setMessages([]);
    setTimeout(() => textareaRef.current?.focus(), 50);
  }, []);

  const handleDeleteSession = async (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));

    if (isDemo && typeof window !== "undefined") {
      try {
        localStorage.removeItem(`jimmy_chat_msg_${sessionId}`);
      } catch {
        // ignore
      }
    } else {
      try {
        await fetch(`/api/chat/sessions?id=${sessionId}`, { method: "DELETE" });
      } catch {
        // ignore
      }
    }

    if (activeSessionId === sessionId) {
      handleNewChat();
    }
    toast.success("Sesi obrolan dihapus.");
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage = makeUserMessage(query);
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Determine or create session ID
    let currentSessionId = activeSessionId;
    if (!currentSessionId) {
      const newSession = createNewSession(isDemo, query);
      currentSessionId = newSession.id;
      setActiveSessionId(currentSessionId);
      setSessions((prev) => [newSession, ...prev]);
    }

    try {
      const history = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history,
          demo: isDemo ? "jimmy" : undefined,
          sessionId: currentSessionId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Gagal mendapatkan respon dari AI.");
      }

      setMessages((prev) => [...prev, data.message]);

      // If auto-save was triggered on the backend
      if (data.savedItem && isDemo && typeof window !== "undefined") {
        try {
          const stored = sessionStorage.getItem("extra_demo_memories");
          const existing = stored ? JSON.parse(stored) : [];
          sessionStorage.setItem("extra_demo_memories", JSON.stringify([data.savedItem, ...existing]));
          toast.success("Catatan otomatis tersimpan ke Timeline!", {
            action: {
              label: "Lihat Timeline",
              onClick: () => router.push("/timeline?demo=jimmy"),
            },
          });
        } catch {
          // ignore
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan saat berbincang.");
    } finally {
      setIsLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  const handleSaveToTimeline = async (msgId: string, content: string) => {
    setSavingMsgId(msgId);
    try {
      const res = await fetch("/api/chat/save-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: content,
          demo: isDemo ? "jimmy" : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Gagal menyimpan catatan.");
      }

      if (data.isDemo && data.item && typeof window !== "undefined") {
        try {
          const stored = sessionStorage.getItem("extra_demo_memories");
          const existing = stored ? JSON.parse(stored) : [];
          sessionStorage.setItem("extra_demo_memories", JSON.stringify([data.item, ...existing]));
        } catch {
          // ignore
        }
      }

      toast.success(`Catatan "${data.summary}" berhasil disimpan ke Timeline!`, {
        action: {
          label: "Buka Timeline",
          onClick: () => router.push(isDemo ? "/timeline?demo=jimmy" : "/timeline"),
        },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan catatan.");
    } finally {
      setSavingMsgId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const activeSessionTitle = sessions.find((s) => s.id === activeSessionId)?.title || "Obrolan Baru";

  return (
    <div className="flex h-full w-full overflow-hidden bg-canvas text-foreground">
      {/* Session History Sidebar */}
      <ChatSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        isOpen={sidebarOpen}
        onToggleOpen={() => setSidebarOpen((prev) => !prev)}
      />

      {/* Main Conversation Area */}
      <div className="flex flex-1 flex-col h-full overflow-hidden">
        {/* Top Navigation Header */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-hairline/80 bg-surface/90 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen((prev) => !prev)}
              title="Toggle Riwayat Obrolan"
              aria-label="Toggle Riwayat Obrolan"
              className="rounded-lg p-2 text-muted hover:bg-surface-subdued hover:text-foreground transition md:hidden"
            >
              <PanelLeft className="h-4 w-4" />
            </button>

            <Link
              href={backLink}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-muted hover:text-foreground transition shrink-0"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
            </Link>

            <div className="hidden h-4 w-px bg-hairline sm:block shrink-0" />

            <div className="flex items-center gap-2 min-w-0">
              <span className="font-serif text-sm font-medium truncate max-w-[220px] sm:max-w-md">
                {activeSessionTitle}
              </span>
              {isDemo && (
                <span className="hidden sm:inline-block rounded-full border border-brand/20 bg-brand/10 px-2 py-0.5 text-[10px] font-mono uppercase text-brand shrink-0">
                  Demo Jimmy
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleNewChat}
                title="Mulai Obrolan Baru"
                className="inline-flex items-center gap-1 rounded-lg border border-hairline bg-surface px-2.5 py-1 text-xs font-mono text-muted hover:text-foreground hover:bg-surface-subdued transition"
              >
                <span>+ Baru</span>
              </button>
            )}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="rounded-lg p-2 text-muted hover:bg-surface-subdued hover:text-foreground transition"
            >
              {mounted && theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {/* Conversation Stream */}
        <main
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 max-w-3xl w-full mx-auto"
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brand/30 bg-brand/10 text-brand shadow-xs">
                <MessageSquare className="h-7 w-7" />
              </div>
              <h1 className="mt-5 font-serif text-2xl font-medium sm:text-3xl">
                Sahabat Jurnal Memori-mu
              </h1>
              <p className="mt-2 max-w-md text-sm text-muted leading-relaxed">
                Tanyakan apa saja tentang perjalanan hidup, aktivitas, orang-orang terdekat, atau tempat favoritmu. Kamu juga bisa langsung meminta: <em>&quot;Catat ini: ...&quot;</em> untuk menambah catatan baru.
              </p>

              {/* Quick Prompt Chips */}
              <div className="mt-8 w-full">
                <p className="font-mono text-xs uppercase tracking-wider text-muted mb-3">
                  Pertanyaan Cepat
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {QUICK_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSend(prompt)}
                      className="flex items-center gap-2 rounded-xl border border-hairline bg-surface p-3 text-left text-xs text-foreground/90 transition hover:border-brand/40 hover:bg-surface-subdued hover:text-brand shadow-2xs"
                    >
                      <MessageSquare className="h-3.5 w-3.5 shrink-0 text-brand/70" />
                      <span>{prompt}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 pb-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full border border-brand/30 bg-brand/10 text-brand mt-0.5">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[78%] ${
                      msg.role === "user"
                        ? "rounded-tr-xs bg-brand text-white shadow-xs"
                        : "rounded-tl-xs border border-hairline bg-surface text-foreground shadow-2xs"
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                    <div className="mt-2.5 flex items-center justify-between gap-3 border-t border-hairline/40 pt-1.5">
                      <button
                        type="button"
                        onClick={() => handleSaveToTimeline(msg.id, msg.content)}
                        disabled={savingMsgId === msg.id}
                        className={`inline-flex items-center gap-1.5 text-[11px] font-mono transition ${
                          msg.role === "user"
                            ? "text-white/80 hover:text-white"
                            : "text-brand hover:underline"
                        }`}
                      >
                        <BookmarkPlus className="h-3.5 w-3.5" />
                        <span>{savingMsgId === msg.id ? "Menyimpan…" : "Simpan ke Catatan"}</span>
                      </button>

                      <span
                        className={`block text-[10px] font-mono opacity-60 ${
                          msg.role === "user" ? "text-white/80" : "text-muted"
                        }`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>

                  {msg.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full border border-hairline bg-surface-subdued text-muted mt-0.5">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full border border-brand/30 bg-brand/10 text-brand mt-0.5">
                    <Loader2 className="h-4 w-4 animate-spin text-brand" />
                  </div>
                  <div className="max-w-[80%] rounded-2xl rounded-tl-xs border border-hairline bg-surface p-4 text-xs text-muted shadow-2xs">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-brand animate-ping" />
                      Gemini sedang membaca memorimu dan merenungkannya…
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Sticky Bottom Input Bar */}
        <footer className="shrink-0 border-t border-hairline/80 bg-surface/95 p-3 backdrop-blur-md sm:p-4">
          <div className="mx-auto max-w-3xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-end gap-2 rounded-2xl border border-hairline bg-canvas p-1.5 focus-within:border-brand/60 focus-within:ring-1 focus-within:ring-brand/40 shadow-xs"
            >
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tanyakan kenanganmu atau ketik 'Catat ini: ...' untuk menambah catatan"
                className="max-h-32 min-h-[38px] flex-1 resize-none bg-transparent px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted/60"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                aria-label="Kirim pesan"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand text-white transition hover:bg-brand-hover disabled:opacity-40 disabled:hover:bg-brand"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <p className="mt-2 text-center text-[11px] font-mono text-muted/70">
              Tekan Enter untuk kirim · Gunakan tombol &quot;Simpan ke Catatan&quot; untuk memasukkan percakapan ke Timeline
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
