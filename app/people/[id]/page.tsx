import { notFound } from "next/navigation";
import { EntityDetail } from "@/components/directory/EntityDetail";
import { getEntityDetail, getEntityDirectory } from "@/lib/queries/entities";

export default async function PersonPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ demo?: string }> }) {
  const demo = (await searchParams).demo === "jimmy";
  const result = await getEntityDetail("people", (await params).id, demo);
  if (!result.entity) notFound();
  const directory = await getEntityDirectory("people", demo);
  return <EntityDetail kind="people" entity={result.entity} memories={result.memories} candidates={directory.items} demo={demo} />;
}
