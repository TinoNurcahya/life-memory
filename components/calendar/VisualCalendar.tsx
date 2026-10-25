"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { TimelineItem } from "@/lib/queries/activities";
import { DayInspectorDrawer } from "@/components/calendar/DayInspectorDrawer";
import styles from "./VisualCalendar.module.css";

interface VisualCalendarProps {
  initialItems: TimelineItem[];
  demo?: boolean;
  initialToday?: string;
}

const CATEGORIES = [
  { key: "all", label: "Semua kategori" },
  { key: "career", label: "Karier" },
  { key: "social", label: "Sosial" },
  { key: "health", label: "Kesehatan" },
  { key: "learning", label: "Belajar" },
  { key: "leisure", label: "Waktu luang" },
  { key: "routine", label: "Rutinitas" },
  { key: "other", label: "Lainnya" },
];

const CATEGORY_COLORS: Record<string, string> = {
  career: "#C98A4C",
  social: "#C25B4E",
  health: "#3B8A6E",
  learning: "#3D78A8",
  leisure: "#8C5DA6",
  routine: "#6E737B",
  other: "#9E8C78",
};

const WEEKDAYS = [
  ["Sen", "Senin"], ["Sel", "Selasa"], ["Rab", "Rabu"], ["Kam", "Kamis"],
  ["Jum", "Jumat"], ["Sab", "Sabtu"], ["Min", "Minggu"],
];

function localDateKey(date: Date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}

function getLocalToday() {
  return localDateKey(new Date());
}

function subscribeToday(onChange: () => void) {
  const timer = window.setInterval(onChange, 60_000);
  window.addEventListener("focus", onChange);
  return () => {
    window.clearInterval(timer);
    window.removeEventListener("focus", onChange);
  };
}

const emptySnapshot = () => null;

function getDemoSnapshot() {
  try {
    return sessionStorage.getItem("extra_demo_memories");
  } catch {
    return null;
  }
}

function subscribeDemoMemories(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("focus", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("focus", onChange);
  };
}

function readDemoMemories(snapshot: string | null): TimelineItem[] {
  if (!snapshot) return [];
  try {
    const parsed: unknown = JSON.parse(snapshot);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is TimelineItem =>
      item && typeof item === "object" &&
      typeof item.id === "string" && typeof item.summary === "string" &&
      typeof item.occurredAt === "string" && /^\d{4}-\d{2}-\d{2}$/.test(item.occurredAt) &&
      (item.category == null || CATEGORIES.some((category) => category.key !== "all" && category.key === item.category)) &&
      [item.people, item.places, item.topics].every((entities) =>
        Array.isArray(entities) && entities.every((entity) =>
          entity && typeof entity.id === "string" && typeof entity.name === "string"
        )
      ) &&
      (item.imageUrls == null || (Array.isArray(item.imageUrls) && item.imageUrls.every((url: unknown) => typeof url === "string")))
    );
  } catch {
    return [];
  }
}

export function VisualCalendar({ initialItems, demo = false, initialToday }: VisualCalendarProps) {
  // Keep the server and hydration snapshot identical before adding session memories.
  const storedMemories = useSyncExternalStore(
    subscribeDemoMemories,
    demo ? getDemoSnapshot : emptySnapshot,
    emptySnapshot,
  );
  const items = useMemo(() => {
    const extra = demo ? readDemoMemories(storedMemories) : [];
    return Array.from(new Map([...extra, ...initialItems].map((item) => [item.id, item])).values());
  }, [initialItems, demo, storedMemories]);

  // Hydrate from the exact server snapshot, then follow the browser's local day.
  const todayString = useSyncExternalStore(subscribeToday, getLocalToday, () => initialToday ?? "");
  const [requestedMonth, setRequestedMonth] = useState<{ year: number; month: number } | null>(null);
  const viewMonth = useMemo(() => {
    const [year, month] = (todayString || "2000-01-01").split("-").map(Number);
    return requestedMonth ?? { year, month: month - 1 };
  }, [requestedMonth, todayString]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const monthDate = new Date(viewMonth.year, viewMonth.month, 1);
  const monthName = new Intl.DateTimeFormat("id-ID", { month: "long" }).format(monthDate);
  const monthLabel = monthName + " " + viewMonth.year;

  const itemsByDate = useMemo(() => {
    const grouped = new Map<string, TimelineItem[]>();
    for (const item of items) {
      if (selectedCategory !== "all" && (item.category ?? "other") !== selectedCategory) continue;
      const dayItems = grouped.get(item.occurredAt) ?? [];
      dayItems.push(item);
      grouped.set(item.occurredAt, dayItems);
    }
    return grouped;
  }, [items, selectedCategory]);

  const calendarDays = useMemo(() => {
    const offset = (new Date(viewMonth.year, viewMonth.month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(viewMonth.year, viewMonth.month + 1, 0).getDate();
    const count = Math.ceil((offset + daysInMonth) / 7) * 7;
    const dateFormatter = new Intl.DateTimeFormat("id-ID", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
    return Array.from({ length: count }, (_, index) => {
      const date = new Date(viewMonth.year, viewMonth.month, index - offset + 1);
      const dateKey = localDateKey(date);
      const dayItems = itemsByDate.get(dateKey) ?? [];
      return {
        date: dateKey,
        label: dateFormatter.format(date),
        dayNumber: date.getDate(),
        isCurrentMonth: date.getMonth() === viewMonth.month,
        isToday: dateKey === todayString,
        items: dayItems,
        photos: dayItems.flatMap((item) => item.imageUrls ?? []),
      };
    });
  }, [viewMonth, itemsByDate, todayString]);

  const monthStats = useMemo(() => {
    const days = calendarDays.filter((day) => day.isCurrentMonth);
    return {
      activeDays: days.filter((day) => day.items.length > 0).length,
      memories: days.reduce((count, day) => count + day.items.length, 0),
      photos: days.reduce((count, day) => count + day.photos.length, 0),
    };
  }, [calendarDays]);

  // Opening a day always reveals all of its memories, including other categories.
  const selectedDayItems = useMemo(
    () => items.filter((item) => item.occurredAt === selectedDate),
    [items, selectedDate],
  );

  function changeMonth(offset: number) {
    setRequestedMonth((current) => {
      const base = current ?? viewMonth;
      const date = new Date(base.year, base.month + offset, 1);
      return { year: date.getFullYear(), month: date.getMonth() };
    });
  }

  if (!todayString) return <p role="status">Memuat kalender…</p>;

  return (
    <div className={styles.calendar}>
      <div className={styles.topline}>
        <p className={styles.eyebrow}>Arsip bulanan</p>
        <Link href={demo ? "/timeline?demo=jimmy" : "/timeline"} className={styles.timelineLink}>
          Lihat timeline <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </div>

      <header className={styles.masthead}>
        <h1 className={styles.title} aria-label={"Kalender " + monthLabel}>
          <span className={styles.monthName}>{monthName}</span>
          <span className={styles.year}>{viewMonth.year}</span>
        </h1>
        <nav className={styles.monthNavigation} aria-label="Navigasi bulan">
          <button type="button" onClick={() => changeMonth(-1)} aria-label="Bulan sebelumnya">
            <ChevronLeft size={21} aria-hidden="true" />
          </button>
          <button type="button" onClick={() => changeMonth(1)} aria-label="Bulan berikutnya">
            <ChevronRight size={21} aria-hidden="true" />
          </button>
        </nav>
      </header>

      <div className={styles.toolbar}>
        <p className={styles.summary} aria-live="polite" aria-atomic="true">
          <span className="sr-only">{monthLabel + ". "}</span>
          <span><strong>{monthStats.memories}</strong> memori</span>
          <span><strong>{monthStats.activeDays}</strong> hari terisi</span>
          <span><strong>{monthStats.photos}</strong> foto</span>
        </p>
        <div className={styles.tools}>
          <button
            type="button"
            className={styles.todayButton}
            onClick={() => setRequestedMonth(null)}
          >
            Hari ini
          </button>
          <label className={styles.categoryFilter}>
            <span className="sr-only">Filter kategori</span>
            <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
              {CATEGORIES.map((category) => <option key={category.key} value={category.key}>{category.label}</option>)}
            </select>
          </label>
        </div>
      </div>

      {monthStats.memories === 0 && (
        <p className={styles.emptyMonth} role="status">
          {selectedCategory === "all" ? "Belum ada memori di bulan ini." : "Belum ada memori untuk kategori ini di bulan " + monthName + "."}
          {selectedCategory !== "all" && <button type="button" onClick={() => setSelectedCategory("all")}>Lihat semua kategori</button>}
        </p>
      )}

      <section aria-label={"Kalender " + monthLabel} className={styles.sheet} data-calendar-grid>
        <div className={styles.weekdays} aria-hidden="true">
          {WEEKDAYS.map(([short, full]) => (
            <div key={short}>
              <span className={styles.weekdayShort}>{short}</span>
              <span className={styles.weekdayFull}>{full}</span>
            </div>
          ))}
        </div>
        <div className={styles.days}>
          {calendarDays.map((cell) => {
            const hasPhotos = cell.photos.length > 0;
            const isSelected = cell.date === selectedDate && isDrawerOpen;
            const className = [
              styles.day,
              hasPhotos && styles.withPhoto,
              !cell.isCurrentMonth && styles.adjacentMonth,
              cell.isToday && styles.isToday,
              isSelected && styles.selected,
            ].filter(Boolean).join(" ");
            return (
              <button
                key={cell.date}
                type="button"
                className={className}
                data-calendar-date={cell.date}
                aria-label={cell.label + ", " + cell.items.length + " memori" + (hasPhotos ? ", " + cell.photos.length + " foto" : "")}
                aria-current={cell.isToday ? "date" : undefined}
                aria-haspopup="dialog"
                aria-expanded={isSelected}
                onClick={() => { setSelectedDate(cell.date); setIsDrawerOpen(true); }}
              >
                {hasPhotos && (
                  <span className={styles.photo}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cell.photos[0]} alt="" loading="lazy" />
                  </span>
                )}
                <span className={styles.dayTop} aria-hidden="true">
                  <span className={styles.dateNumber}>{cell.dayNumber}</span>
                  {cell.isToday && <span className={styles.todayLabel}>Hari ini</span>}
                </span>
                {!hasPhotos && cell.items.length > 0 && (
                  <span className={styles.noteExcerpt} aria-hidden="true">{cell.items[0].summary}</span>
                )}
                <span className={styles.dayBottom} aria-hidden="true">
                  <span className={styles.categoryDots}>
                    {cell.items.slice(0, 4).map((item, index) => (
                      <span
                        key={item.id}
                        className={index > 0 ? styles.secondaryDot : undefined}
                        style={{ backgroundColor: CATEGORY_COLORS[item.category ?? "other"] ?? CATEGORY_COLORS.other }}
                      />
                    ))}
                    {cell.items.length > 4 && <span className={styles.moreItems}>+{cell.items.length - 4}</span>}
                  </span>
                  {cell.photos.length > 1 ? (
                    <span className={styles.photoCount}>+{cell.photos.length - 1}<span className={styles.countLabel}> foto</span></span>
                  ) : cell.items.length > 1 ? (
                    <span className={styles.memoryCount}>{cell.items.length}<span className={styles.countLabel}> memori</span></span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <footer className={styles.footer}>
        <span>Pilih tanggal untuk melihat semua memori hari itu.</span>
      </footer>

      <DayInspectorDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        date={selectedDate}
        items={selectedDayItems}
        demo={demo}
      />
    </div>
  );
}
