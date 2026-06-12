import ConstructionUpdatesClient from "@/app/_clients/construction-updates/ConstructionUpdatesClient";
import { serverApiUrl, serverFetch } from "@/lib/api";
import type { Metadata } from "next";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";

export const dynamic = "force-dynamic";

interface Props { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const titles: Record<string, string> = {
    en: "Dubai Real Estate Insights | Market Reports & Investment Guides | Binayah",
    ru: "Аналитика рынка недвижимости Дубая | Отчёты и инвестиционные гайды | Binayah",
    ar: "رؤى سوق العقارات في دبي | تقارير وأدلة الاستثمار | Binayah",
    zh: "迪拜房产洞察 | 市场报告与投资指南 | Binayah",
    vi: "Phân tích bất động sản Dubai | Báo cáo thị trường | Binayah",
    he: "תובנות נדל\"ן בדובאי | דוחות שוק ומדריכי השקעות | Binayah",
  };
  const descs: Record<string, string> = {
    en: "Expert market analysis, investment guides and property reports for Dubai real estate.",
    ru: "Экспертный анализ рынка, инвестиционные гайды и отчёты по недвижимости Дубая.",
    ar: "تحليل سوق متخصص وأدلة الاستثمار وتقارير عقارات دبي.",
    zh: "迪拜房产市场分析、投资指南与专业报告。",
    vi: "Phân tích thị trường chuyên sâu, hướng dẫn đầu tư và báo cáo bất động sản Dubai.",
    he: "ניתוח שוק מומחה, מדריכי השקעות ודוחות נכסים עבור נדל\"ן בדובאי.",
  };
  const title = titles[locale] ?? titles.en;
  const description = descs[locale] ?? descs.en;
  return {
    title,
    description,
    alternates: { canonical: canonical(locale, "/construction-updates"), languages: altLangs("/construction-updates") },
    openGraph: {
      title, description,
      url: canonical(locale, "/construction-updates"),
      type: "website",
      locale: OG_LOCALE[locale] ?? "en_AE",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    },
  };
}

export default async function InsightsPage({ params }: Props) {
  const { locale } = await params;
  let articles: any[] = [];
  try {
    const res = await serverFetch(serverApiUrl(`/api/project-articles?lang=${locale}&limit=100`));
    if (res.ok) articles = await res.json();
  } catch (err) {
    console.warn("[InsightsPage] API unavailable:", (err as Error).message);
  }

  return <ConstructionUpdatesClient articles={articles} locale={locale} />;
}
