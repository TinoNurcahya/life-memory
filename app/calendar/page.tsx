import { getArchiveData } from "@/lib/queries/activities";
import { JIMMY_DEMO_ITEMS, JIMMY_DEMO_STATS } from "@/lib/demo/jimmy";
import { VisualCalendar } from "@/components/calendar/VisualCalendar";
import { VaultShell } from "@/components/layout/VaultShell";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const isDemo = params.demo === "jimmy";
  const data = isDemo
    ? { items: JIMMY_DEMO_ITEMS, stats: JIMMY_DEMO_STATS, error: null }
    : await getArchiveData();

  return (
    <VaultShell title="Visual Calendar" isDemo={isDemo} items={data.items}>
      <main className="min-h-full px-4 py-8 text-foreground sm:px-8 sm:py-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <p className="font-mono text-xs uppercase tracking-wider text-muted">
              {isDemo ? "Jimmy demo · Living Constellation" : "Private autobiographical archive"}
            </p>
            <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-normal tracking-tight">
              Visual Calendar
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted leading-relaxed">
              Kalender visual bulanan dengan permadani foto analog 35mm. Jelajahi ritme hidup, foto harian, dan inspeksi setiap memori secara mendalam.
            </p>
          </div>

          {data.error && (
            <p className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800">
              {data.error}
            </p>
          )}

          <VisualCalendar initialItems={data.items} demo={isDemo} />
        </div>
      </main>
    </VaultShell>
  );
}
