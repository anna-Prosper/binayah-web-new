import NewsPageClient from "@/app/_clients/news/NewsPageClient";
import { serverApiUrl, serverFetch } from "@/lib/api";
import type { Metadata } from "next";
import { canonical, altLangs } from "@/lib/site";

export const revalidate = 900;

interface Props { params: Promise<{ locale: string }> }

const titles: Record<string, string> = {
  en: "Dubai Real Estate News & Market Reports | Binayah Properties",
  ru: "Новости рынка недвижимости Дубая | Аналитика и обзоры | Binayah",
  ar: "أخبار عقارات دبي وتقارير السوق | بناية للعقارات",
  zh: "迪拜房产新闻与市场报告 | Binayah Properties",
};
const descriptions: Record<string, string> = {
  en: "Stay ahead of the Dubai property market with the latest news, market reports and investment insights from Binayah's editorial team.",
  ru: "Будьте в курсе рынка недвижимости Дубая: последние новости, аналитические отчёты и инвестиционные идеи от редакции Binayah.",
  ar: "ابقَ على اطلاع بسوق العقارات في دبي مع آخر الأخبار والتقارير ورؤى الاستثمار من فريق تحرير بناية.",
  zh: "通过Binayah编辑团队的最新新闻、市场报告和投资见解，了解迪拜房产市场动态。",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
    alternates: {
      canonical: canonical(locale, "/news"),
      languages: altLangs("/news"),
    },
    openGraph: {
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
      url: canonical(locale, "/news"),
      type: "website",
    },
  };
}

export default async function NewsPage({ params }: Props) {
  const { locale } = await params;
  let articles: any[] = [];
  try {
    const res = await serverFetch(serverApiUrl(`/api/news?lang=${locale}`));
    if (res.ok) {
      articles = await res.json();
    }
  } catch (err) {
    console.warn("[NewsPage] API unavailable:", (err as Error).message);
  }

  return <NewsPageClient articles={articles} />;
}
