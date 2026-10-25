import { notFound } from "next/navigation";
import { PersonDetail } from "@/components/people/PersonDetail";
import { PeopleUnavailable } from "@/components/people/PeopleUnavailable";
import { getPeopleData } from "@/lib/queries/people";

export default async function PersonPage({
  params, searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ demo?: string }>;
}) {
  const [{ id }, search] = await Promise.all([params, searchParams]);
  const demo = search.demo === "jimmy";
  const data = await getPeopleData(demo);
  if (data.directoryError) return <PeopleUnavailable demo={demo} />;
  const person = data.people.find(item => item.person.id === id)?.person;
  if (!person) notFound();
  return (
    <PersonDetail
      person={person}
      memories={data.memoriesByPerson.get(id) ?? []}
      candidates={data.people.map(item => item.person)}
      demo={demo}
      memoriesError={data.memoriesError}
    />
  );
}
