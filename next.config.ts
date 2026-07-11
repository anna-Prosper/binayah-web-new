import type { NextConfig } from "next";
import crypto from "node:crypto";
import bundleAnalyzer from "@next/bundle-analyzer";
import createNextIntlPlugin from "next-intl/plugin";

// Per-deploy static CSP nonce (see src/lib/csp.ts). Derived deterministically
// from the deploy's git SHA so every evaluation of this config in a single
// build yields the same value, and it rotates on each deployment. Inlined into
// all bundles (Edge middleware + server) via `env` below so the nonce in the
// cached HTML always matches the nonce the middleware writes into the CSP header.
const CSP_NONCE = crypto
  .createHash("sha256")
  .update(process.env.VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_DEPLOYMENT_ID || "binayah-local-dev")
  .digest("base64")
  .replace(/[+/=]/g, "")
  .slice(0, 22);

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// CSP is set dynamically in middleware.ts with a per-request nonce.
// Static headers here cover everything except CSP.
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  // Inline the per-deploy CSP nonce into every bundle (server + Edge middleware)
  // so src/lib/csp.ts reads the same frozen value everywhere.
  env: { CSP_NONCE },
  // The binayah.ru self-hosted runner is a ~960MB-RAM VPS. Next's default
  // multi-worker static generation runs several page renders in parallel and
  // spikes RAM until the kernel thrashes swap and the GitHub runner loses its
  // heartbeat ("self-hosted runner lost communication"). LOW_MEM_BUILD forces
  // single-threaded generation — slower, but it fits in RAM and the deploy
  // survives. Not set on Vercel, so cloud builds keep full parallelism.
  ...(process.env.LOW_MEM_BUILD === "1"
    ? { experimental: { cpus: 1, workerThreads: false } }
    : {}),
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        // Static assets (hero variants, logos, OG images) are content-stable —
        // cache them aggressively at the edge/browser to fix "efficient cache
        // lifetimes" and keep the preloaded LCP hero warm.
        source: "/assets/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
  async redirects() {
    // SEO landing pages briefly lived under /buy-property-in-<community>
    // and /buying-property-in-dubai-as-<citizen> earlier today. The
    // dynamic segment was greedy-matching unrelated short paths so the
    // structure was changed to /<prefix>/<dynamic>. 301 the old URLs.
    return [
      // Old binayah.com WordPress had a /downloads/ page (brochures).
      // Redirect to /services to recover any backlink value.
      { source: "/downloads", destination: "/services", permanent: true },
      { source: "/downloads/", destination: "/services", permanent: true },
      // Guides live at /pulse/guides — catch bare /guides (bookmarks, old links).
      { source: "/guides", destination: "/pulse/guides", permanent: true },
      { source: "/guides/:slug", destination: "/pulse/guides/:slug", permanent: true },
      // The auto-generated weekly market report is also servable at /news/<slug>
      // (any Article is), which duplicated the canonical /pulse/reports/<slug>.
      // 301 the date-pattern report slug so only /pulse/reports/ is indexed.
      { source: "/news/market-report-:date(\\d{4}-\\d{2}-\\d{2})", destination: "/pulse/reports/market-report-:date", permanent: true },
      { source: "/:locale(ar|ru|zh|vi|he|fr)/news/market-report-:date(\\d{4}-\\d{2}-\\d{2})", destination: "/:locale/pulse/reports/market-report-:date", permanent: true },
      // New SEO-friendly report slug (dubai-property-market-report-<date>): same
      // /news → /pulse/reports canonicalisation.
      { source: "/news/dubai-property-market-report-:date(\\d{4}-\\d{2}-\\d{2})", destination: "/pulse/reports/dubai-property-market-report-:date", permanent: true },
      { source: "/:locale(ar|ru|zh|vi|he|fr)/news/dubai-property-market-report-:date(\\d{4}-\\d{2}-\\d{2})", destination: "/:locale/pulse/reports/dubai-property-market-report-:date", permanent: true },
      // Legal pages use full slugs — catch the short forms.
      { source: "/privacy", destination: "/privacy-policy", permanent: true },
      { source: "/terms", destination: "/terms-of-service", permanent: true },
      // Duplicate community docs — the same area exists under multiple slugs.
      // For arjan/downtown/the-valley the content lives on the "-dubai" slug, so
      // 301 the thin bare slug to it.
      { source: "/communities/arjan", destination: "/communities/arjan-dubai", permanent: true },
      { source: "/communities/downtown", destination: "/communities/downtown-dubai", permanent: true },
      { source: "/communities/the-valley", destination: "/communities/the-valley-dubai", permanent: true },
      { source: "/:locale(ar|ru|zh|vi|he|fr)/communities/arjan", destination: "/:locale/communities/arjan-dubai", permanent: true },
      { source: "/:locale(ar|ru|zh|vi|he|fr)/communities/downtown", destination: "/:locale/communities/downtown-dubai", permanent: true },
      { source: "/:locale(ar|ru|zh|vi|he|fr)/communities/the-valley", destination: "/:locale/communities/the-valley-dubai", permanent: true },
      // Meydan & MBR City are the reverse: the ENRICHED, content-bearing page lives
      // on the clean/correct-spelling slug (meydan, mohammed-bin-rashid-city), so
      // 301 the thin/mis-spelled duplicates TO it.
      { source: "/communities/meydan-dubai", destination: "/communities/meydan", permanent: true },
      { source: "/communities/mohammad-bin-rashid-city", destination: "/communities/mohammed-bin-rashid-city", permanent: true },
      { source: "/communities/mohd-bin-rashid-city", destination: "/communities/mohammed-bin-rashid-city", permanent: true },
      { source: "/:locale(ar|ru|zh|vi|he|fr)/communities/meydan-dubai", destination: "/:locale/communities/meydan", permanent: true },
      { source: "/:locale(ar|ru|zh|vi|he|fr)/communities/mohammad-bin-rashid-city", destination: "/:locale/communities/mohammed-bin-rashid-city", permanent: true },
      { source: "/:locale(ar|ru|zh|vi|he|fr)/communities/mohd-bin-rashid-city", destination: "/:locale/communities/mohammed-bin-rashid-city", permanent: true },
      // JVC, Damac Hills and Dubai Production City have thin / legacy-name dupes
      // (jvc; akoya = old Damac Hills name; impz = old Dubai Production City name)
      // — 301 each to its enriched canonical page.
      { source: "/communities/jvc", destination: "/communities/jumeirah-village-circle", permanent: true },
      { source: "/communities/akoya-damac-hills", destination: "/communities/damac-hills", permanent: true },
      { source: "/communities/impz-dubai", destination: "/communities/dubai-production-city", permanent: true },
      { source: "/:locale(ar|ru|zh|vi|he|fr)/communities/jvc", destination: "/:locale/communities/jumeirah-village-circle", permanent: true },
      { source: "/:locale(ar|ru|zh|vi|he|fr)/communities/akoya-damac-hills", destination: "/:locale/communities/damac-hills", permanent: true },
      { source: "/:locale(ar|ru|zh|vi|he|fr)/communities/impz-dubai", destination: "/:locale/communities/dubai-production-city", permanent: true },
      // Batch-3 dupes: Port Rashid = Mina Rashid (mina=port); Arabian Ranches 1 =
      // the original Arabian Ranches (empty dupe). 301 to the enriched canonical.
      { source: "/communities/port-rashid", destination: "/communities/mina-rashid", permanent: true },
      { source: "/communities/arabian-ranches-1", destination: "/communities/arabian-ranches", permanent: true },
      { source: "/:locale(ar|ru|zh|vi|he|fr)/communities/port-rashid", destination: "/:locale/communities/mina-rashid", permanent: true },
      { source: "/:locale(ar|ru|zh|vi|he|fr)/communities/arabian-ranches-1", destination: "/:locale/communities/arabian-ranches", permanent: true },
      {
        source: "/buy-property-in-:community",
        destination: "/buy-property-in/:community",
        permanent: true,
      },
      {
        source: "/:locale(ar|ru|zh|vi)/buy-property-in-:community",
        destination: "/:locale/buy-property-in/:community",
        permanent: true,
      },
      {
        source: "/buying-property-in-dubai-as-:citizen",
        destination: "/buying-property-in-dubai-as/:citizen",
        permanent: true,
      },
      {
        source: "/:locale(ar|ru|zh|vi)/buying-property-in-dubai-as-:citizen",
        destination: "/:locale/buying-property-in-dubai-as/:citizen",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "binayah.ae" },
      { protocol: "https", hostname: "www.binayah.ae" },
      { protocol: "https", hostname: "binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com" },
      { protocol: "https", hostname: "binayah-media-456051253184-us-east-1-an.s3.amazonaws.com" },
      { protocol: "https", hostname: "binayah-images.s3.ap-south-1.amazonaws.com" },
      { protocol: "https", hostname: "sm-automation-5464.s3.ap-south-1.amazonaws.com" },
      { protocol: "https", hostname: "sm-automation-5464.s3.amazonaws.com" },
      { protocol: "https", hostname: "api.qrserver.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "manage.tanamiproperties.com" },
      { protocol: "https", hostname: "tanamiproperties.com" },
      { protocol: "https", hostname: "keyone.com" },
      { protocol: "https", hostname: "www.keyone.com" },
      { protocol: "https", hostname: "stageproperties.com" },
      { protocol: "https", hostname: "www.stageproperties.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "commons.wikimedia.org" },
      { protocol: "https", hostname: "cdn.prod.website-files.com" },
      { protocol: "https", hostname: "www.modon.com" },
      { protocol: "https", hostname: "sherwoodsproperty.com" },
      { protocol: "https", hostname: "abudhabioffplan.ae" },
    ],
    formats: ["image/avif", "image/webp"],
    // Optimized listing/project thumbnails are content-stable (new photos get
    // new S3 URLs), so cache them 30 days instead of 1 — fewer re-optimizations
    // and better repeat-visit performance ("efficient cache lifetimes").
    minimumCacheTTL: 2592000,
  },
  webpack: (config) => {
    // The self-hosted runner that builds binayah.ru has a tiny disk (8.7GB).
    // Webpack's persistent filesystem cache (.next/cache) grows to 400MB+ and
    // overflowed the disk mid-build, leaving a broken deploy. Disable it in CI.
    if (process.env.DISABLE_WEBPACK_CACHE === "1") {
      config.cache = false;
    }
    return config;
  },
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
