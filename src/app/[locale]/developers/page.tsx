import DevelopersPageClient from "@/app/_clients/developers/DevelopersPageClient";
import { serverApiUrl, serverFetch } from "@/lib/api";
import type { Metadata } from "next";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";

export const revalidate = 3600;

interface Props { params: Promise<{ locale: string }> }

const titles: Record<string, string> = {
  fr: "Promoteurs Immobiliers à Dubaï | Binayah Properties",
  en: "Dubai Property Developers | Binayah Properties",
  ru: "Застройщики Дубая | Новостройки от ведущих девелоперов | Binayah",
  ar: "مطورو العقارات في دبي | بناية للعقارات",
  zh: "迪拜房产开发商 | Binayah Properties",
  vi: "Các nhà phát triển bất động sản Dubai | Binayah Properties",
  he: "מפתחי נדל\"ן בדובאי | Binayah Properties",
};
const descriptions: Record<string, string> = {
  fr: "Découvrez les meilleurs promoteurs immobiliers de Dubaï — Emaar, DAMAC, Nakheel, Meraas, Aldar et plus. Trouvez des projets sur plan et prêts par promoteur.",
  en: "Browse top Dubai real estate developers — Emaar, DAMAC, Nakheel, Meraas, Aldar and more. Find off-plan and ready projects by developer.",
  ru: "Изучите ведущих застройщиков Дубая — Emaar, DAMAC, Nakheel, Meraas, Aldar и других. Найдите новостройки и готовые проекты от застройщика.",
  ar: "تصفح كبار مطوري العقارات في دبي — إعمار، داماك، نخيل، مراس، الدار والمزيد. اعثر على مشاريع على الخارطة وجاهزة.",
  zh: "浏览迪拜顶级房产开发商——Emaar、DAMAC、Nakheel、Meraas、Aldar等。按开发商查找期房和现房项目。",
  vi: "Duyệt qua các nhà phát triển bất động sản hàng đầu tại Dubai — Emaar, DAMAC, Nakheel, Meraas, Aldar và nhiều hơn nữa. Tìm các dự án đang triển khai và đã hoàn thành từ nhà phát triển.",
  he: "עיין במפתחי הנדל\"ן המובילים בדובאי — Emaar, DAMAC, Nakheel, Meraas, Aldar ועוד. מצא פרויקטים בתכנון ובביצוע על ידי מפתח.",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
    alternates: {
      canonical: canonical(locale, "/developers"),
      languages: altLangs("/developers"),
    },
    openGraph: {
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
      url: canonical(locale, "/developers"),
      type: "website",
      locale: OG_LOCALE[locale] ?? "en_AE",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    },
  };
}

const BATCH_SIZE = 24;

export default async function DevelopersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Math.min(50, parseInt(sp.page ?? "1") || 1));
  const limit = page * BATCH_SIZE;

  let initialDevelopers: any[] = [];
  let totalCount = 0;

  try {
    const res = await serverFetch(serverApiUrl(`/api/developers?limit=${limit}`));
    if (res.ok) {
      const data = await res.json();
      initialDevelopers = Array.isArray(data) ? data : [];
      totalCount = initialDevelopers.length === limit ? Math.max(500, limit) : initialDevelopers.length;
    }
  } catch (err) {
    console.warn("[DevelopersPage] API unavailable:", (err as Error).message);
  }

  return (
    <DevelopersPageClient
      initialDevelopers={initialDevelopers}
      totalCount={totalCount}
      initialPage={page}
      batchSize={BATCH_SIZE}
    />
  );
}
