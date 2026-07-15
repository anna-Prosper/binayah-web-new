import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { scrapeCommunityInfo, toSlug, type CommunityInfoPage } from "@/lib/communityScraper";
import { BUY_COMMUNITIES } from "@/lib/buy-communities";

// Ensure the slug unique index exists (idempotent — safe to call on every cold start)
async function ensureIndex() {
  try {
    const client = await clientPromise;
    const db = client.db("binayah_web_new_dev");
    await db.collection("community_info_pages").createIndex({ slug: 1 }, { unique: true });
  } catch {
    // Non-fatal — index may already exist
  }
}

let indexEnsured = false;

// Slugs that must never be cached — non-community Wikipedia articles that users
// have accidentally triggered by typing irrelevant queries.
const BLOCKLIST = new Set([
  "communities-in-dubai", "emaar-properties", "danube-dubai-metro", "dubai",
  "burj-binghatti-jacob-co-residences", "dubai-creek-tower",
  "dubai-international-terminal-3", "burj-vista", "marina-101", "sharjah",
  "marina-106", "dubai-miracle-garden", "united-arab-emirates",
  "emirates-airline", "al-wasl-fc",
]);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 3) {
    return NextResponse.json({ exists: false });
  }

  // Ensure slug index once per cold-start (best-effort — don't block on failure)
  if (!indexEnsured) {
    try {
      await ensureIndex();
    } catch {
      // Non-fatal
    }
    indexEnsured = true;
  }

  try {
    const slug = toSlug(q);
    if (BLOCKLIST.has(slug)) return NextResponse.json({ exists: false });

    // Run cache lookup and DB community check in parallel.
    let cached: CommunityInfoPage | null = null;
    let hasDbCommunity = false;
    try {
      const client = await clientPromise;
      const db = client.db("binayah_web_new_dev");
      const [cachedDoc, dbCommunityDoc] = await Promise.all([
        db.collection<CommunityInfoPage>("community_info_pages").findOne({ slug }),
        // Check if a published DB community record exists — used by the UI to
        // decide whether /communities/[slug] is safe to link to.
        db.collection("communities").findOne({ slug, publishStatus: "published" }, { projection: { _id: 1 } }),
      ]);
      cached = cachedDoc;
      hasDbCommunity = !!dbCommunityDoc;
    } catch (dbErr) {
      console.warn("[community-info] MongoDB lookup failed (will continue):", dbErr);
    }

    if (cached) {
      return NextResponse.json({ exists: true, hasDbCommunity, data: cached });
    }

    // Gate: only scrape Wikipedia for slugs that correspond to a known Dubai
    // community. This prevents garbage accumulating when users type airline
    // names, towers, football clubs, or other non-community queries that still
    // mention "Dubai" in their Wikipedia articles.
    const isKnownCommunity =
      hasDbCommunity ||
      BUY_COMMUNITIES.some((c) => c.slug === slug || c.communitySlug === slug);

    if (!isKnownCommunity) {
      return NextResponse.json({ exists: false });
    }

    // Scrape Wikipedia — only reached for real known communities without a cache hit.
    const scraped = await scrapeCommunityInfo(q);

    if (!scraped) {
      return NextResponse.json({ exists: false });
    }

    // Persist — best-effort; don't fail the request if writing fails.
    try {
      const client = await clientPromise;
      const db = client.db("binayah_web_new_dev");
      const collection = db.collection<CommunityInfoPage>("community_info_pages");
      await collection.updateOne(
        { slug: scraped.slug },
        { $setOnInsert: scraped },
        { upsert: true }
      );
      const stored = await collection.findOne({ slug: scraped.slug });
      return NextResponse.json({ exists: true, hasDbCommunity, data: stored ?? scraped });
    } catch (writeErr) {
      console.error("[community-info] MongoDB write failed:", writeErr);
      return NextResponse.json({ exists: true, hasDbCommunity, data: scraped });
    }
  } catch (err) {
    console.error("[community-info] Unhandled error:", err);
    return NextResponse.json({ exists: false });
  }
}
