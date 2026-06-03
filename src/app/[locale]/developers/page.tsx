import DevelopersPageClient from "@/app/_clients/developers/DevelopersPageClient";
import { serverApiUrl, serverFetch } from "@/lib/api";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Dubai Property Developers | Binayah Properties",
  description: "Browse top Dubai real estate developers — Emaar, DAMAC, Nakheel, Meraas, Aldar and more. Find off-plan and ready projects by developer.",
  alternates: {
    canonical: "https://www.binayah.ae/en/developers",
    languages: { en: "https://www.binayah.ae/en/developers", ru: "https://www.binayah.ae/ru/developers", ar: "https://www.binayah.ae/ar/developers", zh: "https://www.binayah.ae/zh/developers", "x-default": "https://www.binayah.ae/en/developers" },
  },
  openGraph: { title: "Dubai Property Developers | Binayah Properties", description: "Find off-plan and ready projects by top Dubai developers.", url: "https://www.binayah.ae/en/developers", type: "website" },
};

const BATCH_SIZE = 24;

export default async function DevelopersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Math.min(50, parseInt(sp.page ?? "1") || 1));
  const limit = page * BATCH_SIZE;

  let initialDevelopers: any[] = [];
  let totalCount = 0;

  try {
    const res = await serverFetch(serverApiUrl(`/api/developers?limit=${limit}`));
    if (res.ok) {
      const data = await res.json();
      initialDevelopers = Array.isArray(data) ? data : [];
      // Upper-bound — the client confirms when batches return empty.
      totalCount = initialDevelopers.length === limit ? Math.max(500, limit) : initialDevelopers.length;
    }
  } catch (err) {
    console.warn("[DevelopersPage] API unavailable:", (err as Error).message);
  }

  return (
    <DevelopersPageClient
      initialDevelopers={initialDevelopers}
      totalCount={totalCount}
      initialPage={page}
      batchSize={BATCH_SIZE}
    />
  );
}
