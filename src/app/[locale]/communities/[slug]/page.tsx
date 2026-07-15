import CommunityRichClient from "@/app/_clients/communities/[slug]/CommunityRichClient";
import CommunityInfoDetailClient from "@/components/CommunityInfoDetailClient";
import { notFound } from "next/navigation";
import { getCommunity, getDldBuildings, getDldArea, getDldAreaYield } from "@/lib/api";
import { getCommunityWiki } from "@/lib/community-wiki";
import type { CommunityInfoPage } from "@/lib/communityScraper";
import type { Metadata } from "next";
import { canonical as makeCanonical, altLangs, DEFAULT_OG_IMAGE, OG_LOCALE } from "@/lib/site";
import { getCommunityStats, buildCommunityFaqs, dldAreaFor } from "@/lib/market";
import CommunityStatsBand from "@/components/CommunityStatsBand";
import { getNonce } from "@/lib/nonce";

export const revalidate = 3600;

// Opt this dynamic route into ISR. Without a generateStaticParams, a [slug]
// route is treated as fully dynamic (private, no-store) regardless of
// `revalidate`. Returning [] prerenders nothing at build (keeping the build
// light for the low-mem runner) while making every on-demand slug ISR-cached.
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;

  const [wikiResult, dbResult] = await Promise.allSettled([
    getCommunityWiki(slug),
    getCommunity(slug),
  ]);

  const wiki = wikiResult.status === "fulfilled" ? wikiResult.value : null;
  const db = dbResult.status === "fulfilled" ? dbResult.value : null;

  const name =
    (wiki as any)?.name ||
    db?.community?.name ||
    slug.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());

  // Keyword-rich, unique meta description led by real data (project count +
  // price), then a sentence of editorial context. Falls back through the
  // enrichment so communities without a legacy description (JVC/MBR/Meydan)
  // still get unique copy instead of boilerplate.
  const enr = (db?.community?.enrichment || null) as any;
  const priceFrom = (enr?.highlights || []).find((h: any) => /price/i.test(h?.label || ""))?.value as string | undefined;
  const projCount: number = db?.counts?.projects || (Array.isArray(db?.projects) ? db!.projects.length : 0);
  const baseDesc =
    (wiki as any)?.description ||
    db?.community?.description ||
    enr?.overview ||
    enr?.tagline ||
    "";
  const stripped = baseDesc.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  const firstSentence = ((stripped.match(/^.*?[.!?](\s|$)/) || [stripped])[0] || stripped).trim();
  const lead = projCount > 0
    ? `${projCount} off-plan projects plus homes for sale & rent in ${name}, Dubai${priceFrom ? ` from ${priceFrom}` : ""}.`
    : `Property for sale, rent & off-plan in ${name}, Dubai.`;
  let description = `${lead} ${firstSentence}`.replace(/\s+/g, " ").trim();
  if (description.length > 160) {
    const cut = description.lastIndexOf(" ", 158);
    description = description.slice(0, cut > 0 ? cut : 158).trimEnd() + "…";
  }

  // Reject Wikipedia/Wikimedia-hosted images — they may go offline and signal
  // third-party content to social crawlers. Fall back to our branded OG image.
  const rawImage = (wiki as any)?.heroImage || db?.community?.featuredImage;
  const usableImage =
    rawImage && !/(wikipedia|wikimedia)\.org/i.test(rawImage) ? rawImage : null;
  // Our hero PNGs are 8-12 MB — over the size cap some social crawlers enforce
  // (WhatsApp/Facebook), so previews can silently fail. Serve a resized ~1200px
  // JPEG (~70 KB) via the Next image optimizer instead of the raw file.
  const image = usableImage
    ? `https://www.binayah.ae/_next/image?url=${encodeURIComponent(usableImage)}&w=1200&q=72`
    : DEFAULT_OG_IMAGE;

  // Keep titles from overflowing Google's ~60-char display: long community
  // names drop the "for Sale & Rent" phrase; short names keep the full keyword-
  // rich form.
  const fullTitle = `${name} Properties for Sale & Rent in Dubai | Binayah`;
  const title = fullTitle.length > 65 ? `${name} Properties in Dubai | Binayah` : fullTitle;

  const canonicalUrl = makeCanonical(locale, `/communities/${slug}`);

  // Wiki-only pages (a scraped legacy stub with no DB community record — e.g.
  // buildings, developers, whole cities mis-filed under /communities) carry no
  // independent property value and largely reproduce third-party (Wikipedia)
  // content. Keep them crawlable (follow) but out of the index.
  const wikiOnly = !!wiki && !db?.community;
  // Also noindex DB-backed pages that are an empty shell — no editorial text
  // AND no inventory (projects/sale/rent) — since they can't satisfy any query
  // (e.g. a bare community record like mohammed-bin-rashid-city). Rich area
  // guides with real descriptions stay indexed even when inventory is momentarily 0.
  const hasInventory =
    projCount > 0 || (db?.counts?.forSale || 0) > 0 || (db?.counts?.forRent || 0) > 0;
  const emptyDbShell = !!db?.community && stripped.length < 200 && !hasInventory;
  const noindex = wikiOnly || emptyDbShell;

  return {
    title,
    description,
    ...(noindex ? { robots: { index: false as const, follow: true } } : {}),
    alternates: {
      canonical: canonicalUrl,
      languages: altLangs(`/communities/${slug}`),
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonicalUrl,
      locale: OG_LOCALE[locale] ?? "en_AE",
      images: [{ url: image, width: 1200, height: 630, alt: `${name} Dubai` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function CommunityPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;

  // 1. Fetch both sources in parallel
  const [wikiResult, dbResult] = await Promise.allSettled([
    getCommunityWiki(slug),
    getCommunity(slug),
  ]);

  const communityInfoDoc =
    wikiResult.status === "fulfilled"
      ? (wikiResult.value as unknown as CommunityInfoPage | null)
      : null;
  if (wikiResult.status === "rejected") {
    console.error(
      "[communities/slug] community_info_pages lookup failed:",
      wikiResult.reason
    );
  }

  const dbData = dbResult.status === "fulfilled" ? dbResult.value : null;
  if (dbResult.status === "rejected") {
    console.error("[communities/slug] DB community lookup failed:", dbResult.reason);
  }

  const hasWiki = !!communityInfoDoc;
  const hasDb = !!(dbData?.community);

  // 2. Nothing found → 404
  if (!hasWiki && !hasDb) return notFound();

  // 3. Any community with a DB record → unified rich landing page.
  // dbData comes from the API as plain JSON (already serialization-safe).
  if (hasDb) {
    const d = dbData as any;
    const communityName: string = d.community?.name || slug;

    // Live DLD market snapshot + the area's most-active buildings — unique,
    // fresh data per community and the community→building internal-link mesh.
    // All best-effort: any miss renders the page without that section.
    const dldAreaName = dldAreaFor(communityName);
    const [dldArea, buildingsRes] = await Promise.all([
      getDldArea(dldAreaName),
      getDldBuildings(`area=${encodeURIComponent(dldAreaName)}&limit=8&sortBy=sales`),
    ]);
    const dldYield = dldArea?.slug ? await getDldAreaYield(dldArea.slug) : null;
    const market = dldArea
      ? {
          avgPpsfSqft: dldArea.avgPpsf > 0 ? Math.round(dldArea.avgPpsf / 10.764) : null,
          avgPrice: dldArea.avgPrice > 0 ? Math.round(dldArea.avgPrice) : null,
          sales12m: dldYield?.salesSampleSize || null,
          grossYieldPct: dldYield?.grossYieldPct ?? null,
          buildingCount: dldArea.buildingCount || null,
        }
      : null;
    const topBuildings = (buildingsRes.results || [])
      .filter((b: { slug?: string; name?: string; sales?: number }) => b.slug && b.name && (b.sales || 0) >= 3)
      .slice(0, 8)
      .map((b: { slug: string; name: string; sales?: number }) => ({ slug: b.slug, name: b.name, sales: b.sales }));

    return (
      <CommunityRichClient
        community={d.community}
        projects={d.projects || []}
        forSale={d.forSale || []}
        forRent={d.forRent || []}
        counts={d.counts || { projects: (d.projects || []).length, forSale: 0, forRent: 0 }}
        developers={d.developers || []}
        nearby={d.nearby || []}
        locale={locale}
        market={market}
        topBuildings={topBuildings}
      />
    );
  }

  // Market-depth band (DLD stats + FAQs + top buildings) — only for the thin
  // wiki-only fallback below, which lacks the rich client's own content.
  const pageCommunityName =
    (communityInfoDoc as any)?.name ||
    slug.replace(/-/g, " ").replace(/\b\w/g, (ch: string) => ch.toUpperCase());
  const cStats = await getCommunityStats(pageCommunityName);
  const cFaqs = buildCommunityFaqs(pageCommunityName, cStats);
  const cNonce = await getNonce();
  const cLp = locale === "en" ? "" : `/${locale}`;
  const cBuildings = (await getDldBuildings(`area=${encodeURIComponent(dldAreaFor(pageCommunityName))}&limit=12&sortBy=sales`)).results
    .filter((b: { slug?: string; name?: string }) => b.slug && b.name)
    .slice(0, 12)
    .map((b: { slug: string; name: string }) => ({ slug: b.slug, name: b.name }));
  const statsBand = <CommunityStatsBand name={pageCommunityName} stats={cStats} faqs={cFaqs} buildings={cBuildings} localePrefix={cLp} nonce={cNonce} />;

  // 4. Only wiki (no DB record) → existing CommunityInfoDetailClient
  const serialized: Omit<CommunityInfoPage, "scrapedAt"> = {
    slug: communityInfoDoc!.slug,
    name: communityInfoDoc!.name,
    location: communityInfoDoc!.location,
    description: communityInfoDoc!.description,
    developerName: communityInfoDoc!.developerName,
    heroImage: communityInfoDoc!.heroImage,
    amenities: communityInfoDoc!.amenities,
    priceRange: communityInfoDoc!.priceRange,
    sources: communityInfoDoc!.sources,
  };
  return <><CommunityInfoDetailClient community={serialized} locale={locale} />{statsBand}</>;
}
