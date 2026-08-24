// One-off migration: copies PULSE_GUIDES (the static fallback array) into the
// `guides` MongoDB collection. Idempotent — upserts by slug, safe to re-run.
// Usage: npx tsx scripts/migrate-guides.ts
import { MongoClient } from "mongodb";
import { PULSE_GUIDES, guideDates } from "../src/lib/pulse-guides";
import fs from "fs";

function mongoUriFromEnvShared(): { uri: string; db: string } {
  const line = fs
    .readFileSync("/Users/zoop/.env.shared", "utf8")
    .split("\n")
    .find((l) => l.startsWith("MONGODB_URI="));
  if (!line) throw new Error("MONGODB_URI not found in .env.shared");
  const srv = line.slice("MONGODB_URI=".length).trim().replace(/^["']|["']$/g, "");
  const m = srv.match(/^mongodb\+srv:\/\/([^:]+):([^@]+)@([^/?]+)(?:\/([^?]*))?/);
  if (!m) throw new Error("Could not parse MONGODB_URI");
  const [, user, pass, host, dbInUri] = m;
  const hosts = ["ac-0zufr86-shard-00-00", "ac-0zufr86-shard-00-01", "ac-0zufr86-shard-00-02"]
    .map((h) => `${h}.${host.split(".").slice(1).join(".")}:27017`)
    .join(",");
  const db = process.env.DB_NAME || dbInUri || "binayah_web_new_dev";
  return {
    uri: `mongodb://${user}:${pass}@${hosts}/${db}?ssl=true&replicaSet=atlas-ex610l-shard-0&authSource=admin&retryWrites=true&w=majority`,
    db,
  };
}

async function main() {
  const { uri, db } = mongoUriFromEnvShared();
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 30000 });
  await client.connect();
  const col = client.db(db).collection("guides");
  await col.createIndex({ slug: 1 }, { unique: true });

  let upserts = 0;
  for (let i = 0; i < PULSE_GUIDES.length; i++) {
    const g = PULSE_GUIDES[i];
    const dates = guideDates(g.slug);
    const res = await col.updateOne(
      { slug: g.slug },
      {
        $set: {
          slug: g.slug,
          category: g.category,
          readTime: g.readTime,
          views: g.views,
          titleKey: g.titleKey,
          descriptionKey: g.descriptionKey,
          body: g.body,
          relatedCommunities: g.relatedCommunities,
          faq: g.faq,
          heroImage: g.heroImage,
          area: g.area,
          published: true,
          order: i,
          createdAt: new Date(dates.published),
          updatedAt: new Date(dates.modified),
        },
      },
      { upsert: true }
    );
    if (res.upsertedCount || res.modifiedCount) upserts++;
  }

  const count = await col.countDocuments();
  console.log(`Migrated ${PULSE_GUIDES.length} guides (${upserts} written), collection now has ${count} documents.`);
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
