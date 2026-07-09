import NewsPageClient from "@/app/_clients/news/NewsPageClient";
import { serverApiUrl, serverFetch } from "@/lib/api";
import type { Metadata } from "next";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";

export const revalidate = 900;

interface Props { params: Promise<{ locale: string }> }

const titles: Record<string, string> = {
  fr: "Actualités Immobilières de Dubaï & Rapports de Marché | Binayah Properties",
  en: "Dubai Real Estate News & Market Reports | Binayah Properties",
  ru: "Новости рынка недвижимости Дубая | Аналитика и обзоры | Binayah",
  ar: "أخبار عقارات دبي وتقارير السوق | بناية للعقارات",
  zh: "迪拜房产新闻与市场报告 | Binayah Properties",
  vi: "Tin tức Bất động sản Dubai & Báo cáo Thị trường | Binayah Properties",
  he: "חדשות נדל\"ן ודו\"חות שוק בדובאי | Binayah Properties",
};
const descriptions: Record<string, string> = {
  fr: "Restez informé du marché immobilier de Dubaï avec les dernières actualités, rapports de marché et analyses d'investissement de l'équipe éditoriale de Binayah.",
  en: "Stay ahead of the Dubai property market with the latest news, market reports and investment insights from Binayah's editorial team.",
  ru: "Будьте в курсе рынка недвижимости Дубая: последние новости, аналитические отчёты и инвестиционные идеи от редакции Binayah.",
  ar: "ابقَ على اطلاع بسوق العقارات في دبي مع آخر الأخبار والتقارير ورؤى الاستثمار من فريق تحرير بناية.",
  zh: "通过Binayah编辑团队的最新新闻、市场报告和投资见解，了解迪拜房产市场动态。",
  vi: "Luôn dẫn đầu thị trường bất động sản Dubai với tin tức mới nhất, báo cáo thị trường và thông tin đầu tư từ đội ngũ biên tập của Binayah.",
  he: "הישארו מעודכנים בשוק הנדל\"ן של Dubai עם החדשות האחרונות, דוחות שוק ותובנות השקעה מצוות העריכה של Binayah.",
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
      locale: OG_LOCALE[locale] ?? "en_AE",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    },
  };
}

export default async function NewsPage({ params }: Props) {
  const { locale } = await params;
  let articles: any[] = [];
  try {
    // Auto-generated weekly market reports live under /pulse/reports, not the news feed.
    const res = await serverFetch(serverApiUrl(`/api/news?lang=${locale}&excludeCategory=Weekly%20Report`));
    if (res.ok) {
      articles = await res.json();
    }
  } catch (err) {
    console.warn("[NewsPage] API unavailable:", (err as Error).message);
  }

  return <NewsPageClient articles={articles} />;
}
