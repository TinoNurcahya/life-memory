import type { ActionResult } from "../../types/database.ts";
import type { TimelineItem } from "../queries/activities.ts";
import type { AnalyticsActivity } from "../analytics/types.ts";
import type { MonthlyReflectionResult, ReflectionInputPayload } from "../ai/reflection.ts";
import {
  buildDeterministicMonthlyReflection, curateReflectionEvidence, normalizeCachedReflection,
  normalizeReflectionMonth, reflectionEvidenceFor, renumberGlobalFootnotes, sanitizeReflectionActivities,
  ValidateReflection, validReflectionMonth, type FormattedMonthlyEssay,
} from "./monthly.ts";

export interface ReflectionPageData {
  month: string;
  currentMonth: string;
  essay: FormattedMonthlyEssay | null;
  completedCount: number;
  availableMonths: string[];
  error: string | null;
  notice: string | null;
  hasSavedReflection: boolean;
  items: TimelineItem[];
}

export interface ReflectionDependencies {
  readArchive: () => Promise<{ items: TimelineItem[]; error: string | null }>;
  readCached?: (month: string) => Promise<{ value: unknown | null; error: string | null }>;
  generate?: (payload: ReflectionInputPayload) => Promise<MonthlyReflectionResult>;
  save?: (month: string, essay: FormattedMonthlyEssay) => Promise<{ error: string | null }>;
}

export interface GeneratedReflectionData {
  essay: FormattedMonthlyEssay;
  saved: boolean;
  notice: string | null;
}

function analytics(items: TimelineItem[]): AnalyticsActivity[] {
  return items.map(item => ({ id: item.id, occurredAt: item.occurredAt, category: item.category, eventStatus: item.eventStatus,
    summary: item.summary, people: item.people, places: item.places, topics: item.topics, isFirstTime: item.isFirstTime }));
}

function fallback(payload: ReflectionInputPayload): FormattedMonthlyEssay {
  const generated = buildDeterministicMonthlyReflection(payload);
  const formatted = renumberGlobalFootnotes(generated.paragraphs, payload.evidence_pool);
  return { month: payload.month, title: generated.title, paragraphs: formatted.formattedParagraphs,
    bibliography: formatted.bibliography, key_themes: generated.key_themes, source: "deterministic" };
}

/** Rendering only reads: generation and persistence are deliberately unavailable here. */
export async function loadReflectionPage(
  rawMonth: string | undefined,
  demo: boolean,
  dependencies: ReflectionDependencies,
  currentMonth: string,
): Promise<ReflectionPageData> {
  const { month, invalid } = normalizeReflectionMonth(rawMonth, currentMonth);
  const result: ReflectionPageData = { month, currentMonth, essay: null, completedCount: 0, availableMonths: [], error: null,
    notice: invalid ? "Bulan tidak valid. Menampilkan bulan ini." : null, hasSavedReflection: false, items: [] };
  try {
    const archive = await dependencies.readArchive();
    result.items = archive.items;
    if (archive.error) throw new Error("Archive unavailable");
  } catch {
    result.error = "Arsip belum berhasil dimuat. Coba lagi untuk membaca refleksi bulan ini.";
    return result;
  }
  const completed = sanitizeReflectionActivities(analytics(result.items));
  result.availableMonths = [...new Set(completed.map(item => item.occurredAt.slice(0, 7)))].sort().reverse();
  const monthActivities = completed.filter(item => item.occurredAt.slice(0, 7) === month);
  result.completedCount = monthActivities.length;
  if (!monthActivities.length) return result;
  const payload = curateReflectionEvidence(monthActivities, month);
  result.essay = fallback(payload);
  if (demo || !dependencies.readCached) return result;
  try {
    const cached = await dependencies.readCached(month);
    if (cached.error) throw new Error("Cache unavailable");
    if (cached.value === null) return result;
    const normalized = normalizeCachedReflection(cached.value, monthActivities.map(reflectionEvidenceFor), month);
    if (normalized) {
      result.essay = normalized;
      result.hasSavedReflection = true;
    } else {
      result.notice = "Refleksi tersimpan belum sesuai dengan catatan yang tersedia. Ringkasan catatan ditampilkan; kamu bisa menyusun refleksi kembali.";
    }
  } catch {
    result.notice = "Refleksi tersimpan belum berhasil dimuat. Ringkasan catatan tetap tersedia.";
  }
  return result;
}

/** Called only by an explicit generation action; demo never invokes models or persistence. */
export async function generateReflectionFromData(
  month: string,
  demo: boolean,
  dependencies: ReflectionDependencies,
): Promise<ActionResult<GeneratedReflectionData>> {
  if (!validReflectionMonth(month)) return { success: false, error: "Pilih bulan yang valid.", code: "INVALID_INPUT" };
  let items: TimelineItem[];
  try {
    const archive = await dependencies.readArchive();
    if (archive.error) throw new Error("Archive unavailable");
    items = archive.items;
  } catch {
    return { success: false, error: "Catatan belum berhasil dimuat. Coba lagi sebelum menyusun refleksi.", code: "DATABASE_ERROR" };
  }
  const payload = curateReflectionEvidence(analytics(items), month);
  if (!payload.evidence_pool.length) return { success: false, error: "Belum ada memori selesai pada bulan ini.", code: "NOT_FOUND" };
  const summary = fallback(payload);
  if (demo) return { success: true, data: { essay: summary, saved: false, notice: "Mode demo menampilkan ringkasan dari catatan contoh." } };
  let essay: FormattedMonthlyEssay;
  try {
    if (!dependencies.generate) throw new Error("Generation unavailable");
    const generated = await dependencies.generate(payload);
    if (!ValidateReflection(payload, generated.reflection)) throw new Error("Invalid reflection sources");
    const formatted = renumberGlobalFootnotes(generated.reflection.paragraphs, payload.evidence_pool);
    essay = { month: payload.month, title: generated.reflection.title, paragraphs: formatted.formattedParagraphs,
      bibliography: formatted.bibliography, key_themes: generated.reflection.key_themes, source: "gemini", modelUsed: generated.modelUsed };
  } catch {
    return { success: true, data: { essay: summary, saved: false, notice: "Refleksi belum berhasil disusun. Ringkasan catatan tetap ditampilkan; kamu bisa mencoba lagi." } };
  }
  try {
    if (!dependencies.save) throw new Error("Persistence unavailable");
    const saved = await dependencies.save(month, essay);
    if (saved.error) throw new Error("Persistence failed");
    return { success: true, data: { essay, saved: true, notice: null } };
  } catch {
    return { success: true, data: { essay, saved: false, notice: "Refleksi sudah disusun, tetapi belum berhasil disimpan. Hasil ini masih bisa dibaca selama halaman tetap terbuka." } };
  }
}
