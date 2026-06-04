import ServicesPageClient from "./ServicesPageClient";
import type { Metadata } from "next";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";

export const revalidate = 86400;

interface Props { params: Promise<{ locale: string }> }

const titles: Record<string, string> = {
  en: "Real Estate Services in Dubai | Binayah Properties",
  ru: "Услуги в сфере недвижимости Дубая | Binayah Properties",
  ar: "خدمات العقارات في دبي | بناية للعقارات",
  zh: "迪拜房地产服务 | Binayah Properties",
};
const descriptions: Record<string, string> = {
  en: "Full-service Dubai real estate: buying, selling, renting, off-plan investment, property management and valuations. 15+ years of expertise.",
  ru: "Полный спектр услуг по недвижимости в Дубае: покупка, продажа, аренда, инвестиции в новостройки, управление недвижимостью и оценка. Более 15 лет опыта.",
  ar: "خدمات عقارية متكاملة في دبي: شراء، بيع، إيجار، استثمار على الخارطة، إدارة العقارات والتقييم. خبرة تزيد على 15 عامًا.",
  zh: "迪拜一站式房产服务：购买、出售、租赁、期房投资、物业管理和估价。超过15年专业经验。",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
    alternates: {
      canonical: canonical(locale, "/services"),
      languages: altLangs("/services"),
    },
    openGraph: {
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
      url: canonical(locale, "/services"),
      type: "website",
      locale: OG_LOCALE[locale] ?? "en_AE",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    },
  };
}

export default function Page() {
  return <ServicesPageClient />;
}
