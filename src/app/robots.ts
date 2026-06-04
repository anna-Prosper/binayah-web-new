import { MetadataRoute } from "next";
import { headers } from "next/headers";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "";
  const isStaging = host === "staging.binayahhub.com" || host.endsWith(".vercel.app");
  const isRu = host === "binayah.ru" || host === "www.binayah.ru";
  const base = isRu ? "https://binayah.ru" : (process.env.NEXT_PUBLIC_SITE_URL || "https://www.binayah.ae");

  if (isStaging) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/valuation/stream",
          "/signin",
          "/forgot-password",
          "/reset-password",
          "/profile",
          "/api/",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
