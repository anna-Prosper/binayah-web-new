/* eslint-disable i18next/no-literal-string -- SEO landing page; community copy is localized via localizeCommunityText, UI labels via the LABELS map */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ListingsPageClient from "@/app/_clients/rent/ListingsPageClient";
import { serverApiUrl, serverFetch } from "@/lib/api";
import { BUY_COMMUNITIES, findBuyCommunity, localizeCommunityText } from "@/lib/buy-communities";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { canonical as makeCanonical, altLangs, AE_URL } from "@/lib/site";

export const revalidate = 1800;

export function generateStaticParams() {
  const locales = ["en", "ar", "zh", "ru", "vi"];
  return locales.flatMap((locale) =>
    BUY_COMMUNITIES.map((c) => ({ locale, community: c.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; community: string }>;
}): Promise<Metadata> {
  const { community, locale } = await params;
  const c = findBuyCommunity(community);
  if (!c) return {};
  const title = `Buy Property in ${c.name}, Dubai | ${c.priceRange} | Binayah`;
  const description = `${localizeCommunityText(c.shortIntro, locale)} Avg yield ${c.yield}. Browse current listings for sale in ${c.name} with Binayah Properties.`;
  return {
    title,
    description,
    alternates: {
      canonical: makeCanonical(locale, `/buy-property-in/${c.slug}`),
      languages: altLangs(`/buy-property-in/${c.slug}`),
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: makeCanonical(locale, `/buy-property-in/${c.slug}`),
      images: [{ url: `${AE_URL}/assets/og-image.webp`, width: 1200, height: 630 }],
    },
  };
}

const BATCH_SIZE = 9;

const LABELS = {
  en: { home: "Home", buy: "Buy", buyIn: "Buy Property in", dubai: "Dubai", priceRange: "Price range", grossYield: "Gross yield", listings: "Listings", forSale: "Properties for Sale in", secondary: "SECONDARY MARKET" },
  ru: { home: "Главная", buy: "Купить", buyIn: "Купить недвижимость в", dubai: "Дубае", priceRange: "Диапазон цен", grossYield: "Доходность", listings: "Объектов", forSale: "Недвижимость на продажу в", secondary: "ВТОРИЧНЫЙ РЫНОК" },
  ar: { home: "الرئيسية", buy: "شراء", buyIn: "شراء عقار في", dubai: "دبي", priceRange: "نطاق السعر", grossYield: "العائد الإجمالي", listings: "عقارات", forSale: "عقارات للبيع في", secondary: "السوق الثانوي" },
  zh: { home: "首页", buy: "购买", buyIn: "购买房产 —", dubai: "迪拜", priceRange: "价格区间", grossYield: "租金回报", listings: "房源", forSale: "在售房产 —", secondary: "二手市场" },
  vi: { home: "Trang chủ", buy: "Mua", buyIn: "Mua bất động sản tại", dubai: "Dubai", priceRange: "Khoảng giá", grossYield: "Lợi suất gộp", listings: "Tin đăng", forSale: "Bất động sản bán tại", secondary: "THỊ TRƯỜNG THỨ CẤP" },
} as const;

export default async function BuyInCommunityPage({
  params,
}: {
  params: Promise<{ locale: string; community: string }>;
}) {
  const { locale, community } = await params;
  const c = findBuyCommunity(community);
  if (!c) notFound();
  const L = LABELS[(locale as keyof typeof LABELS)] ?? LABELS.en;

  let initialListings: any[] = [];
  let totalCount = 0;

  try {
    const [listingsRes, countRes] = await Promise.all([
      serverFetch(
        serverApiUrl(`/api/listings?listingType=Sale&community=${encodeURIComponent(c.name)}&limit=${BATCH_SIZE}`)
      ),
      serverFetch(
        serverApiUrl(`/api/listings?listingType=Sale&community=${encodeURIComponent(c.name)}&countOnly=1`)
      ),
    ]);
    if (listingsRes.ok) initialListings = await listingsRes.json();
    if (countRes.ok) totalCount = (await countRes.json()).total ?? 0;
  } catch (err) {
    console.warn("[BuyInCommunityPage] API unavailable:", (err as Error).message);
  }

  const localePrefix = locale === "en" ? "" : `/${locale}`;
  const breadcrumbs = [
    { name: L.home, href: `${localePrefix}/` },
    { name: L.buy, href: `${localePrefix}/buy` },
    { name: c.name, href: `${localePrefix}/buy-property-in/${c.slug}` },
  ];

  const seoBlock = (
    <section className="bg-card border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold mb-3">{localizeCommunityText(c.vibe, locale)}</p>
        <h1 className="text-3xl sm:text-5xl font-bold text-foreground mb-4">
          {L.buyIn} {c.name}, {L.dubai}
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl mb-6">{localizeCommunityText(c.shortIntro, locale)}</p>
        <p className="text-sm sm:text-base text-foreground/80 leading-relaxed max-w-3xl mb-8">{localizeCommunityText(c.why, locale)}</p>
        <div className="grid grid-cols-3 gap-4 max-w-xl">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{L.priceRange}</p>
            <p className="text-sm sm:text-base font-bold text-foreground">{c.priceRange}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{L.grossYield}</p>
            <p className="text-sm sm:text-base font-bold text-foreground">{c.yield}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{L.listings}</p>
            <p className="text-sm sm:text-base font-bold text-foreground">{totalCount}+</p>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <ListingsPageClient
        initialListings={initialListings}
        totalCount={totalCount}
        listingType="Sale"
        title={`${L.forSale} ${c.name}`}
        subtitle={localizeCommunityText(c.shortIntro, locale)}
        initialPage={1}
        batchSize={BATCH_SIZE}
        community={c.name}
        headerSlot={seoBlock}
      />
    </>
  );
}
