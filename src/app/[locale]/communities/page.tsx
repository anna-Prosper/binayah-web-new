import CommunitiesPageClient from "@/app/communities/CommunitiesPageClient";
import { fetchPlaceCards } from "./fetchPlaces";

export const revalidate = 3600;

export type CommunityCard = {
  slug: string;
  name: string;
  description?: string;
  thumbnail?: string;
  hasListings: boolean;
  hasGuide: boolean;
};

export default async function CommunitiesPage() {
  const merged = await fetchPlaceCards("community");
  return <CommunitiesPageClient communities={merged} />;
}
