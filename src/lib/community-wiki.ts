import { cache } from "react";
import { unstable_cache } from "next/cache";
import clientPromise from "@/lib/mongodb";

// Legacy scraped "wiki" doc (community_info_pages). Read in BOTH
// generateMetadata and the page body of the community route — dedupe within a
// request via cache() and across requests via unstable_cache, so it's one Mongo
// query per view instead of two. Project out _id so the result is
// JSON-serialisable for unstable_cache.
//
// Kept in its own module (not @/lib/api) because it imports the mongodb driver,
// which can't be bundled into the edge-runtime opengraph-image route that also
// pulls from @/lib/api.
const _communityWikiCached = unstable_cache(
  async (slug: string) => {
    const client = await clientPromise;
    return client
      .db("binayah_web_new_dev")
      .collection("community_info_pages")
      .findOne({ slug }, { projection: { _id: 0 } });
  },
  ["community-wiki"],
  { revalidate: 3600 }
);

export const getCommunityWiki = cache(async (slug: string) => {
  try {
    return await _communityWikiCached(slug);
  } catch {
    return null;
  }
});
