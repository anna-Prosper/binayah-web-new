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

    if (cached) {
      return NextResponse.json({ exists: true, data: cached });
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
      return NextResponse.json({ exists: true, data: stored ?? scraped });
    } catch (writeErr) {
      console.error("[community-info] MongoDB write failed:", writeErr);
      // Still return the scraped data — persistence is best-effort
      return NextResponse.json({ exists: true, data: scraped });
    }
  } catch (err) {
    // Never return 500 — log and return exists: false
    console.error("[community-info] Unhandled error:", err);
    return NextResponse.json({ exists: false });
  }
}
