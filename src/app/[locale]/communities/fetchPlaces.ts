import { serverApiUrl, serverFetch } from "@/lib/api";
import clientPromise from "@/lib/mongodb";

export type PlaceKind = "community" | "area";

export type PlaceCard = {
  slug: string;
  name: string;
  description?: string;
  thumbnail?: string;
  hasListings: boolean;
  hasGuide: boolean;
};

interface DbCommunity {
  slug?: string;
  name?: string;
  description?: string;
  featuredImage?: string;
  imageGallery?: string[];
  placeKind?: "community" | "area" | "both" | null;
}

interface WikiCommunity {
  slug: string;
  name?: string;
  description?: string;
  heroImage?: string;
  location?: string;
  placeKind?: "community" | "area" | "both" | null;
}

// Fetch + merge listings-backed communities and wiki community_info_pages,
// filtered to the requested place kind. Documents marked 'both' appear in
// both /communities and /areas. Documents with placeKind null are treated
// as 'community' for back-compat (legacy data pre-classification).
export async function fetchPlaceCards(kind: PlaceKind): Promise<PlaceCard[]> {
  let dbCommunities: DbCommunity[] = [];
  try {
    const res = await serverFetch(serverApiUrl(`/api/communities?kind=${kind}`));
    if (res.ok) {
      dbCommunities = (await res.json()) as DbCommunity[];
    }
  } catch (err) {
    console.warn("[fetchPlaceCards] API unavailable:", (err as Error).message);
  }

  let wikiCommunities: WikiCommunity[] = [];
  try {
    const client = await clientPromise;
    const db = client.db("binayah_web_new_dev");
    const filter =
      kind === "community"
        ? { placeKind: { $in: ["community", "both", null] } }
        : { placeKind: { $in: ["area", "both"] } };
    const docs = await db
      .collection("community_info_pages")
      .find(filter)
      .project({
        slug: 1,
        name: 1,
        description: 1,
        heroImage: 1,
        location: 1,
        placeKind: 1,
        _id: 0,
      })
      .toArray();
    wikiCommunities = docs as WikiCommunity[];
  } catch (err) {
    console.warn(
      "[fetchPlaceCards] community_info_pages lookup failed:",
      (err as Error).message
    );
  }

  const merged: PlaceCard[] = [];
  const seen = new Set<string>();

  for (const c of dbCommunities) {
    if (!c.slug) continue;
    const wiki = wikiCommunities.find((w) => w.slug === c.slug);
    merged.push({
      slug: c.slug,
      name: c.name || c.slug,
      description: wiki?.description
        ? wiki.description.replace(/<[^>]*>/g, "").slice(0, 200)
        : c.description
        ? c.description.replace(/<[^>]*>/g, "").slice(0, 200)
        : undefined,
      thumbnail:
        c.featuredImage || wiki?.heroImage || c.imageGallery?.[0] || undefined,
      hasListings: true,
      hasGuide: !!wiki,
    });
    seen.add(c.slug);
  }

  // Wiki-only entries (no DB community record) are excluded here because their
  // /communities/[slug] pages now return 404 — they duplicate Wikipedia content
  // with no Binayah inventory. Only DB-backed communities (with inventory) are
  // listed; the wiki data enriches them above via the `wiki` lookup.

  return merged;
}
