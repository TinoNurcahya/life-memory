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
    <VaultShell title="Timeline" isDemo={isDemo} items={data.items}>
      <main className="timeline-page">
        <TimelineFeed initialItems={data.items} demo={isDemo} error={data.error} />
      </main>
    </VaultShell>
  );
}
