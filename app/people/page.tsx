import { PeopleDirectory } from "@/components/people/PeopleDirectory";
import { getPeopleData } from "@/lib/queries/people";

export default async function PeoplePage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const demo = (await searchParams).demo === "jimmy";
  const data = await getPeopleData(demo);
  return <PeopleDirectory people={data.people} demo={demo} directoryError={data.directoryError} memoriesError={data.memoriesError} />;
}
