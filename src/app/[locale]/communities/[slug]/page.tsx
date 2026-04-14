import CommunityDetailClient from "@/app/communities/[slug]/CommunityDetailClient";
import { notFound } from "next/navigation";
import { serverApiUrl, serverFetch } from "@/lib/api";

export const revalidate = 60;

export default async function CommunityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let community: any = null;
  let projects: any[] = [];

  try {
    const res = await serverFetch(serverApiUrl(`/api/communities/${slug}`));
    if (res.status === 404) return notFound();
    if (res.ok) {
      const data = await res.json();
      community = data.community;
      projects = data.projects || [];
    }
  } catch (err) {
    console.warn("[CommunityPage] API unavailable:", (err as Error).message);
  }

  if (!community) return notFound();

  const communityName =
    community.name ||
    slug.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());

  return (
    <CommunityDetailClient
      slug={slug}
      communityName={communityName}
      communityDescription={community.description?.replace(/<[^>]*>/g, "") || ""}
      communityImage={community.imageGallery?.[0] || community.featuredImage || ""}
      projects={projects}
    />
  );
}
