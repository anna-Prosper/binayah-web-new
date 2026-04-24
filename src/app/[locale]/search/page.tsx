import SearchPageClient from "@/app/search/SearchPageClient";

export const metadata = {
  title: "Search Properties in Dubai | Binayah Properties",
  description: "Search apartments, villas, townhouses and off-plan projects in Dubai. Filter by area, price, bedrooms and more.",
};

export const dynamic = 'force-dynamic';

export default function SearchPage() {
  return <SearchPageClient />;
}
