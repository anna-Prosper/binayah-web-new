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

  // Step 1: try to increment a currently-active window.
  const active = await col.updateOne(
    { _id: id as any, expiresAt: { $gt: now } },
    { $inc: { count: 1 } }
  );

  if (active.matchedCount === 0) {
    // No active window — either doc doesn't exist OR it's expired-but-not-yet-reaped.
    // Delete any stale doc (no-op if absent) and insert a fresh one. Use upsert with
    // $setOnInsert so a concurrent first-hitter won't reset count back to 1.
    await col.deleteOne({ _id: id as any, expiresAt: { $lte: now } });
    await col.updateOne(
      { _id: id as any },
      {
        $setOnInsert: {
          count: 1,
          expiresAt: new Date(now.getTime() + windowMs),
        },
      },
      { upsert: true }
    );
    // Fresh window, count === 1, allowed.
    return true;
  }

  // Read back the incremented count to decide.
  const after = await col.findOne({ _id: id as any });
  return (after?.count ?? 1) <= max;
}
