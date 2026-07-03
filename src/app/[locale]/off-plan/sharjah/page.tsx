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
  const url = canonical(locale, "/off-plan/sharjah");
  const desc = locale === "ru" ? "Бюджетные новостройки в Шардже, на 30% дешевле Дубая. Aljada, Tilal City, Masaar. Лучшее соотношение цены и качества в ОАЭ." : locale === "ar" ? "مشاريع على الخارطة الاقتصادية في الشارقة, أرخص بنسبة 30% من دبي. الجادة وتلال سيتي ومسار. أفضل قيمة في الإمارات." : locale === "zh" ? "沙迦实惠期房, , 比迪拜便宜30%。Aljada、Tilal City、Masaar，阿联酋最佳性价比。" : locale === "vi" ? "Off-plan giá phải chăng tại Sharjah, rẻ hơn Dubai 30%. Aljada, Tilal City, Masaar. Giá trị tốt nhất UAE." : locale === "he" ? "נכסים על הנייר ידידותיים לתקציב בשארג'ה, זולים ב-30% מדובאי. Aljada, Tilal City, Masaar. התמורה הטובה ביותר באיחוד האמירויות." : "Budget-friendly off-plan in Sharjah, 30% cheaper than Dubai. Aljada, Tilal City, Masaar. Best value UAE.";
  const title = locale === "ru" ? "Новостройки в Шардже 2026 | Доступные ОАЭ | Binayah" : locale === "ar" ? "عقارات على الخارطة في الشارقة 2026 | Binayah" : locale === "zh" ? "沙迦期房2026 | Binayah" : locale === "vi" ? "Bất động sản Off-Plan tại Sharjah 2026 | UAE giá phải chăng | Binayah" : locale === "he" ? "נכסים על הנייר בשארג'ה 2026 | איחוד האמירויות במחיר משתלם | Binayah" : "Off-Plan Properties in Sharjah 2026 | Affordable UAE | Binayah";
  return {
    title,
    description: desc,
    keywords: "off plan properties sharjah, sharjah off plan 2026, affordable uae property".split(", "),
    alternates: { canonical: url, languages: altLangs("/off-plan/sharjah") },
    openGraph: { title, description: desc, url, type: "website", locale: OG_LOCALE[locale] ?? "en_AE", images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }] },
  };
}

const AREAS = ["Aljada", "Tilal City", "Masaar", "Maryam Island", "Al Zahia", "Nasma Residences"];

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const isRtl = locale === "ar" || locale === "he"; // ar, he are rtl; vi, zh, ru, en are ltr
  const lp = locale === "en" ? "" : `/${locale}`;
  const breadcrumbs = [
    { name: locale === "ru" ? "Главная" : locale === "ar" ? "الرئيسية" : locale === "zh" ? "首页" : locale === "vi" ? "Trang chủ" : locale === "he" ? "בית" : "Home", href: `${lp}/` },
    { name: locale === "ru" ? "Новостройки" : locale === "ar" ? "على الخارطة" : locale === "zh" ? "期房" : locale === "vi" ? "Off-Plan" : locale === "he" ? "על הנייר" : "Off-Plan", href: `${lp}/off-plan` },
    { name: locale === "ru" ? "Новостройки в Шардже" : locale === "ar" ? "على الخارطة في الشارقة" : locale === "zh" ? "Sharjah期房" : locale === "vi" ? "Off-Plan tại Sharjah" : locale === "he" ? "על הנייר בשארג'ה" : "Off-Plan in Sharjah", href: `${lp}/off-plan/sharjah` },
  ];
  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <FAQJsonLd faqs={[{ question: "Is Sharjah off-plan property a good investment?", answer: "Yes. Sharjah offers a growing real estate market with strong government backing, quality developers, and competitive entry prices compared to Dubai. Contact Binayah for a detailed market briefing." }]} />
      <BreadcrumbJsonLd items={breadcrumbs} />
      <Navbar />
      <section className="relative overflow-hidden pt-32 pb-16 text-white" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "48px 48px" }} />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-accent font-bold tracking-[0.4em] uppercase text-xs mb-4">{locale === "ru" ? "НОВОСТРОЙКИ" : locale === "ar" ? "على الخارطة" : locale === "zh" ? "期房" : locale === "vi" ? "OFF-PLAN" : locale === "he" ? "על הנייר" : "OFF-PLAN"}</p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            {locale === "ru" ? "Новостройки в Шардже" : locale === "ar" ? "على الخارطة في الشارقة" : locale === "zh" ? "Sharjah期房项目" : locale === "vi" ? "Bất động sản Off-Plan tại Sharjah" : locale === "he" ? "נכסים על הנייר בשארג'ה" : "Off-Plan Properties in Sharjah"}
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mb-8">{locale === "ru" ? "Бюджетные новостройки в Шардже, на 30% дешевле Дубая. Aljada, Tilal City, Masaar. Лучшее соотношение цены и качества в ОАЭ." : locale === "ar" ? "مشاريع على الخارطة الاقتصادية في الشارقة, أرخص بنسبة 30% من دبي. الجادة وتلال سيتي ومسار. أفضل قيمة في الإمارات." : locale === "zh" ? "沙迦实惠期房, , 比迪拜便宜30%。Aljada、Tilal City、Masaar，阿联酋最佳性价比。" : locale === "vi" ? "Off-plan giá phải chăng tại Sharjah, rẻ hơn Dubai 30%. Aljada, Tilal City, Masaar. Giá trị tốt nhất UAE." : locale === "he" ? "נכסים על הנייר ידידותיים לתקציב בשארג'ה, זולים ב-30% מדובאי. Aljada, Tilal City, Masaar. התמורה הטובה ביותר באיחוד האמירויות." : "Budget-friendly off-plan in Sharjah, 30% cheaper than Dubai. Aljada, Tilal City, Masaar. Best value UAE."}</p>
          <div className="flex flex-wrap gap-4">
            <Link href={`${lp}/contact`} className="font-bold px-8 py-4 rounded-xl hover:opacity-90 transition-all" style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)", color: "#fff" }}>
              {locale === "ru" ? "Консультация специалиста" : locale === "ar" ? "استشر متخصصًا" : locale === "zh" ? "咨询专家" : locale === "vi" ? "Nhận tư vấn chuyên gia" : locale === "he" ? "קבלו ייעוץ מומחה" : "Get Expert Advice"} →
            </Link>
          </div>
        </div>
      </section>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-5">
            {locale === "ru" ? "Ключевые районы" : locale === "ar" ? "المناطق الرئيسية" : locale === "zh" ? "主要区域" : locale === "vi" ? "Khu vực chính" : locale === "he" ? "אזורים מרכזיים" : "Key Areas"}
          </h2>
          <div className="flex flex-wrap gap-3">
            {AREAS.map((a) => (
              <span key={a} className="bg-card border border-border/50 rounded-full px-4 py-2 text-sm font-semibold text-foreground">{a}</span>
            ))}
          </div>
        </section>
        <section className="bg-card border border-border/50 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-foreground mb-4">
            {locale === "ru" ? "Почему инвестировать в Шарджу?" : locale === "ar" ? "لماذا الاستثمار في الشارقة؟" : locale === "zh" ? "为什么投资沙迦？" : locale === "vi" ? "Vì sao đầu tư vào Sharjah?" : locale === "he" ? "למה להשקיע בשארג'ה?" : "Why Invest in Sharjah?"}
          </h2>
          <p className="text-muted-foreground mb-6">{locale === "ru" ? "Бюджетные новостройки в Шардже, на 30% дешевле Дубая. Aljada, Tilal City, Masaar. Лучшее соотношение цены и качества в ОАЭ." : locale === "ar" ? "مشاريع على الخارطة الاقتصادية في الشارقة, أرخص بنسبة 30% من دبي. الجادة وتلال سيتي ومسار. أفضل قيمة في الإمارات." : locale === "zh" ? "沙迦实惠期房, , 比迪拜便宜30%。Aljada、Tilal City、Masaar，阿联酋最佳性价比。" : locale === "vi" ? "Off-plan giá phải chăng tại Sharjah, rẻ hơn Dubai 30%. Aljada, Tilal City, Masaar. Giá trị tốt nhất UAE." : locale === "he" ? "נכסים על הנייר ידידותיים לתקציב בשארג'ה, זולים ב-30% מדובאי. Aljada, Tilal City, Masaar. התמורה הטובה ביותר באיחוד האמירויות." : "Budget-friendly off-plan in Sharjah, 30% cheaper than Dubai. Aljada, Tilal City, Masaar. Best value UAE."}</p>
          <Link href={`${lp}/contact`} className="inline-flex items-center gap-2 font-bold px-6 py-3 rounded-xl text-sm hover:opacity-90 transition-all" style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)", color: "#fff" }}>
            {locale === "ru" ? "Получить подборку объектов" : locale === "ar" ? "احصل على قائمة مختارة" : locale === "zh" ? "获取精选房源" : locale === "vi" ? "Nhận danh sách được chọn lọc" : locale === "he" ? "קבלו רשימות מותאמות" : "Get Curated Listings"} →
          </Link>
        </section>
      </div>
      <Footer />
    </div>
  );
}
