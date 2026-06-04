import CommunitiesPageClient from "@/app/_clients/communities/CommunitiesPageClient";
import { fetchPlaceCards } from "../communities/fetchPlaces";
import type { Metadata } from "next";
import { canonical, altLangs } from "@/lib/site";

export const revalidate = 3600;

interface Props { params: Promise<{ locale: string }> }

const titles: Record<string, string> = {
  en: "Dubai Areas & Districts | Binayah Properties",
  ru: "Районы и округа Дубая | Цены на недвижимость | Binayah",
  ar: "مناطق وأحياء دبي | بناية للعقارات",
  zh: "迪拜地区与街区 | Binayah Properties",
};
const descriptions: Record<string, string> = {
  en: "Explore all Dubai areas and districts — Downtown Dubai, Dubai Marina, Jumeirah, Business Bay, Palm Jumeirah and more. Compare prices and find properties by area.",
  ru: "Изучите все районы Дубая — Даунтаун, Дубай Марина, Джумейра, Бизнес-Бей, Пальма Джумейра и другие. Сравните цены и найдите недвижимость по районам.",
  ar: "استكشف جميع مناطق وأحياء دبي — وسط المدينة، دبي مارينا، جميرا، الخليج التجاري، نخلة جميرا والمزيد.",
  zh: "探索迪拜所有地区和街区——市中心、迪拜marina、朱美拉、商业湾、棕榈岛等。比较价格，按区域查找房产。",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
    alternates: {
      canonical: canonical(locale, "/areas"),
      languages: altLangs("/areas"),
    },
    openGraph: {
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
      url: canonical(locale, "/areas"),
      type: "website",
    },
  };
}

export default async function AreasPage() {
  const merged = await fetchPlaceCards("area");
  return <CommunitiesPageClient communities={merged} kind="area" />;
}
