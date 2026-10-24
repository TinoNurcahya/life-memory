import { EntityDirectory } from "@/components/directory/EntityDirectory";
import { getEntityDirectory } from "@/lib/queries/entities";

export default async function PeoplePage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) { const demo = (await searchParams).demo === "jimmy"; const result = await getEntityDirectory("people", demo); return <EntityDirectory kind="people" items={result.items} demo={demo} />; }
