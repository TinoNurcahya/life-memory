import { PlacesDirectory } from "@/components/places/PlacesDirectory";
import { getPlacesData } from "@/lib/queries/places";

export default async function PlacesPage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const demo = (await searchParams).demo === "jimmy";
  const data = await getPlacesData(demo);
  return <PlacesDirectory places={data.places} demo={demo} directoryError={data.directoryError} memoriesError={data.memoriesError} />;
}
