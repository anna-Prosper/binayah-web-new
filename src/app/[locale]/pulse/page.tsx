import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PulseEmirateNav from "@/components/PulseEmirateNav";
import PulsePageClient from "@/app/_clients/pulse/PulsePageClient";
import { serverApiUrl, serverFetch } from "@/lib/api";
import { Activity } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";

export const revalidate = 300;

interface Props { params: Promise<{ locale: string }> }

const PULSE_TITLE: Record<string, string> = {
  en: "Dubai Real Estate Market Pulse | Live Analytics | Binayah",
  fr: "Pouls du marché immobilier de Dubaï | Analyses en direct | Binayah",
  ru: "Пульс рынка недвижимости Дубая | Аналитика в реальном времени | Binayah",
  ar: "نبض سوق العقارات في دبي | تحليلات حية | بناية",
  zh: "迪拜房地产市场脉搏 | 实时分析 | Binayah",
  vi: "Nhịp đập thị trường bất động sản Dubai | Phân tích trực tiếp | Binayah",
  he: 'דופק שוק הנדל"ן בדובאי | ניתוחים בזמן אמת | Binayah',
};
const PULSE_DESC: Record<string, string> = {
  en: "Live Dubai real estate analytics, price per sqft, rental yields, investment scores, transaction trends, exchange rates, and economic indicators.",
  fr: "Analyses en direct de l'immobilier à Dubaï : prix au pied carré, rendements locatifs, scores d'investissement, tendances des transactions, taux de change et indicateurs économiques.",
  ru: "Аналитика недвижимости Дубая в реальном времени: цена за кв. фут, доходность аренды, инвестиционные оценки, тренды сделок, курсы валют и экономические показатели.",
  ar: "تحليلات حية لعقارات دبي: السعر لكل قدم مربع، عوائد الإيجار، درجات الاستثمار، اتجاهات المعاملات، أسعار الصرف والمؤشرات الاقتصادية.",
  zh: "迪拜房地产实时分析：每平方英尺价格、租金收益率、投资评分、成交趋势、汇率及经济指标。",
  vi: "Phân tích bất động sản Dubai trực tiếp: giá mỗi foot vuông, lợi suất cho thuê, điểm đầu tư, xu hướng giao dịch, tỷ giá và chỉ số kinh tế.",
  he: 'ניתוחים חיים של הנדל"ן בדובאי: מחיר לרגל רבועה, תשואות שכירות, ציוני השקעה, מגמות עסקאות, שערי מטבע ומדדים כלכליים.',
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const title = PULSE_TITLE[locale] ?? PULSE_TITLE.en;
  const description = PULSE_DESC[locale] ?? PULSE_DESC.en;
  return {
    title,
    description,
    alternates: {
      canonical: canonical(locale, "/pulse"),
      languages: altLangs("/pulse"),
    },
    openGraph: {
      title,
      description,
      url: canonical(locale, "/pulse"),
      type: "website",
      locale: OG_LOCALE[locale] ?? "en_AE",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
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

export default async function PulsePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pulse");
  const [marketStats, marketData, areasData, projectsData, binayahNews] = await Promise.all([
    fetchJson("/api/market-stats"),
    fetchJson("/api/market-data"),
    fetchJson("/api/dld/areas?sort=totalSales&limit=20"),
    fetchJson("/api/projects?status=active&limit=200"),
    fetchJson(`/api/news?limit=8&lang=${locale}`),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PulseEmirateNav />

      {/* Hero */}
      <section
        className="relative pt-32 pb-14 text-white overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
      >
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="h-5 w-5 text-accent" />
            <p className="text-accent font-semibold tracking-[0.4em] uppercase text-xs">{t("heroLabel")}</p>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            {t("heroTitle")} <span className="font-light">{t("heroTitleItalic")}</span>
          </h1>
          <p className="text-primary-foreground/70 max-w-2xl text-base sm:text-lg">
            {t("heroSubtitle")}
          </p>
          <div className="flex flex-wrap items-center gap-4 mt-5 text-xs text-primary-foreground/60">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {t("liveListings")}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              {t("dldTransactions")}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              {t("exchangeRates")}
            </div>
          </div>
        </div>
      </section>

      <PulsePageClient
        marketStats={marketStats}
        marketData={marketData}
        areasData={areasData}
        projectsData={projectsData}
        binayahNews={binayahNews}
      />

      <Footer />
    </div>
  );
}
