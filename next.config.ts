import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "binayah.com" },
      { protocol: "https", hostname: "www.binayah.com" },
      { protocol: "https", hostname: "wp.binayah.com" },
      { protocol: "https", hostname: "binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com" },
      { protocol: "https", hostname: "binayah-images.s3.ap-south-1.amazonaws.com" },
      { protocol: "https", hostname: "api.qrserver.com" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
  },
};

export default withBundleAnalyzer(nextConfig);
