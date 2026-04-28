import CommunitiesPageClient from "@/app/communities/CommunitiesPageClient";
import { fetchPlaceCards } from "../communities/fetchPlaces";

export const revalidate = 3600;

export default async function AreasPage() {
  const merged = await fetchPlaceCards("area");
  return <CommunitiesPageClient communities={merged} kind="area" />;
}
