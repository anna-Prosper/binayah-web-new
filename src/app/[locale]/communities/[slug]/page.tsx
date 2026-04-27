import CommunityDetailClient from "@/app/communities/[slug]/CommunityDetailClient";
import CommunityInfoDetailClient from "@/components/CommunityInfoDetailClient";
import { notFound } from "next/navigation";
import { getCommunity } from "@/lib/api";
import clientPromise from "@/lib/mongodb";
import type { CommunityInfoPage } from "@/lib/communityScraper";

export const revalidate = 3600;

export default async function CommunityPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;

  // 1. Check community_info_pages first (scraped community info docs)
  try {
    const client = await clientPromise;
    const db = client.db("binayah_web_new_dev");
    const communityInfoDoc = await db
      .collection<CommunityInfoPage>("community_info_pages")
      .findOne({ slug });

    if (communityInfoDoc) {
      // Serialize MongoDB doc — strip _id (ObjectId) and scrapedAt (Date),
      // neither of which is JSON-serializable across the RSC boundary, and
      // neither is used by CommunityInfoDetailClient.
      const serialized: Omit<CommunityInfoPage, "scrapedAt"> = {
        slug: communityInfoDoc.slug,
        name: communityInfoDoc.name,
        location: communityInfoDoc.location,
        description: communityInfoDoc.description,
        developerName: communityInfoDoc.developerName,
        heroImage: communityInfoDoc.heroImage,
        amenities: communityInfoDoc.amenities,
        priceRange: communityInfoDoc.priceRange,
        sources: communityInfoDoc.sources,
      };
      return <CommunityInfoDetailClient community={serialized} locale={locale} />;
    }
  } catch (err) {
    // DB error — fall through to existing community lookup
    console.error("[communities/slug] community_info_pages lookup failed:", err);
  }

  // 2. Fall back to existing community/projects lookup (Fastify API)
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
