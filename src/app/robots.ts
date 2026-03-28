import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        /* ── All crawlers — allow everything public ── */
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/api/ingest/",
          "/_next/",
        ],
      },
      {
        /* ── GPTBot (ChatGPT) — allow for AI search citations ── */
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
      {
        /* ── PerplexityBot — allow for AI search ── */
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
      {
        /* ── ClaudeBot (Anthropic) — allow ── */
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: "https://binayah.com/sitemap.xml",
    host:    "https://binayah.com",
  };
}
