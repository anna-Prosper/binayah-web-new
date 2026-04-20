import CommunityDetailClient from "@/app/communities/[slug]/CommunityDetailClient";
import { notFound } from "next/navigation";
import { getCommunity } from "@/lib/api";

export const revalidate = 3600;

export default async function CommunityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const data = await getCommunity(slug);

  if (!data || !data.community) return notFound();

  const { community, projects } = data;

  const communityName =
    community.name ||
    slug.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());

  return (
    <CommunityDetailClient
      slug={slug}
      communityName={communityName}
      communityDescription={community.description?.replace(/<[^>]*>/g, "") || ""}
      communityImage={community.imageGallery?.[0] || community.featuredImage || ""}
      projects={projects || []}
    />
  );
}
