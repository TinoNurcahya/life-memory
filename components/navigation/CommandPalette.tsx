"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import type { TimelineItem } from "@/lib/queries/activities";
import styles from "./DashboardNavigation.module.css";

const routes = [
  ["Timeline", "/timeline"],
  ["Visual Calendar", "/calendar"],
  ["People", "/people"],
  ["Places", "/places"],
  ["Topics", "/topics"],
  ["Insights", "/insights"],
  ["Reflection", "/reflection"],
  ["Tanya AI", "/chat"],
  ["Forgot this", "/forgot-this"],
  ["Settings", "/settings"],
  ["About Us", "/about"],
  ["FAQ", "/faq"],
  ["Privacy Policy", "/privacy"],
  ["Terms of Service", "/terms"],
  ["Disclaimer", "/disclaimer"],
  ["User Sitemap", "/sitemap"],
] as const;

interface CommandPaletteProps {
  items: TimelineItem[];
  demo?: boolean;
  showFloatingTrigger?: boolean;
  variant?: "default" | "dashboard";
}

export function CommandPalette({ items, demo = false, showFloatingTrigger = true, variant = "default" }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const isDashboard = variant === "dashboard";

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    searchRef.current?.focus();
    return () => previousFocus?.focus();
  }, [open]);

  const suffix = demo ? "?demo=jimmy" : "";
  const memories = useMemo(() => items.filter((item) => !query || `${item.summary} ${item.rawText}`.toLowerCase().includes(query.toLowerCase())).slice(0, 5), [items, query]);
  if (!open) {
    return showFloatingTrigger ? <button type="button" onClick={() => setOpen(true)} className="fixed bottom-5 right-5 z-30 rounded-full border border-hairline bg-surface px-3 py-2 text-xs text-muted shadow-lg">⌘K <span className="hidden sm:inline">Search archive</span></button> : null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Search archive"
      onMouseDown={() => setOpen(false)}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = dialogRef.current?.querySelectorAll<HTMLElement>('input, a[href], button:not([disabled])');
        if (!controls?.length) return;
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }}
    >
      <div ref={dialogRef} className={`w-full max-w-xl rounded-2xl border border-hairline bg-surface p-3 shadow-2xl ${isDashboard ? styles.palette : ""}`} onMouseDown={(event) => event.stopPropagation()}>
        <div className={isDashboard ? styles.paletteSearchRow : undefined}>
          <input ref={searchRef} aria-label="Search memories" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search memories or navigate…" className="w-full rounded-lg border border-hairline bg-surface-subdued px-3 py-2 text-sm outline-none focus:border-brand" />
          {isDashboard && <button type="button" className={styles.iconButton} aria-label="Close search" onClick={() => setOpen(false)}><X size={18} aria-hidden="true" /></button>}
        </div>
        {!query && (
          <div className="mt-3 grid grid-cols-2 gap-1">
            {routes.map(([label, href]) => <Link key={href} href={href + suffix} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface-subdued hover:text-foreground">{isDashboard && href === "/chat" ? "Ask Memory" : label}</Link>)}
          </div>
        )}
        {query && (
          <div className="mt-3 space-y-1">
            {memories.map((item) => (
              <Link key={item.id} href={(demo ? "/timeline?demo=jimmy" : "/timeline") + "#" + item.id} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm hover:bg-surface-subdued">
                {item.summary}
                <time className={`mt-0.5 block ${isDashboard ? "text-xs" : "text-[10px]"} text-muted`} dateTime={item.occurredAt}>{item.occurredAt}</time>
              </Link>
            ))}
            {!memories.length && <p className="px-3 py-4 text-sm text-muted" role="status">No matching memory.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
