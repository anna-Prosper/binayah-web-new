import ListingsPageClient from "@/app/rent/ListingsPageClient";
import { serverApiUrl, serverFetch } from "@/lib/api";
import { getTranslations } from "next-intl/server";

export const revalidate = 300;

export const metadata = {
  title: "Properties for Sale in Dubai | Binayah Properties",
  description: "Browse apartments, villas and townhouses for sale in Dubai. Find secondary market properties with Binayah Properties.",
};

const BATCH_SIZE = 9;

export default async function BuyPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const t = await getTranslations("buy");
  const sp = await searchParams;
  const page = Math.max(1, Math.min(50, parseInt(sp.page ?? "1") || 1));
  const limit = page * BATCH_SIZE;

  let initialListings: any[] = [];
  let totalCount = 0;

  try {
    const [listingsRes, countRes] = await Promise.all([
      serverFetch(serverApiUrl(`/api/listings?listingType=Sale&limit=${limit}`)),
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
      title={t("title")}
      subtitle={t("subtitle")}
      initialPage={page}
      batchSize={BATCH_SIZE}
    />
  );
}
