import { MetadataRoute } from "next";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";
import Article from "@/models/Article";

const BASE_URL = "https://binayah.com";

/* ── Static pages ── */
const staticRoutes: MetadataRoute.Sitemap = [
  {
    url: BASE_URL,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1.0,
  },
  {
    url: `${BASE_URL}/off-plan`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  },
  {
    url: `${BASE_URL}/communities`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/developers`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/news`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/services`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  },
  {
    url: `${BASE_URL}/about`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  },
  {
    url: `${BASE_URL}/contact`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    await connectDB();

    /* ── Project pages ── */
    const projects = await Project.find({ publishStatus: "Published" })
      .select("slug updatedAt createdAt")
      .lean();

    const safeDate = (val: any): Date => {
      try {
        const d = new Date(val);
        return isNaN(d.getTime()) ? new Date() : d;
      } catch {
        return new Date();
      }
    };

    const projectRoutes: MetadataRoute.Sitemap = projects.map((p: any) => ({
      url: `${BASE_URL}/project/${p.slug}`,
      lastModified: safeDate(p.updatedAt || p.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));

    /* ── Article pages ── */
    const articles = await Article.find({ publishStatus: "Published" })
      .select("slug updatedAt createdAt")
      .lean();

    const articleRoutes: MetadataRoute.Sitemap = articles.map((a: any) => ({
      url: `${BASE_URL}/news/${a.slug}`,
      lastModified: safeDate(a.updatedAt || a.createdAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

    return [...staticRoutes, ...projectRoutes, ...articleRoutes];
  } catch (error) {
    // If DB is unreachable during build, return static routes only
    console.error("[sitemap] DB error:", error);
    return staticRoutes;
  }
}
