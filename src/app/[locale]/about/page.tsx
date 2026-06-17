import AboutPageClient from "./AboutPageClient";
import type { Metadata } from "next";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";

export const revalidate = 86400;

interface Props { params: Promise<{ locale: string }> }

const titles: Record<string, string> = {
  fr: "À propos de Binayah Properties | Agence immobilière de confiance à Dubaï",
  en: "About Binayah Properties | Dubai's Trusted Real Estate Agency",
  ru: "О компании Binayah Properties | Агентство недвижимости в Дубае",
  ar: "عن بناية للعقارات | الوكالة العقارية الموثوقة في دبي",
  zh: "关于Binayah Properties | 迪拜可信赖的房产中介",
  vi: "Về Binayah Properties | Đại lý Bất động sản Đáng tin cậy của Dubai",
  he: "אודות Binayah Properties | סוכנות הנדל\"ן המהימנה של דובאי",
};
const descriptions: Record<string, string> = {
  fr: "Découvrez Binayah Properties — l'agence immobilière de confiance à Dubaï depuis 2007. Équipe certifiée RERA, recherche optimisée par IA, 3 000+ annonces actives.",
  en: "Learn about Binayah Properties — Dubai's trusted real estate agency since 2007. RERA-certified team, AI-powered search, 3,000+ active listings.",
  ru: "Узнайте о Binayah Properties — агентстве недвижимости в Дубае с 2007 года. RERA-сертифицированная команда, поиск на базе ИИ, более 3 000 активных объектов.",
  ar: "تعرف على شركة بناية للعقارات — وكالة العقارات الموثوقة في دبي منذ عام 2007. فريق معتمد من RERA، بحث بالذكاء الاصطناعي، أكثر من 3,000 عقار.",
  zh: "了解Binayah Properties — 自2007年以来迪拜值得信赖的房产中介。RERA认证团队，AI驱动搜索，3,000+在售房源。",
  vi: "Tìm hiểu về Binayah Properties — Đại lý bất động sản đáng tin cậy của Dubai từ năm 2007. Đội ngũ được chứng nhận RERA, tìm kiếm bằng AI, hơn 3.000 danh sách.",
  he: "למדו על Binayah Properties — סוכנות הנדל\"ן המהימנה של דובאי מאז 2007. צוות מוסמך RERA, חיפוש מבוסס AI, מעל 3,000 נכסים פעילים.",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
    alternates: {
      canonical: canonical(locale, "/about"),
      languages: altLangs("/about"),
    },
    openGraph: {
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
      url: canonical(locale, "/about"),
      type: "website",
      locale: OG_LOCALE[locale] ?? "en_AE",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    },
  };
}

export default function Page() {
  return <AboutPageClient />;
}
