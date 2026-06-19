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

  const [projects, listings, articles, communities, updates, developers, projectGuides] =
    await Promise.all([
      // Use MongoDB directly for listings/projects — the API hard-caps at 100
      // items regardless of ?limit=, so the sitemap would only include 100 of
      // 3000+ pages. MongoDB returns all published slugs with no cap.
      fetchSlugDatesFromDb("projects", { slug: { $exists: true, $ne: "" } }),
      fetchSlugDatesFromDb("listings", { publishStatus: "published", slug: { $exists: true, $ne: "" } }),
      fetchSlugs("/api/news?limit=1000&fields=slug,updatedAt"),
      fetchSlugs("/api/communities?limit=500&fields=slug,updatedAt"),
      fetchSlugs("/api/construction-updates?limit=500&fields=slug,updatedAt"),
      fetchSlugs("/api/developers?limit=500&fields=slug,updatedAt"),
      // Project guides (project_articles) — served at /construction-updates/{slug}
      fetchSlugs("/api/project-articles?limit=200"),
    ]);

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
    // Project sub-pages — each has unique metadata + a distinct SEO content block,
    // so they're worth indexing as standalone topic pages. Lean entries (no
    // hreflang alternates) to keep the sitemap under Vercel's 19 MB cap.
    ...projects.flatMap((p) => [
      plainEntry(`/project/${p.slug}/floor-plans`, 0.6, "weekly", p.lastmod ?? now),
      plainEntry(`/project/${p.slug}/location`, 0.6, "weekly", p.lastmod ?? now),
      plainEntry(`/project/${p.slug}/payment-plan`, 0.6, "weekly", p.lastmod ?? now),
      plainEntry(`/project/${p.slug}/faq`, 0.6, "weekly", p.lastmod ?? now),
    ]),
    ...listings.map((l) => withAlternates(`/property/${l.slug}`, 0.7, "weekly", l.lastmod ?? now)),
    ...articles.map((a) => withAlternates(`/news/${a.slug}`, 0.6, "weekly", a.lastmod ?? now)),
    ...communities.map((c) => withAlternates(`/communities/${c.slug}`, 0.7, "monthly", c.lastmod ?? now)),
    ...updates.map((u) => withAlternates(`/construction-updates/${u.slug}`, 0.6, "weekly", u.lastmod ?? now)),
    ...projectGuides.map((g) => withAlternates(`/construction-updates/${g.slug}`, 0.6, "weekly", g.lastmod ?? now)),
    ...developers.map((d) => withAlternates(`/developers/${d.slug}`, 0.6, "monthly", d.lastmod ?? now)),
    // SEO content routes (compiled, not API-driven)
    ...PULSE_GUIDES.map((g) => withAlternates(`/pulse/guides/${g.slug}`, 0.7, "monthly", now)),
    ...BUY_COMMUNITIES.map((c) => withAlternates(`/buy-property-in/${c.slug}`, 0.8, "weekly", now)),
    ...BUY_COMMUNITIES.map((c) => withAlternates(`/rent-property-in/${c.slug}`, 0.7, "weekly", now)),
    ...BUY_COMMUNITIES.map((c) => withAlternates(`/off-plan-in/${c.slug}`, 0.8, "weekly", now)),
    ...FOREIGN_BUYERS.map((b) => withAlternates(`/buying-property-in-dubai-as/${b.slug}`, 0.7, "monthly", now)),
    ...CRYPTO_SLUGS.map((slug) => withAlternates(`/buy-with-crypto/${slug}`, 0.7, "monthly", now)),
  ];

  // On binayah.ru: only expose Russian URLs — other locales live on binayah.ae
  if (IS_RU) {
    return [...staticPages, ...dynamicPages];
  }
  return [...staticPages, ...dynamicPages];
}
