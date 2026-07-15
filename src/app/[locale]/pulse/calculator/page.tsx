import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PulseEmirateNav from "@/components/PulseEmirateNav";
import CalculatorClient from "./CalculatorClient";
import { serverApiUrl, serverFetch } from "@/lib/api";

export const revalidate = 300;

const translations: Record<string, { title: string; description: string }> = {
  en: {
    title: "Investment Calculator | Dubai Pulse | Binayah Properties",
    description: "Calculate potential returns, rental yield and projected value for Dubai real estate investment.",
  },
  ru: {
    title: "Инвестиционный калькулятор | Дубай Пульс | Binayah Properties",
    description: "Рассчитайте потенциальную доходность, доходность аренды и прогнозируемую стоимость инвестиций в недвижимость Дубая.",
  },
  ar: {
    title: "حاسبة الاستثمار | نبض دبي | بناية للعقارات",
    description: "احسب العوائد المحتملة وعائد الإيجار والقيمة المتوقعة للاستثمار في عقارات دبي.",
  },
  zh: {
    title: "投资计算器 | 迪拜脉搏 | Binayah Properties",
    description: "计算迪拜房地产投资的潜在回报、租金收益率和预期价值。",
  },
  vi: {
    title: "Máy tính đầu tư | Dubai Pulse | Binayah Properties",
    description: "Tính lợi nhuận tiềm năng, lợi suất cho thuê và giá trị dự kiến cho đầu tư bất động sản Dubai.",
  },
  he: {
    title: "מחשבון השקעות | דובאי פולס | Binayah Properties",
    description: "חשב תשואות פוטנציאליות, תשואת שכירות וערך משוער להשקעה בנדל\"ן בדובאי.",
  },
  fr: {
    title: "Calculateur d'investissement | Dubai Pulse | Binayah Properties",
    description: "Calculez les rendements potentiels, le rendement locatif et la valeur projetée pour un investissement immobilier à Dubaï.",
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
        ? `https://binayah.ru/ru/pulse/calculator`
        : locale === "en"
          ? `https://www.binayah.ae/pulse/calculator`
          : `https://www.binayah.ae/${locale}/pulse/calculator`,
      languages: {
        en: "https://www.binayah.ae/pulse/calculator",
        ru: "https://binayah.ru/ru/pulse/calculator",
        ar: "https://www.binayah.ae/ar/pulse/calculator",
        zh: "https://www.binayah.ae/zh/pulse/calculator",
        vi: "https://www.binayah.ae/vi/pulse/calculator",
        he: "https://www.binayah.ae/he/pulse/calculator",
        fr: "https://www.binayah.ae/fr/pulse/calculator",
        "x-default": "https://www.binayah.ae/pulse/calculator",
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

export default async function CalculatorPage() {
  const [marketStats, marketData] = await Promise.all([
    fetchJson("/api/market-stats"),
    fetchJson("/api/market-data"),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PulseEmirateNav />
      <CalculatorClient marketStats={marketStats} marketData={marketData} />
      <Footer />
    </div>
  );
}
