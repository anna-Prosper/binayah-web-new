import ListingsPageClient from "../rent/ListingsPageClient";
import { serverApiUrl, serverFetch } from "@/lib/api";

export const revalidate = 60;

export const metadata = {
  title: "Properties for Sale in Dubai | Binayah Properties",
  description: "Browse apartments, villas and townhouses for sale in Dubai. Find secondary market properties with Binayah Properties.",
};

export default async function BuyPage() {
  let initialListings: any[] = [];
  let totalCount = 0;

  try {
    const [listingsRes, countRes] = await Promise.all([
      serverFetch(serverApiUrl("/api/listings?listingType=Sale&limit=9")),
      serverFetch(serverApiUrl("/api/listings?listingType=Sale&countOnly=1")),
    ]);

    if (listingsRes.ok) initialListings = await listingsRes.json();
    if (countRes.ok) totalCount = (await countRes.json()).total ?? 0;
  } catch (err) {
    console.warn("[BuyPage] API unavailable:", (err as Error).message);
  }

  return (
    <ListingsPageClient
      initialListings={initialListings}
      totalCount={totalCount}
      listingType="Sale"
      title="Properties for Sale"
      subtitle="Explore Dubai's secondary market — ready properties available now"
    />
  );
}
