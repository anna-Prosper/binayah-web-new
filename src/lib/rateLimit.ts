import clientPromise from "@/lib/mongodb";

/**
 * Persistent rate limiter backed by Mongo. Increments a counter for (bucket, key)
 * inside a rolling window. Returns true if the request is allowed.
 * Collection uses a TTL index on `expiresAt` so old docs self-delete.
 */
export async function checkRateLimit(
  bucket: string,
  key: string,
  max: number,
  windowMs: number
): Promise<boolean> {
  const client = await clientPromise;
  const col = client.db("binayah_web_new_dev").collection("rate_limits");
  // Ensure TTL index exists (idempotent).
  try {
    await col.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  } catch { /* index already exists */ }

  const now = new Date();
  const id = `${bucket}:${key}`;

  const doc = await col.findOneAndUpdate(
    { _id: id as any, expiresAt: { $gt: now } },
    { $inc: { count: 1 } },
    { returnDocument: "after" }
  );
  const existing = (doc as any)?.value ?? doc;

  if (existing) {
    return existing.count <= max;
  }

  // No active window — create a new one.
  await col.updateOne(
    { _id: id as any },
    {
      $set: {
        count: 1,
        expiresAt: new Date(now.getTime() + windowMs),
      },
    },
    { upsert: true }
  );
  return true;
}
