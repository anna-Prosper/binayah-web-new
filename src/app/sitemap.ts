import { MetadataRoute } from "next";
import { MongoClient } from "mongodb";
import { serverApiUrl, serverFetch } from "@/lib/api";
import { PULSE_GUIDES } from "@/lib/pulse-guides";
import { BUY_COMMUNITIES } from "@/lib/buy-communities";
import { FOREIGN_BUYERS } from "@/lib/foreign-buyers";
import { CRYPTO_SLUGS } from "@/lib/crypto-pages";

import { AE_URL, RU_URL, SITE_URL } from "@/lib/site";

// Fetch all slugs directly from MongoDB — bypasses the API's 100-item hard cap.
// Falls back to empty array on any error so the sitemap still builds.
async function fetchSlugDatesFromDb(
  collection: string,
  filter: Record<string, unknown> = {}
): Promise<{ slug: string; lastmod?: Date }[]> {
  const uri = process.env.MONGODB_URI;
  if (!uri) return [];
  let client: MongoClient | null = null;
  try {
    client = new MongoClient(uri, { serverSelectionTimeoutMS: 10_000 });
    await client.connect();
    const db = client.db();
    const docs = await db
      .collection(collection)
      .find(filter, { projection: { slug: 1, updatedAt: 1, _id: 0 } })
      .toArray();
    return (docs as { slug?: string; updatedAt?: string | Date }[])
      .filter((d) => d.slug)
      .map((d) => {
        const t = d.updatedAt ? new Date(d.updatedAt) : null;
        return { slug: d.slug as string, lastmod: t && !isNaN(t.getTime()) ? t : undefined };
      });
  } catch {
    return [];
  } finally {
    await client?.close();
  }
}

// Projects for the sitemap, with per-sub-page indexability flags. The flags
// MUST mirror the `robots: noindex` guards in each sub-page's generateMetadata
// so we never submit a URL that self-noindexes (which GSC flags as "Submitted
// URL marked noindex"). One query serves both the main /project/{slug} entries
// and the four sub-pages.
async function fetchProjectsForSitemap(): Promise<
  { slug: string; lastmod?: Date; sub: { faq: boolean; payment: boolean; location: boolean; floorplans: boolean } }[]
> {
  const uri = process.env.MONGODB_URI;
  if (!uri) return [];
  let client: MongoClient | null = null;
  try {
    client = new MongoClient(uri, { serverSelectionTimeoutMS: 10_000 });
    await client.connect();
    const docs = await client.db().collection("projects").find(
      { publishStatus: "published", slug: { $exists: true, $ne: "" } },
      { projection: { _id: 0, slug: 1, updatedAt: 1, faqs: 1, paymentPlanDetails: 1, paymentPlanSteps: 1, paymentPlanSummary: 1, locationDescription: 1, nearbyAttractions: 1, floorPlans: 1, unitTypes: 1, unitSizeMin: 1, unitSizeMax: 1 } }
    ).toArray();
    return (docs as Record<string, unknown>[])
      .filter((d) => d.slug)
      .map((d) => {
        const t = d.updatedAt ? new Date(d.updatedAt as string) : null;
        const faqs = (d.faqs as Array<{ question?: string }> | undefined) || [];
        const steps = d.paymentPlanSteps as unknown[] | undefined;
        const nearby = d.nearbyAttractions as unknown[] | undefined;
        const floorPlans = d.floorPlans as unknown[] | undefined;
        const unitTypes = d.unitTypes as unknown[] | undefined;
        return {
          slug: d.slug as string,
          lastmod: t && !isNaN(t.getTime()) ? t : undefined,
          sub: {
            faq: faqs.some((f) => f?.question?.trim()),
            payment: !!(d.paymentPlanDetails || (Array.isArray(steps) && steps.length > 0) || (d.paymentPlanSummary && d.paymentPlanSummary !== "TBA")),
            location: !!((d.locationDescription && String(d.locationDescription).trim()) || (Array.isArray(nearby) && nearby.length > 0)),
            floorplans: !!((Array.isArray(floorPlans) && floorPlans.length > 0) || (Array.isArray(unitTypes) && unitTypes.length > 0 && (d.unitSizeMin != null || d.unitSizeMax != null))),
          },
        };
      });
  } catch {
    return [];
  } finally {
    await client?.close();
  }
}

// Bedroom × type × community matrix URLs that ACTUALLY have listings — emitted
// from a single grouped aggregation so the sitemap never contains empty (and
// therefore self-noindexed) combos. Covers all four supported types. Secondary
// collections lack propertyType, so they can't satisfy a type filter anyway —
// the legacy `listings` collection is the authoritative source here.
async function fetchMatrixCombos(): Promise<string[]> {
  const uri = process.env.MONGODB_URI;
  if (!uri) return [];
  const TYPE_SLUG: Record<string, string> = { Apartment: "apartments", Villa: "villas", Townhouse: "townhouses", Penthouse: "penthouses" };
  const norm = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim();
  const nameToSlug = new Map<string, string>();
  for (const c of BUY_COMMUNITIES) {
    nameToSlug.set(norm(c.name), c.slug);
    const apiName = (c as { apiName?: string }).apiName;
    if (apiName) nameToSlug.set(norm(apiName), c.slug);
  }
  let client: MongoClient | null = null;
  try {
    client = new MongoClient(uri, { serverSelectionTimeoutMS: 10_000 });
    await client.connect();
    const rows = await client.db().collection("listings").aggregate([
      { $match: { publishStatus: "published", community: { $nin: [null, ""] }, propertyType: { $in: Object.keys(TYPE_SLUG) }, bedrooms: { $gte: 0, $lte: 7 } } },
      { $group: { _id: { c: "$community", t: "$propertyType", b: "$bedrooms", lt: "$listingType" }, n: { $sum: 1 } } },
      { $match: { n: { $gte: 1 } } },
    ]).toArray();
    const urls = new Set<string>();
    for (const r of rows as { _id: { c: string; t: string; b: number; lt: string } }[]) {
      const slug = nameToSlug.get(norm(String(r._id.c || "")));
      if (!slug) continue;
      const typeSlug = TYPE_SLUG[r._id.t];
      if (!typeSlug) continue;
      const beds = r._id.b;
      if (typeof beds !== "number" || beds < 0 || beds > 7) continue;
      const bedToken = beds === 0 ? "studio" : `${beds}-bedroom`;
      const txn = r._id.lt === "Rent" ? "rent" : r._id.lt === "Sale" ? "sale" : null;
      if (!txn) continue;
      urls.add(`/${bedToken}-${typeSlug}-for-${txn}-in-${slug}`);
    }
    return [...urls];
  } catch {
    return [];
  } finally {
    await client?.close();
  }
}

// Developer × community combos (/{dev}-projects-in-{community}) where the
// developer has ≥2 projects in a (known) community — data-driven, so only
// substantial pages are submitted.
async function fetchDevCommunityCombos(): Promise<string[]> {
  const uri = process.env.MONGODB_URI;
  if (!uri) return [];
  const norm = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim();
  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const nameToSlug = new Map<string, string>();
  for (const c of BUY_COMMUNITIES) {
    nameToSlug.set(norm(c.name), c.slug);
    const apiName = (c as { apiName?: string }).apiName;
    if (apiName) nameToSlug.set(norm(apiName), c.slug);
  }
  let client: MongoClient | null = null;
  try {
    client = new MongoClient(uri, { serverSelectionTimeoutMS: 10_000 });
    await client.connect();
    const rows = await client.db().collection("projects").aggregate([
      { $match: { publishStatus: "published", developerName: { $nin: [null, ""] }, community: { $nin: [null, ""] } } },
      { $group: { _id: { d: "$developerName", c: "$community" }, n: { $sum: 1 } } },
      { $match: { n: { $gte: 2 } } },
    ]).toArray();
    const urls = new Set<string>();
    for (const r of rows as { _id: { d: string; c: string } }[]) {
      const cslug = nameToSlug.get(norm(String(r._id.c || "")));
      const dslug = slugify(String(r._id.d || ""));
      if (cslug && dslug) urls.add(`/${dslug}-projects-in-${cslug}`);
    }
    return [...urls];
  } catch {
    return [];
  } finally {
    await client?.close();
  }
}

// Superlative pages (/cheapest-{type}-in-{community}) where the community has
// >=3 for-sale listings of that type — enough to make a "ranked by price" page.
async function fetchSuperlativeCombos(): Promise<string[]> {
  const uri = process.env.MONGODB_URI;
  if (!uri) return [];
  const TYPE_SLUG: Record<string, string> = { Apartment: "apartments", Villa: "villas", Townhouse: "townhouses", Penthouse: "penthouses" };
  const norm = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim();
  const nameToSlug = new Map<string, string>();
  for (const c of BUY_COMMUNITIES) {
    nameToSlug.set(norm(c.name), c.slug);
    const apiName = (c as { apiName?: string }).apiName;
    if (apiName) nameToSlug.set(norm(apiName), c.slug);
  }
  let client: MongoClient | null = null;
  try {
    client = new MongoClient(uri, { serverSelectionTimeoutMS: 10_000 });
    await client.connect();
    const rows = await client.db().collection("listings").aggregate([
      { $match: { publishStatus: "published", listingType: "Sale", community: { $nin: [null, ""] }, propertyType: { $in: Object.keys(TYPE_SLUG) } } },
      { $group: { _id: { c: "$community", t: "$propertyType" }, n: { $sum: 1 } } },
      { $match: { n: { $gte: 3 } } },
    ]).toArray();
    const urls = new Set<string>();
    for (const r of rows as { _id: { c: string; t: string } }[]) {
      const cs = nameToSlug.get(norm(String(r._id.c || "")));
      const ts = TYPE_SLUG[r._id.t];
      if (cs && ts) urls.add(`/cheapest-${ts}-in-${cs}`);
    }
    return [...urls];
  } catch {
    return [];
  } finally {
    await client?.close();
  }
}

const IS_RU = SITE_URL.includes("binayah.ru");

function localeUrl(path: string, locale: string) {
  if (locale === "ru") return `${RU_URL}/ru${path}`;
  if (locale === "en") return `${AE_URL}${path}`;
  return `${AE_URL}/${locale}${path}`;
}

// Strip trailing slash from locale prefix URLs so the sitemap emits the
// canonical form (e.g. /zh not /zh/) and Google doesn't flag a redirect.
function localeAlt(base: string, prefix: string, path: string) {
  return path === "/" ? `${base}/${prefix}` : `${base}/${prefix}${path}`;
}

function withAlternates(path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"], lastModified: Date): MetadataRoute.Sitemap[number] {
  return {
    url: IS_RU ? `${RU_URL}/ru${path}` : `${AE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
    alternates: {
      languages: {
        en: `${AE_URL}${path}`,
        ru: path === "/" ? `${RU_URL}/ru` : `${RU_URL}/ru${path}`,
        ar: localeAlt(AE_URL, "ar", path),
        zh: localeAlt(AE_URL, "zh", path),
        vi: localeAlt(AE_URL, "vi", path),
        he: localeAlt(AE_URL, "he", path),
        fr: localeAlt(AE_URL, "fr", path),
        "x-default": `${AE_URL}${path}`,
      },
    },
  };
}

// Lean entry (no hreflang alternates) — used for high-volume secondary URLs like
// project sub-pages. Alternates multiply each entry ~8x and would blow past
// Vercel's 19 MB sitemap pre-render cap; hreflang for these is still served via
// the middleware's HTTP Link headers.
function plainEntry(path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"], lastModified: Date): MetadataRoute.Sitemap[number] {
  return {
    url: IS_RU ? `${RU_URL}/ru${path}` : `${AE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  };
}

async function fetchSlugs(path: string): Promise<{ slug: string; lastmod?: Date }[]> {
  try {
    const res = await serverFetch(serverApiUrl(path), 10_000);
    if (!res.ok) return [];
    const data = await res.json();
    const items: { slug?: string; updatedAt?: string; modifiedAt?: string; publishedAt?: string }[] = Array.isArray(data) ? data : [];
    return items
      .filter((d) => d.slug)
      .map((d) => {
        const raw = d.updatedAt || d.modifiedAt || d.publishedAt;
        const t = raw ? new Date(raw) : null;
        return { slug: d.slug as string, lastmod: t && !isNaN(t.getTime()) ? t : undefined };
      });
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [projects, listings, articles, communities, updates, developers, projectGuides, buildings] =
    await Promise.all([
      // Use MongoDB directly for listings/projects — the API hard-caps at 100
      // items regardless of ?limit=, so the sitemap would only include 100 of
      // 3000+ pages. MongoDB returns all published slugs with no cap.
      fetchProjectsForSitemap(),
      fetchSlugDatesFromDb("listings", { publishStatus: "published", slug: { $exists: true, $ne: "" } }),
      fetchSlugs("/api/news?limit=1000&fields=slug,updatedAt"),
      fetchSlugs("/api/communities?limit=500&fields=slug,updatedAt"),
      fetchSlugs("/api/construction-updates?limit=500&fields=slug,updatedAt"),
      fetchSlugs("/api/developers?limit=500&fields=slug,updatedAt"),
      // Project guides (project_articles) — served at /construction-updates/{slug}
      fetchSlugs("/api/project-articles?limit=200"),
      // DLD building pages — only those with recorded sales (non-thin). Direct
      // DB read (no API 100-cap) like projects/listings.
      fetchSlugDatesFromDb("dldbuildings", { slug: { $exists: true, $ne: "" }, sales: { $gt: 0 } }),
    ]);

  // Populated bedroom × type × community combos (all types) — data-driven.
  const matrixCombos = await fetchMatrixCombos();
  // Developer × community combos (≥2 projects) — data-driven.
  const devCommunityCombos = await fetchDevCommunityCombos();
  // Superlative (cheapest) combos — data-driven.
  const superlativeCombos = await fetchSuperlativeCombos();

  const staticPages: MetadataRoute.Sitemap = [
    withAlternates("/", 1.0, "daily", now),
    withAlternates("/off-plan", 0.9, "daily", now),
    withAlternates("/buy", 0.9, "daily", now),
    withAlternates("/rent", 0.9, "daily", now),
    withAlternates("/search", 0.8, "daily", now),
    withAlternates("/communities", 0.8, "weekly", now),
    withAlternates("/developers", 0.7, "weekly", now),
    withAlternates("/news", 0.7, "daily", now),
    withAlternates("/construction-updates", 0.7, "daily", now),
    withAlternates("/services", 0.6, "monthly", now),
    withAlternates("/about", 0.5, "monthly", now),
    withAlternates("/contact", 0.5, "monthly", now),
    withAlternates("/valuation", 0.5, "monthly", now),
    withAlternates("/pulse", 0.7, "daily", now),
    withAlternates("/pulse/guides", 0.6, "weekly", now),
    withAlternates("/pulse/calculator", 0.5, "monthly", now),
    withAlternates("/list-your-property", 0.5, "monthly", now),
    withAlternates("/buy-with-crypto", 0.8, "monthly", now),
    withAlternates("/hudayriyat-island", 0.9, "monthly", now),
    withAlternates("/sell", 0.8, "monthly", now),
    withAlternates("/services/property-management", 0.8, "monthly", now),
    withAlternates("/mortgage", 0.8, "monthly", now),
    withAlternates("/off-plan/top-projects", 0.8, "weekly", now),
    withAlternates("/off-plan/apartments", 0.8, "weekly", now),
    withAlternates("/off-plan/villas", 0.8, "weekly", now),
    withAlternates("/off-plan/townhouses", 0.8, "weekly", now),
    withAlternates("/rent/apartments", 0.8, "weekly", now),
    withAlternates("/rent/villas", 0.8, "weekly", now),
    withAlternates("/rent/townhouses", 0.8, "weekly", now),
    withAlternates("/off-plan/abu-dhabi", 0.7, "monthly", now),
    withAlternates("/off-plan/sharjah", 0.7, "monthly", now),
    withAlternates("/off-plan/ras-al-khaimah", 0.7, "monthly", now),
    withAlternates("/apartments", 0.8, "weekly", now),
    withAlternates("/villas", 0.8, "weekly", now),
    withAlternates("/penthouses", 0.7, "weekly", now),
    withAlternates("/offices", 0.7, "monthly", now),
    withAlternates("/townhouses", 0.7, "weekly", now),
    withAlternates("/warehouses", 0.6, "monthly", now),
    withAlternates("/land-for-sale", 0.7, "monthly", now),
    withAlternates("/golden-visa", 0.8, "monthly", now),
    withAlternates("/real-estate-marketing", 0.7, "monthly", now),
  ];

  const dynamicPages: MetadataRoute.Sitemap = [
    ...projects.map((p) => withAlternates(`/project/${p.slug}`, 0.8, "weekly", p.lastmod ?? now)),
    // Project sub-pages — only emit the ones with real content (their metadata
    // self-noindexes when the backing field is empty, so submitting an empty one
    // would trip a GSC "marked noindex" notice). Lean entries (no hreflang
    // alternates) to keep the sitemap under Vercel's 19 MB cap.
    ...projects.flatMap((p) => [
      ...(p.sub.floorplans ? [plainEntry(`/project/${p.slug}/floor-plans`, 0.6, "weekly", p.lastmod ?? now)] : []),
      ...(p.sub.location ? [plainEntry(`/project/${p.slug}/location`, 0.6, "weekly", p.lastmod ?? now)] : []),
      ...(p.sub.payment ? [plainEntry(`/project/${p.slug}/payment-plan`, 0.6, "weekly", p.lastmod ?? now)] : []),
      ...(p.sub.faq ? [plainEntry(`/project/${p.slug}/faq`, 0.6, "weekly", p.lastmod ?? now)] : []),
    ]),
    ...listings.map((l) => withAlternates(`/property/${l.slug}`, 0.7, "weekly", l.lastmod ?? now)),
    ...articles.map((a) => withAlternates(`/news/${a.slug}`, 0.6, "weekly", a.lastmod ?? now)),
    // Skip duplicate community slugs that 301 to their canonical — submitting a
    // redirect trips a GSC "submitted URL is a redirect" notice. These are the
    // redirect SOURCES: arjan/downtown/the-valley → "-dubai"; meydan-dubai and
    // the MBR mis-spellings → the enriched meydan / mohammed-bin-rashid-city.
    ...communities.filter((c) => !["arjan", "downtown", "the-valley", "meydan-dubai", "mohammad-bin-rashid-city", "mohd-bin-rashid-city", "jvc", "akoya-damac-hills", "impz-dubai", "port-rashid", "arabian-ranches-1"].includes(c.slug)).map((c) => withAlternates(`/communities/${c.slug}`, 0.7, "monthly", c.lastmod ?? now)),
    ...updates.map((u) => withAlternates(`/construction-updates/${u.slug}`, 0.6, "weekly", u.lastmod ?? now)),
    ...projectGuides.map((g) => withAlternates(`/construction-updates/${g.slug}`, 0.6, "weekly", g.lastmod ?? now)),
    ...developers.map((d) => withAlternates(`/developers/${d.slug}`, 0.6, "monthly", d.lastmod ?? now)),
    // DLD building pages — lean entries (no hreflang) to respect the sitemap size cap.
    ...buildings.map((b) => plainEntry(`/building/${b.slug}`, 0.55, "monthly", b.lastmod ?? now)),
    // SEO content routes (compiled, not API-driven)
    ...PULSE_GUIDES.map((g) => withAlternates(`/pulse/guides/${g.slug}`, 0.7, "monthly", now)),
    ...BUY_COMMUNITIES.map((c) => withAlternates(`/buy-property-in/${c.slug}`, 0.8, "weekly", now)),
    ...BUY_COMMUNITIES.map((c) => withAlternates(`/rent-property-in/${c.slug}`, 0.7, "weekly", now)),
    ...BUY_COMMUNITIES.map((c) => withAlternates(`/off-plan-in/${c.slug}`, 0.8, "weekly", now)),
    // Bedroom × type × community matrix — only combos that actually have
    // listings (all four types), so no empty/self-noindexed URLs are submitted.
    ...matrixCombos.map((u) => plainEntry(u, 0.6, "weekly", now)),
    // Developer × community pages.
    ...devCommunityCombos.map((u) => plainEntry(u, 0.6, "weekly", now)),
    // Superlative (cheapest) pages.
    ...superlativeCombos.map((u) => plainEntry(u, 0.6, "weekly", now)),
    // Area ranking pages.
    withAlternates("/highest-yield-areas-in-dubai", 0.7, "weekly", now),
    withAlternates("/most-affordable-areas-in-dubai", 0.7, "weekly", now),
    ...FOREIGN_BUYERS.map((b) => withAlternates(`/buying-property-in-dubai-as/${b.slug}`, 0.7, "monthly", now)),
    ...CRYPTO_SLUGS.map((slug) => withAlternates(`/buy-with-crypto/${slug}`, 0.7, "monthly", now)),
  ];

  // On binayah.ru: only expose Russian URLs — other locales live on binayah.ae
  if (IS_RU) {
    return [...staticPages, ...dynamicPages];
  }
  return [...staticPages, ...dynamicPages];
}
