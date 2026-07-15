import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PulseEmirateNav from "@/components/PulseEmirateNav";
import TrendingClient from "./TrendingClient";
import { serverApiUrl, serverFetch } from "@/lib/api";

export const revalidate = 300;

const translations: Record<string, { title: string; description: string }> = {
  en: {
    title: "Trending | Dubai Pulse | Binayah Properties",
    description: "Biggest movers, new launches, and the latest insights from the Dubai real estate market.",
  },
  ru: {
    title: "Тренды | Дубай Пульс | Binayah Properties",
    description: "Главные изменения рынка, новые запуски и свежие аналитические данные по рынку недвижимости Дубая.",
  },
  ar: {
    title: "الأكثر تداولاً | نبض دبي | بناية للعقارات",
    description: "أكبر التحركات في السوق والمشاريع الجديدة وأحدث تحليلات سوق العقارات في دبي.",
  },
  zh: {
    title: "热门动态 | 迪拜脉搏 | Binayah Properties",
    description: "迪拜房地产市场最大涨幅、新楼盘发布及最新市场洞察。",
  },
  vi: {
    title: "Xu hướng | Dubai Pulse | Binayah Properties",
    description: "Những biến động lớn nhất, dự án mới ra mắt và phân tích mới nhất từ thị trường bất động sản Dubai.",
  },
  he: {
    title: "מגמות | דובאי פולס | Binayah Properties",
    description: "השינויים הגדולים ביותר, השקות חדשות והתובנות האחרונות משוק הנדל\"ן בדובאי.",
  },
  fr: {
    title: "Tendances | Dubai Pulse | Binayah Properties",
    description: "Plus grands mouvements, nouveaux lancements et dernières analyses du marché immobilier de Dubaï.",
  },
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = translations[locale] ?? translations.en;
  return {
    title: t.title,
    description: t.description,
    alternates: {
      canonical: locale === "ru"
        ? `https://binayah.ru/ru/pulse/trending`
        : locale === "en"
          ? `https://www.binayah.ae/pulse/trending`
          : `https://www.binayah.ae/${locale}/pulse/trending`,
      languages: {
        en: "https://www.binayah.ae/pulse/trending",
        ru: "https://binayah.ru/ru/pulse/trending",
        ar: "https://www.binayah.ae/ar/pulse/trending",
        zh: "https://www.binayah.ae/zh/pulse/trending",
        vi: "https://www.binayah.ae/vi/pulse/trending",
        he: "https://www.binayah.ae/he/pulse/trending",
        fr: "https://www.binayah.ae/fr/pulse/trending",
        "x-default": "https://www.binayah.ae/pulse/trending",
      },
    },
  };
}

async function fetchJson(path: string) {
  try {
    const res = await serverFetch(serverApiUrl(path), 12_000);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function TrendingPage() {
  const [marketData, projects, marketStats, binayahNews] = await Promise.all([
    fetchJson("/api/market-data"),
    fetchJson("/api/projects?status=Off-Plan&limit=20"),
    fetchJson("/api/market-stats"),
    fetchJson("/api/news?limit=6"),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PulseEmirateNav />
      <TrendingClient marketData={marketData} projects={projects} marketStats={marketStats} binayahNews={binayahNews} />
      <Footer />
    </div>
  );
}
