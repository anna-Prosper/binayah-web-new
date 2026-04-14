import DevelopersPageClient from "./DevelopersPageClient";
import { serverApiUrl } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function DevelopersPage() {
  let initialDevelopers: any[] = [];
  let totalCount = 0;

  try {
    const res = await fetch(serverApiUrl("/api/developers?limit=200"));
    if (res.ok) {
      const data = await res.json();
      initialDevelopers = Array.isArray(data) ? data : [];
      totalCount = initialDevelopers.length;
    }
  } catch (err) {
    console.warn("[DevelopersPage] API unavailable:", (err as Error).message);
  }

  return (
    <DevelopersPageClient
      initialDevelopers={initialDevelopers}
      totalCount={totalCount}
    />
  );
}
