"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Plus, Search, Trash2, X } from "lucide-react";
import { dashboardSans, dashboardSerif } from "@/components/dashboard/fonts";
import styles from "./Chat.module.css";

export interface ChatSessionSummary { id: string; title: string; updatedAt: string }
interface Props {
  sessions: ChatSessionSummary[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  busy?: boolean;
  error?: string | null;
  onRetry?: () => void;
  deletingId?: string | null;
}

function HistoryDialog({ sessions, activeSessionId, onSelectSession, onNewChat, onDeleteSession, onToggleOpen, busy, error, onRetry, deletingId }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const fold = (value: string) => value.normalize("NFKD").replace(/\p{M}/gu, "").toLocaleLowerCase("id-ID");
  const visible = sessions.filter(session => fold(session.title).includes(fold(query.trim())))
    .sort((a, b) => (Date.parse(b.updatedAt) || 0) - (Date.parse(a.updatedAt) || 0) || a.id.localeCompare(b.id));

  useLayoutEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const shell = document.querySelector<HTMLElement>(".lm-vault-shell--dashboard");
    const previousInert = shell?.inert ?? false;
    const previousOverflow = document.body.style.overflow;
    if (shell) shell.inert = true;
    document.body.style.overflow = "hidden";
    const first = () => root.current?.querySelector<HTMLButtonElement>("[data-chat-history-close]");
    first()?.focus({ preventScroll: true });
    const focusInside = (event: FocusEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) first()?.focus({ preventScroll: true });
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault(); event.stopPropagation(); onToggleOpen();
      }
      if ((event.ctrlKey || event.metaKey) && ["k", "b"].includes(event.key.toLowerCase())) {
        event.preventDefault(); event.stopPropagation();
      }
      if (event.key !== "Tab") return;
      const controls = Array.from(root.current?.querySelectorAll<HTMLElement>("button:not(:disabled), input") ?? []).filter(e => e.getClientRects().length);
      const start = controls[0], end = controls.at(-1);
      if (event.shiftKey && document.activeElement === start) { event.preventDefault(); end?.focus(); }
      else if (!event.shiftKey && document.activeElement === end) { event.preventDefault(); start?.focus(); }
    };
    document.addEventListener("focusin", focusInside);
    document.addEventListener("keydown", handleKey, true);
    return () => {
      document.removeEventListener("focusin", focusInside);
      document.removeEventListener("keydown", handleKey, true);
      if (shell) shell.inert = previousInert;
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [onToggleOpen]);

  return createPortal(
    <div className={["lm-vault-shell--dashboard", dashboardSans.variable, dashboardSerif.variable, styles.historyLayer].join(" ")}
      onMouseDown={event => { if (event.target === event.currentTarget) onToggleOpen(); }}>
      <div ref={root} role="dialog" aria-modal="true" aria-labelledby="chat-history-title" className={styles.history} data-chat-history>
        <header className={styles.historyHeader}>
          <h2 id="chat-history-title">Riwayat</h2>
          <button type="button" className={styles.iconButton} onClick={onToggleOpen} aria-label="Tutup riwayat" data-chat-history-close><X size={20} aria-hidden="true" /></button>
        </header>
        <div className={styles.historyTools}>
          <button type="button" className={styles.historyNew} disabled={busy} onClick={onNewChat}><Plus size={18} aria-hidden="true" /> Obrolan baru</button>
          <label className={styles.historySearch}>
            <Search size={17} aria-hidden="true" /><span className={styles.srOnly}>Cari percakapan</span>
            <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Cari percakapan" />
          </label>
        </div>
        {error && <div className={styles.historyNotice} role="alert"><p>{error}</p>{onRetry && <button type="button" className={styles.textButton} onClick={onRetry} disabled={busy}>Coba lagi</button>}</div>}
        <div className={styles.historyScroll}>
          {visible.length ? <ul className={styles.sessionList}>
            {visible.map(session => {
              const date = new Date(session.updatedAt);
              return <li key={session.id} className={styles.sessionRow} data-active={session.id === activeSessionId}>
                <button type="button" className={styles.sessionSelect} disabled={busy} aria-current={session.id === activeSessionId ? "true" : undefined}
                  onClick={() => onSelectSession(session.id)} data-chat-session={session.id}>
                  <span>{session.title}</span>
                  <time dateTime={Number.isNaN(date.getTime()) ? undefined : session.updatedAt}>{Number.isNaN(date.getTime()) ? "Tanggal belum tersedia" : new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(date)}</time>
                </button>
                <button type="button" className={styles.sessionDelete} disabled={busy || Boolean(deletingId)} onClick={() => onDeleteSession(session.id)}
                  aria-label={(deletingId === session.id ? "Menghapus " : "Hapus percakapan ") + session.title} data-chat-delete={session.id}>
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </li>;
            })}
          </ul> : <div className={styles.historyEmpty}><p>{query ? "Percakapan tidak ditemukan." : "Belum ada percakapan tersimpan."}</p>{query && <button type="button" className={styles.textButton} onClick={() => { setQuery(""); root.current?.querySelector("input")?.focus(); }}>Hapus pencarian</button>}</div>}
        </div>
        <p className={styles.historyCount} role="status">{query ? visible.length + " dari " : ""}{sessions.length} percakapan</p>
      </div>
    </div>, document.body,
  );
}

export function ChatSidebar(props: Props) {
  return props.isOpen ? <HistoryDialog {...props} /> : null;
}
