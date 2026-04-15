import SearchPageClient from "@/app/search/SearchPageClient";

export const revalidate = 60;

export default function SearchPage() {
  return <SearchPageClient />;
}
