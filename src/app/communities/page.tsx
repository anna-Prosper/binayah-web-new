import CommunitiesPageClient from "./CommunitiesPageClient";
import { serverApiUrl } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function CommunitiesPage() {
  let communities: any[] = [];
  try {
    const res = await fetch(serverApiUrl("/api/communities"));
    if (res.ok) {
      communities = await res.json();
    }
  } catch (err) {
    console.warn("[CommunitiesPage] API unavailable:", (err as Error).message);
  }

  return <CommunitiesPageClient communities={communities} />;
}
