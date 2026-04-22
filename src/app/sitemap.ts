import { MetadataRoute } from "next";
import { serverApiUrl, serverFetch } from "@/lib/api";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://binayah.com";
const LOCALES = ["en", "ru", "zh", "ar"] as const;

function localeUrl(path: string, locale: string) {
  const prefix = locale === "en" ? "" : `/${locale}`;
  return `${BASE}${prefix}${path}`;
}

function withAlternates(path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"], lastModified: Date): MetadataRoute.Sitemap[number] {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    languages[locale === "en" ? "x-default" : locale] = localeUrl(path, locale);
    if (locale !== "en") languages[locale] = localeUrl(path, locale);
  }
  return {
    url: localeUrl(path, "en"),
    lastModified,
    changeFrequency,
    priority,
    alternates: { languages },
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
  ];

  const dynamicPages: MetadataRoute.Sitemap = [
    ...projects.map((slug) => withAlternates(`/project/${slug}`, 0.8, "weekly", now)),
    ...listings.map((slug) => withAlternates(`/property/${slug}`, 0.7, "weekly", now)),
    ...articles.map((slug) => withAlternates(`/news/${slug}`, 0.6, "weekly", now)),
    ...communities.map((slug) => withAlternates(`/communities/${slug}`, 0.7, "monthly", now)),
    ...updates.map((slug) => withAlternates(`/construction-updates/${slug}`, 0.6, "weekly", now)),
    ...developers.map((slug) => withAlternates(`/developers/${slug}`, 0.6, "monthly", now)),
  ];

  return [...staticPages, ...dynamicPages];
}
