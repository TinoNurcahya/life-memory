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

/**
 * Curates 4-8 salient completed activities for the target month according to AI_SPEC §6.1.
 */
export function curateReflectionEvidence(
  activities: AnalyticsActivity[],
  targetMonth: string
): ReflectionInputPayload {
  const monthActivities = activities.filter(
    (item) => item.eventStatus === "completed" && item.occurredAt.startsWith(targetMonth)
  );

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
    .sort((a, b) => b[1] - a[1])
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

  const evidencePool: ReflectionEvidenceItem[] = Array.from(pool.values()).map((item) => ({
    id: item.id,
    date: item.occurredAt,
    summary: item.summary,
    category: item.category ?? "other",
    people: (item.people ?? []).map((p) => (typeof p === "string" ? p : p.name)),
    places: (item.places ?? []).map((p) => (typeof p === "string" ? p : p.name)),
    topics: (item.topics ?? []).map((t) => (typeof t === "string" ? t : t.name)),
    is_first_time: item.isFirstTime,
  }));

  // Format month name e.g. "2026-10" -> "October 2026"
  const [year, monthNum] = targetMonth.split("-");
  const dateObj = new Date(Date.UTC(Number(year), Number(monthNum) - 1, 1));
  const monthName = isNaN(dateObj.getTime())
    ? targetMonth
    : dateObj.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

  return {
    month: monthName,
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
  if (!response?.paragraphs?.length) return false;
  if (!response.title?.trim()) return false;

  const validIds = new Set(payload.evidence_pool.map((e) => e.id));

  for (const paragraph of response.paragraphs) {
    // 1. Mandatory evidence check
    if (!paragraph.evidence_ids || paragraph.evidence_ids.length === 0) {
      return false;
    }

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
  const topCat = payload.top_categories[0]?.category ?? "life";
  const pool = payload.evidence_pool;

  const paragraphs: ReflectionParagraph[] = [];

  if (pool.length > 0) {
    const item1 = pool[0];
    const text1 = `This month unfolded with a notable rhythm in ${item1.category}, anchored by ${item1.summary} [1].`;
    paragraphs.push({
      theme: "rhythm_and_focus",
      text: text1,
      evidence_ids: [item1.id],
    });
  }

  if (pool.length > 1) {
    const item2 = pool[1];
    const peopleMention = item2.people.length ? ` with ${item2.people.join(", ")}` : "";
    const placeMention = item2.places.length ? ` at ${item2.places.join(", ")}` : "";
    const text2 = `Meaningful connections were marked by ${item2.summary}${peopleMention}${placeMention} [1].`;
    paragraphs.push({
      theme: "relationships_and_places",
      text: text2,
      evidence_ids: [item2.id],
    });
  }

  if (pool.length > 2) {
    const remaining = pool.slice(2, 4);
    const markers = remaining.map((_, idx) => `[${idx + 1}]`).join(" and ");
    const text3 = `The month also witnessed key transitions: ${remaining.map((r) => r.summary).join("; ")} ${markers}.`;
    paragraphs.push({
      theme: "shifts_and_firsts",
      text: text3,
      evidence_ids: remaining.map((r) => r.id),
    });
  }

  return {
    title: `Reflections on ${payload.month}: A Month of ${topCat.charAt(0).toUpperCase() + topCat.slice(1)}`,
    paragraphs,
    key_themes: payload.top_categories.map((c) => c.category),
  };
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

  const formattedParagraphs: FormattedParagraph[] = paragraphs.map((p) => {
    const footnotes: FormattedFootnote[] = [];
    let updatedText = p.text;

    p.evidence_ids.forEach((id, localIdx) => {
      globalCount++;
      const evidence = evidenceMap.get(id) || {
        id,
        date: "Unknown date",
        summary: "Referenced memory",
        category: "other",
        people: [],
        places: [],
      };

      const footnote: FormattedFootnote = {
        globalIndex: globalCount,
        evidenceId: id,
        evidence,
      };

      footnotes.push(footnote);
      bibliography.push(footnote);

      // Replace local citation marker [localIdx + 1] with global [globalCount]
      const localMarker = `[${localIdx + 1}]`;
      const globalMarker = `[${globalCount}]`;
      updatedText = updatedText.replace(localMarker, globalMarker);
    });

    return {
      theme: p.theme,
      text: updatedText,
      footnotes,
    };
  });

  return { formattedParagraphs, bibliography };
}
