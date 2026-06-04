import AboutPageClient from "./AboutPageClient";
import type { Metadata } from "next";
import { canonical, altLangs } from "@/lib/site";

export const revalidate = 86400;

interface Props { params: Promise<{ locale: string }> }

const titles: Record<string, string> = {
  en: "About Binayah Properties | Dubai's Trusted Real Estate Agency",
  ru: "О компании Binayah Properties | Агентство недвижимости в Дубае",
  ar: "عن بناية للعقارات | الوكالة العقارية الموثوقة في دبي",
  zh: "关于Binayah Properties | 迪拜可信赖的房产中介",
};
const descriptions: Record<string, string> = {
  en: "Learn about Binayah Properties — Dubai's trusted real estate agency since 2007. RERA-certified team, AI-powered search, 2,500+ listings.",
  ru: "Узнайте о Binayah Properties — агентстве недвижимости в Дубае с 2007 года. RERA-сертифицированная команда, поиск на базе ИИ, более 2500 объектов.",
  ar: "تعرف على شركة بناية للعقارات — وكالة العقارات الموثوقة في دبي منذ عام 2007. فريق معتمد من RERA، بحث بالذكاء الاصطناعي.",
  zh: "了解Binayah Properties — 自2007年以来迪拜值得信赖的房产中介。RERA认证团队，AI驱动搜索，超过2500个房源。",
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
    },
  };
}

export default function Page() {
  return <AboutPageClient />;
}
