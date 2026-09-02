import AboutPageClient from "./AboutPageClient";
import type { Metadata } from "next";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";
import { getAgents, isPublishableAgent } from "@/lib/agents";
import { SUPPORT_TEAM } from "@/lib/support-team";

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
  fr: "Binayah Properties L.L.C, agence immobilière à Dubaï enregistrée RERA (ORN 1162) depuis 2007. Informations société, bureau d'Al Quoz, équipe et services.",
  en: "Binayah Properties L.L.C is a RERA-registered Dubai real estate brokerage (ORN 1162), trading since 2007. Company facts, credentials, Al Quoz office, team and services.",
  ru: "Binayah Properties L.L.C — агентство недвижимости в Дубае, зарегистрированное в RERA (ORN 1162), работает с 2007 года. Факты о компании, офис в Аль-Кузе, команда и услуги.",
  ar: "بناية للعقارات ذ.م.م، وساطة عقارية في دبي مسجّلة لدى RERA برقم ORN 1162 وتعمل منذ عام 2007. معلومات الشركة والمكتب في القوز والفريق والخدمات.",
  zh: "Binayah Properties L.L.C 是一家在 RERA 注册的迪拜房产中介（ORN 1162），自 2007 年经营至今。公司信息、资质、Al Quoz 办公室、团队与服务。",
  vi: "Binayah Properties L.L.C là công ty môi giới bất động sản Dubai đăng ký RERA (ORN 1162), hoạt động từ năm 2007. Thông tin công ty, văn phòng Al Quoz, đội ngũ và dịch vụ.",
  he: "Binayah Properties L.L.C היא סוכנות תיווך נדל\"ן בדובאי הרשומה ב-RERA (ORN 1162) ופועלת מאז 2007. פרטי החברה, המשרד באל קוז, הצוות והשירותים.",
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
    twitter: {
      card: "summary_large_image",
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

// The team headcount on this page is read from the same source /team renders
// from, so the two can never drift. If Mongo is unavailable getAgents() returns
// [] and the client falls back to a countless sentence rather than a wrong one.
export default async function Page() {
  const agents = await getAgents();
  const agentCount = agents.filter(isPublishableAgent).length;
  return <AboutPageClient agentCount={agentCount} supportCount={SUPPORT_TEAM.length} />;
}
