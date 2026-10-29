import { notFound } from "next/navigation";
import { PlaceDetail } from "@/components/places/PlaceDetail";
import { PlacesUnavailable } from "@/components/places/PlacesUnavailable";
import { getPlacesData } from "@/lib/queries/places";

export default async function PlacePage({
  params, searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ demo?: string }>;
}) {
  const [{ id }, search] = await Promise.all([params, searchParams]);
  const demo = search.demo === "jimmy";
  const data = await getPlacesData(demo);
  if (data.directoryError) return <PlacesUnavailable demo={demo} />;
  const place = data.places.find(item => item.place.id === id)?.place;
  if (!place) notFound();
  return (
    <PlaceDetail
      place={place}
      memories={data.memoriesByPlace.get(id) ?? []}
      candidates={data.places.map(item => item.place)}
      demo={demo}
      memoriesError={data.memoriesError}
    />
  );
}
