import CommunityRichClient from "@/app/_clients/communities/[slug]/CommunityRichClient";
import { notFound } from "next/navigation";
import { getCommunity, getDldBuildings, getDldArea, getDldAreaYield, getCommunitiesIndex } from "@/lib/api";
import { getCommunityWiki } from "@/lib/community-wiki";
import type { Metadata } from "next";
import { canonical as makeCanonical, altLangs, DEFAULT_OG_IMAGE, OG_LOCALE } from "@/lib/site";
import { dldAreaFor } from "@/lib/market";
import { getCommunityEnrichmentTranslation, mergeEnrichment } from "@/lib/community-i18n";

export const revalidate = 3600;

// Curated area → sub-communities map. Turns a large master-development area page
// (e.g. Dubailand) into a proper area overview that links to the communities
// inside it. Only slugs with a live /communities/[slug] page render — the list
// is resolved against the communities index at request time and order is kept.
const AREA_SUBCOMMUNITIES: Record<string, string[]> = {
  dubailand: [
    "arabian-ranches-3", "mudon", "villanova", "majan", "town-square",
    "arjan", "living-legends", "falcon-city", "wadi-al-safa",
  ],
  "jebel-ali": [
    "palm-jebel-ali", "jebel-ali-village", "downtown-jebel-ali",
  ],
};

// Locale-aware title + lead-sentence templates. The community name is a proper
// noun kept verbatim; the surrounding phrasing is localized so each locale URL
// carries a genuinely localized <title>/<meta description>. The DB's editorial
// first sentence (English) is appended after the localized lead. Self-canonical
// + hreflang kept for all 7 locales.
const COMM_META: Record<
  string,
  {
    titleFull: (n: string) => string;
    titleShort: (n: string) => string;
    leadProjects: (n: string, count: number, priceFrom: string) => string;
    leadPlain: (n: string) => string;
  }
> = {
  en: {
    titleFull: (n) => `${n} Properties for Sale & Rent in Dubai | Binayah`,
    titleShort: (n) => `${n} Properties in Dubai | Binayah`,
    leadProjects: (n, c, p) => `${c} off-plan projects plus homes for sale & rent in ${n}, Dubai${p ? ` from ${p}` : ""}.`,
    leadPlain: (n) => `Property for sale, rent & off-plan in ${n}, Dubai.`,
  },
  fr: {
    titleFull: (n) => `Biens à vendre et à louer à ${n}, Dubaï | Binayah`,
    titleShort: (n) => `Biens immobiliers à ${n}, Dubaï | Binayah`,
    leadProjects: (n, c, p) => `${c} projets sur plan ainsi que des biens à vendre et à louer à ${n}, Dubaï${p ? ` à partir de ${p}` : ""}.`,
    leadPlain: (n) => `Biens à vendre, à louer et sur plan à ${n}, Dubaï.`,
  },
  ru: {
    titleFull: (n) => `Недвижимость на продажу и в аренду в ${n}, Дубай | Binayah`,
    titleShort: (n) => `Недвижимость в ${n}, Дубай | Binayah`,
    leadProjects: (n, c, p) => `${c} проектов на стадии строительства, а также жильё на продажу и в аренду в ${n}, Дубай${p ? ` от ${p}` : ""}.`,
    leadPlain: (n) => `Недвижимость на продажу, в аренду и на стадии строительства в ${n}, Дубай.`,
  },
  ar: {
    titleFull: (n) => `عقارات للبيع والإيجار في ${n}، دبي | بناية`,
    titleShort: (n) => `عقارات في ${n}، دبي | بناية`,
    leadProjects: (n, c, p) => `${c} مشاريع على الخارطة بالإضافة إلى منازل للبيع والإيجار في ${n}، دبي${p ? ` تبدأ من ${p}` : ""}.`,
    leadPlain: (n) => `عقارات للبيع والإيجار وعلى الخارطة في ${n}، دبي.`,
  },
  zh: {
    titleFull: (n) => `迪拜 ${n} 待售及出租房产 | Binayah`,
    titleShort: (n) => `迪拜 ${n} 房产 | Binayah`,
    leadProjects: (n, c, p) => `迪拜 ${n} 的 ${c} 个期房项目，以及待售和出租房源${p ? `，起价 ${p}` : ""}。`,
    leadPlain: (n) => `迪拜 ${n} 的待售、出租及期房房源。`,
  },
  vi: {
    titleFull: (n) => `Bất động sản bán & cho thuê tại ${n}, Dubai | Binayah`,
    titleShort: (n) => `Bất động sản tại ${n}, Dubai | Binayah`,
    leadProjects: (n, c, p) => `${c} dự án off-plan cùng nhà bán & cho thuê tại ${n}, Dubai${p ? ` từ ${p}` : ""}.`,
    leadPlain: (n) => `Bất động sản bán, cho thuê & off-plan tại ${n}, Dubai.`,
  },
  he: {
    titleFull: (n) => `נכסים למכירה ולהשכרה ב-${n}, דובאי | Binayah`,
    titleShort: (n) => `נכסים ב-${n}, דובאי | Binayah`,
    leadProjects: (n, c, p) => `${c} פרויקטים על הנייר ונכסים למכירה ולהשכרה ב-${n}, דובאי${p ? ` החל מ-${p}` : ""}.`,
    leadPlain: (n) => `נכסים למכירה, להשכרה ועל הנייר ב-${n}, דובאי.`,
  },
};

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

  const [wikiResult, dbResult, transResult] = await Promise.allSettled([
    getCommunityWiki(slug),
    getCommunity(slug),
    locale !== "en" ? getCommunityEnrichmentTranslation(locale, slug) : Promise.resolve(null),
  ]);

  const wiki = wikiResult.status === "fulfilled" ? wikiResult.value : null;
  const db = dbResult.status === "fulfilled" ? dbResult.value : null;
  const trans = transResult.status === "fulfilled" ? transResult.value : null;

  const name =
    db?.community?.name ||
    (wiki as any)?.name ||
    slug.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());

  // Keyword-rich, unique meta description led by real data (project count +
  // price), then a sentence of editorial context. DB content wins; wiki is a
  // last-resort fallback for communities with no curated copy yet. For non-EN,
  // overlay the translated enrichment so both the lead price and the editorial
  // sentence are localized rather than English.
  const enr = mergeEnrichment(db?.community?.enrichment, trans) as any;
  const priceFrom = (enr?.highlights || []).find((h: any) => /price|prix|цен|سعر|价|giá|מחיר/i.test(h?.label || ""))?.value as string | undefined;
  const projCount: number = db?.counts?.projects || (Array.isArray(db?.projects) ? db!.projects.length : 0);
  // Non-EN with a translation: lead with the translated overview/tagline instead
  // of the English DB description. EN (or untranslated) keeps the DB description.
  const baseDesc =
    (trans ? (enr?.overview || enr?.tagline) : db?.community?.description) ||
    enr?.overview ||
    enr?.tagline ||
    (wiki as any)?.description ||
    "";
  const stripped = baseDesc.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  const firstSentence = ((stripped.match(/^.*?[.!?](\s|$)/) || [stripped])[0] || stripped).trim();
  const cm = COMM_META[locale] ?? COMM_META.en;
  const lead = projCount > 0
    ? cm.leadProjects(name, projCount, priceFrom || "")
    : cm.leadPlain(name);
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
  const fullTitle = cm.titleFull(name);
  const title = fullTitle.length > 65 ? cm.titleShort(name) : fullTitle;

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

    // Non-EN: overlay the translated enrichment (overview, faqs, highlights,
    // headings, amenities, connectivity, keyFacts…) so the whole rich body
    // renders in the visitor's language. Field-by-field merge, English fallback.
    if (locale !== "en") {
      const trans = await getCommunityEnrichmentTranslation(locale, slug);
      if (trans) {
        d.community = {
          ...d.community,
          enrichment: mergeEnrichment(d.community?.enrichment, trans),
        };
      }
    }

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

    // Curated sub-communities inside this area (area-overview pages). Resolve the
    // slugs to cards from the cached communities index, preserving curated order
    // and dropping any that don't have a live page.
    const childSlugs = AREA_SUBCOMMUNITIES[slug] ?? [];
    let childCommunities: { name: string; slug: string; featuredImage?: string }[] = [];
    if (childSlugs.length) {
      const index = await getCommunitiesIndex();
      const bySlug = new Map(index.map((c) => [c.slug, c]));
      childCommunities = childSlugs
        .map((s) => bySlug.get(s))
        .filter((c): c is { name: string; slug: string; featuredImage: string } => !!c)
        .map((c) => ({ name: c.name, slug: c.slug, featuredImage: c.featuredImage }));
    }

    return (
      <CommunityRichClient
        community={d.community}
        projects={d.projects || []}
        forSale={d.forSale || []}
        forRent={d.forRent || []}
        counts={d.counts || { projects: (d.projects || []).length, forSale: 0, forRent: 0 }}
        developers={d.developers || []}
        nearby={d.nearby || []}
        childCommunities={childCommunities}
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
