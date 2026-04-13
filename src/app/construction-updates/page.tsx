import { connectDB } from "@/lib/mongodb";
import ConstructionUpdate from "@/models/ConstructionUpdate";
import ConstructionUpdatesClient from "./ConstructionUpdatesClient";

export const revalidate = 300;

export const metadata = {
  title: "Construction Updates | Binayah Properties",
  description: "Track the latest construction progress of Dubai's top off-plan projects. Real-time updates, completion timelines, and developer information.",
};

export default async function ConstructionUpdatesPage() {
  await connectDB();
  const updates = await ConstructionUpdate.find()
    .sort({ progress: 1, publishedAt: -1 })
    .lean();

  const serialized = JSON.parse(JSON.stringify(updates));
  return <ConstructionUpdatesClient updates={serialized} />;
}
