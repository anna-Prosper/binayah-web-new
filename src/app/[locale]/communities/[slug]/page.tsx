import CommunityDetailClient from "@/app/communities/[slug]/CommunityDetailClient";
import CommunityInfoDetailClient from "@/components/CommunityInfoDetailClient";
import CommunityMergedDetailClient from "@/app/communities/[slug]/CommunityMergedDetailClient";
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

  // 1. Fetch both sources in parallel
  const [wikiResult, dbResult] = await Promise.allSettled([
    (async () => {
      const client = await clientPromise;
      const db = client.db("binayah_web_new_dev");
      return db
        .collection<CommunityInfoPage>("community_info_pages")
        .findOne({ slug });
    })(),
    getCommunity(slug),
  ]);

  const communityInfoDoc =
    wikiResult.status === "fulfilled" ? wikiResult.value : null;
  if (wikiResult.status === "rejected") {
    console.error(
      "[communities/slug] community_info_pages lookup failed:",
      wikiResult.reason
    );
  }

  const dbData = dbResult.status === "fulfilled" ? dbResult.value : null;
  if (dbResult.status === "rejected") {
    console.error("[communities/slug] DB community lookup failed:", dbResult.reason);
  }

  const hasWiki = !!communityInfoDoc;
  const hasDb = !!(dbData?.community);

  // 2. Nothing found → 404
  if (!hasWiki && !hasDb) return notFound();

  // 3. Both present → merged page
  if (hasWiki && hasDb) {
    const { community, projects } = dbData!;

    const communityName =
      community.name ||
      slug.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());

    // Serialize wiki doc — strip _id (ObjectId) and scrapedAt (Date)
    const serialized: Omit<CommunityInfoPage, "scrapedAt"> = {
      slug: communityInfoDoc!.slug,
      name: communityInfoDoc!.name,
      location: communityInfoDoc!.location,
      description: communityInfoDoc!.description,
      developerName: communityInfoDoc!.developerName,
      heroImage: communityInfoDoc!.heroImage,
      amenities: communityInfoDoc!.amenities,
      priceRange: communityInfoDoc!.priceRange,
      sources: communityInfoDoc!.sources,
    };

    // Serialize projects — strip _id, Date fields and non-serializable types
    const serializedProjects = (projects || []).map((p: any) => ({
      slug: p.slug ?? null,
      name: p.name ?? null,
      developerName: p.developerName ?? null,
      featuredImage: p.featuredImage ?? null,
      imageGallery: Array.isArray(p.imageGallery) ? p.imageGallery : [],
      status: p.status ?? null,
      startingPrice: p.startingPrice ?? null,
      currency: p.currency ?? null,
      completionDate: p.completionDate
        ? typeof p.completionDate === "string"
          ? p.completionDate
          : new Date(p.completionDate).toISOString()
        : null,
    }));

    return (
      <CommunityMergedDetailClient
        community={serialized}
        communityName={communityName}
        projects={serializedProjects}
        locale={locale}
      />
    );
  }

  // 4. Only wiki → existing CommunityInfoDetailClient
  if (hasWiki) {
    const serialized: Omit<CommunityInfoPage, "scrapedAt"> = {
      slug: communityInfoDoc!.slug,
      name: communityInfoDoc!.name,
      location: communityInfoDoc!.location,
      description: communityInfoDoc!.description,
      developerName: communityInfoDoc!.developerName,
      heroImage: communityInfoDoc!.heroImage,
      amenities: communityInfoDoc!.amenities,
      priceRange: communityInfoDoc!.priceRange,
      sources: communityInfoDoc!.sources,
    };
    return <CommunityInfoDetailClient community={serialized} locale={locale} />;
  }

  // 5. Only DB → existing CommunityDetailClient
  const { community, projects } = dbData!;
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
