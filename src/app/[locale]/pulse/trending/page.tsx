import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
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
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = translations[locale] ?? translations.en;
  return { title: t.title, description: t.description };
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
      <WhatsAppButton />
    </div>
  );
}
