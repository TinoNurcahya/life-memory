"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { X, Calendar, MapPin, Tag, User, ArrowRight, Image as ImageIcon } from "lucide-react";
import type { TimelineItem } from "@/lib/queries/activities";
import { MemoryImageGrid } from "@/components/activity/MemoryImageGrid";

interface DayInspectorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  date: string | null;
  items: TimelineItem[];
  demo?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  career: "#C98A4C",
  social: "#C25B4E",
  health: "#3B8A6E",
  learning: "#3D78A8",
  leisure: "#8C5DA6",
  routine: "#6E737B",
  other: "#9E8C78",
};

export function DayInspectorDrawer({
  isOpen,
  onClose,
  date,
  items,
  demo = false,
}: DayInspectorDrawerProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const formattedDate = useMemo(() => {
    if (!date) return "";
    try {
      const d = new Date(`${date}T00:00:00Z`);
      return new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(d);
    } catch {
      return date;
    }
  }, [date]);

  const totalPhotos = useMemo(() => {
    return items.reduce((acc, it) => acc + (it.imageUrls?.length || 0), 0);
  }, [items]);

  if (!isOpen) return null;

  const linkSuffix = demo ? "?demo=jimmy" : "";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Inspeksi tanggal ${date || ""}`}
      className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <aside
        className="relative z-10 flex h-full w-full max-w-lg flex-col border-l border-hairline bg-surface text-foreground shadow-2xl animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-hairline px-6 py-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand/10 text-brand">
                <Calendar className="h-3.5 w-3.5" />
              </span>
              <span className="font-mono text-xs uppercase tracking-wider text-muted">
                Inspeksi Hari
              </span>
            </div>
            <h2 className="font-serif text-xl font-normal capitalize text-foreground">
              {formattedDate}
            </h2>
            <div className="flex items-center gap-3 pt-0.5 text-xs text-muted">
              <span>{items.length} aktivitas terekam</span>
              {totalPhotos > 0 && (
                <span className="inline-flex items-center gap-1 font-mono text-[11px] text-brand">
                  <ImageIcon className="h-3 w-3" />
                  {totalPhotos} foto analog
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup panel inspeksi hari"
            className="rounded-lg p-2 text-muted transition hover:bg-surface-subdued hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-hairline/70 p-10 text-center">
              <Calendar className="h-8 w-8 text-muted/50 mb-3" />
              <p className="font-serif text-base text-foreground">Tidak Ada Memori</p>
              <p className="mt-1 text-xs text-muted max-w-xs leading-relaxed">
                Belum ada aktivitas yang dicatat pada tanggal ini. Catat momen baru menggunakan Quick Logger.
              </p>
            </div>
          ) : (
            items.map((item) => {
              const catColor = item.category ? CATEGORY_COLORS[item.category] || "#9E8C78" : "#9E8C78";

              return (
                <article
                  key={item.id}
                  className="rounded-2xl border border-hairline bg-surface-subdued/70 p-5 shadow-xs transition hover:border-brand/40 space-y-3.5"
                >
                  {/* Top metadata badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-mono capitalize"
                        style={{
                          borderColor: `${catColor}40`,
                          backgroundColor: `${catColor}15`,
                          color: catColor,
                        }}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: catColor }}
                        />
                        {item.category || "other"}
                      </span>

                      {item.isFirstTime && (
                        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] text-amber-500">
                          Pertama Kali
                        </span>
                      )}

                      {item.eventStatus && item.eventStatus !== "completed" && (
                        <span className="rounded-full border border-hairline bg-surface px-2 py-0.5 font-mono text-[10px] text-muted uppercase">
                          {item.eventStatus}
                        </span>
                      )}
                    </div>

                    {item.timeHint && (
                      <span className="font-mono text-[11px] text-muted">
                        {item.timeHint}
                      </span>
                    )}
                  </div>

                  {/* High Quality Analog Photo Gallery */}
                  {item.imageUrls && item.imageUrls.length > 0 && (
                    <MemoryImageGrid
                      images={item.imageUrls}
                      summary={item.summary}
                      date={formattedDate}
                    />
                  )}

                  {/* Summary Text */}
                  <p className="font-serif text-base leading-relaxed text-foreground">
                    {item.summary}
                  </p>

                  {/* Source Raw Text quote if distinct from summary */}
                  {item.sourceText && item.sourceText !== item.summary && (
                    <p className="rounded-lg border-l-2 border-brand/40 bg-surface/50 px-3 py-1.5 font-mono text-xs text-muted leading-normal">
                      &ldquo;{item.sourceText}&rdquo;
                    </p>
                  )}

                  {/* Connected Entities */}
                  {(item.people.length > 0 || item.places.length > 0 || item.topics.length > 0) && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-hairline/60">
                      {item.people.map((person) => (
                        <Link
                          key={person.id}
                          href={`/people/${person.id}${linkSuffix}`}
                          onClick={onClose}
                          className="inline-flex items-center gap-1 rounded-full border border-hairline bg-surface px-2.5 py-1 text-[11px] text-foreground transition hover:border-brand/40 hover:text-brand"
                        >
                          <User className="h-3 w-3 text-brand" />
                          <span>{person.name}</span>
                        </Link>
                      ))}

                      {item.places.map((place) => (
                        <Link
                          key={place.id}
                          href={`/places/${place.id}${linkSuffix}`}
                          onClick={onClose}
                          className="inline-flex items-center gap-1 rounded-md border border-hairline bg-surface px-2.5 py-1 text-[11px] text-foreground transition hover:border-brand/40 hover:text-brand"
                        >
                          <MapPin className="h-3 w-3 text-brand" />
                          <span>{place.name}</span>
                        </Link>
                      ))}

                      {item.topics.map((topic) => (
                        <Link
                          key={topic.id}
                          href={`/topics/${topic.id}${linkSuffix}`}
                          onClick={onClose}
                          className="inline-flex items-center gap-1 rounded-md border border-brand/20 bg-brand/5 px-2.5 py-1 text-[11px] text-brand transition hover:bg-brand/10"
                        >
                          <Tag className="h-3 w-3" />
                          <span>{topic.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Action Link to Feed */}
                  <div className="pt-1 flex items-center justify-end">
                    <Link
                      href={`${demo ? "/timeline?demo=jimmy" : "/timeline"}#${item.id}`}
                      onClick={onClose}
                      className="inline-flex items-center gap-1.5 font-mono text-xs text-muted hover:text-brand transition group"
                    >
                      <span>Lihat di Timeline Feed</span>
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="border-t border-hairline bg-surface-subdued/40 px-6 py-4 flex items-center justify-between text-xs text-muted">
          <span className="font-mono text-[11px]">Tekan ESC untuk menutup</span>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-xs text-brand hover:underline"
          >
            Selesai
          </button>
        </div>
      </aside>
    </div>
  );
}
