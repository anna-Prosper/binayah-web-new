/* eslint-disable i18next/no-literal-string */
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { FAQJsonLd, BreadcrumbJsonLd } from "@/components/JsonLd";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";

export const revalidate = 86400;
interface Props { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const url = canonical(locale, "/off-plan/ras-al-khaimah");
  const desc = locale === "ru" ? "Новостройки в Рас-эль-Хайме — Wynn Resort, Аль-Марджан Айленд, Мина Аль-Араб. Самый быстрорастущий эмират ОАЭ, доходность 7–9%." : locale === "ar" ? "مشاريع على الخارطة في رأس الخيمة — Wynn Resort وجزيرة المرجان وميناء العرب. أسرع إمارة إماراتية نمواً، عوائد 7-9%." : locale === "zh" ? "阿联酋增长最快的酋长国期房——Wynn Resort、Al Marjan岛、Mina Al Arab，租金回报率7-9%。" : locale === "vi" ? "Off-plan tại RAK — Wynn Resort, Al Marjan Island, Mina Al Arab. Tiểu vương quốc UAE phát triển nhanh nhất, lợi suất 7-9%." : "Off-plan in RAK — Wynn Resort, Al Marjan Island, Mina Al Arab. Fastest-growing UAE emirate, 7-9% yields.";
  const title = locale === "ru" ? "Новостройки в Рас-эль-Хайме 2026 | Wynn Resort | Binayah" : locale === "ar" ? "عقارات على الخارطة في رأس الخيمة 2026 | Binayah" : locale === "zh" ? "阿联酋RAK期房2026 | Binayah" : locale === "vi" ? "Bất động sản Off-Plan tại Ras Al Khaimah 2026 | Wynn Resort | Binayah" : "Off-Plan Properties in Ras Al Khaimah 2026 | Wynn Resort | Binayah";
  return {
    title,
    description: desc,
    keywords: "off plan properties ras al khaimah, rak property investment, al marjan island wynn resort".split(", "),
    alternates: { canonical: url, languages: altLangs("/off-plan/ras-al-khaimah") },
    openGraph: { title, description: desc, url, type: "website", locale: OG_LOCALE[locale] ?? "en_AE", images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }] },
  };
}

const AREAS = ["Al Marjan Island", "Mina Al Arab", "Al Hamra Village", "Hayat Island", "RAK City"];

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const isRtl = locale === "ar";
  const lp = locale === "en" ? "" : `/${locale}`;
  const breadcrumbs = [
    { name: locale === "ru" ? "Главная" : locale === "ar" ? "الرئيسية" : locale === "zh" ? "首页" : locale === "vi" ? "Trang chủ" : "Home", href: `${lp}/` },
    { name: locale === "ru" ? "Новостройки" : locale === "ar" ? "على الخارطة" : locale === "zh" ? "期房" : locale === "vi" ? "Off-Plan" : "Off-Plan", href: `${lp}/off-plan` },
    { name: locale === "ru" ? "Новостройки в Рас-эль-Хайме" : locale === "ar" ? "على الخارطة في رأس الخيمة" : locale === "zh" ? "Ras Al Khaimah期房" : locale === "vi" ? "Off-Plan tại Ras Al Khaimah" : "Off-Plan in Ras Al Khaimah", href: `${lp}/off-plan/ras-al-khaimah` },
  ];
  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <FAQJsonLd faqs={[{ question: "Is Ras Al Khaimah off-plan property a good investment?", answer: "Yes. Ras Al Khaimah offers a growing real estate market with strong government backing, quality developers, and competitive entry prices compared to Dubai. Contact Binayah for a detailed market briefing." }]} />
      <BreadcrumbJsonLd items={breadcrumbs} />
      <Navbar />
      <section className="relative overflow-hidden pt-32 pb-16 text-white" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "48px 48px" }} />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-accent font-bold tracking-[0.4em] uppercase text-xs mb-4">{locale === "ru" ? "НОВОСТРОЙКИ" : locale === "ar" ? "على الخارطة" : locale === "zh" ? "期房" : locale === "vi" ? "OFF-PLAN" : "OFF-PLAN"}</p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            {locale === "ru" ? "Новостройки в Рас-эль-Хайме" : locale === "ar" ? "على الخارطة في رأس الخيمة" : locale === "zh" ? "Ras Al Khaimah期房项目" : locale === "vi" ? "Bất động sản Off-Plan tại Ras Al Khaimah" : "Off-Plan Properties in Ras Al Khaimah"}
          </h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mb-8">{locale === "ru" ? "Новостройки в Рас-эль-Хайме — Wynn Resort, Аль-Марджан Айленд, Мина Аль-Араб. Самый быстрорастущий эмират ОАЭ, доходность 7–9%." : locale === "ar" ? "مشاريع على الخارطة في رأس الخيمة — Wynn Resort وجزيرة المرجان وميناء العرب. أسرع إمارة إماراتية نمواً، عوائد 7-9%." : locale === "zh" ? "阿联酋增长最快的酋长国期房——Wynn Resort、Al Marjan岛、Mina Al Arab，租金回报率7-9%。" : locale === "vi" ? "Off-plan tại Ras Al Khaimah — Wynn Resort, Al Marjan Island, Mina Al Arab. Tiểu vương quốc UAE phát triển nhanh nhất, lợi suất 7-9%." : "Off-plan in RAK — Wynn Resort, Al Marjan Island, Mina Al Arab. Fastest-growing UAE emirate, 7-9% yields."}</p>
          <div className="flex flex-wrap gap-4">
            <Link href={`${lp}/contact`} className="font-bold px-8 py-4 rounded-xl hover:opacity-90 transition-all" style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)", color: "#fff" }}>
              {locale === "ru" ? "Консультация специалиста" : locale === "ar" ? "استشر متخصصًا" : locale === "zh" ? "咨询专家" : locale === "vi" ? "Nhận tư vấn chuyên gia" : "Get Expert Advice"} →
            </Link>
          </div>
        </div>
      </section>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-5">
            {locale === "ru" ? "Ключевые районы" : locale === "ar" ? "المناطق الرئيسية" : locale === "zh" ? "主要区域" : locale === "vi" ? "Khu vực chính" : "Key Areas"}
          </h2>
          <div className="flex flex-wrap gap-3">
            {AREAS.map((a) => (
              <span key={a} className="bg-card border border-border/50 rounded-full px-4 py-2 text-sm font-semibold text-foreground">{a}</span>
            ))}
          </div>
        </section>
        <section className="bg-card border border-border/50 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-foreground mb-4">
            {locale === "ru" ? "Почему инвестировать в Рас-эль-Хайму?" : locale === "ar" ? "لماذا الاستثمار في رأس الخيمة؟" : locale === "zh" ? "为什么投资RAK？" : locale === "vi" ? "Vì sao đầu tư vào Ras Al Khaimah?" : "Why Invest in Ras Al Khaimah?"}
          </h2>
          <p className="text-muted-foreground mb-6">{locale === "ru" ? "Новостройки в Рас-эль-Хайме — Wynn Resort, Аль-Марджан Айленд, Мина Аль-Араб. Самый быстрорастущий эмират ОАЭ, доходность 7–9%." : locale === "ar" ? "مشاريع على الخارطة في رأس الخيمة — Wynn Resort وجزيرة المرجان وميناء العرب. أسرع إمارة إماراتية نمواً، عوائد 7-9%." : locale === "zh" ? "阿联酋增长最快的酋长国期房——Wynn Resort、Al Marjan岛、Mina Al Arab，租金回报率7-9%。" : locale === "vi" ? "Off-plan tại Ras Al Khaimah — Wynn Resort, Al Marjan Island, Mina Al Arab. Tiểu vương quốc UAE phát triển nhanh nhất, lợi suất 7-9%." : "Off-plan in RAK — Wynn Resort, Al Marjan Island, Mina Al Arab. Fastest-growing UAE emirate, 7-9% yields."}</p>
          <Link href={`${lp}/contact`} className="inline-flex items-center gap-2 font-bold px-6 py-3 rounded-xl text-sm hover:opacity-90 transition-all" style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)", color: "#fff" }}>
            {locale === "ru" ? "Получить подборку объектов" : locale === "ar" ? "احصل على قائمة مختارة" : locale === "zh" ? "获取精选房源" : locale === "vi" ? "Nhận danh sách được chọn lọc" : "Get Curated Listings"} →
          </Link>
        </section>
      </div>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
