import { TopicsDirectory } from "@/components/topics/TopicsDirectory";
import { getTopicsData } from "@/lib/queries/topics";

export default async function TopicsPage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const demo = (await searchParams).demo === "jimmy";
  const data = await getTopicsData(demo);
  return (
    <TopicsDirectory
      topics={data.topics}
      demo={demo}
      directoryError={data.directoryError}
      memoriesError={data.memoriesError}
    />
  );
}
