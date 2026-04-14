import { MetadataRoute } from "next";
import { serverApiUrl, serverFetch } from "@/lib/api";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://binayah.com";

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

  // Fetch all slugs concurrently
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
    { url: BASE, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE}/off-plan`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/buy`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/rent`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/search`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/communities`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/developers`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/news`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE}/construction-updates`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/valuation`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const dynamicPages: MetadataRoute.Sitemap = [
    ...projects.map((slug) => ({
      url: `${BASE}/project/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...listings.map((slug) => ({
      url: `${BASE}/property/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...articles.map((slug) => ({
      url: `${BASE}/news/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...communities.map((slug) => ({
      url: `${BASE}/communities/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...updates.map((slug) => ({
      url: `${BASE}/construction-updates/${slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...developers.map((slug) => ({
      url: `${BASE}/developers/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];

  return [...staticPages, ...dynamicPages];
}
