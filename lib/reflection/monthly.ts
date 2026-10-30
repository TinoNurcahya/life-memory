import type { AnalyticsActivity } from "../analytics/types.ts";
import type {
  GeneratedMonthlyReflection,
  ReflectionEvidenceItem,
  ReflectionInputPayload,
  ReflectionParagraph,
} from "../ai/reflection.ts";

export interface FormattedFootnote {
  globalIndex: number;
  evidenceId: string;
  evidence: ReflectionEvidenceItem;
}

export interface FormattedParagraph {
  theme: string;
  text: string;
  footnotes: FormattedFootnote[];
}

export interface FormattedMonthlyEssay {
  month: string;
  title: string;
  paragraphs: FormattedParagraph[];
  key_themes: string[];
  source: "gemini" | "deterministic";
  modelUsed?: string;
  bibliography: FormattedFootnote[];
}

export function validReflectionMonth(value: unknown): value is string {
  return typeof value === "string" && /^(?!0000)\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

export function normalizeReflectionMonth(value: string | undefined, currentMonth: string) {
  if (!validReflectionMonth(currentMonth)) throw new RangeError("Invalid current month.");
  return { month: validReflectionMonth(value) ? value : currentMonth, invalid: value !== undefined && !validReflectionMonth(value) };
}

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !validReflectionMonth(value.slice(0, 7))) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function formatReflectionMonth(value: string) {
  return validReflectionMonth(value)
    ? new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}-01T12:00:00Z`))
    : "Bulan belum tersedia";
}

export function formatReflectionDate(value: string) {
  return validDate(value)
    ? new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T12:00:00Z`))
    : "Tanggal belum tersedia";
}

export function sanitizeReflectionActivities(activities: AnalyticsActivity[]): AnalyticsActivity[] {
  const seen = new Set<string>();
  return activities.filter(item => item.eventStatus === "completed" && item.id.trim() && validDate(item.occurredAt))
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt) || a.id.localeCompare(b.id) || a.summary.localeCompare(b.summary) || JSON.stringify(a).localeCompare(JSON.stringify(b)))
    .filter(item => { if (seen.has(item.id)) return false; seen.add(item.id); return true; });
}

export function reflectionEvidenceFor(item: AnalyticsActivity): ReflectionEvidenceItem {
  return {
    id: item.id, date: item.occurredAt, summary: item.summary, category: item.category ?? "other",
    people: (item.people ?? []).map(person => person.name), places: (item.places ?? []).map(place => place.name),
    topics: (item.topics ?? []).map(topic => topic.name), is_first_time: item.isFirstTime,
  };
}

/**
 * Curates 4-8 salient completed activities for the target month according to AI_SPEC §6.1.
 */
export function curateReflectionEvidence(
  activities: AnalyticsActivity[],
  targetMonth: string
): ReflectionInputPayload {
  if (!validReflectionMonth(targetMonth)) throw new RangeError("Invalid reflection month.");
  const monthActivities = sanitizeReflectionActivities(activities).filter(item => item.occurredAt.slice(0, 7) === targetMonth);

  const peopleSet = new Set(
    monthActivities.flatMap((item) => (item.people ?? []).map((p) => (typeof p === "string" ? p : p.name)))
  );
  const placesSet = new Set(
    monthActivities.flatMap((item) => (item.places ?? []).map((p) => (typeof p === "string" ? p : p.name)))
  );
  const firstTimes = monthActivities.filter((item) => item.isFirstTime);

  const categoryCounts = monthActivities.reduce<Record<string, number>>((acc, item) => {
    const cat = item.category ?? "other";
    acc[cat] = (acc[cat] ?? 0) + 1;
    return acc;
  }, {});

  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([category, count]) => ({ category, count }));

  // Deterministically curate 4-8 salient memories
  const pool = new Map<string, AnalyticsActivity>();

  // 1. Up to 2 first-time memories
  for (const item of firstTimes.slice(0, 2)) {
    pool.set(item.id, item);
  }

  // 2. 2 activities from top categories
  const topCat = topCategories[0]?.category;
  if (topCat) {
    for (const item of monthActivities.filter((a) => (a.category ?? "other") === topCat)) {
      if (pool.size >= 8) break;
      pool.set(item.id, item);
      if (pool.size >= 4) break;
    }
  }

  // 3. 2 activities representing social connections (with people)
  for (const item of monthActivities.filter((a) => (a.people ?? []).length > 0)) {
    if (pool.size >= 8) break;
    pool.set(item.id, item);
    if (pool.size >= 6) break;
  }

  // 4. Fill remaining slots up to 8 if pool is still small
  for (const item of monthActivities) {
    if (pool.size >= 8) break;
    pool.set(item.id, item);
  }

  const evidencePool = Array.from(pool.values()).map(reflectionEvidenceFor);

  return {
    month: formatReflectionMonth(targetMonth),
    stats: {
      total_activities: monthActivities.length,
      unique_people_count: peopleSet.size,
      unique_places_count: placesSet.size,
      first_times_count: firstTimes.length,
    },
    top_categories: topCategories.slice(0, 3),
    evidence_pool: evidencePool,
  };
}

/**
 * Deterministic Citation Validator matching AI_SPEC §6.3.
 * Returns true only if all citations are grounded, sequential, and reference valid evidence IDs.
 */
export function ValidateReflection(
  payload: ReflectionInputPayload,
  response: GeneratedMonthlyReflection
): boolean {
  if (!response || !Array.isArray(response.paragraphs) || !response.paragraphs.length) return false;
  if (typeof response.title !== "string" || !response.title.trim()) return false;
  if (!Array.isArray(response.key_themes) || !response.key_themes.every(theme => typeof theme === "string")) return false;

  const validIds = new Set(payload.evidence_pool.map((e) => e.id));

  for (const paragraph of response.paragraphs) {
    // 1. Mandatory evidence check
    if (!paragraph || typeof paragraph.text !== "string" || !paragraph.text.trim() || !Array.isArray(paragraph.evidence_ids) || paragraph.evidence_ids.length === 0) {
      return false;
    }
    if (!["rhythm_and_focus", "relationships_and_places", "shifts_and_firsts"].includes(paragraph.theme)) return false;

    // 2. Referenced IDs validity check (No hallucinated IDs)
    for (const id of paragraph.evidence_ids) {
      if (!validIds.has(id)) {
        return false;
      }
    }

    // 3. Sequential citation marker check [1]..[N]
    const markerMatches = paragraph.text.match(/\[(\d+)\]/g) || [];
    const extractedNumbers = markerMatches.map((m) => parseInt(m.slice(1, -1), 10));

    if (extractedNumbers.length !== paragraph.evidence_ids.length) {
      return false;
    }

    for (let i = 0; i < extractedNumbers.length; i++) {
      if (extractedNumbers[i] !== i + 1) {
        return false; // Out of order or non-sequential marker
      }
    }
  }

  return true;
}

/**
 * Builds a deterministic fallback monthly reflection that is 100% grounded and passes validation.
 */
export function buildDeterministicMonthlyReflection(
  payload: ReflectionInputPayload
): GeneratedMonthlyReflection {
  const pool = payload.evidence_pool;
  const paragraphs: ReflectionParagraph[] = [];
  // Numeric bracket text in a memory must not masquerade as an essay citation.
  const quote = (text: string) => text.replace(/\[(\d+)\]/g, "\uFF3B$1\uFF3D");
  for (let index = 0; index < Math.min(pool.length, 6); index += 2) {
    const group = pool.slice(index, index + 2);
    const text = group.map((item, localIndex) =>
      `Pada ${formatReflectionDate(item.date)}, catatanmu berbunyi: \u201C${quote(item.summary)}\u201D [${localIndex + 1}].`,
    ).join(" ");
    paragraphs.push({ theme: "rhythm_and_focus", text, evidence_ids: group.map(item => item.id) });
  }
  return { title: `Catatan ${payload.month}`, paragraphs, key_themes: payload.top_categories.map(item => item.category) };
}

/**
 * Transforms local paragraph citations [1]..[N] into global consecutive footnotes [1]..[Total].
 */
export function renumberGlobalFootnotes(
  paragraphs: ReflectionParagraph[],
  evidencePool: ReflectionEvidenceItem[]
): {
  formattedParagraphs: FormattedParagraph[];
  bibliography: FormattedFootnote[];
} {
  const evidenceMap = new Map(evidencePool.map((e) => [e.id, e]));
  const bibliography: FormattedFootnote[] = [];
  let globalCount = 0;

  const formattedParagraphs: FormattedParagraph[] = paragraphs.map((paragraph) => {
    const footnotes = paragraph.evidence_ids.map(id => {
      const evidence = evidenceMap.get(id);
      if (!evidence) throw new Error("Reflection references unavailable evidence.");
      const footnote = { globalIndex: ++globalCount, evidenceId: id, evidence };
      bibliography.push(footnote);
      return footnote;
    });
    // One pass: newly assigned global numbers are never read as local numbers.
    const text = paragraph.text.replace(/\[(\d+)\]/g, (marker, number: string) => {
      const footnote = footnotes[Number(number) - 1];
      if (!footnote) throw new Error("Reflection has an invalid citation marker.");
      return `[${footnote.globalIndex}]`;
    });
    return { theme: paragraph.theme, text, footnotes };
  });
  return { formattedParagraphs, bibliography };
}

function object(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function sameStrings(left: unknown, right: string[] | undefined) {
  return Array.isArray(left) && left.every(item => typeof item === "string") &&
    JSON.stringify([...left].sort()) === JSON.stringify([...(right ?? [])].sort());
}

function sameEvidence(value: unknown, current: ReflectionEvidenceItem) {
  const cached = object(value);
  return cached !== null && cached.id === current.id && cached.date === current.date && cached.summary === current.summary &&
    cached.category === current.category && sameStrings(cached.people, current.people) && sameStrings(cached.places, current.places) &&
    (cached.topics === undefined || sameStrings(cached.topics, current.topics)) && Boolean(cached.is_first_time) === Boolean(current.is_first_time);
}

/** Validate cache against current notes, then repair legacy numbering by citation position. */
export function normalizeCachedReflection(value: unknown, allMonthEvidence: ReflectionEvidenceItem[], targetMonth: string): FormattedMonthlyEssay | null {
  if (!validReflectionMonth(targetMonth)) return null;
  const cached = object(value);
  if (!cached || typeof cached.title !== "string" || !cached.title.trim() ||
    !["gemini", "deterministic"].includes(String(cached.source)) ||
    !Array.isArray(cached.key_themes) || !cached.key_themes.every(item => typeof item === "string") ||
    !Array.isArray(cached.paragraphs) || !cached.paragraphs.length || !Array.isArray(cached.bibliography)) return null;
  const currentById = new Map(allMonthEvidence.filter(item => item.date.slice(0, 7) === targetMonth).map(item => [item.id, item]));
  const bibliography: FormattedFootnote[] = [];
  const paragraphs: FormattedParagraph[] = [];
  for (const item of cached.paragraphs) {
    const paragraph = object(item);
    if (!paragraph || typeof paragraph.text !== "string" || !paragraph.text.trim() || typeof paragraph.theme !== "string" ||
      !["rhythm_and_focus", "relationships_and_places", "shifts_and_firsts"].includes(paragraph.theme) ||
      !Array.isArray(paragraph.footnotes) || !paragraph.footnotes.length) return null;
    const markers = [...paragraph.text.matchAll(/\[(\d+)\]/g)];
    if (markers.length !== paragraph.footnotes.length) return null;
    const footnotes: FormattedFootnote[] = [];
    for (const rawFootnote of paragraph.footnotes) {
      const footnote = object(rawFootnote);
      if (!footnote || typeof footnote.evidenceId !== "string") return null;
      const evidence = currentById.get(footnote.evidenceId);
      if (!evidence || !sameEvidence(footnote.evidence, evidence) || footnote.globalIndex !== bibliography.length + 1) return null;
      const rawBibliography = object(cached.bibliography[bibliography.length]);
      if (!rawBibliography || rawBibliography.globalIndex !== footnote.globalIndex || rawBibliography.evidenceId !== footnote.evidenceId || !sameEvidence(rawBibliography.evidence, evidence)) return null;
      const normalized = { globalIndex: bibliography.length + 1, evidenceId: evidence.id, evidence };
      footnotes.push(normalized);
      bibliography.push(normalized);
    }
    const validIndexes = new Set(footnotes.map(footnote => footnote.globalIndex));
    const markerIndexes = new Set(markers.map(marker => Number(marker[1])));
    if (markerIndexes.size !== validIndexes.size || markers.some(marker => !validIndexes.has(Number(marker[1])))) return null;
    let position = 0;
    const text = paragraph.text.replace(/\[\d+\]/g, () => `[${footnotes[position++].globalIndex}]`);
    paragraphs.push({ theme: paragraph.theme, text, footnotes });
  }
  if (cached.bibliography.length !== bibliography.length) return null;
  return {
    month: formatReflectionMonth(targetMonth), title: cached.title, paragraphs,
    key_themes: cached.key_themes as string[], source: cached.source as FormattedMonthlyEssay["source"],
    ...(typeof cached.modelUsed === "string" ? { modelUsed: cached.modelUsed } : {}), bibliography,
  };
}
