import { ValuationPage } from "@/components/valuation";

export const revalidate = 86400;

export const metadata = {
  title: "Free Property Valuation Dubai | AI-Powered Instant Estimate | Binayah",
  description: "Get an instant AI-powered property valuation for Dubai and UAE real estate. Free, accurate, no registration required.",
  alternates: {
    canonical: "https://www.binayah.ae/en/valuation",
    languages: { en: "https://www.binayah.ae/en/valuation", ru: "https://www.binayah.ae/ru/valuation", ar: "https://www.binayah.ae/ar/valuation", zh: "https://www.binayah.ae/zh/valuation", "x-default": "https://www.binayah.ae/en/valuation" },
  },
};

export default function Page() {
  return <ValuationPage />;
}
