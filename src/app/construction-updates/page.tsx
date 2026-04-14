import ConstructionUpdatesClient from "./ConstructionUpdatesClient";
import { serverApiUrl } from "@/lib/api";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Construction Updates | Binayah Properties",
  description: "Track the latest construction progress of Dubai's top off-plan projects. Real-time updates, completion timelines, and developer information.",
};

export default async function ConstructionUpdatesPage() {
  let updates: any[] = [];
  try {
    const res = await fetch(serverApiUrl("/api/construction-updates"));
    if (res.ok) {
      updates = await res.json();
    }
  } catch (err) {
    console.warn("[ConstructionUpdatesPage] API unavailable:", (err as Error).message);
  }

  return <ConstructionUpdatesClient updates={updates} />;
}
