/**
 * deal-check/parse.ts
 *
 * Reads whatever the visitor submitted — a portal link, a screenshot, a
 * brochure PDF, or pasted text — into a structured DealInput.
 *
 * The model's job stops here. It extracts facts that are present in the source
 * and returns null for everything else; it never estimates a price, never
 * infers a rent, and never computes a cost. All money maths happens in
 * engine.ts against DLD data, so a hallucinated figure can't reach the report.
 */

import type { DealInput, DealPropertyKind, DealPurchaseType, PaymentPlanStep } from "./types";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
/** Vision-capable and cheap — the input is one listing page or brochure. */
const MODEL = "gpt-5.4-mini";

const SYSTEM_PROMPT = `You extract structured facts about a single UAE property from listing text, brochures, or screenshots.

You return ONLY JSON matching the provided schema.

Absolute rules:
- Extract ONLY what the source actually states. If a field is not stated, return null. Never estimate, infer, or fill from general knowledge.
- Never invent a price, a rent, a size, or a service charge. A wrong number here becomes wrong financial advice.
- listingIntent: FIRST decide what this listing is. "sale" if the property is for sale. "rent" if it is a rental/leasing listing — look for "for rent", "to let", "per year", "yearly", "annually", "/yr", "per month", "monthly", cheques/"chqs" terms, "tenancy", or a price that is obviously an annual rent rather than a purchase price. "unclear" if you genuinely cannot tell. This matters more than any other field: a rental listing run as a purchase produces completely wrong financial advice.
- price: the asking/sale PURCHASE price in AED as a plain number. Strip currency symbols, commas and words like "starting from". If the price is a range, take the lower bound. If the price is in another currency, still return the number but set currencyNote. CRITICAL: if listingIntent is "rent", price MUST be null and the figure goes in statedRent instead — never put an annual rent in price.
- areaSqft: the internal/built-up area in SQUARE FEET as a number. If the source gives square metres, multiply by 10.7639 and return the result. If both are given prefer sqft. Note in sizeNote whether it is built-up, plot, or unclear.
- bedrooms: integer. A studio is 0. "1BR"/"1 bed"/"1BHK" is 1. Penthouses still report their bedroom count.
- community: the Dubai community or district only — e.g. "Business Bay", "Dubai Marina", "Jumeirah Village Circle". NOT the building name, NOT "Dubai", NOT the emirate.
- building: the tower, project or development name if stated, otherwise null.
- propertyKind: one of apartment, villa, townhouse, penthouse, plot, commercial.
- purchaseType: "off-plan" if it is under construction / sold by a developer / has a handover date or payment plan. "ready" if it is an existing completed unit or a resale. null if genuinely unclear.
- statedRent: the ANNUAL rent in AED. Set it when the source states an actual annual rent, a current rental income, or (when listingIntent is "rent") the advertised rent itself. Convert monthly figures to annual by multiplying by 12. If the source only advertises a projected/estimated ROI percentage, leave this null and put the claim in marketingClaims.
- paymentPlan: for off-plan, the instalment schedule. Each step needs a label, a percentage (number, no % sign) or an amount, and a phase from: booking, construction, handover, post-handover. Return an empty array if no plan is stated.
- handover: the stated completion/handover date as written, e.g. "Q4 2027".
- developer: the developer name if stated.
- marketingClaims: short verbatim quotes of any promotional or projected claims — "guaranteed 10% ROI", "prices rising 20% a year", "last unit". These get scrutinised, so capture them exactly as written.
- redFlags: things a buyer should be told that are visible in the source — no size given, no service charge stated, a price that looks like a placeholder, an unusually short handover, missing developer name.

Be conservative. A null is always better than a guess.`;

const EXTRACTION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    listingIntent: { type: "string", enum: ["sale", "rent", "unclear"] },
    price: { type: ["number", "null"] },
    currencyNote: { type: ["string", "null"] },
    areaSqft: { type: ["number", "null"] },
    sizeNote: { type: ["string", "null"] },
    bedrooms: { type: ["integer", "null"] },
    community: { type: ["string", "null"] },
    building: { type: ["string", "null"] },
    propertyKind: {
      type: ["string", "null"],
      enum: ["apartment", "villa", "townhouse", "penthouse", "plot", "commercial", null],
    },
    purchaseType: { type: ["string", "null"], enum: ["ready", "off-plan", null] },
    statedRent: { type: ["number", "null"] },
    handover: { type: ["string", "null"] },
    developer: { type: ["string", "null"] },
    paymentPlan: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          label: { type: "string" },
          percentage: { type: ["number", "null"] },
          amount: { type: ["number", "null"] },
          phase: { type: "string", enum: ["booking", "construction", "handover", "post-handover"] },
        },
        required: ["label", "percentage", "amount", "phase"],
      },
    },
    marketingClaims: { type: "array", items: { type: "string" } },
    redFlags: { type: "array", items: { type: "string" } },
    confidence: { type: "number" },
  },
  required: [
    "listingIntent",
    "price",
    "currencyNote",
    "areaSqft",
    "sizeNote",
    "bedrooms",
    "community",
    "building",
    "propertyKind",
    "purchaseType",
    "statedRent",
    "handover",
    "developer",
    "paymentPlan",
    "marketingClaims",
    "redFlags",
    "confidence",
  ],
} as const;

export type ListingIntent = "sale" | "rent" | "unclear";

export interface ExtractionResult {
  input: DealInput;
  /** What the source actually is. "rent" short-circuits the whole report. */
  listingIntent: ListingIntent;
  marketingClaims: string[];
  redFlags: string[];
  sizeNote: string | null;
  currencyNote: string | null;
  confidence: number;
}

export interface ParseSource {
  /** Pasted text, or text scraped from a submitted URL. */
  text?: string;
  /** Data URL for a screenshot or brochure page. */
  imageDataUrl?: string;
  sourceUrl?: string | null;
  /** Buyer context, supplied by the form rather than extracted. */
  mortgage?: boolean;
  downPaymentPct?: number | null;
}

/** Convert the model's raw extraction into a DealInput plus context. */
export async function extractDeal(source: ParseSource): Promise<ExtractionResult | null> {
  const apiKey = String(process.env.OPENAI_API_KEY || "").trim();
  if (!apiKey) return null;

  const content: Record<string, unknown>[] = [];

  if (source.text) {
    content.push({
      type: "text",
      text: `Extract the property facts from this source.\n\n${source.text.slice(0, 24_000)}`,
    });
  }

  if (source.imageDataUrl) {
    content.push({ type: "text", text: "Extract the property facts from this image." });
    content.push({ type: "image_url", image_url: { url: source.imageDataUrl, detail: "high" } });
  }

  if (content.length === 0) return null;

  try {
    const res = await fetch(OPENAI_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      signal: AbortSignal.timeout(60_000),
      body: JSON.stringify({
        model: MODEL,
        temperature: 0,
        max_completion_tokens: 1500,
        response_format: {
          type: "json_schema",
          json_schema: { name: "deal_extraction", strict: true, schema: EXTRACTION_SCHEMA },
        },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content },
        ],
      }),
    });

    if (!res.ok) {
      console.error("[deal-check] OpenAI returned", res.status, (await res.text()).slice(0, 400));
      return null;
    }

    const json = await res.json();
    const raw = json?.choices?.[0]?.message?.content;
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return normalize(parsed, source);
  } catch (err) {
    // Log the cause. A silent null here surfaces to the visitor as the generic
    // "we couldn't read that", which is indistinguishable from a genuinely
    // unreadable listing and hid a schema regression during development.
    console.error("[deal-check] extraction failed:", err);
    return null;
  }
}

/**
 * Sanity-bound the model's output. Even with a strict schema, a misread
 * screenshot can produce an absurd figure — a price of 5,000 or a size of
 * 900,000 sqft — and it is safer to drop the field than to build a report on it.
 */
function normalize(raw: Record<string, unknown>, source: ParseSource): ExtractionResult {
  const num = (v: unknown, min: number, max: number): number | null => {
    const n = Number(v);
    return Number.isFinite(n) && n >= min && n <= max ? n : null;
  };

  let intent: ListingIntent =
    raw.listingIntent === "rent" || raw.listingIntent === "unclear" || raw.listingIntent === "sale"
      ? raw.listingIntent
      : "unclear";

  let price = num(raw.price, 50_000, 2_000_000_000);
  const areaSqft = num(raw.areaSqft, 100, 200_000);
  const bedroomsRaw = num(raw.bedrooms, 0, 20);
  const statedRent = num(raw.statedRent, 5_000, 100_000_000);

  let statedRentFinal = statedRent;

  /**
   * Backstop for a misclassified rental. A Dubai purchase essentially never
   * costs under ~AED 300k, while annual rents essentially never exceed it, so
   * a "sale" price below that floor is far more likely to be an annual rent
   * that the extractor mislabelled. Reclassify rather than run purchase maths
   * on a rent figure — that path produced a 92%-below-market verdict and a 66%
   * net yield on a real Arjan rental listing.
   */
  const RENT_PRICE_CEILING = 300_000;
  if (intent !== "rent" && price != null && price < RENT_PRICE_CEILING) {
    intent = "rent";
    statedRentFinal = statedRentFinal ?? price;
    price = null;
  }

  // A rental listing has no purchase price by definition; if the model set
  // both, the price field is the rent restated.
  if (intent === "rent") {
    statedRentFinal = statedRentFinal ?? price;
    price = null;
  }

  const kind = raw.propertyKind as DealPropertyKind | null;
  const purchase = raw.purchaseType as DealPurchaseType | null;

  const plan = Array.isArray(raw.paymentPlan)
    ? (raw.paymentPlan as PaymentPlanStep[])
        .filter((s) => s && typeof s.label === "string")
        .map((s) => ({
          label: String(s.label).slice(0, 80),
          // Treat 0 as "not stated". Models return 0 rather than null for an
          // absent figure, and a zero here would zero out a schedule stage.
          percentage: num(s.percentage, 0.01, 100),
          amount: num(s.amount, 1, 2_000_000_000),
          phase: ["booking", "construction", "handover", "post-handover"].includes(s.phase)
            ? s.phase
            : "construction",
        }))
    : [];

  // A plan whose percentages are wildly off 100 has been misread — drop it
  // rather than produce a schedule that doesn't add up to the price.
  const pctTotal = plan.reduce((s, p) => s + (p.percentage ?? 0), 0);
  const planUsable = plan.length > 0 && (pctTotal === 0 || (pctTotal > 80 && pctTotal < 120));

  const input: DealInput = {
    price,
    areaSqft: areaSqft ? Math.round(areaSqft) : null,
    bedrooms: bedroomsRaw != null ? Math.round(bedroomsRaw) : null,
    community: cleanStr(raw.community, 80),
    building: cleanStr(raw.building, 120),
    propertyKind: kind ?? null,
    purchaseType: purchase ?? (planUsable ? "off-plan" : null),
    statedRent: statedRentFinal,
    paymentPlan: planUsable ? plan : null,
    handover: cleanStr(raw.handover, 40),
    developer: cleanStr(raw.developer, 80),
    mortgage: source.mortgage ?? false,
    downPaymentPct: source.downPaymentPct ?? null,
    sourceUrl: source.sourceUrl ?? null,
  };

  return {
    input,
    listingIntent: intent,
    marketingClaims: strArray(raw.marketingClaims, 6),
    redFlags: strArray(raw.redFlags, 6),
    sizeNote: cleanStr(raw.sizeNote, 200),
    currencyNote: cleanStr(raw.currencyNote, 200),
    confidence: num(raw.confidence, 0, 1) ?? 0.5,
  };
}

function cleanStr(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s.length > 0 ? s.slice(0, max) : null;
}

function strArray(v: unknown, limit: number): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
    .map((x) => x.trim().slice(0, 240))
    .slice(0, limit);
}

/** Fields whose absence materially weakens the report. Drives the UI prompts. */
export function findMissing(input: DealInput): string[] {
  const missing: string[] = [];
  if (input.price == null) missing.push("price");
  if (input.areaSqft == null) missing.push("areaSqft");
  if (input.bedrooms == null) missing.push("bedrooms");
  if (input.community == null) missing.push("community");
  if (input.statedRent == null) missing.push("rent");
  // Service charge is never in a listing, but naming it teaches the buyer to ask.
  missing.push("serviceCharge");
  return missing;
}
