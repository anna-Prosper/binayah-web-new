import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  if (req.headers.get("x-admin-secret") !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const client = await clientPromise;
  const db = client.db("binayah_web_new_dev");
  const docs = await db.collection("community_info_pages")
    .find({}, { projection: { slug: 1, name: 1, _id: 0 } })
    .sort({ slug: 1 })
    .toArray();
  // Also fetch known community slugs from DB to identify wikiOnly
  const dbCommunities = await db.collection("communities")
    .find({ publishStatus: "published" }, { projection: { slug: 1, _id: 0 } })
    .toArray();
  const dbSlugs = new Set(dbCommunities.map((c) => (c as unknown as { slug: string }).slug));
  const annotated = docs.map((d) => {
    const doc = d as unknown as { slug: string; name: string };
    return { slug: doc.slug, name: doc.name, wikiOnly: !dbSlugs.has(doc.slug) };
  });
  return NextResponse.json({ total: docs.length, docs: annotated });
}

export async function DELETE(req: NextRequest) {
  if (req.headers.get("x-admin-secret") !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slugs } = await req.json();
  if (!Array.isArray(slugs) || slugs.length === 0) {
    return NextResponse.json({ error: "slugs array required" }, { status: 400 });
  }
  const client = await clientPromise;
  const db = client.db("binayah_web_new_dev");
  const result = await db.collection("community_info_pages").deleteMany({ slug: { $in: slugs } });
  return NextResponse.json({ deleted: result.deletedCount });
}
