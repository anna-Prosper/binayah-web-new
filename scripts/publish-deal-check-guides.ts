/**
 * scripts/publish-deal-check-guides.ts
 *
 * Upserts the Deal Check supporting guides into the `guides` collection.
 *
 * The guides API is read-only and `loadGuides()` REPLACES the static array with
 * the API result, so editing src/lib/pulse-guides.ts publishes nothing — Mongo
 * is the publishing surface. See the guide-publishing-path note.
 *
 *   npx tsx --tsconfig tsconfig.json scripts/publish-deal-check-guides.ts
 */

import { MongoClient } from "mongodb";
import fs from "fs";

const ARTICLES_PATH =
  process.env.ARTICLES_JSON ??
  "/private/tmp/claude-503/-Users-zoop-All-home-folders-binayah-properties/0e63b8c6-f053-4c28-8306-c42abc3f40cf/scratchpad/articles.json";

/** SRV lookup times out on this machine; rewrite to direct shard hosts. */
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

interface Article {
  slug: string;
  category: string;
  title: string;
  description: string;
  readTime: string;
  body: string;
  faq: { question: string; answer: string }[];
  relatedCommunities: string[];
}

async function main() {
  const articles: Article[] = JSON.parse(fs.readFileSync(ARTICLES_PATH, "utf8"));

  // Body is markdown-lite: **bold** and headings only. A markdown link would
  // render as literal bracket characters on the guide page.
  for (const a of articles) {
    if (/\]\(/.test(a.body)) throw new Error(`Markdown link in ${a.slug} — write a plain path instead`);
  }

  const { uri, db } = mongoUriFromEnvShared();
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 30000 });
  await client.connect();
  const col = client.db(db).collection("guides");
  await col.createIndex({ slug: 1 }, { unique: true });

  // Order after the existing set so the index stays chronological.
  const maxOrder = await col
    .find({}, { projection: { order: 1 } })
    .sort({ order: -1 })
    .limit(1)
    .toArray();
  let order = (maxOrder[0]?.order ?? 0) + 1;

  const published = "2026-09-10";

  for (const a of articles) {
    const res = await col.updateOne(
      { slug: a.slug },
      {
        $set: {
          slug: a.slug,
          category: a.category,
          title: a.title,
          description: a.description,
          readTime: a.readTime,
          // The Mongoose model requires these and defaults `published`, but
          // this script writes through the raw driver, which applies neither.
          // Without `published: true` the API's filter hides the guide, and
          // without the *Key fields the model rejects it on any later save.
          titleKey: `guide_${a.slug.replace(/-/g, "_")}_title`,
          descriptionKey: `guide_${a.slug.replace(/-/g, "_")}_desc`,
          published: true,
          body: a.body,
          faq: a.faq,
          relatedCommunities: a.relatedCommunities,
          // titleKey/descriptionKey intentionally omitted: these guides carry
          // their own title/description so they render without a deploy.
          views: 0,
          publishedAt: published,
          modifiedAt: published,
          updatedAt: new Date(),
        },
        $setOnInsert: { order: order++, createdAt: new Date(published) },
      },
      { upsert: true },
    );
    console.log(`${a.slug}: ${res.upsertedCount ? "inserted" : "updated"}`);
  }

  await client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
