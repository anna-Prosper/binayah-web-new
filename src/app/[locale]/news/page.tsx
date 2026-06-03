import NewsPageClient from "@/app/_clients/news/NewsPageClient";
import { serverApiUrl, serverFetch } from "@/lib/api";
import type { Metadata } from "next";

export const revalidate = 900;

export const metadata: Metadata = {
  title: "Dubai Real Estate News & Market Reports | Binayah Properties",
  description: "Stay ahead of the Dubai property market with the latest news, market reports and investment insights from Binayah's editorial team.",
  alternates: {
    canonical: "https://www.binayah.ae/en/news",
    languages: { en: "https://www.binayah.ae/en/news", ru: "https://www.binayah.ae/ru/news", ar: "https://www.binayah.ae/ar/news", zh: "https://www.binayah.ae/zh/news", "x-default": "https://www.binayah.ae/en/news" },
  },
  openGraph: { title: "Dubai Real Estate News | Binayah Properties", description: "Latest Dubai property market news and analysis.", url: "https://www.binayah.ae/en/news", type: "website" },
};

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function NewsPage({ params }: Props) {
  const { locale } = await params;
  let articles: any[] = [];
  try {
    const res = await serverFetch(serverApiUrl(`/api/news?lang=${locale}`));
    if (res.ok) {
      articles = await res.json();
    }
  } catch (err) {
    console.warn("[NewsPage] API unavailable:", (err as Error).message);
  }

  return <NewsPageClient articles={articles} />;
}
