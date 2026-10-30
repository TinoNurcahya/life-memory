import { ReflectionView } from "@/components/reflection/ReflectionView";
import { VaultShell } from "@/components/layout/VaultShell";
import { getReflectionData } from "@/lib/queries/reflection";

export default async function ReflectionPage({ searchParams }: { searchParams: Promise<{ demo?: string; month?: string }> }) {
  const params = await searchParams;
  const demo = params.demo === "jimmy";
  const data = await getReflectionData(params.month, demo);
  return <VaultShell title="Reflection" isDemo={demo} items={data.items}><ReflectionView data={data} demo={demo} /></VaultShell>;
}
