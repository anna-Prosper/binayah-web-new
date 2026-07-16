import SearchPageClient from "@/app/_clients/search/SearchPageClient";
import type { Metadata } from "next";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";
import { getCachedSearch } from "@/lib/api";

export const dynamic = "force-dynamic";

const TITLES: Record<string, string> = {
  en: "Search Properties in Dubai | Binayah Properties",
  ar: "البحث عن عقارات في دبي | بناية العقارية",
  fr: "Rechercher des biens à Dubaï | Binayah Properties",
  he: "חיפוש נכסים בדובאי | Binayah Properties",
  ru: "Поиск недвижимости в Дубае | Binayah Properties",
  vi: "Tìm bất động sản tại Dubai | Binayah Properties",
  zh: "搜索迪拜房产 | Binayah Properties",
};

const DESCS: Record<string, string> = {
  en: "Search apartments, villas, townhouses and off-plan projects in Dubai. Filter by area, price, bedrooms and more.",
  ar: "ابحث عن الشقق والفلل والتاون هاوس ومشاريع على الخارطة في دبي. قم بالتصفية حسب المنطقة والسعر وعدد غرف النوم والمزيد.",
  fr: "Recherchez des appartements, villas, maisons de ville et projets sur plan à Dubaï. Filtrez par quartier, prix, chambres et plus encore.",
  he: "חפשו דירות, וילות, בתים טוריים ופרויקטים על הנייר בדובאי. סננו לפי אזור, מחיר, חדרי שינה ועוד.",
  ru: "Ищите квартиры, виллы, таунхаусы и проекты на стадии строительства в Дубае. Фильтруйте по району, цене, количеству спален и другим параметрам.",
  vi: "Tìm căn hộ, biệt thự, nhà phố và dự án hình thành trong tương lai tại Dubai. Lọc theo khu vực, giá, số phòng ngủ và hơn thế nữa.",
  zh: "搜索迪拜的公寓、别墅、联排别墅和期房项目。按区域、价格、卧室数量等条件筛选。",
};

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
  const title = TITLES[locale] ?? TITLES.en;
  const description = DESCS[locale] ?? DESCS.en;
  return {
    title,
    description,
    ...(hasFilters ? { robots: { index: false, follow: true } } : {}),
    alternates: { canonical: url, languages: altLangs("/search") },
    openGraph: {
      title,
      description,
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
