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

  // Single atomic upsert: $inc always increments the counter; $setOnInsert only
  // fires on insert, so expiresAt is set once and never reset by concurrent requests.
  // This eliminates the TOCTOU race where two concurrent first-hit requests both
  // fall through to a $set that resets count to 1.
  await col.updateOne(
    { _id: id as any },
    {
      $inc: { count: 1 },
      $setOnInsert: { expiresAt: new Date(now.getTime() + windowMs) },
    },
    { upsert: true }
  );

  // Read back the updated count to decide whether the request is allowed.
  const after = await col.findOne({ _id: id as any });
  return (after?.count ?? 1) <= max;
}
