import SearchPageClient from "@/app/_clients/search/SearchPageClient";
import type { Metadata } from "next";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";

export const dynamic = "force-dynamic";

interface Props { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const url = canonical(locale, "/search");
  return {
    title: "Search Properties in Dubai | Binayah Properties",
    description: "Search apartments, villas, townhouses and off-plan projects in Dubai. Filter by area, price, bedrooms and more.",
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

export default function SearchPage() {
  return <SearchPageClient />;
}
