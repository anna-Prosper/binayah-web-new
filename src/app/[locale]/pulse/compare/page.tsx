import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PulseEmirateNav from "@/components/PulseEmirateNav";
import CompareClient from "./CompareClient";
import { serverApiUrl, serverFetch } from "@/lib/api";

export const revalidate = 300;

const translations: Record<string, { title: string; description: string }> = {
  en: {
    title: "Community Compare | Dubai Pulse | Binayah Properties",
    description: "Compare Dubai communities and developers side-by-side on price, yield, volume and more.",
  },
  ru: {
    title: "Сравнение районов | Дубай Пульс | Binayah Properties",
    description: "Сравните районы и застройщиков Дубая по цене, доходности, объёму сделок и другим показателям.",
  },
  ar: {
    title: "مقارنة المجتمعات | نبض دبي | بناية للعقارات",
    description: "قارن مجتمعات دبي والمطورين جنباً إلى جنب من حيث السعر والعائد والحجم والمزيد.",
  },
  zh: {
    title: "社区对比 | 迪拜脉搏 | Binayah Properties",
    description: "对比迪拜各社区和开发商的价格、收益率、交易量等指标。",
  },
  vi: {
    title: "So sánh khu vực | Dubai Pulse | Binayah Properties",
    description: "So sánh các khu vực và chủ đầu tư Dubai song song về giá, lợi suất, khối lượng và hơn thế nữa.",
  },
  he: {
    title: "השוואת קהילות | דובאי פולס | Binayah Properties",
    description: "השווה קהילות ויזמים בדובאי זה לצד זה על פי מחיר, תשואה, נפח ועוד.",
  },
  fr: {
    title: "Comparaison de quartiers | Dubai Pulse | Binayah Properties",
    description: "Comparez les quartiers et promoteurs de Dubaï côte à côte sur le prix, le rendement, le volume et plus encore.",
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
        ? `https://binayah.ru/ru/pulse/compare`
        : locale === "en"
          ? `https://www.binayah.ae/pulse/compare`
          : `https://www.binayah.ae/${locale}/pulse/compare`,
      languages: {
        en: "https://www.binayah.ae/pulse/compare",
        ru: "https://binayah.ru/ru/pulse/compare",
        ar: "https://www.binayah.ae/ar/pulse/compare",
        zh: "https://www.binayah.ae/zh/pulse/compare",
        vi: "https://www.binayah.ae/vi/pulse/compare",
        he: "https://www.binayah.ae/he/pulse/compare",
        fr: "https://www.binayah.ae/fr/pulse/compare",
        "x-default": "https://www.binayah.ae/pulse/compare",
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

export default async function ComparePage() {
  const [marketStats, marketData, communities, developers, dldAreas] = await Promise.all([
    fetchJson("/api/market-stats"),
    fetchJson("/api/market-data"),
    fetchJson("/api/communities"),
    fetchJson("/api/developers?limit=200"),
    fetchJson("/api/dld/areas?limit=200&sortBy=totalSales"),
  ]);

  // Build set of community names that have actual data (market-stats or DLD areas)
  const matrixNames = new Set<string>(
    ((marketStats as { communityMatrix?: { area: string }[] } | null)?.communityMatrix ?? [])
      .map((c: { area: string }) => c.area.toLowerCase())
  );
  const dldAreaNames = new Set<string>(
    ((dldAreas as { results?: { name: string }[] } | null)?.results ?? [])
      .map((a: { name: string }) => a.name.toLowerCase())
  );

  // Only include communities that have at least one data source
  const filteredCommunities = Array.isArray(communities)
    ? communities.filter((c: { name: string }) =>
        matrixNames.has(c.name.toLowerCase()) || dldAreaNames.has(c.name.toLowerCase())
      )
    : communities;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PulseEmirateNav />
      <CompareClient
        marketStats={marketStats}
        marketData={marketData}
        communities={filteredCommunities}
        developers={developers}
      />
      <Footer />
    </div>
  );
}
