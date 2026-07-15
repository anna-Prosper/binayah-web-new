import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const client = await clientPromise;
  const db = client.db("binayah_web_new_dev");
  const [wikiDocs, communityDocs] = await Promise.all([
    db.collection("community_info_pages")
      .find({}, { projection: { slug: 1, name: 1, description: 1, placeKind: 1, heroImage: 1, _id: 0 } })
      .toArray(),
    db.collection("communities")
      .find({ publishStatus: "published" }, { projection: { slug: 1, name: 1, _id: 0 } })
      .toArray(),
  ]);
  const dbSlugs = new Set(communityDocs.map((c: any) => c.slug));
  const wikiOnly = wikiDocs
    .filter((w: any) => !dbSlugs.has(w.slug))
    .map((w: any) => ({
      slug: w.slug,
      name: w.name,
      placeKind: w.placeKind || null,
      hasHero: !!w.heroImage,
      descLen: (w.description || "").replace(/<[^>]*>/g, "").length,
    }))
    .sort((a: any, b: any) => b.descLen - a.descLen);
  return NextResponse.json({
    totalWiki: wikiDocs.length,
    dbCount: communityDocs.length,
    wikiOnlyCount: wikiOnly.length,
    wikiOnly,
  });
}
