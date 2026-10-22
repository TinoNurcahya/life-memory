import { getArchiveData } from "@/lib/queries/activities";
import { JIMMY_DEMO_ITEMS, JIMMY_DEMO_STATS } from "@/lib/demo/jimmy";
import { TimelineFeed } from "@/components/timeline/TimelineFeed";
import { VaultShell } from "@/components/layout/VaultShell";

export default async function TimelinePage({
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
    <VaultShell title="Timeline Feed" isDemo={isDemo} items={data.items}>
      <main className="timeline-page min-h-full px-4 py-8 text-foreground sm:px-8 sm:py-10">
        <div className="mx-auto max-w-6xl">
          <div className="timeline-page__intro mb-8 rounded-[2rem] border border-hairline/80 bg-surface p-5 shadow-sm sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
              {isDemo ? "Demo workspace · fictional memories" : "Private memory workspace"}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Your memory timeline
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
              Explore the moments you have collected over time. Search, filter, and refine each memory without losing its original context.
            </p>
          </div>

          {data.error && (
            <p className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-300">
              {data.error}
            </p>
          )}

          <TimelineFeed initialItems={data.items} demo={isDemo} />
        </div>
      </main>
    </VaultShell>
  );
}
