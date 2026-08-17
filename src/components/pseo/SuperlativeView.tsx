/* eslint-disable i18next/no-literal-string -- programmatic SEO template; data-driven English */
import type { Metadata } from "next";
// Intentional: the `lp` prefix in this file also feeds BreadcrumbJsonLd/FAQJsonLd,
// which concatenates href onto the site origin to emit absolute SEO URLs and never
// passes through next-intl. Switching to the locale-aware Link would require
// stripping `lp` from the hrefs, which would silently emit English canonical
// breadcrumb URLs on every localized page. Keep the manual prefix here.
// eslint-disable-next-line no-restricted-imports
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BedDouble, Home } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import CommunityStatsBand from "@/components/CommunityStatsBand";
import { getCachedSearch } from "@/lib/api";
import { findBuyCommunity } from "@/lib/buy-communities";
import { getCommunityStats, buildCommunityFaqs, fmtAed } from "@/lib/market";
import { getNonce } from "@/lib/nonce";
import { canonical as makeCanonical, altLangs, AE_URL } from "@/lib/site";

const TYPES: Record<string, { canon: string; plural: string }> = {
  apartment: { canon: "Apartment", plural: "apartments" }, apartments: { canon: "Apartment", plural: "apartments" },
  villa: { canon: "Villa", plural: "villas" }, villas: { canon: "Villa", plural: "villas" },
  townhouse: { canon: "Townhouse", plural: "townhouses" }, townhouses: { canon: "Townhouse", plural: "townhouses" },
  penthouse: { canon: "Penthouse", plural: "penthouses" }, penthouses: { canon: "Penthouse", plural: "penthouses" },
};

// URL: /{cheapest|most-expensive}-{type}-in-{community}
export function parseSuperlative(slug: string): { mode: "cheapest" | "expensive"; typeKey: string; communitySlug: string } | null {
  const m = slug.match(/^(cheapest|most-expensive|luxury)-(apartments?|villas?|townhouses?|penthouses?)-in-(.+)$/i);
  if (!m) return null;
  return { mode: m[1].toLowerCase() === "cheapest" ? "cheapest" : "expensive", typeKey: m[2].toLowerCase(), communitySlug: m[3].toLowerCase() };
}

function resolve(p: { mode: "cheapest" | "expensive"; typeKey: string; communitySlug: string }) {
  const community = findBuyCommunity(p.communitySlug);
  const type = TYPES[p.typeKey];
  if (!community || !type) return null;
  return { community, type, apiCommunity: community.apiName ?? community.name, mode: p.mode };
}

async function fetchListings(apiCommunity: string, typeCanon: string, mode: "cheapest" | "expensive") {
  const sort = mode === "cheapest" ? "price_asc" : "price_desc";
  const data = (await getCachedSearch(`status=Secondary&type=${encodeURIComponent(typeCanon)}&locations=${encodeURIComponent(apiCommunity)}&sort=${sort}&pageSize=24`)) as any;
  const listings = Array.isArray(data?.listings) ? data.listings : [];
  return { listings, total: Number(data?.listingCount ?? listings.length) };
}

export async function buildSuperlativeMeta(parsed: NonNullable<ReturnType<typeof parseSuperlative>>, locale: string, searchSlug: string): Promise<Metadata> {
  const r = resolve(parsed);
  if (!r) return {};
  const label = r.mode === "cheapest" ? "Cheapest" : "Most Expensive";
  const { listings } = await fetchListings(r.apiCommunity, r.type.canon, r.mode);
  const title = `${label} ${r.type.canon}s in ${r.community.name}, Dubai | Binayah`;
  const description = `${label.toLowerCase() === "cheapest" ? "The most affordable" : "The most premium"} ${r.type.canon.toLowerCase()}s for sale in ${r.community.name}, Dubai — ranked by price.${r.community.priceRange ? ` Area range ${r.community.priceRange}.` : ""} Live listings with Binayah.`.slice(0, 158);
  const path = `/${searchSlug}`;
  return {
    title,
    description,
    ...(listings.length === 0 ? { robots: { index: false, follow: true } } : {}),
    alternates: { canonical: makeCanonical(locale, path), languages: altLangs(path) },
    openGraph: { title, description, type: "website", url: makeCanonical(locale, path), images: [{ url: `${AE_URL}/assets/og-image.webp`, width: 1200, height: 630 }] },
  };
}

export default async function SuperlativeView({ parsed, locale, searchSlug }: { parsed: NonNullable<ReturnType<typeof parseSuperlative>>; locale: string; searchSlug: string }) {
  const r = resolve(parsed);
  if (!r) return null;
  const lp = locale === "en" ? "" : `/${locale}`;
  const nonce = await getNonce();
  const { listings, total } = await fetchListings(r.apiCommunity, r.type.canon, r.mode);
  const stats = await getCommunityStats(r.apiCommunity);
  const faqs = buildCommunityFaqs(r.community.name, stats, locale);

  const label = r.mode === "cheapest" ? "Cheapest" : "Most Expensive";
  const h1 = `${label} ${r.type.canon}s in ${r.community.name}, Dubai`;
  const breadcrumbs = [
    { name: "Home", href: `${lp}/` },
    { name: "Buy", href: `${lp}/buy` },
    { name: r.community.name, href: `${lp}/buy-property-in/${r.community.slug}` },
    { name: `${label} ${r.type.canon}s`, href: `${lp}/${searchSlug}` },
  ];

  return (
    <div className="min-h-screen bg-background">
      <BreadcrumbJsonLd items={breadcrumbs} nonce={nonce} />
      <Navbar />

      <section className="relative overflow-hidden pt-28 pb-12 text-white" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "48px 48px" }} />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-accent font-bold tracking-[0.3em] uppercase text-xs mb-3">{r.community.name}, Dubai</p>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-3">{h1}</h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl">
            {r.mode === "cheapest"
              ? `The most affordable ${r.type.canon.toLowerCase()}s for sale in ${r.community.name}, ranked by price — lowest first.`
              : `The most premium ${r.type.canon.toLowerCase()}s for sale in ${r.community.name}, ranked by price — highest first.`}
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10">
        {listings.length > 0 ? (
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map((l: any, i: number) => {
              const img = l.featuredImage || (Array.isArray(l.images) ? l.images[0] : "") || (Array.isArray(l.imageGallery) ? l.imageGallery[0] : "") || "";
              const href = `${lp}/property/${l.slug}`;
              return (
                <li key={l.slug || i}>
                  <Link href={href} className="group block rounded-2xl overflow-hidden border border-border/50 hover:border-primary/30 hover:shadow-md transition-all bg-background">
                    <div className="relative aspect-[4/3] bg-muted">
                      {img ? (
                        <Image src={img} alt={l.title || l.name || `${r.type.canon} in ${r.community.name}`} fill className="object-cover group-hover:scale-[1.03] transition-transform duration-500" sizes="(max-width:768px) 100vw, 360px" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground"><Home className="h-8 w-8" /></div>
                      )}
                      <span className="absolute top-3 left-3 text-[11px] font-bold text-white px-2.5 py-1 rounded-full" style={{ background: "rgba(11,61,46,0.85)" }}>#{i + 1}</span>
                    </div>
                    <div className="p-4">
                      <p className="text-base font-bold text-foreground mb-1">{l.price ? fmtAed(l.price) : "Price on request"}</p>
                      <h2 className="text-sm text-foreground leading-snug mb-2 line-clamp-1">{l.title || l.name || `${r.type.canon} in ${r.community.name}`}</h2>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        {l.bedrooms != null && <span className="inline-flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" />{l.bedrooms === 0 ? "Studio" : `${l.bedrooms} BR`}</span>}
                        <span>{l.community || r.community.name}</span>
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        ) : (
          <div className="max-w-xl mx-auto text-center py-12">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">No {r.type.canon.toLowerCase()}s listed in {r.community.name} right now</h2>
            <p className="text-sm text-muted-foreground mb-6">Browse all properties in {r.community.name}, or tell us what you&apos;re after.</p>
            <Link href={`${lp}/buy-property-in/${r.community.slug}`} className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-white font-semibold text-sm" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}>All properties in {r.community.name} <ArrowRight className="h-4 w-4" /></Link>
          </div>
        )}

        {total > listings.length && (
          <div className="mt-6">
            <Link href={`${lp}/buy-property-in/${r.community.slug}`} className="text-sm text-primary hover:underline">View all {total}+ {r.type.canon.toLowerCase()}s in {r.community.name} →</Link>
          </div>
        )}
      </div>

      <CommunityStatsBand name={r.community.name} stats={stats} faqs={faqs} localePrefix={lp} nonce={nonce} />

      <Footer />
    </div>
  );
}
