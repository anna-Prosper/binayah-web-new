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

export const dynamic = "force-dynamic";

// Pre-generate the valid type pages; unknown types 404 cleanly.
export function generateStaticParams() {
  const locales = ["en", "ru", "ar", "zh", "vi", "he"];
  return locales.flatMap((locale) => ["apartments", "villas", "townhouses"].map((type) => ({ locale, type })));
}


interface Props {
  params: Promise<{ locale: string; type: string }>;
}

// URL slug -> { searchType passed to SearchPageClient, per-locale label, sidebar slug }
const TYPES = {
  apartments: {
    searchType: "Apartment", slug: "apartments",
    label: { en: "Apartments", ru: "Апартаменты", ar: "شقق", zh: "公寓", vi: "Căn hộ", he: "דירות" },
  },
  villas: {
    searchType: "Villa", slug: "villas",
    label: { en: "Villas", ru: "Виллы", ar: "فلل", zh: "别墅", vi: "Biệt thự", he: "וילות" },
  },
  townhouses: {
    searchType: "Townhouse", slug: "townhouses",
    label: { en: "Townhouses", ru: "Таунхаусы", ar: "تاون هاوس", zh: "联排别墅", vi: "Nhà phố", he: "בתים טוריים" },
  },
} as const;

type TypeSlug = keyof typeof TYPES;
type Loc = keyof (typeof TYPES)["apartments"]["label"];

const RENT_LABEL: Record<string, string> = {
  en: "Rent", ru: "Аренда", ar: "إيجار", zh: "租赁", vi: "Thuê", he: "השכרה",
};
const HOME_LABEL: Record<string, string> = {
  en: "Home", ru: "Главная", ar: "الرئيسية", zh: "首页", vi: "Trang chủ", he: "בית",
};

function titleFor(typeLabel: string, locale: string): string {
  switch (locale) {
    case "ru": return `Аренда: ${typeLabel.toLowerCase()} в Дубае | Binayah Properties`;
    case "ar": return `${typeLabel} للإيجار في دبي | بناية للعقارات`;
    case "zh": return `迪拜${typeLabel}租赁 | Binayah Properties`;
    case "vi": return `${typeLabel} cho thuê tại Dubai | Binayah Properties`;
    case "he": return `${typeLabel} להשכרה בדובאי | Binayah Properties`;
    default: return `${typeLabel} for Rent in Dubai | Binayah Properties`;
  }
}
function descFor(typeLabel: string, locale: string): string {
  switch (locale) {
    case "ru": return `Аренда: ${typeLabel.toLowerCase()} в Дубае. Проверенные объявления по районам, цене и количеству спален. Поддержка экспертов Binayah.`;
    case "ar": return `${typeLabel} للإيجار في دبي. عروض موثوقة حسب المنطقة والسعر وعدد الغرف. دعم خبراء بناية.`;
    case "zh": return `迪拜${typeLabel}租赁。按地区、价格和卧室数量筛选的真实房源。Binayah专家支持。`;
    case "vi": return `${typeLabel} cho thuê tại Dubai. Tin đăng đã xác minh theo khu vực, giá và số phòng ngủ. Hỗ trợ chuyên gia Binayah.`;
    case "he": return `${typeLabel} להשכרה בדובאי. מודעות מאומתות לפי אזור, מחיר ומספר חדרי שינה. ליווי מומחי Binayah.`;
    default: return `${typeLabel} for rent in Dubai. Verified listings filtered by area, price and bedrooms. Expert support from Binayah.`;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, type } = await params;
  const entry = TYPES[type as TypeSlug];
  if (!entry) notFound();
  const typeLabel = entry.label[(locale as Loc)] ?? entry.label.en;
  const url = canonical(locale, `/rent/${type}`);
  const title = titleFor(typeLabel, locale);
  const description = descFor(typeLabel, locale);
  return {
    title, description,
    alternates: { canonical: url, languages: altLangs(`/rent/${type}`) },
    openGraph: {
      title, description, url, type: "website",
      locale: OG_LOCALE[locale] ?? "en_AE",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    },
  };
}

export default async function RentTypePage({ params }: Props) {
  const { locale, type } = await params;
  const entry = TYPES[type as TypeSlug];
  if (!entry) return notFound();

  const isRtl = locale === "ar" || locale === "he";
  const lp = locale === "en" ? "" : `/${locale}`;
  const typeLabel = entry.label[(locale as Loc)] ?? entry.label.en;
  const rent = RENT_LABEL[locale] ?? RENT_LABEL.en;

  const breadcrumbs = [
    { name: HOME_LABEL[locale] ?? HOME_LABEL.en, href: `${lp}/` },
    { name: rent, href: `${lp}/rent` },
    { name: typeLabel, href: `${lp}/rent/${type}` },
  ];

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <Navbar />

      <section
        className="relative overflow-hidden pt-28 pb-12 text-white"
        style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
      >
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "48px 48px" }} />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-accent font-bold tracking-[0.4em] uppercase text-xs mb-3">{rent}</p>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-4">{titleFor(typeLabel, locale).split(" | ")[0]}</h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl">{descFor(typeLabel, locale)}</p>
        </div>
      </section>

      {/* Embedded search — rent, pre-filtered to this type, clean URL (no query params) */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        <SearchPageClient defaultIntent="rent" defaultType={entry.searchType} syncUrl={false} />
      </div>

      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 pb-12 sm:pb-16 lg:grid lg:grid-cols-[1fr_320px] lg:gap-8 lg:items-start">
        <div className="min-w-0" />
        <aside className="mt-12 lg:mt-0 lg:sticky lg:top-24 self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden">
          <PropertyTypeSidebar locale={locale} slug={entry.slug} />
        </aside>
      </div>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
