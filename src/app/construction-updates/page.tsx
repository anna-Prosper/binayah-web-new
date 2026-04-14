import ConstructionUpdatesClient from "./ConstructionUpdatesClient";
import { serverApiUrl, serverFetch } from "@/lib/api";

export const revalidate = 60;

export const metadata = {
  title: "Construction Updates | Binayah Properties",
  description: "Track the latest construction progress of Dubai's top off-plan projects. Real-time updates, completion timelines, and developer information.",
};

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
