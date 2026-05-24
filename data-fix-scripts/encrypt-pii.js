// Encrypt existing PII in MongoDB — run once after deploying the encryption module.
//
// Usage:
//   ENCRYPTION_KEY=<hex> HMAC_KEY=<hex> MONGODB_URI=<uri> node data-fix-scripts/encrypt-pii.js
//
// The script is idempotent: values already prefixed with "enc:" are skipped.
// Run again safely at any time.

const { MongoClient } = require("mongodb");
const { createCipheriv, createHmac, randomBytes } = require("crypto");

const ENC_PREFIX = "enc:";
const DB = "binayah_web_new_dev";

function getKey(envVar) {
  const hex = process.env[envVar];
  if (!hex || hex.length !== 64) throw new Error(`${envVar} must be 64 hex chars`);
  return Buffer.from(hex, "hex");
}

const ENC_KEY = getKey("ENCRYPTION_KEY");
const MAC_KEY = getKey("HMAC_KEY");

function encrypt(plaintext) {
  if (!plaintext) return plaintext;
  if (plaintext.startsWith(ENC_PREFIX)) return plaintext;
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", ENC_KEY, iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ENC_PREFIX + Buffer.concat([iv, tag, ct]).toString("base64");
}

function fieldHash(value) {
  if (!value) return undefined;
  return createHmac("sha256", MAC_KEY).update(value.toLowerCase().trim()).digest("hex");
}

async function encryptCollection(col, fields, hashFields = []) {
  let processed = 0;
  let updated = 0;
  const cursor = col.find({});
  for await (const doc of cursor) {
    processed++;
    const $set = {};
    let dirty = false;
    for (const field of fields) {
      const val = doc[field];
      if (!val || typeof val !== "string") continue;
      if (val.startsWith(ENC_PREFIX)) continue;
      $set[field] = encrypt(val);
      dirty = true;
    }
    for (const { raw, hash } of hashFields) {
      const val = doc[raw];
      if (!val || typeof val !== "string") continue;
      if (!doc[hash]) {
        $set[hash] = fieldHash(val.startsWith(ENC_PREFIX) ? null : val);
        dirty = true;
      }
    }
    if (dirty) {
      await col.updateOne({ _id: doc._id }, { $set });
      updated++;
    }
  }
  return { processed, updated };
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI required");
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(DB);
  console.log("Connected to MongoDB. Starting PII encryption...\n");

  const collections = [
    {
      name: "inquiries",
      fields: ["name", "email", "phone", "message"],
      hashFields: [
        { raw: "email", hash: "emailH" },
        { raw: "phone", hash: "phoneH" },
      ],
    },
    {
      name: "property_submissions",
      fields: ["userEmail", "userName", "phone", "description"],
      hashFields: [
        { raw: "userEmail", hash: "emailH" },
        { raw: "phone", hash: "phoneH" },
      ],
    },
    {
      name: "project_subscriptions",
      fields: ["email"],
      hashFields: [{ raw: "email", hash: "emailH" }],
    },
    {
      name: "marketreportsubscriptions",
      fields: ["name", "email", "phone"],
      hashFields: [
        { raw: "email", hash: "emailH" },
        { raw: "phone", hash: "phoneH" },
      ],
    },
  ];

  for (const { name, fields, hashFields } of collections) {
    process.stdout.write(`  ${name}... `);
    const { processed, updated } = await encryptCollection(
      db.collection(name),
      fields,
      hashFields
    );
    console.log(`${updated} encrypted / ${processed} total`);
  }

  console.log("\nDone. All PII fields encrypted.");
  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
