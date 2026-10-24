import { EntityDirectory } from "@/components/directory/EntityDirectory";
import { getEntityDirectory } from "@/lib/queries/entities";

export default async function TopicsPage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) { const demo = (await searchParams).demo === "jimmy"; const result = await getEntityDirectory("topics", demo); return <EntityDirectory kind="topics" items={result.items} demo={demo} />; }
