/* eslint-disable i18next/no-literal-string -- multilingual SEO landing page */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";
import SearchPageClient from "@/app/_clients/search/SearchPageClient";
import PropertyTypeSidebar from "@/components/PropertyTypeSidebar";

export const revalidate = 1800;
// Only the 3 whitelisted types are valid; any other slug returns a real 404
// (Next built-in via dynamicParams=false), not a soft 200.
export const dynamicParams = false;
export function generateStaticParams() {
  const locales = ["en", "ru", "ar", "zh", "vi", "he"];
  return locales.flatMap((locale) => ["apartments", "villas", "townhouses"].map((type) => ({ locale, type })));
}

interface Props {
  params: Promise<{ locale: string; type: string }>;
}

// URL slug -> { searchType (passed to SearchPageClient), per-locale labels }
const TYPES = {
  apartments: {
    searchType: "Apartment",
    label: { en: "Apartments", ru: "Апартаменты", ar: "شقق", zh: "公寓", vi: "Căn hộ", he: "דירות" },
  },
  villas: {
    searchType: "Villa",
    label: { en: "Villas", ru: "Виллы", ar: "فلل", zh: "别墅", vi: "Biệt thự", he: "וילות" },
  },
  townhouses: {
    searchType: "Townhouse",
    label: { en: "Townhouses", ru: "Таунхаусы", ar: "تاون هاوس", zh: "联排别墅", vi: "Nhà phố", he: "בתים טוריים" },
  },
} as const;

type TypeSlug = keyof typeof TYPES;
type Loc = keyof (typeof TYPES)["apartments"]["label"];

const OFFPLAN_LABEL: Record<string, string> = {
  en: "Off-Plan", ru: "Новостройки", ar: "على الخارطة", zh: "期房", vi: "Off-Plan", he: "על הנייר",
};
const HOME_LABEL: Record<string, string> = {
  en: "Home", ru: "Главная", ar: "الرئيسية", zh: "首页", vi: "Trang chủ", he: "בית",
};

function titleFor(typeLabel: string, locale: string): string {
  switch (locale) {
    case "ru": return `${typeLabel} в новостройках Дубая | Off-Plan | Binayah`;
    case "ar": return `${typeLabel} على الخارطة في دبي | بناية للعقارات`;
    case "zh": return `迪拜期房${typeLabel} | Binayah Properties`;
    case "vi": return `${typeLabel} off-plan tại Dubai | Binayah Properties`;
    case "he": return `${typeLabel} על הנייר בדובאי | Binayah Properties`;
    default: return `Off-Plan ${typeLabel} in Dubai | New Launches | Binayah`;
  }
}
function descFor(typeLabel: string, locale: string): string {
  switch (locale) {
    case "ru": return `Новостройки (off-plan) — ${typeLabel.toLowerCase()} в Дубае. Гибкие планы рассрочки от ведущих застройщиков, высокий потенциал доходности.`;
    case "ar": return `${typeLabel} على الخارطة في دبي من كبار المطوّرين. خطط سداد مرنة وإمكانية عائد مرتفع قبل التسليم.`;
    case "zh": return `迪拜期房${typeLabel}，来自顶级开发商。灵活付款计划，交房前高增值潜力。`;
    case "vi": return `${typeLabel} off-plan tại Dubai từ các chủ đầu tư hàng đầu. Kế hoạch thanh toán linh hoạt, tiềm năng tăng giá cao.`;
    case "he": return `${typeLabel} על הנייר בדובאי מהיזמים המובילים. תוכניות תשלום גמישות ופוטנציאל תשואה גבוה.`;
    default: return `Off-plan ${typeLabel.toLowerCase()} in Dubai from top developers. Flexible payment plans and high capital-appreciation potential before handover.`;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, type } = await params;
  const entry = TYPES[type as TypeSlug];
  if (!entry) notFound();
  const typeLabel = entry.label[(locale as Loc)] ?? entry.label.en;
  const url = canonical(locale, `/off-plan/${type}`);
  const title = titleFor(typeLabel, locale);
  const description = descFor(typeLabel, locale);
  return {
    title,
    description,
    alternates: { canonical: url, languages: altLangs(`/off-plan/${type}`) },
    openGraph: {
      title, description, url, type: "website",
      locale: OG_LOCALE[locale] ?? "en_AE",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    },
  };
}

export default async function OffPlanTypePage({ params }: Props) {
  const { locale, type } = await params;
  const entry = TYPES[type as TypeSlug];
  if (!entry) return notFound();

  const isRtl = locale === "ar" || locale === "he";
  const lp = locale === "en" ? "" : `/${locale}`;
  const typeLabel = entry.label[(locale as Loc)] ?? entry.label.en;
  const offplan = OFFPLAN_LABEL[locale] ?? OFFPLAN_LABEL.en;

  const breadcrumbs = [
    { name: HOME_LABEL[locale] ?? HOME_LABEL.en, href: `${lp}/` },
    { name: offplan, href: `${lp}/off-plan` },
    { name: typeLabel, href: `${lp}/off-plan/${type}` },
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <Navbar />

      {/* Hero */}
      <section
        className="relative overflow-hidden pt-28 pb-12 text-white"
        style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
      >
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "48px 48px" }} />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-accent font-bold tracking-[0.4em] uppercase text-xs mb-3">{offplan}</p>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-4">{titleFor(typeLabel, locale).split(" | ")[0]}</h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl">{descFor(typeLabel, locale)}</p>
        </div>
      </section>

      {/* Embedded search — off-plan, pre-filtered to this type, clean URL (no query params) */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        <SearchPageClient defaultStatus="Off-Plan" defaultIntent="off-plan" defaultType={entry.searchType} syncUrl={false} />
      </div>

      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 pb-12 sm:pb-16 lg:grid lg:grid-cols-[1fr_320px] lg:gap-8 lg:items-start">
        <div className="min-w-0" />
        <aside className="mt-12 lg:mt-0 lg:sticky lg:top-24 self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden">
          <PropertyTypeSidebar locale={locale} slug="off-plan" />
        </aside>
      </div>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
