/* eslint-disable i18next/no-literal-string -- programmatic SEO matrix page; community copy localized via the community data, UI chrome via ListingsPageClient */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ListingsPageClient from "@/app/_clients/rent/ListingsPageClient";
import { serverApiUrl, serverFetch, getAreaSoldMatrix, findSoldCombo } from "@/lib/api";
import { findBuyCommunity, localizeCommunityText } from "@/lib/buy-communities";
import { getCommunityStats, buildCommunityFaqs } from "@/lib/market";
import CommunityStatsBand from "@/components/CommunityStatsBand";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { getNonce } from "@/lib/nonce";
import { canonical as makeCanonical, altLangs, AE_URL } from "@/lib/site";
import DevCommunityView, { parseDevCommunity, buildDevCommunityMeta, resolveDevCommunity } from "@/components/pseo/DevCommunityView";
import SuperlativeView, { parseSuperlative, buildSuperlativeMeta } from "@/components/pseo/SuperlativeView";
import AreaRankingView, { parseAreaRanking, buildAreaRankingMeta } from "@/components/pseo/AreaRankingView";

export const revalidate = 1800;

const TYPES: Record<string, { canon: string; plural: string }> = {
  apartment: { canon: "Apartment", plural: "apartments" },
  apartments: { canon: "Apartment", plural: "apartments" },
  villa: { canon: "Villa", plural: "villas" },
  villas: { canon: "Villa", plural: "villas" },
  townhouse: { canon: "Townhouse", plural: "townhouses" },
  townhouses: { canon: "Townhouse", plural: "townhouses" },
  penthouse: { canon: "Penthouse", plural: "penthouses" },
  penthouses: { canon: "Penthouse", plural: "penthouses" },
};

// Strict parse: only "{studio|N-bedroom}-{type}s-for-{sale|rent}-in-{community}"
// resolves; anything else returns null so the route 404s (never hijacks other
// single-segment paths).
interface Parsed { beds: number; bedsLabel: string; type: { canon: string; plural: string }; listingType: "Sale" | "Rent"; verb: string; communitySlug: string; }
function parse(slug: string): Parsed | null {
  const m = slug.match(/^(studio|(\d+)-bedroom)-(apartments?|villas?|townhouses?|penthouses?)-for-(sale|rent)-in-(.+)$/i);
  if (!m) return null;
  const bedsToken = m[1].toLowerCase();
  const beds = bedsToken === "studio" ? 0 : parseInt(m[2], 10);
  if (beds < 0 || beds > 7 || (bedsToken !== "studio" && !Number.isFinite(beds))) return null;
  const type = TYPES[m[3].toLowerCase()];
  if (!type) return null;
  const listingType = m[4].toLowerCase() === "rent" ? "Rent" : "Sale";
  return {
    beds,
    bedsLabel: beds === 0 ? "Studio" : `${beds}-Bedroom`,
    type,
    listingType,
    verb: listingType === "Rent" ? "for Rent" : "for Sale",
    communitySlug: m[5].toLowerCase(),
  };
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; searchSlug: string }> }): Promise<Metadata> {
  const { locale, searchSlug } = await params;
  // Area ranking pages (highest-yield / most-affordable areas in Dubai).
  const ar = parseAreaRanking(searchSlug);
  if (ar) return buildAreaRankingMeta(ar.mode, locale, searchSlug);
  // Superlative pattern (/{cheapest|most-expensive}-{type}-in-{community}).
  const sup = parseSuperlative(searchSlug);
  if (sup) return buildSuperlativeMeta(sup, locale, searchSlug);
  // Developer × community pattern (/{dev}-projects-in-{community}).
  const dc = parseDevCommunity(searchSlug);
  if (dc && !parse(searchSlug)) return buildDevCommunityMeta(dc.devSlug, dc.communitySlug, locale, searchSlug);

  const p = parse(searchSlug);
  if (!p) return {};
  const c = findBuyCommunity(p.communitySlug);
  if (!c) return {};
  // Real DLD sold-price data for this bedroom×type combo (apartments/villas,
  // sale only). Its presence makes the page data-rich even with no live listings.
  const soldCombo = p.listingType === "Sale" ? findSoldCombo(await getAreaSoldMatrix(c.slug), p.type.canon, p.beds) : null;
  const title = `${p.bedsLabel} ${p.type.canon}s ${p.verb} in ${c.name}, Dubai | Binayah`;
  const soldSentence = soldCombo ? `Median sold price AED ${soldCombo.medianPrice.toLocaleString("en-AE")} from ${soldCombo.count.toLocaleString("en-AE")} DLD transactions. ` : "";
  const description = `Browse ${p.bedsLabel.toLowerCase()} ${p.type.canon.toLowerCase()}s ${p.verb.toLowerCase()} in ${c.name}, Dubai. ${soldSentence}${c.yield ? `Avg gross yield ${c.yield}. ` : ""}Live listings and DLD sold-price data with Binayah.`.slice(0, 158);
  const path = `/${searchSlug}`;

  // Thin-content guard: 404 matrix combos with zero inventory so Google drops
  // the URL. BUT keep it when we have real DLD sold-price data for the combo —
  // that alone makes it substantive. Only 404 on a confirmed 200+empty response.
  let confirmedEmpty = false;
  try {
    const apiCommunity = c.apiName ?? c.name;
    const res = await serverFetch(serverApiUrl(`/api/listings?listingType=${p.listingType}&community=${encodeURIComponent(apiCommunity)}&propertyType=${encodeURIComponent(p.type.canon)}&bedrooms=${p.beds}&countOnly=1`));
    if (res.ok) confirmedEmpty = ((await res.json()).total ?? 0) === 0;
  } catch { /* API down — don't 404 on transient errors */ }
  if (confirmedEmpty && !soldCombo) notFound();

  return {
    title,
    description,
    alternates: { canonical: makeCanonical(locale, path), languages: altLangs(path) },
    openGraph: { title, description, type: "website", url: makeCanonical(locale, path), images: [{ url: `${AE_URL}/assets/og-image.webp`, width: 1200, height: 630 }] },
  };
}

export default async function PseoRouterPage({ params }: { params: Promise<{ locale: string; searchSlug: string }> }) {
  const { locale, searchSlug } = await params;
  const p = parse(searchSlug);

  // Non-matrix patterns.
  if (!p) {
    const ar = parseAreaRanking(searchSlug);
    if (ar) return <AreaRankingView mode={ar.mode} locale={locale} searchSlug={searchSlug} />;
    const sup = parseSuperlative(searchSlug);
    if (sup && findBuyCommunity(sup.communitySlug)) {
      return <SuperlativeView parsed={sup} locale={locale} searchSlug={searchSlug} />;
    }
    const dc = parseDevCommunity(searchSlug);
    if (dc) {
      const r = await resolveDevCommunity(dc.devSlug, dc.communitySlug);
      if (r) return <DevCommunityView devSlug={dc.devSlug} communitySlug={dc.communitySlug} locale={locale} searchSlug={searchSlug} />;
    }
    notFound();
  }

  const c = findBuyCommunity(p.communitySlug);
  if (!c) notFound();

  const apiCommunity = c.apiName ?? c.name;
  const lp = locale === "en" ? "" : `/${locale}`;
  const BATCH = 9;

  let initialListings: any[] = [];
  let totalCount = 0;
  try {
    const base = `/api/listings?listingType=${p.listingType}&community=${encodeURIComponent(apiCommunity)}&propertyType=${encodeURIComponent(p.type.canon)}&bedrooms=${p.beds}`;
    const [listRes, countRes] = await Promise.all([
      serverFetch(serverApiUrl(`${base}&limit=${BATCH}`)),
      serverFetch(serverApiUrl(`${base}&countOnly=1`)),
    ]);
    if (listRes.ok) initialListings = await listRes.json();
    if (countRes.ok) totalCount = (await countRes.json()).total ?? 0;
  } catch {
    /* API down — render the page shell with stats/FAQ depth */
  }

  const stats = await getCommunityStats(apiCommunity);
  const faqs = buildCommunityFaqs(c.name, stats);
  const nonce = await getNonce();
  const soldCombo = p.listingType === "Sale" ? findSoldCombo(await getAreaSoldMatrix(c.slug), p.type.canon, p.beds) : null;

  const h1 = `${p.bedsLabel} ${p.type.canon}s ${p.verb} in ${c.name}, Dubai`;
  const buyOrRent = p.listingType === "Rent" ? "Rent" : "Buy";
  const breadcrumbs = [
    { name: "Home", href: `${lp}/` },
    { name: buyOrRent, href: `${lp}/${p.listingType === "Rent" ? "rent" : "buy"}` },
    { name: c.name, href: `${lp}/${p.listingType === "Rent" ? "rent-property-in" : "buy-property-in"}/${c.slug}` },
    { name: `${p.bedsLabel} ${p.type.canon}s`, href: `${lp}/${searchSlug}` },
  ];

  const seoBlock = (
    <section className="bg-card border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold mb-3">{c.name}, Dubai</p>
        <h1 className="text-3xl sm:text-5xl font-bold text-foreground mb-4">{h1}</h1>
        <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl mb-6">
          {localizeCommunityText(c.shortIntro, locale)}
        </p>
        <div className="grid grid-cols-3 gap-4 max-w-xl">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Available</p>
            <p className="text-sm sm:text-base font-bold text-foreground">{totalCount > 0 ? `${totalCount}+` : "On request"}</p>
          </div>
          {c.priceRange && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Price range</p>
              <p className="text-sm sm:text-base font-bold text-foreground">{c.priceRange}</p>
            </div>
          )}
          {c.yield && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Gross yield</p>
              <p className="text-sm sm:text-base font-bold text-foreground">{c.yield}</p>
            </div>
          )}
        </div>

        {soldCombo && (
          <div className="mt-8 rounded-2xl border border-border/60 bg-background/60 p-5 sm:p-6 max-w-3xl">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-sm font-bold text-foreground">
                {p.bedsLabel} {p.type.canon.toLowerCase()}s in {c.name} — DLD sold prices
              </h2>
              <span className="text-[11px] text-muted-foreground whitespace-nowrap">{soldCombo.count.toLocaleString("en-AE")} sales · last 24 months</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl bg-muted/40 border border-border/40 px-3 py-3">
                <div className="text-lg sm:text-xl font-bold text-foreground leading-tight">AED {soldCombo.medianPrice.toLocaleString("en-AE")}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Median sold price</div>
              </div>
              <div className="rounded-xl bg-muted/40 border border-border/40 px-3 py-3">
                <div className="text-lg sm:text-xl font-bold text-foreground leading-tight">AED {(soldCombo.minPrice / 1_000_000).toFixed(1)}M–{(soldCombo.maxPrice / 1_000_000).toFixed(1)}M</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Price range</div>
              </div>
              {soldCombo.pricePerSqft && (
                <div className="rounded-xl bg-muted/40 border border-border/40 px-3 py-3">
                  <div className="text-lg sm:text-xl font-bold text-foreground leading-tight">AED {soldCombo.pricePerSqft.toLocaleString("en-AE")}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Avg price / sqft</div>
                </div>
              )}
              <div className="rounded-xl bg-muted/40 border border-border/40 px-3 py-3">
                <div className="text-lg sm:text-xl font-bold text-foreground leading-tight">{soldCombo.count.toLocaleString("en-AE")}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">DLD transactions</div>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground/80 mt-3 leading-relaxed">Median of real Dubai Land Department sale transactions for {p.bedsLabel.toLowerCase()} {p.type.canon.toLowerCase()}s in {c.name} over the last 24 months.</p>
          </div>
        )}
      </div>
    </section>
  );

  const emptyState = (
    <div className="max-w-xl mx-auto text-center py-16">
      <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">No {p.bedsLabel.toLowerCase()} {p.type.canon.toLowerCase()}s listed right now</h3>
      <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-8">We add matching homes in {c.name} regularly. Tell us what you&apos;re after and we&apos;ll alert you, or browse everything available in {c.name} today.</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a href={`${lp}/${p.listingType === "Rent" ? "rent-property-in" : "buy-property-in"}/${c.slug}`} className="font-bold px-6 py-3 rounded-xl text-sm hover:opacity-90 transition-all" style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)", color: "#fff" }}>
          All {p.type.canon.toLowerCase()}s in {c.name}
        </a>
        <a href={`${lp}/contact`} className="border-2 border-border text-foreground font-bold px-6 py-3 rounded-xl text-sm hover:bg-muted transition-all">Get notified</a>
      </div>
    </div>
  );

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} nonce={nonce} />
      <ListingsPageClient
        initialListings={initialListings}
        totalCount={totalCount}
        listingType={p.listingType}
        title={h1}
        subtitle={localizeCommunityText(c.shortIntro, locale)}
        initialPage={1}
        batchSize={BATCH}
        community={apiCommunity}
        propertyType={p.type.canon}
        bedrooms={p.beds}
        headerSlot={seoBlock}
        emptyState={emptyState}
      />
      <CommunityStatsBand name={c.name} stats={stats} faqs={faqs} localePrefix={lp} nonce={nonce} />
    </>
  );
}
