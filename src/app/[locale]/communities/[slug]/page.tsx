import CommunityRichClient from "@/app/_clients/communities/[slug]/CommunityRichClient";
import CommunityInfoDetailClient from "@/components/CommunityInfoDetailClient";
import { notFound, permanentRedirect } from "next/navigation";
import { getCommunity, getDldBuildings } from "@/lib/api";
import { getCommunityWiki } from "@/lib/community-wiki";
import type { CommunityInfoPage } from "@/lib/communityScraper";
import type { Metadata } from "next";
import { canonical as makeCanonical, altLangs, DEFAULT_OG_IMAGE, OG_LOCALE } from "@/lib/site";
import { getCommunityStats, buildCommunityFaqs, dldAreaFor } from "@/lib/market";
import CommunityStatsBand from "@/components/CommunityStatsBand";
import { getNonce } from "@/lib/nonce";

export const revalidate = 3600;

// Duplicate community docs — the same real area exists under a thin bare slug and
// a content-bearing "-dubai" slug. 301 the thin duplicate to its canonical so the
// two pages don't compete for the same term. (Determined by project coverage:
// e.g. downtown-dubai has 49 projects vs downtown's 0.)
const DUP_CANONICAL: Record<string, string> = {
  "arjan": "arjan-dubai",
  "downtown": "downtown-dubai",
  "meydan": "meydan-dubai",
  "the-valley": "the-valley-dubai",
};
const localePath = (locale: string, path: string) => (locale === "en" ? path : `/${locale}${path}`);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  if (DUP_CANONICAL[slug]) permanentRedirect(localePath(locale, `/communities/${DUP_CANONICAL[slug]}`));

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
  const image =
    rawImage && !/(wikipedia|wikimedia)\.org/i.test(rawImage)
      ? rawImage
      : DEFAULT_OG_IMAGE;

  const title = `${name} Properties for Sale & Rent in Dubai | Binayah`;

  const canonicalUrl = makeCanonical(locale, `/communities/${slug}`);

  // Wiki-only pages (a scraped legacy stub with no DB community record — e.g.
  // buildings, developers, whole cities mis-filed under /communities) carry no
  // independent property value and largely reproduce third-party (Wikipedia)
  // content. Keep them crawlable (follow) but out of the index.
  const wikiOnly = !!wiki && !db?.community;

  return {
    title,
    description,
    ...(wikiOnly ? { robots: { index: false as const, follow: true } } : {}),
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
  if (DUP_CANONICAL[slug]) permanentRedirect(localePath(locale, `/communities/${DUP_CANONICAL[slug]}`));

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
  // dbData comes from the API as plain JSON (already serialization-safe). The
  // rich client already carries its own market context, FAQs and schema, so it
  // does NOT need the separate stats band appended after it.
  if (hasDb) {
    const d = dbData as any;
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
