import ListingsPageClient from "@/app/rent/ListingsPageClient";
import { serverApiUrl, serverFetch } from "@/lib/api";

export const revalidate = 60;

export const metadata = {
  title: "Properties for Rent in Dubai | Binayah Properties",
  description: "Browse apartments, villas and townhouses for rent in Dubai. Find your perfect rental with Binayah Properties.",
};

export default async function RentPage() {
  let initialListings: any[] = [];
  let totalCount = 0;

  try {
    const [listingsRes, countRes] = await Promise.all([
      serverFetch(serverApiUrl("/api/listings?listingType=Rent&limit=9")),
      serverFetch(serverApiUrl("/api/listings?listingType=Rent&countOnly=1")),
    ]);

    if (listingsRes.ok) initialListings = await listingsRes.json();
    if (countRes.ok) totalCount = (await countRes.json()).total ?? 0;
  } catch (err) {
    console.warn("[RentPage] API unavailable:", (err as Error).message);
  }

  return (
    <ListingsPageClient
      initialListings={initialListings}
      totalCount={totalCount}
      listingType="Rent"
      title="Properties for Rent"
      subtitle="Discover Dubai's best rental apartments, villas and townhouses"
    />
  );
}
