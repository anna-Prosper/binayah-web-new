import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";
import Community from "@/models/Community";
import CommunityDetailClient from "./CommunityDetailClient";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const CARD_FIELDS = "name slug status developerName community startingPrice completionDate shortOverview featuredImage imageGallery";

export default async function CommunityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  await connectDB();

  // Get community from DB
  const community = await Community.findOne({ slug, publishStatus: "Published" }).lean();
  const communityName = community?.name || slug.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());

  // Match projects by: community field, name containing community, or areas containing community
  const projects = await Project.find({
    publishStatus: "Published",
    $or: [
      { community: communityName },
      { community: { $regex: communityName, $options: "i" } },
      { name: { $regex: communityName, $options: "i" } },
      { areas: communityName },
    ],
  })
    .select(CARD_FIELDS)
    .sort({ createdAt: -1 })
    .limit(60)
    .lean();

  const serialized = JSON.parse(JSON.stringify(projects));
  return (
    <CommunityDetailClient
      slug={slug}
      communityName={communityName}
      communityDescription={community?.description?.replace(/<[^>]*>/g, "") || ""}
      communityImage={community?.imageGallery?.[0] || community?.featuredImage || ""}
      projects={serialized}
    />
  );
}
