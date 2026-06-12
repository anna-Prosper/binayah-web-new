import ContactPageClient from "./ContactPageClient";
import type { Metadata } from "next";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";

export const revalidate = 86400;

interface Props { params: Promise<{ locale: string }> }

const titles: Record<string, string> = {
  en: "Contact Binayah Properties | Dubai Real Estate Experts",
  ru: "Контакты Binayah Properties | Эксперты по недвижимости Дубая",
  ar: "تواصل مع بناية للعقارات | خبراء العقارات في دبي",
  zh: "联系Binayah Properties | 迪拜房产专家",
  vi: "Liên hệ Binayah Properties | Chuyên gia Bất động sản Dubai",
  he: "צרו קשר עם Binayah Properties | מומחי נדל\"ן בדובאי",
};
const descriptions: Record<string, string> = {
  en: "Get in touch with Binayah Properties for buying, selling, renting or investing in Dubai real estate. Call, WhatsApp or email our team.",
  ru: "Свяжитесь с Binayah Properties по вопросам покупки, продажи, аренды или инвестиций в недвижимость Дубая. Позвоните, напишите в WhatsApp или по электронной почте.",
  ar: "تواصل مع بناية للعقارات لشراء أو بيع أو إيجار أو الاستثمار في عقارات دبي. اتصل أو واتساب أو راسلنا.",
  zh: "联系Binayah Properties，了解迪拜房产的购买、出售、租赁或投资。致电、WhatsApp或发送电子邮件给我们的团队。",
  vi: "Liên hệ với Binayah Properties để mua, bán, cho thuê hoặc đầu tư vào bất động sản Dubai. Gọi điện, WhatsApp hoặc email cho đội ngũ của chúng tôi.",
  he: "צרו קשר עם Binayah Properties לרכישה, מכירה, השכרה או השקעה בנדל\"ן בדובאי. התקשרו, שלחו הודעת WhatsApp או אימייל לצוות שלנו.",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
    alternates: {
      canonical: canonical(locale, "/contact"),
      languages: altLangs("/contact"),
    },
    openGraph: {
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
      url: canonical(locale, "/contact"),
      type: "website",
      locale: OG_LOCALE[locale] ?? "en_AE",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    },
  };
}

export default function Page() {
  return <ContactPageClient />;
}
