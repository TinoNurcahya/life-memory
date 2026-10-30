"use client";

import { useState, useRef, useEffect, useLayoutEffect, useTransition, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUpRight, BookmarkPlus, Check, History, Plus, Send } from "lucide-react";
import { ChatSidebar, type ChatSessionSummary } from "./ChatSidebar";
import { ChatMessageContent } from "./ChatMessageContent";
import { chatHref, formatChatTime, isMessage, isUuid, parseMessages, parseSessions, sortSessions, type MessageItem } from "@/lib/chat/model";
import type { TimelineItem } from "@/lib/queries/activities";
import styles from "./Chat.module.css";

export type { MessageItem } from "@/lib/chat/model";

const EMPTY_SESSIONS: ChatSessionSummary[] = [];
const EMPTY_MESSAGES: MessageItem[] = [];
const PROMPTS = [
  "Apa yang paling sering kucatat belakangan ini?",
  "Rangkum aktivitasku minggu ini.",
  "Apa hal baru yang pernah kucoba?",
];
type SaveState = { status: "pending" | "saved" | "error"; error?: string; href?: string };

function rememberDemoNote(item: TimelineItem) {
  const raw = sessionStorage.getItem("extra_demo_memories");
  let existing: TimelineItem[] = [];
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) existing = parsed.filter(value => value && typeof value.id === "string");
  } catch { /* Keep the newly saved item even if an older cache is malformed. */ }
  sessionStorage.setItem("extra_demo_memories", JSON.stringify([item, ...existing.filter(value => value.id !== item.id)]));
}

export function ChatClient({
  isDemo, initialSessions = EMPTY_SESSIONS, initialMessages = EMPTY_MESSAGES,
  initialSessionId = null, requestedSessionId = null, startNew = false,
  initialSessionsError = null, initialMessagesError = null, initialHasOlderMessages = false,
}: {
  isDemo: boolean;
  initialSessions?: ChatSessionSummary[];
  initialMessages?: MessageItem[];
  initialSessionId?: string | null;
  requestedSessionId?: string | null;
  startNew?: boolean;
  initialSessionsError?: string | null;
  initialMessagesError?: string | null;
  initialHasOlderMessages?: boolean;
}) {
  const router = useRouter();
  const [navigationPending, startNavigation] = useTransition();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = useCallback(() => setSidebarOpen(value => !value), []);
  const [state, setState] = useState({
    sessions: initialSessions, activeSessionId: initialSessionId,
    messages: initialMessages, messagesError: initialMessagesError,
  });
  const [hydrated, setHydrated] = useState(!isDemo);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [saveStates, setSaveStates] = useState<Record<string, SaveState>>({});
  const [newReply, setNewReply] = useState(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const transcript = useRef<HTMLElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const alive = useRef(true);
  const sendLock = useRef(false);
  const deleteLock = useRef(false);
  const saveLocks = useRef(new Set<string>());
  const controllers = useRef(new Set<AbortController>());
  const nearBottom = useRef(true);
  const didHydrate = useRef(false);
  const storageFailed = useRef(false);

  useEffect(() => {
    alive.current = true;
    const requests = controllers.current;
    return () => { alive.current = false; requests.forEach(controller => controller.abort()); };
  }, []);

  // Server and first client render use the same props. Local demo history is read
  // only after hydration, and no persistence effect can overwrite it beforehand.
  useEffect(() => {
    if (didHydrate.current || !isDemo) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      didHydrate.current = true;
      try {
        const raw = localStorage.getItem("jimmy_chat_sessions");
        const stored = parseSessions(raw);
        const sessions = stored ?? initialSessions;
        const preferred = requestedSessionId || initialSessionId;
        const id = startNew ? null : (preferred && sessions.some(session => session.id === preferred) ? preferred : requestedSessionId ? requestedSessionId : sessions[0]?.id ?? null);
        const sessionExists = !id || sessions.some(session => session.id === id);
        const rawMessages = id ? localStorage.getItem("jimmy_chat_msg_" + id) : null;
        const cachedMessages = parseMessages(rawMessages);
        const messagesError = !sessionExists ? "Percakapan ini tidak ditemukan. Pilih percakapan lain dari riwayat."
          : rawMessages !== null && cachedMessages === null ? "Pesan demo tersimpan tidak dapat dibaca. Kamu bisa membuka percakapan lain atau memulai yang baru." : null;
        setState({ sessions, activeSessionId: id,
          messages: messagesError || !id ? [] : cachedMessages ?? (id === initialSessionId ? initialMessages : []), messagesError });
        if (raw !== null && stored === null) setStorageWarning("Riwayat demo tersimpan tidak dapat dibaca. Contoh percakapan ditampilkan kembali.");
      } catch {
        storageFailed.current = true;
        setStorageWarning("Penyimpanan browser tidak tersedia. Percakapan demo hanya bertahan selama halaman ini terbuka.");
      }
      setHydrated(true);
    });
    return () => { cancelled = true; };
  }, [isDemo, initialSessionId, initialSessions, initialMessages, requestedSessionId, startNew]);

  useEffect(() => {
    if (!isDemo || !hydrated || storageFailed.current) return;
    try {
      localStorage.setItem("jimmy_chat_sessions", JSON.stringify(state.sessions));
      if (state.activeSessionId && !state.messagesError) {
        localStorage.setItem("jimmy_chat_msg_" + state.activeSessionId, JSON.stringify(state.messages));
      }
    } catch {
      storageFailed.current = true;
      queueMicrotask(() => { if (alive.current) setStorageWarning("Riwayat demo tidak dapat disimpan di browser ini. Percakapan yang terbuka tetap tersedia."); });
    }
  }, [isDemo, hydrated, state]);

  useLayoutEffect(() => {
    if (textarea.current) {
      textarea.current.style.height = "auto";
      textarea.current.style.height = Math.min(160, textarea.current.scrollHeight) + "px";
    }
  }, [input]);

  useEffect(() => {
    if (startNew && hydrated) textarea.current?.focus({ preventScroll: true });
  }, [startNew, hydrated]);

  useLayoutEffect(() => {
    if (nearBottom.current && transcript.current) transcript.current.scrollTop = transcript.current.scrollHeight;
  }, [state.messages, sending, hydrated]);

  const saving = Object.values(saveStates).some(value => value.status === "pending");
  const busy = sending || navigationPending || deletingId !== null || saving || !hydrated;
  const canCompose = hydrated && !initialSessionsError && !state.messagesError && !navigationPending;
  const activeTitle = state.sessions.find(session => session.id === state.activeSessionId)?.title ?? "Percakapan baru";
  const guarded = () => sendLock.current || deleteLock.current || saveLocks.current.size > 0 || navigationPending || !hydrated;
  const retryLoad = () => startNavigation(() => router.refresh());
  const updateUrl = (id: string | null, isNew = false) => window.history.replaceState(window.history.state, "", chatHref(isDemo, id, isNew));

  const selectSession = (id: string) => {
    if (guarded()) return;
    setSidebarOpen(false);
    if (id === state.activeSessionId) return;
    startNavigation(() => router.push(chatHref(isDemo, id), { scroll: false }));
  };

  const newChat = () => {
    if (guarded()) return;
    setSidebarOpen(false);
    setSendError(null);
    setSavedNotice(null);
    setDeleteError(null);
    setInput("");
    setState(previous => ({ ...previous, activeSessionId: null, messages: [], messagesError: null }));
    nearBottom.current = true;
    setNewReply(false);
    updateUrl(null, true);
    requestAnimationFrame(() => textarea.current?.focus({ preventScroll: true }));
  };

  const removeSession = async (id: string) => {
    if (guarded()) return;
    const session = state.sessions.find(item => item.id === id);
    if (!session || !window.confirm('Hapus percakapan "' + session.title + '"? Pesan dalam percakapan ini akan dihapus.')) return;
    deleteLock.current = true;
    setDeletingId(id);
    setDeleteError(null);
    const controller = new AbortController();
    controllers.current.add(controller);
    try {
      if (!isDemo) {
        const response = await fetch("/api/chat/sessions?id=" + encodeURIComponent(id), { method: "DELETE", signal: controller.signal });
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error("Percakapan belum berhasil dihapus. Coba lagi.");
      }
      if (!alive.current) return;
      if (isDemo) {
        try { localStorage.removeItem("jimmy_chat_msg_" + id); }
        catch { setStorageWarning("Perubahan riwayat tidak dapat disimpan di browser ini."); }
      }
      const removedActive = state.activeSessionId === id;
      setState(previous => ({
        ...previous, sessions: previous.sessions.filter(item => item.id !== id),
        ...(removedActive ? { activeSessionId: null, messages: [], messagesError: null } : {}),
      }));
      if (removedActive) {
        setInput(""); setSendError(null); setSavedNotice(null); updateUrl(null, true);
      }
    } catch {
      if (alive.current) setDeleteError("Percakapan belum berhasil dihapus. Coba lagi.");
    } finally {
      controllers.current.delete(controller);
      deleteLock.current = false;
      if (alive.current) setDeletingId(null);
    }
  };

  const send = async () => {
    const query = input.trim();
    if (!query || query.length > 2000 || guarded() || !canCompose) return;
    sendLock.current = true;
    const returnToComposer = document.activeElement === textarea.current || document.activeElement?.closest("form")?.contains(textarea.current) === true;
    setSending(true); setSendError(null); setSavedNotice(null); setInput(""); setNewReply(false);
    nearBottom.current = true;
    const userMessage: MessageItem = { id: "user-" + crypto.randomUUID(), role: "user", content: query, createdAt: new Date().toISOString() };
    const previousMessages = state.messages;
    setState(previous => ({ ...previous, messages: [...previous.messages, userMessage] }));
    const controller = new AbortController();
    controllers.current.add(controller);
    let sessionId = state.activeSessionId;
    try {
      if (!sessionId) {
        const title = query.length > 70 ? query.slice(0, 70) + "…" : query;
        let session: ChatSessionSummary;
        if (isDemo) {
          session = { id: "demo-session-" + crypto.randomUUID(), title, updatedAt: new Date().toISOString() };
        } else {
          const response = await fetch("/api/chat/sessions", {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title }), signal: controller.signal,
          });
          const data = await response.json();
          if (!response.ok || !data.success || !isUuid(data.session?.id)) throw new Error("Percakapan baru belum bisa dibuat.");
          session = { id: data.session.id, title: typeof data.session.title === "string" ? data.session.title : title,
            updatedAt: typeof data.session.updated_at === "string" && Number.isFinite(Date.parse(data.session.updated_at)) ? data.session.updated_at : new Date().toISOString() };
        }
        if (!alive.current) return;
        sessionId = session.id;
        setState(previous => ({ ...previous, activeSessionId: session.id, sessions: sortSessions([session, ...previous.sessions.filter(item => item.id !== session.id)]) }));
        updateUrl(session.id);
      }
      const response = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal,
        body: JSON.stringify({ message: query, history: previousMessages.slice(-6).map(({ role, content }) => ({ role, content })), demo: isDemo ? "jimmy" : undefined, sessionId }),
      });
      const data = await response.json();
      if (!response.ok || !data.success || !isMessage(data.message) || data.message.role !== "assistant") throw new Error("Jawaban belum dapat dimuat.");
      if (!alive.current) return;
      const updatedAt = new Date().toISOString();
      setState(previous => ({ ...previous, messages: [...previous.messages, data.message],
        sessions: sortSessions(previous.sessions.map(session => session.id === sessionId ? { ...session, updatedAt } : session)) }));
      if (!nearBottom.current) setNewReply(true);
      if (isDemo && data.savedItem && typeof data.savedItem.id === "string") {
        try {
          rememberDemoNote(data.savedItem);
          setSavedNotice("/timeline?demo=jimmy#" + encodeURIComponent(data.savedItem.id));
          setSaveStates(previous => ({ ...previous, [userMessage.id]: { status: "saved", href: "/timeline?demo=jimmy#" + encodeURIComponent(data.savedItem.id) } }));
        } catch { setStorageWarning("Catatan demo belum dapat disimpan di browser ini."); }
      }
    } catch {
      if (!alive.current) return;
      setState(previous => ({ ...previous, messages: previous.messages.filter(message => message.id !== userMessage.id) }));
      setInput(query);
      setSendError(/catat|simpan/i.test(query)
        ? "Jawaban belum diterima. Pesan dikembalikan ke draf; periksa timeline sebelum mengirim ulang permintaan menyimpan catatan."
        : "Jawaban belum diterima. Pesanmu kembali ke draf dan bisa dikirim lagi.");
    } finally {
      controllers.current.delete(controller);
      sendLock.current = false;
      if (alive.current) {
        setSending(false);
        if (returnToComposer && document.activeElement === document.body) requestAnimationFrame(() => {
          if (alive.current && document.activeElement === document.body) textarea.current?.focus({ preventScroll: true });
        });
      }
    }
  };

  const saveMessage = async (message: MessageItem) => {
    if (saveLocks.current.has(message.id) || saveStates[message.id]?.status === "saved" || sending || navigationPending) return;
    saveLocks.current.add(message.id);
    setSaveStates(previous => ({ ...previous, [message.id]: { status: "pending" } }));
    const controller = new AbortController();
    controllers.current.add(controller);
    try {
      const response = await fetch("/api/chat/save-note", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal,
        body: JSON.stringify({ text: message.content, demo: isDemo ? "jimmy" : undefined }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error("Catatan belum berhasil disimpan.");
      if (!alive.current) return;
      let href = isDemo ? "/timeline?demo=jimmy" : "/timeline";
      if (isDemo) {
        if (!data.item || typeof data.item.id !== "string") throw new Error("Catatan demo belum tersedia.");
        rememberDemoNote(data.item);
        href += "#" + encodeURIComponent(data.item.id);
      } else if (typeof data.detailId === "string") href += "#" + encodeURIComponent(data.detailId);
      setSaveStates(previous => ({ ...previous, [message.id]: { status: "saved", href } }));
    } catch {
      if (alive.current) setSaveStates(previous => ({ ...previous, [message.id]: { status: "error", error: "Catatan belum berhasil disimpan. Periksa timeline sebelum mencoba lagi." } }));
    } finally {
      controllers.current.delete(controller);
      saveLocks.current.delete(message.id);
    }
  };

  const jumpLatest = useCallback(() => {
    nearBottom.current = true;
    transcript.current?.scrollTo({ top: transcript.current.scrollHeight, behavior: "auto" });
    setNewReply(false);
  }, []);

  return (
    <section className={styles.page} data-chat-page data-chat-client data-chat-ready={hydrated} aria-busy={navigationPending}>
      <header className={styles.toolbar}>
        <div className={styles.toolbarTitle}>
          <h1>Ask Memory</h1>
          <p title={activeTitle}>{activeTitle}</p>
        </div>
        <div className={styles.toolbarActions}>
          <button type="button" className={styles.textButton} data-chat-history-toggle aria-expanded={sidebarOpen} aria-haspopup="dialog" onClick={() => setSidebarOpen(true)}>
            <History size={17} aria-hidden="true" /><span>Riwayat</span>
          </button>
          <button type="button" className={styles.textButton} data-chat-new disabled={busy} onClick={newChat}>
            <Plus size={17} aria-hidden="true" /><span>Obrolan baru</span>
          </button>
        </div>
      </header>
      <div className={styles.workspace}>
        <ChatSidebar sessions={state.sessions} activeSessionId={state.activeSessionId}
          onSelectSession={selectSession} onNewChat={newChat} onDeleteSession={removeSession}
          isOpen={sidebarOpen} onToggleOpen={toggleSidebar}
          busy={busy} error={deleteError ?? initialSessionsError} onRetry={initialSessionsError ? retryLoad : undefined} deletingId={deletingId} />
        <div className={styles.chat}>
          <main ref={transcript} className={styles.transcript} data-chat-transcript onScroll={() => {
            const element = transcript.current;
            if (!element) return;
            nearBottom.current = element.scrollHeight - element.scrollTop - element.clientHeight < 80;
            if (nearBottom.current) setNewReply(false);
          }}>
            <div className={styles.readingColumn}>
              {storageWarning && <p className={styles.notice} role="status">{storageWarning}</p>}
              {(initialSessionsError || state.messagesError) ? (
                <div className={styles.notice} role="alert" data-chat-error>
                  <p>{initialSessionsError || state.messagesError}</p>
                  <button type="button" className={styles.textButton} disabled={navigationPending} onClick={retryLoad}>Coba lagi</button>
                </div>
              ) : state.messages.length === 0 ? (
                <div className={styles.empty}>
                  <p className={styles.eyebrow}>Dari catatanmu</p>
                  <h2>Apa yang ingin kamu ingat?</h2>
                  <p>Cari kembali sebuah momen, lihat pola kecil, atau ceritakan sesuatu yang baru.</p>
                  <div className={styles.prompts} aria-label="Contoh pertanyaan">
                    {PROMPTS.map(prompt => <button key={prompt} type="button" className={styles.prompt} data-chat-prompt disabled={!canCompose || busy}
                      onClick={() => { setInput(prompt); textarea.current?.focus({ preventScroll: true }); }}>
                      <span>{prompt}</span><ArrowUpRight size={17} aria-hidden="true" />
                    </button>)}
                  </div>
                </div>
              ) : (
                <>
                  {initialHasOlderMessages && <p className={styles.status}>Menampilkan 50 pesan terakhir dari percakapan ini.</p>}
                  <ol className={styles.conversation} role="log" aria-label="Isi percakapan" aria-live="polite" aria-relevant="additions">
                    {state.messages.map(message => {
                      const save = saveStates[message.id];
                      return <li key={message.id} className={[styles.message, message.role === "user" ? styles.userMessage : styles.assistantMessage].join(" ")}
                        data-chat-message={message.id} data-role={message.role}>
                        <p className={styles.messageLabel}>{message.role === "user" ? "Kamu" : "Life Memory"}</p>
                        <div className={styles.messageBody}><ChatMessageContent content={message.content} /></div>
                        <div className={styles.messageActions}>
                          {save?.status === "saved" ? (
                            <Link href={save.href ?? (isDemo ? "/timeline?demo=jimmy" : "/timeline")} className={styles.savedLabel} data-chat-saved={message.id}>
                              <Check size={15} aria-hidden="true" /> Tersimpan · Lihat catatan
                            </Link>
                          ) : (
                            <button type="button" className={styles.saveButton} data-chat-save={message.id}
                              disabled={save?.status === "pending" || sending || navigationPending || message.content.length > 10000}
                              onClick={() => saveMessage(message)}>
                              <BookmarkPlus size={15} aria-hidden="true" />{save?.status === "pending" ? "Menyimpan…" : "Simpan ke catatan"}
                            </button>
                          )}
                          <time className={styles.messageTime} dateTime={message.createdAt}>{formatChatTime(message.createdAt)}</time>
                        </div>
                        {save?.status === "error" && <p className={styles.notice} role="alert" data-chat-error>{save.error}</p>}
                      </li>;
                    })}
                  </ol>
                </>
              )}
              {sending && <p className={styles.status} role="status" data-chat-status>Sedang membaca catatanmu…</p>}
              {navigationPending && <p className={styles.status} role="status">Membuka percakapan…</p>}
              {savedNotice && <p className={styles.status} role="status"><Link href={savedNotice}>Catatan tersimpan. Lihat di timeline <ArrowUpRight size={14} aria-hidden="true" /></Link></p>}
            </div>
          </main>
          {newReply && <button type="button" className={styles.jumpLatest} onClick={jumpLatest}><ArrowDown size={16} aria-hidden="true" /> Jawaban baru</button>}
          <footer className={styles.composer}>
            <div className={styles.composerInner}>
              {sendError && <p className={styles.notice} role="alert" data-chat-error>{sendError}</p>}
              <form className={styles.composerForm} onSubmit={event => { event.preventDefault(); void send(); }}>
                <label htmlFor="chat-message" className={styles.srOnly}>Pesan untuk Life Memory</label>
                <textarea id="chat-message" ref={textarea} className={styles.composerInput} rows={1} maxLength={2000}
                  data-chat-composer value={input} disabled={!canCompose || sending || deletingId !== null}
                  placeholder="Tanyakan sesuatu dari catatanmu…" aria-describedby="chat-composer-hint"
                  onChange={event => setInput(event.target.value)} onKeyDown={event => {
                    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) {
                      event.preventDefault(); void send();
                    }
                  }} />
                <button type="submit" className={styles.sendButton} aria-label="Kirim pesan" disabled={!canCompose || busy || !input.trim()}><Send size={18} aria-hidden="true" /></button>
              </form>
              <div className={styles.composerMeta}>
                <p id="chat-composer-hint">Enter untuk kirim · Shift+Enter untuk baris baru. <span>Untuk menyimpan momen, tulis “Catat ini: …”.</span></p>
                {input.length >= 1800 && <span className={styles.count} aria-live="polite">{input.length}/2000</span>}
              </div>
            </div>
          </footer>
        </div>
      </div>
    </section>
  );
}
