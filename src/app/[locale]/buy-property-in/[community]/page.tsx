/* eslint-disable i18next/no-literal-string -- SEO landing page, English-only by design (targets English search queries) */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ListingsPageClient from "@/app/_clients/rent/ListingsPageClient";
import { serverApiUrl, serverFetch } from "@/lib/api";
import { BUY_COMMUNITIES, findBuyCommunity } from "@/lib/buy-communities";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { canonical as makeCanonical, altLangs, AE_URL } from "@/lib/site";

export const revalidate = 1800;

export function generateStaticParams() {
  const locales = ["en", "ar", "zh", "ru"];
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
  const description = `${c.shortIntro} Avg yield ${c.yield}. Browse current listings for sale in ${c.name} with Binayah Properties.`;
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

export default async function BuyInCommunityPage({
  params,
}: {
  params: Promise<{ locale: string; community: string }>;
}) {
  const { locale, community } = await params;
  const c = findBuyCommunity(community);
  if (!c) notFound();

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
    { name: "Home", href: `${localePrefix}/` },
    { name: "Buy", href: `${localePrefix}/buy` },
    { name: c.name, href: `${localePrefix}/buy-property-in/${c.slug}` },
  ];

  const seoBlock = (
    <section className="bg-card border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold mb-3">{c.vibe}</p>
        <h1 className="text-3xl sm:text-5xl font-bold text-foreground mb-4">
          Buy Property in {c.name}, Dubai
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl mb-6">{c.shortIntro}</p>
        <p className="text-sm sm:text-base text-foreground/80 leading-relaxed max-w-3xl mb-8">{c.why}</p>
        <div className="grid grid-cols-3 gap-4 max-w-xl">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Price range</p>
            <p className="text-sm sm:text-base font-bold text-foreground">{c.priceRange}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Gross yield</p>
            <p className="text-sm sm:text-base font-bold text-foreground">{c.yield}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Listings</p>
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
        title={`Properties for Sale in ${c.name}`}
        subtitle={c.shortIntro}
        initialPage={1}
        batchSize={BATCH_SIZE}
        community={c.name}
        headerSlot={seoBlock}
      />
    </>
  );
}
