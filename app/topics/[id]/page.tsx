import { notFound } from "next/navigation";
import { TopicDetail } from "@/components/topics/TopicDetail";
import { TopicsUnavailable } from "@/components/topics/TopicsUnavailable";
import { getTopicsData } from "@/lib/queries/topics";

export default async function TopicPage({
  params, searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ demo?: string }>;
}) {
  const [{ id }, search] = await Promise.all([params, searchParams]);
  const demo = search.demo === "jimmy";
  const data = await getTopicsData(demo);
  if (data.directoryError) return <TopicsUnavailable demo={demo} />;
  const topic = data.topics.find(item => item.topic.id === id)?.topic;
  if (!topic) notFound();
  return (
    <TopicDetail
      topic={topic}
      memories={data.memoriesByTopic.get(id) ?? []}
      candidates={data.topics.map(item => item.topic)}
      demo={demo}
      memoriesError={data.memoriesError}
    />
  );
}
