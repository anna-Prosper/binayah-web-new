import { connectDB } from "@/lib/mongodb";
import ConstructionUpdate from "@/models/ConstructionUpdate";
import { notFound } from "next/navigation";
import ConstructionUpdateDetailClient from "./ConstructionUpdateDetailClient";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await connectDB();
  const update = await ConstructionUpdate.findOne({ slug }).lean();
  if (!update) return { title: "Not Found" };
  const u = update as any;
  return {
    title: `${u.title} Construction Update | Binayah Properties`,
    description: `Track construction progress of ${u.title} by ${u.developerName}. Currently at ${u.progress ?? 0}% completion.`,
  };
}

export default async function ConstructionUpdatePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  await connectDB();
  const update = await ConstructionUpdate.findOne({ slug }).lean();
  if (!update) notFound();

  // Get related updates from same developer
  const u = update as any;
  const related = await ConstructionUpdate.find({
    developerName: u.developerName,
    slug: { $ne: slug },
  })
    .sort({ progress: 1 })
    .limit(6)
    .lean();

  return (
    <ConstructionUpdateDetailClient
      update={JSON.parse(JSON.stringify(update))}
      related={JSON.parse(JSON.stringify(related))}
    />
  );
}
