import CommunitiesPageClient from "@/app/_clients/communities/CommunitiesPageClient";
import { fetchPlaceCards } from "../communities/fetchPlaces";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Dubai Areas & Districts | Binayah Properties",
  description: "Explore all Dubai areas and districts — Downtown Dubai, Dubai Marina, Jumeirah, Business Bay, Palm Jumeirah and more. Compare prices and find properties by area.",
  alternates: {
    canonical: "https://www.binayah.ae/en/areas",
    languages: { en: "https://www.binayah.ae/en/areas", ru: "https://www.binayah.ae/ru/areas", ar: "https://www.binayah.ae/ar/areas", zh: "https://www.binayah.ae/zh/areas", "x-default": "https://www.binayah.ae/en/areas" },
  },
  openGraph: { title: "Dubai Areas | Binayah Properties", description: "Compare Dubai areas by price, amenities and lifestyle.", url: "https://www.binayah.ae/en/areas", type: "website" },
};

export default async function AreasPage() {
  const merged = await fetchPlaceCards("area");
  return <CommunitiesPageClient communities={merged} kind="area" />;
}
