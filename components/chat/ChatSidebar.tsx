"use client";

import { MessageSquare, Plus, Trash2, PanelLeftClose, PanelLeft } from "lucide-react";

export interface ChatSessionSummary {
  id: string;
  title: string;
  updatedAt: string;
}

export function ChatSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  isOpen,
  onToggleOpen,
}: {
  sessions: ChatSessionSummary[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onToggleOpen}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-hairline/80 bg-surface transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:w-0 md:overflow-hidden md:border-r-0"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between border-b border-hairline/60 p-3.5">
          <button
            type="button"
            onClick={onNewChat}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-brand/30 bg-brand/10 py-2 px-3 text-xs font-mono font-medium text-brand transition hover:bg-brand/20 shadow-2xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Obrolan Baru</span>
          </button>
          <button
            type="button"
            onClick={onToggleOpen}
            title="Tutup Panel Riwayat"
            aria-label="Tutup Panel Riwayat"
            className="ml-2 rounded-lg p-2 text-muted hover:bg-surface-subdued hover:text-foreground transition"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <p className="px-2 pt-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-muted">
            Riwayat Percakapan
          </p>

          {sessions.length === 0 ? (
            <div className="py-8 text-center px-4">
              <MessageSquare className="mx-auto h-6 w-6 text-muted/40 mb-2" />
              <p className="text-xs text-muted">Belum ada percakapan lampau.</p>
              <p className="text-[11px] text-muted/70 mt-1">Mulai obrolan baru untuk mencatat kenangan.</p>
            </div>
          ) : (
            sessions.map((session) => {
              const isActive = session.id === activeSessionId;
              return (
                <div
                  key={session.id}
                  className={`group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-xs transition cursor-pointer ${
                    isActive
                      ? "border border-brand/30 bg-brand/10 text-brand font-medium shadow-2xs"
                      : "text-foreground/80 hover:bg-surface-subdued hover:text-foreground"
                  }`}
                  onClick={() => onSelectSession(session.id)}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-6">
                    <MessageSquare className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-brand" : "text-muted"}`} />
                    <span className="truncate">{session.title}</span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    title="Hapus sesi ini"
                    aria-label="Hapus sesi ini"
                    className="absolute right-2 opacity-0 group-hover:opacity-100 rounded p-1 text-muted hover:text-red-500 hover:bg-surface transition"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="border-t border-hairline/60 p-3 text-center">
          <p className="text-[10px] font-mono text-muted/70">
            {sessions.length} sesi percakapan tersimpan
          </p>
        </div>
      </aside>

      {/* Floating Toggle Button when Sidebar is closed on Desktop */}
      {!isOpen && (
        <button
          type="button"
          onClick={onToggleOpen}
          title="Buka Riwayat Obrolan"
          aria-label="Buka Riwayat Obrolan"
          className="fixed top-16 left-4 z-20 hidden md:flex items-center gap-1.5 rounded-full border border-hairline bg-surface/90 px-3 py-1.5 text-xs font-mono text-muted shadow-md hover:bg-surface-subdued hover:text-foreground backdrop-blur-md transition"
        >
          <PanelLeft className="h-3.5 w-3.5" />
          <span>Riwayat</span>
        </button>
      )}
    </>
  );
}
