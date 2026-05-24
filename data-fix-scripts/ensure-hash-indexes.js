// Ensures HMAC hash fields are indexed for fast lookups.
// Safe to run multiple times — createIndex is idempotent.
//
// Usage:
//   MONGODB_URI=<uri> node data-fix-scripts/ensure-hash-indexes.js

const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const { MongoClient } = require("mongodb");

const DB = "binayah_web_new_dev";

const INDEXES = [
  { collection: "users",                    index: { emailH: 1 }, options: { sparse: true } },
  { collection: "inquiries",                index: { emailH: 1 }, options: { sparse: true } },
  { collection: "inquiries",                index: { phoneH: 1 }, options: { sparse: true } },
  { collection: "property_submissions",     index: { emailH: 1 }, options: { sparse: true } },
  { collection: "property_submissions",     index: { phoneH: 1 }, options: { sparse: true } },
  { collection: "project_subscriptions",    index: { emailH: 1, slug: 1 }, options: { sparse: true } },
  { collection: "marketreportsubscriptions",index: { emailH: 1 }, options: { sparse: true } },
  { collection: "marketreportsubscriptions",index: { phoneH: 1 }, options: { sparse: true } },
];

async function main() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db(DB);

  for (const { collection, index, options } of INDEXES) {
    const name = Object.keys(index).join("_");
    process.stdout.write(`  ${collection}.${name}... `);
    await db.collection(collection).createIndex(index, options);
    console.log("ok");
  }

  await client.close();
  console.log("\nAll hash indexes in place.");
}

main().catch(err => { console.error(err); process.exit(1); });
