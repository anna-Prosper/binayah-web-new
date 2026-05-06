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
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "binayah.com" },
      { protocol: "https", hostname: "www.binayah.com" },
      { protocol: "https", hostname: "binayah.ae" },
      { protocol: "https", hostname: "www.binayah.ae" },
      { protocol: "https", hostname: "wp.binayah.com" },
      { protocol: "https", hostname: "binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com" },
      { protocol: "https", hostname: "binayah-images.s3.ap-south-1.amazonaws.com" },
      { protocol: "https", hostname: "sm-automation-5464.s3.ap-south-1.amazonaws.com" },
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
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
  },
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
