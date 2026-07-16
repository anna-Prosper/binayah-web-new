/* eslint-disable i18next/no-literal-string */
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FAQJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";

export const revalidate = 86400;
interface Props { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const url = canonical(locale, "/off-plan/abu-dhabi");
  const desc = locale === "fr" ? "Appartements, villas et maisons de ville sur plan à Abou Dabi. Aldar, Imkan, Bloom sur Yas Island, Saadiyat, Al Reem Island." : locale === "ru" ? "Новостройки в Абу-Даби, квартиры, виллы и таунхаусы. Aldar, Imkan, Bloom на Яс-Айленд, Саадийят, Аль-Рим Айленд." : locale === "ar" ? "مشاريع على الخارطة في أبوظبي, شقق وفلل وتاون هاوس. Aldar وImkan وBloom في جزيرة ياس وجزيرة السعديات وجزيرة الريم." : locale === "zh" ? "阿布扎比期房项目, , 公寓、别墅和联排。Aldar、Imkan、Bloom，位于亚斯岛、萨迪亚特岛、里姆岛。" : locale === "vi" ? "Căn hộ, biệt thự và nhà phố off-plan tại Abu Dhabi. Aldar, Imkan, Bloom trên Yas Island, Saadiyat, Al Reem Island." : locale === "he" ? "דירות, וילות ובתים על הנייר באבו דאבי. Aldar, Imkan, Bloom ב-Yas Island, Saadiyat, Al Reem Island." : "Off-plan apartments, villas and townhouses in Abu Dhabi. Aldar, Imkan, Bloom on Yas Island, Saadiyat, Al Reem Island.";
  const title = locale === "fr" ? "Biens sur plan à Abou Dabi 2026 | Nouveaux projets | Binayah" : locale === "ru" ? "Новостройки в Абу-Даби 2026 | Aldar, Imkan | Binayah" : locale === "ar" ? "عقارات على الخارطة في أبوظبي 2026 | Binayah" : locale === "zh" ? "阿布扎比期房2026 | Binayah" : locale === "vi" ? "Bất động sản Off-Plan tại Abu Dhabi 2026 | Aldar, Imkan | Binayah" : locale === "he" ? "נכסים על הנייר באבו דאבי 2026 | פרויקטים חדשים | Binayah" : "Off-Plan Properties in Abu Dhabi 2026 | New Projects | Binayah";
  return {
    title,
    description: desc,
    keywords: "off plan properties abu dhabi, abu dhabi off plan 2026, aldar properties".split(", "),
    alternates: { canonical: url, languages: altLangs("/off-plan/abu-dhabi") },
    openGraph: { title, description: desc, url, type: "website", locale: OG_LOCALE[locale] ?? "en_AE", images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }] },
  };
}

const AREAS = ["Yas Island", "Saadiyat Island", "Al Reem Island", "Al Raha Beach", "Masdar City", "Khalifa City"];

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const isRtl = locale === "ar" || locale === "he"; // ar, he are rtl; vi, zh, ru, en are ltr
  const lp = locale === "en" ? "" : `/${locale}`;
  const breadcrumbs = [
    { name: locale === "fr" ? "Accueil" : locale === "ru" ? "Главная" : locale === "ar" ? "الرئيسية" : locale === "zh" ? "首页" : locale === "vi" ? "Trang chủ" : locale === "he" ? "בית" : "Home", href: `${lp}/` },
    { name: locale === "fr" ? "Sur plan" : locale === "ru" ? "Новостройки" : locale === "ar" ? "على الخارطة" : locale === "zh" ? "期房" : locale === "vi" ? "Off-Plan" : locale === "he" ? "על הנייר" : "Off-Plan", href: `${lp}/off-plan` },
    { name: locale === "fr" ? "Sur plan à Abou Dabi" : locale === "ru" ? "Новостройки в Abu Dhabi" : locale === "ar" ? "على الخارطة في Abu Dhabi" : locale === "zh" ? "Abu Dhabi期房" : locale === "vi" ? "Off-Plan tại Abu Dhabi" : locale === "he" ? "על הנייר באבו דאבי" : "Off-Plan in Abu Dhabi", href: `${lp}/off-plan/abu-dhabi` },
  ];
  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <FAQJsonLd faqs={[locale === "fr" ? { question: "Investir dans un bien sur plan à Abou Dabi est-il une bonne opération ?", answer: "Oui. Abou Dabi offre un marché immobilier en croissance, un fort soutien gouvernemental, des promoteurs de qualité et des prix d'entrée compétitifs par rapport à Dubaï. Contactez Binayah pour un briefing de marché détaillé." } : { question: "Is Abu Dhabi off-plan property a good investment?", answer: "Yes. Abu Dhabi offers a growing real estate market with strong government backing, quality developers, and competitive entry prices compared to Dubai. Contact Binayah for a detailed market briefing." }]} />
      <BreadcrumbJsonLd items={breadcrumbs} />
      <Navbar />
      <section className="relative overflow-hidden pt-32 pb-16 text-white" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "48px 48px" }} />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-accent font-bold tracking-[0.4em] uppercase text-xs mb-4">{locale === "fr" ? "SUR PLAN" : locale === "ru" ? "НОВОСТРОЙКИ" : locale === "ar" ? "على الخارطة" : locale === "zh" ? "期房" : locale === "vi" ? "OFF-PLAN" : locale === "he" ? "על הנייר" : "OFF-PLAN"}</p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            {locale === "fr" ? "Biens sur plan à Abou Dabi" : locale === "ru" ? "Новостройки в Abu Dhabi" : locale === "ar" ? "على الخارطة في Abu Dhabi" : locale === "zh" ? "Abu Dhabi期房项目" : locale === "vi" ? "Bất động sản Off-Plan tại Abu Dhabi" : locale === "he" ? "נכסים על הנייר באבו דאבי" : "Off-Plan Properties in Abu Dhabi"}
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mb-8">{locale === "fr" ? "Appartements, villas et maisons de ville sur plan à Abou Dabi. Aldar, Imkan, Bloom sur Yas Island, Saadiyat, Al Reem Island." : locale === "ru" ? "Новостройки в Абу-Даби, квартиры, виллы и таунхаусы. Aldar, Imkan, Bloom на Яс-Айленд, Саадийят, Аль-Рим Айленд." : locale === "ar" ? "مشاريع على الخارطة في أبوظبي, شقق وفلل وتاون هاوس. Aldar وImkan وBloom في جزيرة ياس وجزيرة السعديات وجزيرة الريم." : locale === "zh" ? "阿布扎比期房项目, , 公寓、别墅和联排。Aldar、Imkan、Bloom，位于亚斯岛、萨迪亚特岛、里姆岛。" : locale === "vi" ? "Căn hộ, biệt thự và nhà phố off-plan tại Abu Dhabi. Aldar, Imkan, Bloom trên Yas Island, Saadiyat, Al Reem Island." : locale === "he" ? "דירות, וילות ובתים על הנייר באבו דאבי. Aldar, Imkan, Bloom ב-Yas Island, Saadiyat, Al Reem Island." : "Off-plan apartments, villas and townhouses in Abu Dhabi. Aldar, Imkan, Bloom on Yas Island, Saadiyat, Al Reem Island."}</p>
          <div className="flex flex-wrap gap-4">
            <Link href={`${lp}/contact`} className="font-bold px-8 py-4 rounded-xl hover:opacity-90 transition-all" style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)", color: "#fff" }}>
              {locale === "fr" ? "Obtenez un conseil d'expert" : locale === "ru" ? "Консультация специалиста" : locale === "ar" ? "استشر متخصصًا" : locale === "zh" ? "咨询专家" : locale === "vi" ? "Nhận tư vấn chuyên gia" : locale === "he" ? "קבלו ייעוץ מומחה" : "Get Expert Advice"} →
            </Link>
          </div>
        </div>
      </section>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-5">
            {locale === "fr" ? "Zones et îles clés" : locale === "ru" ? "Ключевые районы и острова" : locale === "ar" ? "المناطق الرئيسية" : locale === "zh" ? "主要区域" : locale === "vi" ? "Khu vực & Đảo chính" : locale === "he" ? "אזורים מרכזיים ואיים" : "Key Areas & Islands"}
          </h2>
          <div className="flex flex-wrap gap-3">
            {AREAS.map((a) => (
              <span key={a} className="bg-card border border-border/50 rounded-full px-4 py-2 text-sm font-semibold text-foreground">{a}</span>
            ))}
          </div>
        </section>
        <section className="bg-card border border-border/50 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-foreground mb-4">
            {locale === "fr" ? "Pourquoi investir à Abou Dabi ?" : locale === "ru" ? "Почему инвестировать в Abu Dhabi?" : locale === "ar" ? "لماذا الاستثمار في Abu Dhabi؟" : locale === "zh" ? "为什么投资Abu Dhabi？" : locale === "vi" ? "Vì sao đầu tư vào Abu Dhabi?" : locale === "he" ? "למה להשקיע באבו דאבי?" : "Why Invest in Abu Dhabi?"}
          </h2>
          <p className="text-muted-foreground mb-6">{locale === "fr" ? "Appartements, villas et maisons de ville sur plan à Abou Dabi. Aldar, Imkan, Bloom sur Yas Island, Saadiyat, Al Reem Island." : locale === "ru" ? "Новостройки в Абу-Даби, квартиры, виллы и таунхаусы. Aldar, Imkan, Bloom на Яс-Айленд, Саадийят, Аль-Рим Айленд." : locale === "ar" ? "مشاريع على الخارطة في أبوظبي, شقق وفلل وتاون هاوس. Aldar وImkan وBloom في جزيرة ياس وجزيرة السعديات وجزيرة الريم." : locale === "zh" ? "阿布扎比期房项目, , 公寓、别墅和联排。Aldar、Imkan、Bloom，位于亚斯岛、萨迪亚特岛、里姆岛。" : locale === "vi" ? "Căn hộ, biệt thự và nhà phố off-plan tại Abu Dhabi. Aldar, Imkan, Bloom trên Yas Island, Saadiyat, Al Reem Island." : locale === "he" ? "דירות, וילות ובתים על הנייר באבו דאבי. Aldar, Imkan, Bloom ב-Yas Island, Saadiyat, Al Reem Island." : "Off-plan apartments, villas and townhouses in Abu Dhabi. Aldar, Imkan, Bloom on Yas Island, Saadiyat, Al Reem Island."}</p>
          <Link href={`${lp}/contact`} className="inline-flex items-center gap-2 font-bold px-6 py-3 rounded-xl text-sm hover:opacity-90 transition-all" style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)", color: "#fff" }}>
            {locale === "fr" ? "Obtenez une sélection de biens" : locale === "ru" ? "Получить подборку объектов" : locale === "ar" ? "احصل على قائمة مختارة" : locale === "zh" ? "获取精选房源" : locale === "vi" ? "Nhận danh sách được chọn lọc" : locale === "he" ? "קבלו רשימות מותאמות" : "Get Curated Listings"} →
          </Link>
        </section>
      </div>
      <Footer />
    </div>
  );
}
