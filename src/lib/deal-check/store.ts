/**
 * deal-check/store.ts
 *
 * Server-side storage for the gated half of a report.
 *
 * The teaser goes to the browser; the remainder stays here under a random id
 * until a lead is captured against it. Reports expire after 24 hours via a
 * TTL index — this is a short-lived handoff, not an archive, and holding
 * property assessments longer than the session needs them serves no purpose.
 */

import { randomBytes } from "crypto";
import clientPromise from "@/lib/mongodb";
import type { GatedRemainder } from "./gate";
import type { DealQuestion } from "./types";

const COLLECTION = "deal_check_reports";
const TTL_SECONDS = 24 * 60 * 60;

export type StoredPayload =
  | {
      kind: "purchase";
      locked: GatedRemainder;
      /** Everything unlock() needs to re-anchor the price on the valuation. */
      valuationLeadId?: string | null;
      input?: unknown;
      dldPrice?: unknown;
    }
  | { kind: "rent"; locked: { questions: DealQuestion[] } };

/** Unguessable id — this is the only thing standing between the payload and
 *  anyone who wants it without leaving details. */
export function newReportId(): string {
  return randomBytes(18).toString("base64url");
}

export async function storeReport(id: string, payload: StoredPayload): Promise<void> {
  const client = await clientPromise;
  const col = client.db("binayah_web_new_dev").collection(COLLECTION);

  try {
    await col.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  } catch {
    /* index already exists */
  }

  await col.insertOne({
    _id: id as never,
    ...payload,
    unlocked: false,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + TTL_SECONDS * 1000),
  });
}

/** Fetch and mark unlocked. Returns null if unknown or expired. */
export async function unlockReport(id: string): Promise<StoredPayload | null> {
  const client = await clientPromise;
  const col = client.db("binayah_web_new_dev").collection(COLLECTION);

  const doc = await col.findOneAndUpdate(
    { _id: id as never },
    { $set: { unlocked: true, unlockedAt: new Date() } },
    { returnDocument: "after" },
  );

  if (!doc) return null;

  if (doc.kind === "rent") {
    return { kind: "rent", locked: doc.locked as { questions: DealQuestion[] } };
  }
  return {
    kind: "purchase",
    locked: doc.locked as GatedRemainder,
    valuationLeadId: (doc.valuationLeadId as string | null) ?? null,
    input: doc.input,
    dldPrice: doc.dldPrice,
  };
}
