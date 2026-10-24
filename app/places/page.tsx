import { EntityDirectory } from "@/components/directory/EntityDirectory";
import { getEntityDirectory } from "@/lib/queries/entities";

export default async function PlacesPage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) { const demo = (await searchParams).demo === "jimmy"; const result = await getEntityDirectory("places", demo); return <EntityDirectory kind="places" items={result.items} demo={demo} />; }
