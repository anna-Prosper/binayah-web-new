import CommunityRichClient from "@/app/_clients/communities/[slug]/CommunityRichClient";
import { notFound } from "next/navigation";
import { getCommunity, getDldBuildings, getDldArea, getDldAreaYield } from "@/lib/api";
import { getCommunityWiki } from "@/lib/community-wiki";
import type { Metadata } from "next";
import { canonical as makeCanonical, altLangs, DEFAULT_OG_IMAGE, OG_LOCALE } from "@/lib/site";
import { dldAreaFor } from "@/lib/market";

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
    db?.community?.name ||
    (wiki as any)?.name ||
    slug.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());

  // Keyword-rich, unique meta description led by real data (project count +
  // price), then a sentence of editorial context. DB content wins; wiki is a
  // last-resort fallback for communities with no curated copy yet.
  const enr = (db?.community?.enrichment || null) as any;
  const priceFrom = (enr?.highlights || []).find((h: any) => /price/i.test(h?.label || ""))?.value as string | undefined;
  const projCount: number = db?.counts?.projects || (Array.isArray(db?.projects) ? db!.projects.length : 0);
  const baseDesc =
    db?.community?.description ||
    enr?.overview ||
    enr?.tagline ||
    (wiki as any)?.description ||
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
  const rawImage = db?.community?.featuredImage || (wiki as any)?.heroImage;
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

  // Wiki-only pages have no DB record → no Binayah inventory, no editorial copy
  // of our own — they duplicate Wikipedia verbatim. Return 404 so Google drops
  // the URL and stops crawling it.
  const wikiOnly = !!wiki && !db?.community;
  if (wikiOnly) notFound();
  // Noindex DB-backed pages that are an empty shell — no editorial text AND no
  // inventory — since they can't satisfy any query. Rich area guides with real
  // descriptions stay indexed even when inventory is momentarily 0.
  const hasInventory =
    projCount > 0 || (db?.counts?.forSale || 0) > 0 || (db?.counts?.forRent || 0) > 0;
  const emptyDbShell = !!db?.community && stripped.length < 200 && !hasInventory;
  const noindex = emptyDbShell;

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

  // Only DB-backed communities render a page. Wiki-only slugs (no DB record)
  // are already 404'd in generateMetadata before this component runs, so the
  // wiki lookup that used to happen here has been removed. getCommunity swallows
  // its own errors and returns null.
  const dbData = await getCommunity(slug);
  const hasDb = !!(dbData?.community);
  if (!hasDb) return notFound();

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
    // The DLD dataset starts ~Jan 2026, so a "12-month" sample can cover far
    // fewer months — label the count with its real coverage start instead.
    let salesSince: string | null = null;
    if (dldYield?.coverageStart) {
      const cs = new Date(dldYield.coverageStart);
      if (!isNaN(cs.getTime()) && Date.now() - cs.getTime() < 330 * 24 * 3600 * 1000) {
        salesSince = cs.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
      }
    }
    const market = dldArea
      ? {
          avgPpsfSqft: dldArea.avgPpsf > 0 ? Math.round(dldArea.avgPpsf / 10.764) : null,
          avgPrice: dldArea.avgPrice > 0 ? Math.round(dldArea.avgPrice) : null,
          sales12m: dldYield?.salesSampleSize || null,
          salesSince,
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

  // wikiOnly (wiki data but no DB record) is caught in generateMetadata and
  // returns 404 before the page component runs. This path is unreachable.
  return notFound();
}
