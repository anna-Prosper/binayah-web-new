import { MetadataRoute } from "next";
import { serverApiUrl, serverFetch } from "@/lib/api";
import { PULSE_GUIDES } from "@/lib/pulse-guides";
import { BUY_COMMUNITIES } from "@/lib/buy-communities";
import { FOREIGN_BUYERS } from "@/lib/foreign-buyers";

import { AE_URL, RU_URL, SITE_URL } from "@/lib/site";

const IS_RU = SITE_URL.includes("binayah.ru");

function localeUrl(path: string, locale: string) {
  if (locale === "ru") return `${RU_URL}/ru${path}`;
  if (locale === "en") return `${AE_URL}${path}`;
  return `${AE_URL}/${locale}${path}`;
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
        ru: `${RU_URL}/ru${path}`,
        ar: `${AE_URL}/ar${path}`,
        zh: `${AE_URL}/zh${path}`,
        "x-default": `${AE_URL}${path}`,
      },
    },
  };
}

async function fetchSlugs(path: string): Promise<string[]> {
  try {
    const res = await serverFetch(serverApiUrl(path), 10_000);
    if (!res.ok) return [];
    const data = await res.json();
    const items: { slug?: string }[] = Array.isArray(data) ? data : [];
    return items.map((d) => d.slug).filter(Boolean) as string[];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [projects, listings, articles, communities, updates, developers] =
    await Promise.all([
      fetchSlugs("/api/projects?limit=1000&fields=slug"),
      fetchSlugs("/api/listings?limit=1000&fields=slug"),
      fetchSlugs("/api/news?limit=1000&fields=slug"),
      fetchSlugs("/api/communities?limit=500&fields=slug"),
      fetchSlugs("/api/construction-updates?limit=500&fields=slug"),
      fetchSlugs("/api/developers?limit=500&fields=slug"),
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
  ];

  const dynamicPages: MetadataRoute.Sitemap = [
    ...projects.map((slug) => withAlternates(`/project/${slug}`, 0.8, "weekly", now)),
    ...listings.map((slug) => withAlternates(`/property/${slug}`, 0.7, "weekly", now)),
    ...articles.map((slug) => withAlternates(`/news/${slug}`, 0.6, "weekly", now)),
    ...communities.map((slug) => withAlternates(`/communities/${slug}`, 0.7, "monthly", now)),
    ...updates.map((slug) => withAlternates(`/construction-updates/${slug}`, 0.6, "weekly", now)),
    ...developers.map((slug) => withAlternates(`/developers/${slug}`, 0.6, "monthly", now)),
    // SEO content routes (compiled, not API-driven)
    ...PULSE_GUIDES.map((g) => withAlternates(`/pulse/guides/${g.slug}`, 0.7, "monthly", now)),
    ...BUY_COMMUNITIES.map((c) => withAlternates(`/buy-property-in/${c.slug}`, 0.8, "weekly", now)),
    ...FOREIGN_BUYERS.map((b) => withAlternates(`/buying-property-in-dubai-as/${b.slug}`, 0.7, "monthly", now)),
  ];

  // On binayah.ru: only expose Russian URLs — other locales live on binayah.ae
  if (IS_RU) {
    return [...staticPages, ...dynamicPages];
  }
  return [...staticPages, ...dynamicPages];
}
