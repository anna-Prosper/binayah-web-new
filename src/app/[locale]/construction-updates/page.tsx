import ConstructionUpdatesClient from "@/app/_clients/construction-updates/ConstructionUpdatesClient";
import { serverApiUrl, serverFetch } from "@/lib/api";
import type { Metadata } from "next";
import { canonical, altLangs } from "@/lib/site";

export const revalidate = 600;

interface Props { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Construction Updates | Dubai Off-Plan Projects | Binayah",
    description: "Track the latest construction progress of Dubai's top off-plan projects. Real-time updates, completion timelines, and developer information.",
    alternates: {
      canonical: canonical(locale, "/construction-updates"),
      languages: altLangs("/construction-updates"),
    },
    openGraph: {
      title: "Construction Updates | Binayah Properties",
      url: canonical(locale, "/construction-updates"),
      type: "website",
      images: [{ url: "/assets/og-image.webp", width: 1200, height: 630 }],
    },
  };
}

export default async function ConstructionUpdatesPage() {
  let updates: any[] = [];
  try {
    const res = await serverFetch(serverApiUrl("/api/construction-updates"));
    if (res.ok) {
      updates = await res.json();
    }
  } catch (err) {
    console.warn("[ConstructionUpdatesPage] API unavailable:", (err as Error).message);
  }

  return <ConstructionUpdatesClient updates={updates} />;
}
