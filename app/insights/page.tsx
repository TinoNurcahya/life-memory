import { InsightsClient } from "@/components/insights/InsightsClient";
import { VaultShell } from "@/components/layout/VaultShell";
import { getInsightsData } from "@/lib/queries/insights";

export default async function InsightsPage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const demo = (await searchParams).demo === "jimmy";
  const data = await getInsightsData(demo);
  return (
    <VaultShell title="Insights" isDemo={demo} items={data.items}>
      <InsightsClient model={data.model} error={data.error} demo={demo} />
    </VaultShell>
  );
}
