import { MetadataRoute } from "next";
import { MongoClient, type Db } from "mongodb";
import { serverApiUrl, serverFetch } from "@/lib/api";
import { PULSE_GUIDES } from "@/lib/pulse-guides";
import { OFFERS, isExpired } from "@/lib/offers";
import { BUY_COMMUNITIES, CURATED_COMMUNITY_SLUGS } from "@/lib/buy-communities";
import { FOREIGN_BUYERS } from "@/lib/foreign-buyers";
import { SOURCE_CITIES } from "@/lib/source-cities";
import { GOLDEN_VISA_NATIONALITIES } from "@/lib/golden-visa-nationalities";
import { CRYPTO_SLUGS } from "@/lib/crypto-pages";
import { getAgents, isPublishableAgent } from "@/lib/agents";
import { isIndexableNewsArticle } from "@/lib/news-topicality";

import { AE_URL, RU_BASE, SITE_URL } from "@/lib/site";

/**
 * One Mongo connection for the whole sitemap build.
 *
 * Every DB-backed helper below used to open its own MongoClient, connect,
 * query and close. With fetchSlugDatesFromDb called three times (sales,
 * rentals, buildings) that came to TEN Atlas connects per build — ten TLS
 * handshakes and ten replica-set discoveries for one document.
 *
 * Returning a `close` rather than exposing the client keeps the lifetime in
 * one place: helpers receive a Db they must not close, and the single owner
 * closes it once in a finally. A helper that closed a shared client would
 * break every sibling still using it — the failure this shape exists to make
 * impossible.
 *
 * A failed connect resolves to db:null rather than throwing, so each helper
 * takes the same fallback path it already had for a missing MONGODB_URI. The
 * sitemap must still build when Mongo is unreachable.
 */
type SitemapDb = Db | null;

async function openSitemapDb(): Promise<{ db: SitemapDb; close: () => Promise<void> }> {
  const uri = process.env.MONGODB_URI;
  const noop = async () => {};
  if (!uri) return { db: null, close: noop };
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10_000 });
  try {
    await client.connect();
    return { db: client.db(), close: () => client.close() };
  } catch {
    await client.close().catch(() => {});
    return { db: null, close: noop };
  }
}

// Fetch all slugs directly from MongoDB — bypasses the API's 100-item hard cap.
// Falls back to empty array on any error so the sitemap still builds.
async function fetchSlugDatesFromDb(
  db: SitemapDb,
  collection: string,
  filter: Record<string, unknown> = {}
): Promise<{ slug: string; lastmod?: Date }[]> {
  if (!db) return [];
  try {
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
  }
}

// /property/{slug} pages are served from the live secondary_sales /
// secondary_rentals feed. The legacy `listings` collection is deprecated (stale
// inventory — e.g. already-removed villas) and is excluded from search, so we
// no longer advertise its URLs here either; that lets Google de-index the old
// pages instead of us re-submitting removed listings each crawl.
async function fetchAllListingSlugs(db: SitemapDb): Promise<{ slug: string; lastmod?: Date }[]> {
  const filter = { publishStatus: "published", slug: { $exists: true, $ne: "" } };
  const [sales, rentals] = await Promise.all([
    fetchSlugDatesFromDb(db, "secondary_sales", filter),
    fetchSlugDatesFromDb(db, "secondary_rentals", filter),
  ]);
  const seen = new Set<string>();
  const out: { slug: string; lastmod?: Date }[] = [];
  for (const l of [...sales, ...rentals]) {
    if (seen.has(l.slug)) continue;
    seen.add(l.slug);
    out.push(l);
  }
  return out;
}

// Projects for the sitemap, with the /location sub-page's indexability flag.
// The flag MUST mirror the `robots: noindex` guard in location/page.tsx's
// generateMetadata so we never submit a URL that self-noindexes (which GSC flags
// as "Submitted URL marked noindex"). /faq, /floor-plans and /payment-plan are
// now unconditionally noindex (they were 84-95% duplicates of the parent, which
// already renders all of their sections), so they are no longer submitted at all
// and no flags are computed for them.
async function fetchProjectsForSitemap(db: SitemapDb): Promise<
  { slug: string; lastmod?: Date; sub: { location: boolean } }[]
> {
  if (!db) return [];
  try {
    const docs = await db.collection("projects").find(
      { publishStatus: "published", slug: { $exists: true, $ne: "" } },
      { projection: { _id: 0, slug: 1, updatedAt: 1, locationDescription: 1, nearbyAttractions: 1 } }
    ).toArray();
    return (docs as Record<string, unknown>[])
      .filter((d) => d.slug)
      .map((d) => {
        const t = d.updatedAt ? new Date(d.updatedAt as string) : null;
        const nearby = d.nearbyAttractions as unknown[] | undefined;
        return {
          slug: d.slug as string,
          lastmod: t && !isNaN(t.getTime()) ? t : undefined,
          sub: {
            location: !!((d.locationDescription && String(d.locationDescription).trim()) || (Array.isArray(nearby) && nearby.length > 0)),
          },
        };
      });
  } catch {
    return [];
  }
}

// Bedroom × type × community matrix URLs that ACTUALLY have listings — emitted
// from a single grouped aggregation so the sitemap never contains empty (and
// therefore self-noindexed) combos. Covers all four supported types. Secondary
// collections lack propertyType, so they can't satisfy a type filter anyway —
// the legacy `listings` collection is the authoritative source here.
// The original 20 community slugs. The bedroom×type matrix, superlative and
// dev×community sitemap sets are held to these — the 38 communities added in
// the 2026-07 catalog expansion contribute only their hub + off-plan-in pages
// (live listing inventory is too thin to back a matrix long-tail).
const MATRIX_SLUGS = new Set<string>([
  "dubai-marina", "downtown-dubai", "palm-jumeirah", "business-bay", "jumeirah-village-circle",
  "dubai-hills-estate", "arabian-ranches", "jumeirah-beach-residence", "difc", "dubai-creek-harbour",
  "mbr-city", "damac-hills", "emirates-hills", "bluewaters-island", "mirdif", "al-barari",
  "jumeirah-lakes-towers", "town-square", "the-springs", "international-city",
]);

// Data-backed matrix combos (phase 2): bedroom × type sale pages the DLD
// sold-price endpoint reports enough real transactions for. This is what makes
// the matrix tail viable beyond the original 20 — every emitted URL renders a
// median sold price from >=12 DLD transactions, so it's substantive even with
// no live listings. Apartments/villas only (DLD's only residential type tags).
async function fetchDldMatrixCombos(): Promise<string[]> {
  const key = process.env.API_KEY;
  if (!key) return [];
  const bedToken = (b: number) => (b === 0 ? "studio" : `${b}-bedroom`);
  const results = await Promise.all(
    BUY_COMMUNITIES.map(async (c) => {
      try {
        const res = await serverFetch(serverApiUrl(`/api/dld/areas/${c.slug}/matrix?min=12`), 10_000, { "x-api-key": key });
        if (!res.ok) return [] as string[];
        const d = await res.json();
        const combos = Array.isArray(d?.combos) ? (d.combos as { type: string; bedrooms: number }[]) : [];
        return combos
          .filter((x) => (x.type === "apartments" || x.type === "villas") && typeof x.bedrooms === "number" && x.bedrooms >= 0 && x.bedrooms <= 7)
          .map((x) => `/${bedToken(x.bedrooms)}-${x.type}-for-sale-in-${c.slug}`);
      } catch {
        return [] as string[];
      }
    })
  );
  return [...new Set(results.flat())];
}

async function fetchMatrixCombos(db: SitemapDb): Promise<string[]> {
  if (!db) return [];
  const TYPE_SLUG: Record<string, string> = { Apartment: "apartments", Villa: "villas", Townhouse: "townhouses", Penthouse: "penthouses" };
  const norm = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim();
  const nameToSlug = new Map<string, string>();
  for (const c of BUY_COMMUNITIES) {
    if (!MATRIX_SLUGS.has(c.slug)) continue;
    nameToSlug.set(norm(c.name), c.slug);
    const apiName = (c as { apiName?: string }).apiName;
    if (apiName) nameToSlug.set(norm(apiName), c.slug);
  }
  try {
    const rows = await db.collection("listings").aggregate([
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
  }
}

// Developer × community combos (/{dev}-projects-in-{community}) where the
// developer has ≥2 projects in a (known) community — data-driven, so only
// substantial pages are submitted.
async function fetchDevCommunityCombos(db: SitemapDb): Promise<string[]> {
  if (!db) return [];
  const norm = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim();
  const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const nameToSlug = new Map<string, string>();
  for (const c of BUY_COMMUNITIES) {
    if (!MATRIX_SLUGS.has(c.slug)) continue;
    nameToSlug.set(norm(c.name), c.slug);
    const apiName = (c as { apiName?: string }).apiName;
    if (apiName) nameToSlug.set(norm(apiName), c.slug);
  }
  try {
    const rows = await db.collection("projects").aggregate([
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
  }
}

// Superlative pages (/cheapest-{type}-in-{community}) where the community has
// >=3 for-sale listings of that type — enough to make a "ranked by price" page.
async function fetchSuperlativeCombos(db: SitemapDb): Promise<string[]> {
  if (!db) return [];
  const TYPE_SLUG: Record<string, string> = { Apartment: "apartments", Villa: "villas", Townhouse: "townhouses", Penthouse: "penthouses" };
  const norm = (s: string) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim();
  const nameToSlug = new Map<string, string>();
  for (const c of BUY_COMMUNITIES) {
    if (!MATRIX_SLUGS.has(c.slug)) continue;
    nameToSlug.set(norm(c.name), c.slug);
    const apiName = (c as { apiName?: string }).apiName;
    if (apiName) nameToSlug.set(norm(apiName), c.slug);
  }
  try {
    const rows = await db.collection("listings").aggregate([
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
  }
}

const IS_RU = SITE_URL.includes("binayah.ru");

function localeUrl(path: string, locale: string) {
  if (locale === "ru") return `${RU_BASE}${path}`;
  if (locale === "en") return `${AE_URL}${path}`;
  return `${AE_URL}/${locale}${path}`;
}

// Strip trailing slash from locale prefix URLs so the sitemap emits the
// canonical form (e.g. /zh not /zh/) and Google doesn't flag a redirect.
function localeAlt(base: string, prefix: string, path: string) {
  return path === "/" ? `${base}/${prefix}` : `${base}/${prefix}${path}`;
}

// English-only pages (e.g. /offers). The route renders the same English copy at
// every locale, so emitting hreflang alternates would advertise translations
// that don't exist. Submit the canonical English URL alone instead.
function enOnly(path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"], lastModified: Date): MetadataRoute.Sitemap[number] {
  return { url: `${AE_URL}${path}`, lastModified, changeFrequency, priority };
}

function withAlternates(path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"], lastModified: Date): MetadataRoute.Sitemap[number] {
  return {
    url: IS_RU ? `${RU_BASE}${path}` : `${AE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
    alternates: {
      languages: {
        en: `${AE_URL}${path}`,
        ru: path === "/" ? RU_BASE : `${RU_BASE}${path}`,
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
    url: IS_RU ? `${RU_BASE}${path}` : `${AE_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  };
}

// News articles that are ALLOWED to be indexed. Must mirror the robots guard in
// news/[slug]/page.tsx's generateMetadata — hence the shared
// isIndexableNewsArticle() predicate rather than a second copy of the rules
// here: off-topic scraped articles (restaurant round-ups, concerts, chip fabs)
// are noindex,follow, so submitting them would be a straight contradiction.
type SitemapNewsItem = {
  slug?: string; title?: string; excerpt?: string; metaDescription?: string;
  category?: string | string[]; tags?: string[];
  updatedAt?: string; modifiedAt?: string; publishedAt?: string;
};

/**
 * Classify one article without letting it take the others down.
 *
 * isIndexableNewsArticle reads fields straight off a scraped feed, and that
 * feed is not type-stable: `category` arrives as a string on 502 articles and
 * an array on 762. When the array case threw, the whole function's catch
 * swallowed it and the sitemap silently shipped with ZERO news URLs — no
 * error, no partial result, nothing to alert on. It only escaped notice
 * because the API caps this list at 100 and those happened to be the
 * string-typed ones.
 *
 * So a bad article is now skipped and counted, never fatal.
 */
function classifyForSitemap(d: SitemapNewsItem, failures: string[]): boolean {
  try {
    return isIndexableNewsArticle(d);
  } catch (err) {
    failures.push(`${d.slug ?? "(no slug)"}: ${err instanceof Error ? err.message : String(err)}`);
    return false;
  }
}

async function fetchIndexableNewsForSitemap(): Promise<{ slug: string; lastmod?: Date }[]> {
  try {
    // /api/news/index-feed, not /api/news. The list route caps limit at 100 with
    // no pagination, so this was classifying 100 of 1,254 articles and
    // submitting 56 — about 1,200 were missing from the sitemap. Its select
    // also omits metaDescription and tags, which the classifier reads as part
    // of its signal haystack, so even those 100 were judged on partial data.
    //
    // 30s rather than 10s: one ~790KB response, and Render cold-starts.
    const res = await serverFetch(
      serverApiUrl("/api/news/index-feed?excludeCategory=Weekly%20Report"),
      30_000
    );
    if (!res.ok) {
      // Loud, because the failure mode is invisible: the sitemap still builds
      // and still validates, just with every news URL missing.
      console.error(`[sitemap] news fetch failed: HTTP ${res.status} — news URLs omitted from this build`);
      return [];
    }
    const data = await res.json();
    const items: SitemapNewsItem[] = Array.isArray(data) ? data : [];
    const failures: string[] = [];
    const out = items
      .filter((d) => d.slug && classifyForSitemap(d, failures))
      .map((d) => {
        const raw = d.updatedAt || d.modifiedAt || d.publishedAt;
        const t = raw ? new Date(raw) : null;
        return { slug: d.slug as string, lastmod: t && !isNaN(t.getTime()) ? t : undefined };
      });
    if (failures.length) {
      console.error(`[sitemap] ${failures.length} of ${items.length} article(s) failed classification and were omitted:`);
      failures.slice(0, 5).forEach((f) => console.error(`[sitemap]   ${f}`));
    }
    if (items.length && !out.length) {
      console.error(`[sitemap] ${items.length} article(s) fetched but NONE were indexable — check the classifier, this is rarely legitimate`);
    }
    return out;
  } catch (err) {
    console.error("[sitemap] news section failed entirely — news URLs omitted from this build:", err);
    return [];
  }
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

// Published offers straight from Mongo, so an offer added to the DB appears in
// the sitemap on the next revalidate without a redeploy. `deadline` comes along
// because expired promotions must never be submitted. Falls back to the bundled
// array when the DB is unreachable (the sitemap still has to build).
async function fetchOffersForSitemap(db: SitemapDb): Promise<{ slug: string; deadline: string; lastmod?: Date }[]> {
  if (!db) return OFFERS.map((o) => ({ slug: o.slug, deadline: o.deadline }));
  try {
    const docs = await db
      .collection("offers")
      .find({ published: true }, { projection: { _id: 0, slug: 1, deadline: 1, updatedAt: 1 } })
      .toArray();
    if (!docs.length) return [];
    return (docs as unknown as { slug: string; deadline: string; updatedAt?: Date }[]).map((d) => ({
      slug: d.slug,
      deadline: d.deadline,
      lastmod: d.updatedAt instanceof Date ? d.updatedAt : undefined,
    }));
  } catch {
    return OFFERS.map((o) => ({ slug: o.slug, deadline: o.deadline }));
  }
}

async function fetchGuidesForSitemap(db: SitemapDb): Promise<{ slug: string; lastmod?: Date }[]> {
  if (!db) return PULSE_GUIDES.map((g) => ({ slug: g.slug }));
  try {
    const docs = await db
      .collection("guides")
      .find({ published: true }, { projection: { _id: 0, slug: 1, updatedAt: 1 } })
      .toArray();
    if (!docs.length) return PULSE_GUIDES.map((g) => ({ slug: g.slug }));
    return (docs as unknown as { slug: string; updatedAt?: Date }[]).map((d) => ({
      slug: d.slug,
      lastmod: d.updatedAt instanceof Date ? d.updatedAt : undefined,
    }));
  } catch {
    return PULSE_GUIDES.map((g) => ({ slug: g.slug }));
  }
}

  /**
   * Every source in ONE parallel batch, over ONE Mongo connection.
   *
   * These were three groups before: a Promise.all, then seven sequential
   * awaits, each opening its own client. Nothing here depends on anything
   * else here, so the only reason for the split was how it grew.
   *
   * The connection is opened before the batch and closed in the finally
   * below — helpers never close it, because a shared client closed by one
   * caller breaks every sibling still reading from it.
   */
  const mongo = await openSitemapDb();
  let projects: Awaited<ReturnType<typeof fetchProjectsForSitemap>>;
  let listings: Awaited<ReturnType<typeof fetchAllListingSlugs>>;
  let articles: Awaited<ReturnType<typeof fetchIndexableNewsForSitemap>>;
  let reports: Awaited<ReturnType<typeof fetchSlugs>>;
  let communities: Awaited<ReturnType<typeof fetchSlugs>>;
  let developers: Awaited<ReturnType<typeof fetchSlugs>>;
  let projectGuides: Awaited<ReturnType<typeof fetchSlugs>>;
  let buildings: Awaited<ReturnType<typeof fetchSlugDatesFromDb>>;
  let offers: Awaited<ReturnType<typeof fetchOffersForSitemap>>;
  let guides: Awaited<ReturnType<typeof fetchGuidesForSitemap>>;
  let matrixCombos: string[];
  let dldMatrixCombos: string[];
  let devCommunityCombos: string[];
  let superlativeCombos: string[];
  let agents: Awaited<ReturnType<typeof getAgents>>;

  try {
    [
      projects, listings, articles, reports, communities, developers, projectGuides, buildings,
      offers, guides, matrixCombos, dldMatrixCombos, devCommunityCombos, superlativeCombos, agents,
    ] = await Promise.all([
      // Use MongoDB directly for listings/projects — the API hard-caps at 100
      // items regardless of ?limit=, so the sitemap would only include 100 of
      // 3000+ pages. MongoDB returns all published slugs with no cap.
      fetchProjectsForSitemap(mongo.db),
      fetchAllListingSlugs(mongo.db),
      // News feed excludes weekly market reports — those live under /pulse/reports.
      // Off-topic articles are dropped here (see fetchIndexableNewsForSitemap).
      fetchIndexableNewsForSitemap(),
      fetchSlugs("/api/news?limit=1000&category=Weekly%20Report&fields=slug,updatedAt"),
      fetchSlugs("/api/communities?limit=500&fields=slug,updatedAt"),
      fetchSlugs("/api/developers?limit=500&fields=slug,updatedAt"),
      // Project guides (project_articles) — the ONLY data the /construction-updates/{slug}
      // route renders. The old /api/construction-updates source was removed: those
      // slugs (project slugs) have no page and returned ~980 soft-404s in the sitemap.
      fetchSlugs("/api/project-articles?limit=1000"),
      // DLD building pages — only those with recorded sales (non-thin). Direct
      // DB read (no API 100-cap) like projects/listings.
      // Submit every INDEXABLE building page. This filter must mirror the
      // isIndexable() guard in building/[slug]/page.tsx (≥3 sales AND a real
      // avg price) so a noindexed URL is never submitted. Thinner towers stay
      // reachable via sibling links and flip in automatically as DLD data grows.
      fetchSlugDatesFromDb(mongo.db, "dldbuildings", { slug: { $exists: true, $ne: "" }, sales: { $gte: 3 }, avgPrice: { $gt: 0 } }),
      fetchOffersForSitemap(mongo.db),
      fetchGuidesForSitemap(mongo.db),
      // Populated bedroom × type × community combos (all types) — data-driven.
      fetchMatrixCombos(mongo.db),
      fetchDldMatrixCombos(),
      // Developer × community combos (≥2 projects) — data-driven.
      fetchDevCommunityCombos(mongo.db),
      // Superlative (cheapest) combos — data-driven.
      fetchSuperlativeCombos(mongo.db),
      // Agent profiles substantive enough to index (real bio + RERA BRN).
      getAgents(),
    ]);
  } finally {
    // Closed here and nowhere else, whether the batch resolved or threw.
    await mongo.close();
  }

  // matrix and dldMatrix are independent of each other; only their union is used.
  const allMatrixCombos = [...new Set([...matrixCombos, ...dldMatrixCombos])];
  const publishableAgents = agents.filter(isPublishableAgent);

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
    withAlternates("/team", 0.6, "weekly", now),
    withAlternates("/contact", 0.5, "monthly", now),
    // Indexable and linked from the footer, but were never submitted.
    withAlternates("/privacy-policy", 0.3, "yearly", now),
    withAlternates("/terms-of-service", 0.3, "yearly", now),
    // Individual agent profiles — only those with a real bio + BRN (the rest are
    // noindex until enriched, so they'd be "submitted URL marked noindex").
    ...publishableAgents.map((a) => withAlternates(`/team/${a.slug}`, 0.4, "monthly", now)),
    withAlternates("/valuation", 0.5, "monthly", now),
    withAlternates("/deal-check", 0.6, "monthly", now),
    withAlternates("/pulse", 0.7, "daily", now),
    withAlternates("/pulse/reports", 0.7, "weekly", now),
    withAlternates("/pulse/guides", 0.6, "weekly", now),
    withAlternates("/pulse/calculator", 0.5, "monthly", now),
    withAlternates("/list-your-property", 0.5, "monthly", now),
    withAlternates("/buy-with-crypto", 0.8, "monthly", now),
    withAlternates("/hudayriyat-island", 0.9, "monthly", now),
    withAlternates("/sell", 0.8, "monthly", now),
    withAlternates("/services/property-management", 0.8, "monthly", now),
    // Commercial service pages targeting the agency/broker/investment keyword
    // clusters — the SERP audit found these terms ranking on page 1-2 with no
    // dedicated landing page behind them.
    withAlternates("/services/real-estate-agency-dubai", 0.9, "monthly", now),
    withAlternates("/services/real-estate-broker-dubai", 0.9, "monthly", now),
    withAlternates("/services/property-investment-dubai", 0.8, "monthly", now),
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
    // Project sub-pages — /location ONLY. /faq, /floor-plans and /payment-plan
    // are unconditionally noindex (84-95% duplicates of the parent, which already
    // renders every one of those sections in full), so submitting them would both
    // contradict their own robots tag and burn crawl budget. /location carries
    // genuine unique content, so it stays. Emitted with the backing-field guard
    // so we never submit a self-noindexing URL. Lean entries (no hreflang
    // alternates) to keep the sitemap under Vercel's 19 MB cap.
    ...projects.flatMap((p) =>
      p.sub.location ? [plainEntry(`/project/${p.slug}/location`, 0.6, "weekly", p.lastmod ?? now)] : []
    ),
    ...listings.map((l) => withAlternates(`/property/${l.slug}`, 0.7, "weekly", l.lastmod ?? now)),
    ...articles.map((a) => withAlternates(`/news/${a.slug}`, 0.6, "weekly", a.lastmod ?? now)),
    ...reports.map((r) => withAlternates(`/pulse/reports/${r.slug}`, 0.7, "weekly", r.lastmod ?? now)),
    // Skip duplicate community slugs that 301 to their canonical — submitting a
    // redirect trips a GSC "submitted URL is a redirect" notice. These are the
    // redirect SOURCES: arjan/downtown/the-valley → "-dubai"; meydan-dubai and
    // the MBR mis-spellings → the enriched meydan / mohammed-bin-rashid-city.
    ...communities.filter((c) => !["arjan", "downtown", "the-valley", "meydan-dubai", "mohammad-bin-rashid-city", "mohd-bin-rashid-city", "jvc", "akoya-damac-hills", "impz-dubai", "port-rashid", "arabian-ranches-1"].includes(c.slug)).map((c) => withAlternates(`/communities/${c.slug}`, 0.7, "monthly", c.lastmod ?? now)),
    ...projectGuides.map((g) => withAlternates(`/construction-updates/${g.slug}`, 0.6, "weekly", g.lastmod ?? now)),
    ...developers.map((d) => withAlternates(`/developers/${d.slug}`, 0.6, "monthly", d.lastmod ?? now)),
    // DLD building pages — lean entries (no hreflang) to respect the sitemap size cap.
    ...buildings.map((b) => plainEntry(`/building/${b.slug}`, 0.55, "monthly", b.lastmod ?? now)),
    // SEO content routes (compiled, not API-driven). Guides are English-only
    // content, so we submit just the EN URL (non-EN routes are noindex).
    // Guides are now fully translated in all 7 locales (body + FAQ), so submit
    // them WITH hreflang alternates.
    ...guides.map((g) => withAlternates(`/pulse/guides/${g.slug}`, 0.7, "monthly", g.lastmod ?? now)),
    // Promotional offers — fully translated in all 7 locales via each document's
    // `translations` map, so they carry hreflang alternates. Expired offers stay
    // in the sitemap: the page keeps its rankings and its backlinks, and it
    // simply stops making any claim about a date (no countdown, no window
    // label, no validThrough). Only the crawl cadence drops, since a closed
    // promotion is not changing daily any more.
    withAlternates("/offers", 0.75, "weekly", now),
    ...offers.map((o) =>
      withAlternates(`/offers/${o.slug}`, 0.8, isExpired(o) ? "monthly" : "daily", o.lastmod ?? now),
    ),
    ...BUY_COMMUNITIES.map((c) => withAlternates(`/buy-property-in/${c.slug}`, 0.8, "weekly", now)),
    ...BUY_COMMUNITIES.map((c) => withAlternates(`/rent-property-in/${c.slug}`, 0.7, "weekly", now)),
    ...BUY_COMMUNITIES.map((c) => withAlternates(`/off-plan-in/${c.slug}`, 0.8, "weekly", now)),
    // Seller-intent valuation landing pages — only the curated 20 (real DLD price data).
    ...CURATED_COMMUNITY_SLUGS.map((slug) => withAlternates(`/property-valuation/${slug}`, 0.7, "monthly", now)),
    // Bedroom × type × community matrix — only combos that actually have
    // listings (all four types), so no empty/self-noindexed URLs are submitted.
    // Matrix pages are fully localized (title/H1/description/sold-price band in
    // all 7 locales), so submit them WITH hreflang alternates.
    ...allMatrixCombos.map((u) => withAlternates(u, 0.6, "weekly", now)),
    // Developer × community pages.
    ...devCommunityCombos.map((u) => plainEntry(u, 0.6, "weekly", now)),
    // Superlative (cheapest) pages.
    ...superlativeCombos.map((u) => plainEntry(u, 0.6, "weekly", now)),
    // Area ranking pages.
    withAlternates("/highest-yield-areas-in-dubai", 0.7, "weekly", now),
    withAlternates("/most-affordable-areas-in-dubai", 0.7, "weekly", now),
    // Hub for the per-nationality buyer guides. Without it the whole cluster is
    // orphaned: the profile pages carry no inbound internal links at all.
    withAlternates("/buying-property-in-dubai-as", 0.7, "monthly", now),
    ...FOREIGN_BUYERS.map((b) => withAlternates(`/buying-property-in-dubai-as/${b.slug}`, 0.7, "monthly", now)),
    // Source-city guides: the logistics of buying at a distance, as opposed to
    // the nationality guides' legal and tax position.
    ...SOURCE_CITIES.map((c) => withAlternates(`/buying-property-in-dubai-from/${c.slug}`, 0.7, "monthly", now)),
    // Golden Visa per nationality. The generic /golden-visa page is already a
    // static entry; these only cover what differs by passport.
    ...GOLDEN_VISA_NATIONALITIES.map((g) => withAlternates(`/golden-visa/${g.slug}`, 0.7, "monthly", now)),
    ...CRYPTO_SLUGS.map((slug) => withAlternates(`/buy-with-crypto/${slug}`, 0.7, "monthly", now)),
  ];

  // On binayah.ru: only expose Russian URLs — other locales live on binayah.ae
  if (IS_RU) {
    return [...staticPages, ...dynamicPages];
  }
  return [...staticPages, ...dynamicPages];
}
