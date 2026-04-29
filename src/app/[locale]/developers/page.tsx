import DevelopersPageClient from "@/app/developers/DevelopersPageClient";
import { serverApiUrl, serverFetch } from "@/lib/api";

export const revalidate = 3600;

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
