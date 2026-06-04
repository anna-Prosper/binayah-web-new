import { ValuationPage } from "@/components/valuation";
import type { Metadata } from "next";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";

export const revalidate = 86400;

interface Props { params: Promise<{ locale: string }> }

const titles: Record<string, string> = {
  en: "Free Property Valuation Dubai | AI-Powered Instant Estimate | Binayah",
  ru: "Бесплатная оценка недвижимости в Дубае | ИИ-оценка онлайн | Binayah",
  ar: "تقييم عقاري مجاني في دبي | تقدير فوري بالذكاء الاصطناعي | بناية",
  zh: "迪拜免费房产估价 | AI驱动即时估价 | Binayah",
};
const descriptions: Record<string, string> = {
  en: "Get an instant AI-powered property valuation for Dubai and UAE real estate. Free, accurate, no registration required.",
  ru: "Получите мгновенную оценку недвижимости в Дубае и ОАЭ на базе ИИ. Бесплатно, точно, без регистрации.",
  ar: "احصل على تقييم عقاري فوري بالذكاء الاصطناعي لعقارات دبي والإمارات. مجاني، دقيق، بدون تسجيل.",
  zh: "获取迪拜和阿联酋房产的AI驱动即时估价。免费、准确，无需注册。",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
    alternates: {
      canonical: canonical(locale, "/valuation"),
      languages: altLangs("/valuation"),
    },
    openGraph: {
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
      url: canonical(locale, "/valuation"),
      type: "website",
      locale: OG_LOCALE[locale] ?? "en_AE",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    },
  };
}

export default function Page() {
  return <ValuationPage />;
}
