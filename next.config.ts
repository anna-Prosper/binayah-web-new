import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";
import createNextIntlPlugin from "next-intl/plugin";

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
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
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
      { protocol: "https", hostname: "binayah.com" },
      { protocol: "https", hostname: "www.binayah.com" },
      { protocol: "https", hostname: "binayah.ae" },
      { protocol: "https", hostname: "www.binayah.ae" },
      { protocol: "https", hostname: "wp.binayah.com" },
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
    minimumCacheTTL: 86400,
  },
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
