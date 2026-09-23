/**
 * deal-check/valuation.ts
 *
 * Client for the property-valuation service that already powers /valuation.
 *
 * What it adds over our DLD comps: a per-unit fair-value range, a confidence
 * rating with a stated reason, and — most useful of all — individually NAMED
 * recent transactions (building, date, size, closing price) rather than an
 * anonymous median. A buyer can check those against the listing themselves.
 *
 * ── Two things to keep in mind about this source ──────────────────────────
 *
 * 1. It is PropertyFinder-derived and self-describes as "an AI-assisted
 *    estimate, not a formal appraisal". We surface it as the headline because
 *    its comparables are recent and specific, but we ALWAYS keep the DLD
 *    registered-sales figure beside it so a wrong estimate is visibly wrong
 *    rather than silently authoritative.
 *
 * 2. It reads materially lower than our DLD year-to-date median — about 28%
 *    on a Business Bay 2-bed. That is not a bug in either source: DLD's
 *    *recent* transactions median ~1,922/sqft against its ~2,417 YTD figure,
 *    so the valuation's ~1,821 is in the right neighbourhood for current
 *    trading. The two answer different questions (this month vs this year)
 *    and the UI says which is which.
 *
 * The upstream is a streaming NDJSON endpoint that takes 6-8s. Deal Check
 * already runs 15-30s, so this fits inside the existing flow.
 *
 * TWO-STEP BY DESIGN. /stream returns a preview only — confidence, a quick-sale
 * range and one teaser comparable. The 15 named transactions, the fair-value
 * range and the competing listings come from /unlock, which requires a name and
 * a phone number. That is the upstream's own lead gate, and it happens to line
 * up exactly with ours: when a visitor unlocks Deal Check they give us those
 * same two fields, so we can pass them on and release the detail. Nobody is
 * asked for anything twice.
 */

import type { DealInput } from "./types";

const TIMEOUT_MS = 45_000;

/** One named comparable — the part buyers find most convincing. */
export interface ValuationComparable {
  headline: string;
  price: number | null;
  size: string | null;
  sizeSqft: number | null;
  date: string | null;
  bedrooms: string | null;
  pricePerSqft: number | null;
  notes: string | null;
}

export interface ValuationRange {
  low: number;
  high: number;
  note?: string | null;
}

/** The free half — shown without a lead. */
export interface ValuationTeaser {
  confidence: string | null;
  confidenceReason: string | null;
  quickSale: ValuationRange | null;
  /** One example comparable, to prove the rest exist. */
  sampleComparable: ValuationComparable | null;
  comparableCount: number;
  listingCount: number;
}

/** The gated half — released with the rest of the report. */
export interface ValuationDetail {
  estimate: ValuationRange | null;
  recommendedList: ValuationRange | null;
  quickSale: ValuationRange | null;
  confidence: string | null;
  confidenceReason: string | null;
  comparables: ValuationComparable[];
  listings: ValuationComparable[];
  /** Median closing PSF across the named comparables, computed by us. */
  comparableMedianPsf: number | null;
  marketRead: string | null;
  methodologyNote: string | null;
  disclaimer: string | null;
  sourceLabel: string;
}

export interface ValuationResult {
  /** Needed to unlock the detail later; never sent to the browser. */
  leadId: string | null;
  teaser: ValuationTeaser;
  /** Null until unlockValuation() runs — /stream only returns the preview. */
  detail: ValuationDetail | null;
}

function baseUrl(): string {
  const raw =
    process.env.VALUATION_API_BASE_URL || process.env.VALUATION_API_URL || "";
  return raw.replace(/\/+$/, "");
}

/** Map a DealInput onto the upstream's field names, which differ from ours. */
function toInquiry(input: DealInput): Record<string, string> {
  const beds =
    input.bedrooms === 0 ? "Studio" : input.bedrooms != null ? String(input.bedrooms) : "";

  // The upstream only distinguishes a few types.
  const type =
    input.propertyKind === "villa" || input.propertyKind === "townhouse"
      ? "Villa"
      : input.propertyKind === "commercial"
        ? "Commercial"
        : input.propertyKind === "plot"
          ? "Plot"
          : "Apartment";

  return {
    countryCode: "AE",
    transactionType: "buy",
    propertyName: input.building ?? "",
    community: input.community ?? "",
    city: "Dubai",
    propertyType: type,
    bedrooms: beds,
    maids: "No",
    size: input.areaSqft ? `${input.areaSqft} sq ft` : "",
  };
}

const num = (v: unknown): number | null => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
};

/** "1,549 sqft" → 1549 */
function parseSqft(size: unknown): number | null {
  if (typeof size !== "string") return null;
  const n = Number(size.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function toComparable(raw: Record<string, unknown>): ValuationComparable | null {
  const price = num(raw.price);
  const sizeSqft = parseSqft(raw.size);
  const headline = typeof raw.headline === "string" ? raw.headline.trim() : "";
  if (!headline) return null;

  return {
    headline: headline.slice(0, 140),
    price,
    size: typeof raw.size === "string" ? raw.size : null,
    sizeSqft,
    date: typeof raw.date === "string" ? raw.date : null,
    bedrooms: raw.bedrooms != null ? String(raw.bedrooms) : null,
    pricePerSqft: price && sizeSqft ? Math.round(price / sizeSqft) : null,
    notes: typeof raw.notes === "string" ? raw.notes.slice(0, 200) : null,
  };
}

function toRange(raw: unknown): ValuationRange | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const low = num(r.low);
  const high = num(r.high);
  if (!low || !high) return null;
  return { low, high, note: typeof r.note === "string" ? r.note : null };
}

/**
 * Run a valuation. Returns null on any failure — this is an enhancement to the
 * report, never a dependency of it, so a slow or broken upstream must degrade
 * to the DLD-only report rather than failing the check.
 */
export async function fetchValuation(input: DealInput): Promise<ValuationResult | null> {
  const base = baseUrl();
  if (!base) return null;
  if (!input.community) return null;

  const inquiry = toInquiry(input);
  if (!inquiry.community || !inquiry.size) return null;

  let final: Record<string, unknown> | null = null;

  try {
    const res = await fetch(`${base}/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/x-ndjson, application/json",
      },
      body: JSON.stringify(inquiry),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });

    if (!res.ok || !res.body) return null;

    // NDJSON: one event per line, the last of which carries the result.
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const t = line.trim();
        if (!t) continue;
        try {
          const evt = JSON.parse(t) as { event?: string; data?: unknown };
          if (evt.event === "final" && evt.data && typeof evt.data === "object") {
            final = evt.data as Record<string, unknown>;
          }
        } catch {
          /* partial or malformed line — skip */
        }
      }
    }
  } catch (err) {
    console.error("[deal-check] valuation fetch failed:", err);
    return null;
  }

  if (!final) return null;
  return shapePreview(final);
}

/**
 * Release the full valuation. Called once our own gate has captured the lead,
 * passing the same name and phone the visitor just gave us.
 */
export async function unlockValuation(
  leadId: string,
  name: string,
  phone: string,
): Promise<ValuationDetail | null> {
  const base = baseUrl();
  if (!base || !leadId || !name || !phone) return null;

  try {
    const res = await fetch(`${base}/unlock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, ownerName: name, phone }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("[deal-check] valuation unlock HTTP", res.status, (await res.text()).slice(0, 200));
      return null;
    }
    const d = (await res.json()) as Record<string, unknown>;
    if (d.error) {
      console.error("[deal-check] valuation unlock rejected:", d.error);
      return null;
    }
    return shapeDetail(d);
  } catch (err) {
    console.error("[deal-check] valuation unlock failed:", err);
    return null;
  }
}

function shapePreview(d: Record<string, unknown>): ValuationResult {
  const preview = (d.preview ?? {}) as Record<string, unknown>;

  const previewRows = Array.isArray(preview.comparableRows)
    ? (preview.comparableRows as Record<string, unknown>[])
    : [];
  const sample =
    previewRows
      .filter((r) => r.visibility === "teaser")
      .map(toComparable)
      .find((c): c is ValuationComparable => c !== null) ?? null;

  const comparables = (Array.isArray(d.transactions) ? (d.transactions as Record<string, unknown>[]) : [])
    .map(toComparable)
    .filter((c): c is ValuationComparable => c !== null);

  const listings = (Array.isArray(d.listings) ? (d.listings as Record<string, unknown>[]) : [])
    .map(toComparable)
    .filter((c): c is ValuationComparable => c !== null);

  // Compute the median ourselves rather than trusting an upstream average —
  // the cohort contains genuine outliers (a 22.5M penthouse at 5,607/sqft in
  // a set otherwise trading near 1,800) that would drag a mean badly.
  const psfs = comparables
    .map((c) => c.pricePerSqft)
    .filter((n): n is number => n != null)
    .sort((a, b) => a - b);
  const comparableMedianPsf = psfs.length
    ? psfs.length % 2
      ? psfs[(psfs.length - 1) / 2]
      : Math.round((psfs[psfs.length / 2 - 1] + psfs[psfs.length / 2]) / 2)
    : null;

  return {
    leadId: typeof d.leadId === "string" ? d.leadId : null,
    teaser: {
      confidence: typeof preview.confidence === "string" ? preview.confidence : null,
      confidenceReason:
        typeof preview.confidenceReason === "string" ? preview.confidenceReason : null,
      quickSale: toRange(preview.quickSaleRange),
      sampleComparable: sample,
      comparableCount:
        comparables.length ||
        previewRows.length + (num(preview.hiddenComparableCount) ?? 0),
      listingCount: listings.length,
    },
    detail: null,
  };
}

/** The unlocked half: named transactions, the range, and competing listings. */
function shapeDetail(d: Record<string, unknown>): ValuationDetail {
  const comparables = (Array.isArray(d.transactions) ? (d.transactions as Record<string, unknown>[]) : [])
    .map(toComparable)
    .filter((c): c is ValuationComparable => c !== null);

  const listings = (Array.isArray(d.listings) ? (d.listings as Record<string, unknown>[]) : [])
    .map(toComparable)
    .filter((c): c is ValuationComparable => c !== null);

  // Compute the median ourselves rather than trusting an upstream average —
  // the cohort contains genuine outliers (a 22.5M penthouse at 5,607/sqft in
  // a set otherwise trading near 1,800) that would drag a mean badly.
  const psfs = comparables
    .map((c) => c.pricePerSqft)
    .filter((n): n is number => n != null)
    .sort((a, b) => a - b);
  const comparableMedianPsf = psfs.length
    ? psfs.length % 2
      ? psfs[(psfs.length - 1) / 2]
      : Math.round((psfs[psfs.length / 2 - 1] + psfs[psfs.length / 2]) / 2)
    : null;

  const methodology = (d.valuation_methodology ?? {}) as Record<string, unknown>;

  return {
    estimate:
      num(d.estimate_low) && num(d.estimate_high)
        ? { low: num(d.estimate_low)!, high: num(d.estimate_high)! }
        : null,
    recommendedList: toRange(d.recommended_list_price),
    quickSale: toRange(d.quick_sale_range),
    confidence: typeof d.confidence === "string" ? d.confidence : null,
    confidenceReason:
      typeof d.confidence_reason === "string" ? d.confidence_reason : null,
    comparables,
    listings,
    comparableMedianPsf,
    marketRead: typeof d.market_read === "string" ? d.market_read.slice(0, 900) : null,
    methodologyNote:
      typeof methodology.data_quality_notes === "string"
        ? methodology.data_quality_notes.slice(0, 300)
        : null,
    disclaimer: typeof d.disclaimer === "string" ? d.disclaimer.slice(0, 300) : null,
    sourceLabel: "Recent comparable sales nearby",
  };
}
