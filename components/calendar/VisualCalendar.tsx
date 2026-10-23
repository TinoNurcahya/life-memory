"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Image as ImageIcon,
  Users,
  Clock,
  Sparkles as _NoSparkles, // explicitly not using sparkles
} from "lucide-react";
import type { TimelineItem } from "@/lib/queries/activities";
import type { ActivityCategory } from "@/types/database";
import { DayInspectorDrawer } from "@/components/calendar/DayInspectorDrawer";

interface VisualCalendarProps {
  initialItems: TimelineItem[];
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

const CATEGORIES: { key: string; label: string }[] = [
  { key: "all", label: "Semua Kategori" },
  { key: "career", label: "Career" },
  { key: "social", label: "Social" },
  { key: "health", label: "Health" },
  { key: "learning", label: "Learning" },
  { key: "leisure", label: "Leisure" },
  { key: "routine", label: "Routine" },
  { key: "other", label: "Other" },
];

const WEEKDAYS = [
  { short: "Sen", full: "Senin" },
  { short: "Sel", full: "Selasa" },
  { short: "Rab", full: "Rabu" },
  { short: "Kam", full: "Kamis" },
  { short: "Jum", full: "Jumat" },
  { short: "Sab", full: "Sabtu" },
  { short: "Min", full: "Minggu" },
];

export function VisualCalendar({ initialItems, demo = false }: VisualCalendarProps) {
  // Sync with extra demo memories in session storage if in demo mode
  const [items] = useState<TimelineItem[]>(() => {
    if (demo && typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("extra_demo_memories");
        if (stored) {
          const parsed = JSON.parse(stored) as TimelineItem[];
          return [...parsed, ...initialItems];
        }
      } catch {
        // Ignore JSON error
      }
    }
    return initialItems;
  });

  // Default to today's date
  const today = useMemo(() => new Date(), []);
  const todayString = useMemo(() => today.toISOString().slice(0, 10), [today]);

  const [currentYear, setCurrentYear] = useState(() => today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => today.getMonth()); // 0-indexed
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Drawer state
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Filter items by category
  const filteredItems = useMemo(() => {
    if (selectedCategory === "all") return items;
    return items.filter((item) => item.category === selectedCategory);
  }, [items, selectedCategory]);

  // Group items by YYYY-MM-DD
  const itemsByDate = useMemo(() => {
    const map = new Map<string, TimelineItem[]>();
    for (const item of filteredItems) {
      const existing = map.get(item.occurredAt);
      if (existing) {
        existing.push(item);
      } else {
        map.set(item.occurredAt, [item]);
      }
    }
    return map;
  }, [filteredItems]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  // Month title display (e.g. "Oktober 2026")
  const monthName = useMemo(() => {
    const d = new Date(currentYear, currentMonth, 1);
    return new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(d);
  }, [currentYear, currentMonth]);

  // Calendar cells generation (Monday to Sunday)
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    // getDay(): Sunday=0, Monday=1, ..., Saturday=6
    // Monday offset (0 for Monday, 6 for Sunday)
    const firstDayOffset = (firstDayOfMonth.getDay() + 6) % 7;

    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days: Array<{
      date: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      items: TimelineItem[];
      photos: string[];
      isToday: boolean;
    }> = [];

    // 1. Previous month trailing days
    for (let i = firstDayOffset - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const dateStr = `${prevMonthYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      const dayItems = itemsByDate.get(dateStr) || [];
      const photos = dayItems.flatMap((it) => it.imageUrls || []);

      days.push({
        date: dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        items: dayItems,
        photos,
        isToday: dateStr === todayString,
      });
    }

    // 2. Current month days
    for (let dayNum = 1; dayNum <= daysInCurrentMonth; dayNum++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      const dayItems = itemsByDate.get(dateStr) || [];
      const photos = dayItems.flatMap((it) => it.imageUrls || []);

      days.push({
        date: dateStr,
        dayNumber: dayNum,
        isCurrentMonth: true,
        items: dayItems,
        photos,
        isToday: dateStr === todayString,
      });
    }

    // 3. Next month leading days to complete grid (multiples of 7)
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let dayNum = 1; dayNum <= remainingCells; dayNum++) {
      const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const dateStr = `${nextMonthYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
      const dayItems = itemsByDate.get(dateStr) || [];
      const photos = dayItems.flatMap((it) => it.imageUrls || []);

      days.push({
        date: dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        items: dayItems,
        photos,
        isToday: dateStr === todayString,
      });
    }

    return days;
  }, [currentYear, currentMonth, itemsByDate, todayString]);

  // Monthly summary stats
  const monthStats = useMemo(() => {
    let activeDays = 0;
    let totalMemories = 0;
    let totalPhotos = 0;
    const peopleSet = new Set<string>();

    for (const day of calendarDays) {
      if (day.isCurrentMonth && day.items.length > 0) {
        activeDays += 1;
        totalMemories += day.items.length;
        totalPhotos += day.photos.length;
        for (const item of day.items) {
          for (const person of item.people) {
            peopleSet.add(person.name);
          }
        }
      }
    }

    return {
      activeDays,
      totalMemories,
      totalPhotos,
      connectedPeople: peopleSet.size,
    };
  }, [calendarDays]);

  const handleCellClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setIsDrawerOpen(true);
  };

  const selectedDayItems = useMemo(() => {
    if (!selectedDate) return [];
    // Always use full items list for drawer inspection (even if category filtered in calendar)
    return items.filter((it) => it.occurredAt === selectedDate);
  }, [items, selectedDate]);

  return (
    <div className="space-y-6">
      {/* Top Controls: Switcher & Quick Navigation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* View Switcher Pill */}
        <div className="inline-flex items-center rounded-xl border border-hairline bg-surface p-1 shadow-xs">
          <Link
            href={demo ? "/timeline?demo=jimmy" : "/timeline"}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-mono text-muted transition hover:text-foreground"
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Feed List</span>
          </Link>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg bg-surface-subdued border border-hairline/80 px-3 py-1.5 text-xs font-mono font-medium text-brand shadow-xs"
          >
            <CalendarDays className="h-3.5 w-3.5" />
            <span>Month Calendar</span>
          </button>
        </div>

        {/* Month Selector & Today Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToday}
            className="rounded-lg border border-hairline bg-surface px-3 py-1.5 font-mono text-xs text-muted transition hover:bg-surface-subdued hover:text-foreground"
          >
            Hari Ini
          </button>

          <div className="flex items-center rounded-xl border border-hairline bg-surface p-0.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Bulan sebelumnya"
              className="rounded-lg p-1.5 text-muted transition hover:bg-surface-subdued hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[130px] text-center font-serif text-sm font-medium capitalize text-foreground sm:min-w-[150px]">
              {monthName}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Bulan berikutnya"
              className="rounded-lg p-1.5 text-muted transition hover:bg-surface-subdued hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Month Stats Capsule */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-2xl border border-hairline bg-surface p-4 shadow-xs">
        <div className="border-r border-hairline/50 pr-3 last:border-r-0">
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted">Hari Aktif</p>
          <p className="mt-1 font-serif text-2xl font-normal text-foreground">
            {monthStats.activeDays} <span className="text-xs font-sans text-muted">hari</span>
          </p>
        </div>

        <div className="border-r border-hairline/50 pr-3 last:border-r-0 sm:border-r">
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted">Total Memori</p>
          <p className="mt-1 font-serif text-2xl font-normal text-foreground">
            {monthStats.totalMemories} <span className="text-xs font-sans text-muted">catatan</span>
          </p>
        </div>

        <div className="border-r border-hairline/50 pr-3 last:border-r-0">
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted">Foto Analog</p>
          <p className="mt-1 font-serif text-2xl font-normal text-brand">
            {monthStats.totalPhotos} <span className="text-xs font-sans text-muted">arsip 35mm</span>
          </p>
        </div>

        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted">Relasi Terhubung</p>
          <p className="mt-1 font-serif text-2xl font-normal text-foreground">
            {monthStats.connectedPeople} <span className="text-xs font-sans text-muted">orang</span>
          </p>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.key;
          const color = cat.key !== "all" ? CATEGORY_COLORS[cat.key] : null;

          return (
            <button
              type="button"
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-mono transition ${
                isActive
                  ? "border-brand bg-brand text-white shadow-xs"
                  : "border-hairline bg-surface text-muted hover:border-brand/30 hover:text-foreground"
              }`}
            >
              {color && (
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
              )}
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Photo Tapestry Calendar Grid */}
      <div className="overflow-hidden rounded-2xl border border-hairline bg-surface shadow-xs">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-hairline bg-surface-subdued/80 text-center font-mono text-xs font-medium text-muted">
          {WEEKDAYS.map((w) => (
            <div key={w.short} className="py-2.5 sm:py-3 border-r border-hairline/40 last:border-r-0">
              <span className="sm:hidden">{w.short}</span>
              <span className="hidden sm:inline">{w.full}</span>
            </div>
          ))}
        </div>

        {/* 7-column calendar cells */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-hairline/40 bg-surface">
          {calendarDays.map((cell) => {
            const hasItems = cell.items.length > 0;
            const hasPhotos = cell.photos.length > 0;
            const primaryPhoto = cell.photos[0];

            return (
              <div
                key={cell.date}
                onClick={() => handleCellClick(cell.date)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleCellClick(cell.date);
                  }
                }}
                className={`group relative flex flex-col justify-between overflow-hidden transition-all duration-200 cursor-pointer select-none p-1.5 sm:p-2 min-h-[95px] sm:min-h-[125px] md:min-h-[140px] ${
                  cell.isCurrentMonth
                    ? "bg-surface hover:bg-surface-subdued/60"
                    : "bg-surface-subdued/20 opacity-40 hover:opacity-80"
                } ${cell.isToday ? "ring-2 ring-brand ring-inset" : ""}`}
              >
                {/* Background Photo for Photo Tapestry Grid */}
                {hasPhotos && (
                  <div className="absolute inset-0 z-0 overflow-hidden bg-black/40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={primaryPhoto}
                      alt={`Foto memori ${cell.date}`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    {/* Dark gradient overlay to preserve date and dot readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/50 group-hover:from-black/70 transition-opacity" />
                  </div>
                )}

                {/* Top Row: Date Number & Photo Count Badge */}
                <div className="relative z-10 flex items-center justify-between w-full">
                  <span
                    className={`inline-flex items-center justify-center font-mono text-xs font-semibold rounded-md px-1.5 py-0.5 transition ${
                      hasPhotos
                        ? "bg-black/60 backdrop-blur-xs text-white border border-white/15"
                        : cell.isToday
                        ? "bg-brand text-white font-bold"
                        : cell.isCurrentMonth
                        ? "text-foreground group-hover:text-brand"
                        : "text-muted"
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  {/* Photo count indicator */}
                  {cell.photos.length > 1 && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-black/60 backdrop-blur-xs border border-white/20 px-1.5 py-0.5 font-mono text-[10px] text-white">
                      <ImageIcon className="h-2.5 w-2.5" />
                      <span>+{cell.photos.length - 1}</span>
                    </span>
                  )}
                </div>

                {/* Middle Content (When no photos but has notes) */}
                {!hasPhotos && hasItems && (
                  <div className="relative z-10 my-1 hidden sm:block">
                    <p className="line-clamp-2 font-serif text-[11px] leading-tight text-foreground/80 group-hover:text-foreground">
                      {cell.items[0].summary}
                    </p>
                    {cell.items.length > 1 && (
                      <span className="mt-0.5 block font-mono text-[9px] text-muted">
                        +{cell.items.length - 1} catatan lagi
                      </span>
                    )}
                  </div>
                )}

                {/* Bottom Row: Category indicator dots */}
                <div className="relative z-10 flex items-center justify-between w-full pt-1">
                  <div className="flex flex-wrap items-center gap-1">
                    {cell.items.slice(0, 4).map((it, idx) => {
                      const color = it.category ? CATEGORY_COLORS[it.category] || "#9E8C78" : "#9E8C78";
                      return (
                        <span
                          key={idx}
                          title={it.category || "activity"}
                          className="h-1.5 w-1.5 rounded-full ring-1 ring-black/40"
                          style={{ backgroundColor: color }}
                        />
                      );
                    })}
                    {cell.items.length > 4 && (
                      <span className="font-mono text-[8px] text-white/80">
                        +{cell.items.length - 4}
                      </span>
                    )}
                  </div>

                  {/* Multiple activity badge if with photo */}
                  {hasPhotos && cell.items.length > 1 && (
                    <span className="font-mono text-[9px] text-white/80 bg-black/50 rounded px-1">
                      {cell.items.length} memori
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend & Guidance Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-hairline/80 bg-surface px-4 py-3 text-xs text-muted">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-[11px] uppercase tracking-wider text-foreground">
            Kategori:
          </span>
          {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
            <span key={cat} className="inline-flex items-center gap-1 capitalize">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
              <span>{cat}</span>
            </span>
          ))}
        </div>

        <div className="font-mono text-[11px] text-muted">
          Klik tanggal mana pun untuk membuka panel inspeksi
        </div>
      </div>

      {/* Slide-over Day Inspector Drawer */}
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
