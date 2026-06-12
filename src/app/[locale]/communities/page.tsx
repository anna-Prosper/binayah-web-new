import CommunitiesPageClient from "@/app/_clients/communities/CommunitiesPageClient";
import { fetchPlaceCards } from "./fetchPlaces";
import type { Metadata } from "next";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";

export const revalidate = 3600;

interface Props { params: Promise<{ locale: string }> }

const titles: Record<string, string> = {
  en: "Dubai Communities & Neighbourhoods | Binayah Properties",
  ru: "Районы Дубая | Выбрать район для жизни и покупки | Binayah",
  ar: "مجتمعات وأحياء دبي | بناية للعقارات",
  zh: "迪拜社区与街区 | Binayah Properties",
  vi: "Cộng đồng & Khu vực lân cận Dubai | Binayah Properties",
  he: "קהילות ושכונות בדובאי | Binayah Properties",
};
const descriptions: Record<string, string> = {
  en: "Explore Dubai's top communities — Marina, Downtown, Palm Jumeirah, Business Bay. Browse properties by neighbourhood with live market data.",
  ru: "Изучите лучшие жилые районы Дубая — Дубай Марина, Даунтаун, Пальма Джумейра, Бизнес-Бей и другие. Сравните цены и найдите недвижимость по районам.",
  ar: "استكشف أفضل المجتمعات السكنية في دبي — دبي مارينا، وسط المدينة، نخلة جميرا، الخليج التجاري والمزيد.",
  zh: "探索迪拜顶级住宅社区——迪拜marina、市中心、棕榈岛、商业湾等。按社区浏览房产，附实时市场数据。",
  vi: "Khám phá các cộng đồng hàng đầu của Dubai — Marina, Downtown, Palm Jumeirah, Business Bay. Duyệt qua bất động sản theo khu vực với dữ liệu thị trường trực tiếp.",
  he: "חקור את הקהילות המובילות של Dubai — Marina, Downtown, Palm Jumeirah, Business Bay. עיין בנכסים לפי שכונה עם נתוני שוק בזמן אמת.",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
    alternates: {
      canonical: canonical(locale, "/communities"),
      languages: altLangs("/communities"),
    },
    openGraph: {
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
      url: canonical(locale, "/communities"),
      type: "website",
      locale: OG_LOCALE[locale] ?? "en_AE",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    },
  };
}

export type CommunityCard = {
  slug: string;
  name: string;
  description?: string;
  thumbnail?: string;
  hasListings: boolean;
  hasGuide: boolean;
};

export default async function CommunitiesPage() {
  const merged = await fetchPlaceCards("community");
  return <CommunitiesPageClient communities={merged} />;
}
