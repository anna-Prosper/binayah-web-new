import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "binayah.com" },
      { protocol: "https", hostname: "www.binayah.com" },
    ],
  },
};

export default nextConfig;