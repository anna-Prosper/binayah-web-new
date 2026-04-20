import CommunitiesPageClient from "@/app/communities/CommunitiesPageClient";
import { serverApiUrl, serverFetch } from "@/lib/api";

export const revalidate = 3600;

export default async function CommunitiesPage() {
  let communities: any[] = [];
  try {
    const res = await serverFetch(serverApiUrl("/api/communities"));
    if (res.ok) {
      communities = await res.json();
    }
  } catch (err) {
    console.warn("[CommunitiesPage] API unavailable:", (err as Error).message);
  }

  return <CommunitiesPageClient communities={communities} />;
}
