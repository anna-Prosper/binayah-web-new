import CommunitiesPageClient from "@/app/_clients/communities/CommunitiesPageClient";
import { fetchPlaceCards } from "./fetchPlaces";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Dubai Communities & Neighbourhoods | Binayah Properties",
  description: "Explore Dubai's top residential communities — Dubai Marina, Downtown Dubai, Palm Jumeirah, Business Bay and more. Browse properties by neighbourhood with live market data.",
  alternates: {
    canonical: "https://www.binayah.ae/en/communities",
    languages: { en: "https://www.binayah.ae/en/communities", ru: "https://www.binayah.ae/ru/communities", ar: "https://www.binayah.ae/ar/communities", zh: "https://www.binayah.ae/zh/communities", "x-default": "https://www.binayah.ae/en/communities" },
  },
  openGraph: { title: "Dubai Communities | Binayah Properties", description: "Find your perfect Dubai neighbourhood.", url: "https://www.binayah.ae/en/communities", type: "website" },
};

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
