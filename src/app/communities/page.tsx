import CommunitiesPageClient from "./CommunitiesPageClient";
import { serverApiUrl } from "@/lib/api";

export const revalidate = 300;

export default async function CommunitiesPage() {
  let communities: any[] = [];
  try {
    const res = await fetch(serverApiUrl("/api/communities"), {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      communities = await res.json();
    }
  } catch (err) {
    console.warn("[CommunitiesPage] API unavailable:", (err as Error).message);
  }

  return <CommunitiesPageClient communities={communities} />;
}
