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

  // Ensure slug index once per cold-start
  if (!indexEnsured) {
    await ensureIndex();
    indexEnsured = true;
  }

  try {
    const client = await clientPromise;
    const db = client.db("binayah_web_new_dev");
    const collection = db.collection<CommunityInfoPage>("community_info_pages");

    const slug = toSlug(q);

    // 1. Check cache first
    const cached = await collection.findOne({ slug });
    if (cached) {
      return NextResponse.json({ exists: true, data: cached });
    }

    // 2. Scrape from external sources
    const scraped = await scrapeCommunityInfo(q);

    if (!scraped) {
      return NextResponse.json({ exists: false });
    }

    // 3. Store in MongoDB (insertOne; on duplicate slug from race condition, upsert)
    try {
      await collection.updateOne(
        { slug: scraped.slug },
        { $setOnInsert: scraped },
        { upsert: true }
      );
    } catch (err) {
      // Log but don't fail the request — return the scraped data anyway
      console.error("[community-info] MongoDB write error:", err);
      return NextResponse.json({ exists: true, data: scraped });
    }

    // Re-fetch to get the _id assigned by MongoDB
    const stored = await collection.findOne({ slug: scraped.slug });
    return NextResponse.json({ exists: true, data: stored ?? scraped });
  } catch (err) {
    // Never return 500 — log and return exists: false
    console.error("[community-info] Unhandled error:", err);
    return NextResponse.json({ exists: false });
  }
}
