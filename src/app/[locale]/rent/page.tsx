import ListingsPageClient from "@/app/rent/ListingsPageClient";
import { serverApiUrl, serverFetch } from "@/lib/api";
import { getTranslations } from "next-intl/server";

export const revalidate = 300;

export const metadata = {
  title: "Properties for Rent in Dubai | Binayah Properties",
  description: "Browse apartments, villas and townhouses for rent in Dubai. Find your perfect rental with Binayah Properties.",
};

const BATCH_SIZE = 9;

export default async function RentPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const t = await getTranslations("rent");
  const sp = await searchParams;
  const page = Math.max(1, Math.min(50, parseInt(sp.page ?? "1") || 1));
  const limit = page * BATCH_SIZE;

  let initialListings: any[] = [];
  let totalCount = 0;

  try {
    const [listingsRes, countRes] = await Promise.all([
      serverFetch(serverApiUrl(`/api/listings?listingType=Rent&limit=${limit}`)),
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
      title={t("title")}
      subtitle={t("subtitle")}
      initialPage={page}
      batchSize={BATCH_SIZE}
    />
  );
}
