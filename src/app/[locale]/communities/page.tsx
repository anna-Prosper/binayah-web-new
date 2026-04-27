import CommunitiesPageClient from "@/app/communities/CommunitiesPageClient";
import { serverApiUrl, serverFetch } from "@/lib/api";
import clientPromise from "@/lib/mongodb";

export const revalidate = 3600;

export type CommunityCard = {
  slug: string;
  name: string;
  description?: string;
  thumbnail?: string;
  hasListings: boolean;
  hasGuide: boolean;
};

export default async function CommunitiesPage() {
  // Fetch DB communities (off-plan projects / listings-backed entries)
  let dbCommunities: any[] = [];
  try {
    const res = await serverFetch(serverApiUrl("/api/communities"));
    if (res.ok) {
      dbCommunities = await res.json();
    }
  } catch (err) {
    console.warn("[CommunitiesPage] API unavailable:", (err as Error).message);
  }

  // Fetch scraped community_info_pages directly from MongoDB
  let wikiCommunities: Array<{
    slug: string;
    name: string;
    description?: string;
    heroImage?: string;
    location?: string;
  }> = [];
  try {
    const client = await clientPromise;
    const db = client.db("binayah_web_new_dev");
    const docs = await db
      .collection("community_info_pages")
      .find({})
      .project({ slug: 1, name: 1, description: 1, heroImage: 1, location: 1, _id: 0 })
      .toArray();
    wikiCommunities = docs as typeof wikiCommunities;
  } catch (err) {
    console.warn(
      "[CommunitiesPage] community_info_pages lookup failed:",
      (err as Error).message
    );
  }

  // Build a slug-keyed map from DB entries
  const dbMap = new Map<string, any>();
  for (const c of dbCommunities) {
    if (c.slug) dbMap.set(c.slug, c);
  }

  // Build merged list — DB slugs take precedence
  const merged: CommunityCard[] = [];
  const seen = new Set<string>();

  // First pass: DB communities (may also have a wiki counterpart)
  for (const c of dbCommunities) {
    if (!c.slug) continue;
    const wiki = wikiCommunities.find((w) => w.slug === c.slug);
    merged.push({
      slug: c.slug,
      name: c.name || c.slug,
      description: wiki?.description
        ? wiki.description.replace(/<[^>]*>/g, "").slice(0, 200)
        : c.description
        ? (c.description as string).replace(/<[^>]*>/g, "").slice(0, 200)
        : undefined,
      // Best available image: DB gallery > DB featured > wiki hero
      thumbnail:
        c.imageGallery?.[0] || c.featuredImage || wiki?.heroImage || undefined,
      hasListings: true,
      hasGuide: !!wiki,
    });
    seen.add(c.slug);
  }

  // Second pass: wiki-only entries (slugs not in DB)
  for (const w of wikiCommunities) {
    if (!w.slug || seen.has(w.slug)) continue;
    merged.push({
      slug: w.slug,
      name: w.name || w.slug,
      description: w.description
        ? w.description.replace(/<[^>]*>/g, "").slice(0, 200)
        : undefined,
      thumbnail: w.heroImage || undefined,
      hasListings: false,
      hasGuide: true,
    });
    seen.add(w.slug);
  }

  return <CommunitiesPageClient communities={merged} />;
}
