import { connectDB } from "@/lib/mongodb";
import Community from "@/models/Community";
import CommunitiesPageClient from "./CommunitiesPageClient";

export const revalidate = 300;

export default async function CommunitiesPage() {
  await connectDB();
  const communities = await Community.find({ publishStatus: "published" })
    .select("name slug description featuredImage imageGallery viewCount")
    .sort({ createdAt: -1 })
    .lean();

  const serialized = JSON.parse(JSON.stringify(communities));
  return <CommunitiesPageClient communities={serialized} />;
}
