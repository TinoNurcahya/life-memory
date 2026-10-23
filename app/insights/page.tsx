import { Compass, Layers, Flame, TrendingUp } from "lucide-react";
import { InsightList } from "@/components/insights/InsightList";
import { JIMMY_DEMO_ITEMS } from "@/lib/demo/jimmy";
import { getArchiveData } from "@/lib/queries/activities";
import { timelineToAnalytics } from "@/lib/analytics/adapters";
import { getOrGenerateInsights } from "@/lib/analytics/insights-generator";
import { VaultShell } from "@/components/layout/VaultShell";

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ demo?: string }>;
}) {
  const params = await searchParams;
  const demo = params.demo === "jimmy";
  const archive = demo ? { items: JIMMY_DEMO_ITEMS } : await getArchiveData();
  const analyticsActivities = timelineToAnalytics(archive.items);

  const insights = await getOrGenerateInsights(analyticsActivities, {
    isDemo: demo,
    userId: demo ? "demo" : undefined,
  });

  const totalInsights = insights.length;
  const firstTimesCount = insights.filter((i) => i.type === "first_time").length;
  const recurringCount = insights.filter((i) => i.type === "recurring").length;
  const shiftsCount = insights.filter((i) => i.type === "change").length;

  return (
    <VaultShell title="Pattern Insights" isDemo={demo} items={archive.items}>
      <main className="min-h-full px-4 py-8 text-foreground sm:px-8 sm:py-10">
        <div className="mx-auto max-w-5xl">
          {/* Page Header */}
          <header className="mb-8">
            <p className="font-mono text-xs uppercase tracking-wider text-muted">
              Deterministic Pattern Discovery · Evidence Drawer
            </p>
            <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-normal tracking-tight text-foreground">
              What keeps returning
            </h1>
            <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-muted">
              Deterministic patterns and milestones discovered across your completed memories. Every claim is strictly grounded in verifiable source activities via the interactive Evidence Drawer.
            </p>
          </header>

          {/* Stats Summary Pills */}
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-hairline bg-surface p-4 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <Layers className="h-3.5 w-3.5 text-brand" /> Total Patterns
              </div>
              <p className="mt-2 font-mono text-2xl sm:text-3xl font-medium">{totalInsights}</p>
            </div>

            <div className="rounded-2xl border border-hairline bg-surface p-4 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <Compass className="h-3.5 w-3.5 text-emerald-600" /> First-Times
              </div>
              <p className="mt-2 font-mono text-2xl sm:text-3xl font-medium">{firstTimesCount}</p>
            </div>

            <div className="rounded-2xl border border-hairline bg-surface p-4 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <Flame className="h-3.5 w-3.5 text-amber-600" /> Recurring
              </div>
              <p className="mt-2 font-mono text-2xl sm:text-3xl font-medium">{recurringCount}</p>
            </div>

            <div className="rounded-2xl border border-hairline bg-surface p-4 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <TrendingUp className="h-3.5 w-3.5 text-indigo-600" /> Monthly Shifts
              </div>
              <p className="mt-2 font-mono text-2xl sm:text-3xl font-medium">{shiftsCount}</p>
            </div>
          </div>

          {/* Feed with 4 Tabs & Vaul Drawer */}
          <InsightList insights={insights} demo={demo} />
        </div>
      </main>
    </VaultShell>
  );
}
