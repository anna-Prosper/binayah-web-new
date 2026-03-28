import type { Metadata } from "next";
import { ValuationPage } from "@/components/valuation";

export const metadata: Metadata = {
  title: "Instant Property Valuation | Binayah Properties Dubai",
  description: "Get an AI-powered property valuation for your UAE property in under 2 minutes. Fair value, suggested list price and quick-sale range based on live market data.",
  alternates: { canonical: "https://binayah.com/valuation" },
  openGraph: {
    title: "Instant Property Valuation | Binayah Properties Dubai",
    description: "AI-powered property valuation based on live Dubai market data. Free, instant, no signup required.",
    url: "https://binayah.com/valuation",
    type: "website",
    images: [{ url: "/assets/og-default.jpg", width: 1200, height: 630, alt: "Property Valuation — Binayah Properties" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Instant Property Valuation | Binayah Properties",
    description: "AI-powered property valuation based on live Dubai market data.",
    images: ["/assets/og-default.jpg"],
  },
};

export default function Page() {
  return <ValuationPage />;
}
