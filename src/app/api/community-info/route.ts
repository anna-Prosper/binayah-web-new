import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { scrapeCommunityInfo, toSlug, type CommunityInfoPage } from "@/lib/communityScraper";

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
    let cached: CommunityInfoPage | null = null;

    // 1. Try MongoDB cache — isolated so a DB outage doesn't block scraping
    try {
      const client = await clientPromise;
      const db = client.db("binayah_web_new_dev");
      const collection = db.collection<CommunityInfoPage>("community_info_pages");
      cached = await collection.findOne({ slug });
    } catch (dbErr) {
      console.warn("[community-info] MongoDB cache lookup failed (will scrape anyway):", dbErr);
    }

    // Check if a published DB community record exists for this slug. Used by
    // the UI to decide whether /communities/[slug] is safe to link to (wikiOnly
    // pages now return 404, so we only show the community link when a DB entry
    // confirms the page will render).
    let hasDbCommunity = false;
    try {
      const client = await clientPromise;
      const db = client.db("binayah_web_new_dev");
      const dbCommunity = await db.collection("communities").findOne(
        { slug, publishStatus: "published" },
        { projection: { _id: 1 } }
      );
      hasDbCommunity = !!dbCommunity;
    } catch {
      // Non-fatal — UI will just not show the link
    }

    if (cached) {
      return NextResponse.json({ exists: true, hasDbCommunity, data: cached });
    }

    // 2. Always attempt scraping, even if MongoDB was unavailable
    const scraped = await scrapeCommunityInfo(q);

    if (!scraped) {
      return NextResponse.json({ exists: false });
    }

    // 3. Try to persist — best-effort; don't fail the request if writing fails
    try {
      const client = await clientPromise;
      const db = client.db("binayah_web_new_dev");
      const collection = db.collection<CommunityInfoPage>("community_info_pages");
      await collection.updateOne(
        { slug: scraped.slug },
        { $setOnInsert: scraped },
        { upsert: true }
      );
      // Re-fetch to get the _id assigned by MongoDB
      const stored = await collection.findOne({ slug: scraped.slug });
      return NextResponse.json({ exists: true, hasDbCommunity, data: stored ?? scraped });
    } catch (writeErr) {
      console.error("[community-info] MongoDB write failed:", writeErr);
      // Still return the scraped data — persistence is best-effort
      return NextResponse.json({ exists: true, hasDbCommunity, data: scraped });
    }
  } catch (err) {
    // Never return 500 — log and return exists: false
    console.error("[community-info] Unhandled error:", err);
    return NextResponse.json({ exists: false });
  }
}
