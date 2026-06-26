import SearchPageClient from "@/app/_clients/search/SearchPageClient";
import type { Metadata } from "next";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";
import { getCachedSearch } from "@/lib/api";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const sp = await searchParams;
  const url = canonical(locale, "/search");
  // Faceted-search URLs (?type=, ?locations=, ?q=, …) are infinite near-duplicate
  // combinations — keep them out of the index (but follow links) so they don't pile
  // up under "Duplicate without user-selected canonical". Bare /search stays indexable.
  const hasFilters = Object.keys(sp).length > 0;
  return {
    title: "Search Properties in Dubai | Binayah Properties",
    description: "Search apartments, villas, townhouses and off-plan projects in Dubai. Filter by area, price, bedrooms and more.",
    ...(hasFilters ? { robots: { index: false, follow: true } } : {}),
    alternates: { canonical: url, languages: altLangs("/search") },
    openGraph: {
      title: "Search Properties in Dubai | Binayah Properties",
      description: "Search apartments, villas, townhouses and off-plan projects in Dubai. Filter by area, price, bedrooms and more.",
      url,
      type: "website",
      locale: OG_LOCALE[locale] ?? "en_AE",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    },
  };
}

export default async function SearchPage() {
  // Seed the default (all-inventory) grid so bare /search ships listings in the
  // SSR HTML for crawlers; filtered views are noindex and re-fetch client-side.
  const initialData = await getCachedSearch("pageSize=24");
  return <SearchPageClient initialData={initialData} />;
}
