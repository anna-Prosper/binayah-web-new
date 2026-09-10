/**
 * deal-check/alternatives.ts
 *
 * Finds two or three genuinely comparable options from Binayah's own
 * inventory, each with a stated reason for the comparison.
 *
 * Editorial rule: an alternative earns its place only when it is actually
 * comparable — same community or a defensible neighbour, similar size or
 * bedroom count, and a price within a sane band of the subject. We would
 * rather return one honest comparison, or none at all, than pad the list with
 * whatever happens to be in stock. A visitor who spots a bad comparison stops
 * trusting the rest of the report.
 */

import { serverApiUrl } from "@/lib/api";
import type { DealAlternative, DealInput } from "./types";

const HEADERS = (): Record<string, string> => ({ "x-api-key": process.env.API_KEY || "" });

interface ApiListing {
  _id?: string;
  name?: string;
  title?: string;
  slug?: string;
  listingType?: string;
  propertyType?: string;
  bedrooms?: number | null;
  size?: number | null;
  sizeUnit?: string;
  price?: number | null;
  community?: string;
  featuredImage?: string;
  developerName?: string;
}

interface ApiProject {
  _id?: string;
  name?: string;
  slug?: string;
  status?: string;
  completionDate?: string;
  developerName?: string;
  community?: string;
  startingPrice?: number | null;
  unitTypes?: string[];
  featuredImage?: string;
  shortOverview?: string;
}

async function fetchJson<T>(path: string, timeoutMs = 10_000): Promise<T | null> {
  try {
    const res = await fetch(serverApiUrl(path), {
      headers: HEADERS(),
      signal: AbortSignal.timeout(timeoutMs),
      next: { revalidate: 1800 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** Price band we'll consider comparable — wide enough to show a cheaper or
 *  better option, tight enough that it's still the same decision. */
const PRICE_FLOOR = 0.65;
const PRICE_CEILING = 1.35;

export async function findAlternatives(
  input: DealInput,
  subjectPsf: number | null,
): Promise<DealAlternative[]> {
  if (!input.community || !input.price) return [];

  // Fetch without a listingType filter and narrow in code: combining
  // `community` with `listingType` on the upstream returns nothing, and the
  // secondary sale inventory is thin enough that we cannot afford to lose rows
  // to a filter quirk.
  const [listings, projects] = await Promise.all([
    fetchJson<ApiListing[]>(`/api/listings?community=${encodeURIComponent(input.community)}&limit=60`),
    fetchJson<ApiProject[]>(`/api/projects?community=${encodeURIComponent(input.community)}&limit=20`),
  ]);

  const out: DealAlternative[] = [];
  const price = input.price;
  const lo = price * PRICE_FLOOR;
  const hi = price * PRICE_CEILING;

  // Residential only — an office or a warehouse is never a useful comparison
  // for someone weighing up an apartment.
  const RESIDENTIAL = /apartment|villa|townhouse|penthouse|duplex|studio/i;

  // ── Secondary listings ────────────────────────────────────────────────────
  for (const l of listings ?? []) {
    if (!l.price || l.price < lo || l.price > hi) continue;
    if (!l.slug) continue;
    // Sale listings only: a rental listing's "price" is an annual rent, and
    // comparing it against a purchase price would be nonsense.
    if ((l.listingType ?? "").toLowerCase() !== "sale") continue;
    if (l.propertyType && !RESIDENTIAL.test(l.propertyType)) continue;
    // Same bedroom count, or one either side — a 1-bed against a 3-bed is not
    // a comparison a buyer can act on.
    if (input.bedrooms != null && l.bedrooms != null && Math.abs(l.bedrooms - input.bedrooms) > 1) {
      continue;
    }

    const size = normaliseSqft(l.size, l.sizeUnit);
    const psf = size && l.price ? Math.round(l.price / size) : null;

    out.push({
      name: l.title || l.name || "Listing",
      kind: "listing",
      slug: l.slug,
      community: l.community ?? null,
      price: l.price,
      areaSqft: size,
      bedrooms: l.bedrooms ?? null,
      pricePsf: psf,
      developer: null,
      handover: null,
      rationale: listingRationale(l, psf, subjectPsf, input),
      url: `/property/${l.slug}`,
      image: l.featuredImage ?? null,
    });
  }

  // ── Off-plan projects ─────────────────────────────────────────────────────
  // Only worth showing when the subject is ready: the comparison a buyer
  // actually faces is "should I buy resale or new here instead?".
  for (const p of projects ?? []) {
    if (!p.slug || !p.startingPrice) continue;
    if (p.startingPrice > hi) continue;

    out.push({
      name: p.name || "Project",
      kind: "project",
      slug: p.slug,
      community: p.community ?? null,
      price: p.startingPrice,
      areaSqft: null,
      bedrooms: null,
      pricePsf: null,
      developer: p.developerName ?? null,
      handover: p.completionDate ?? null,
      rationale: projectRationale(p, input),
      url: `/project/${p.slug}`,
      image: p.featuredImage ?? null,
    });
  }

  return rank(out, input, subjectPsf).slice(0, 3);
}

/**
 * Rank by how useful the comparison is, not by price alone. A cheaper unit at
 * a better price per sqft is the most useful thing we can show; a mix of one
 * resale and one off-plan is more informative than three near-identical flats.
 */
function rank(items: DealAlternative[], input: DealInput, subjectPsf: number | null): DealAlternative[] {
  const scored = items.map((a) => {
    let score = 0;

    // Better value per sqft is the strongest signal.
    if (a.pricePsf && subjectPsf) {
      const better = (subjectPsf - a.pricePsf) / subjectPsf;
      score += better * 100;
    }

    // Exact bedroom match is worth a lot.
    if (input.bedrooms != null && a.bedrooms === input.bedrooms) score += 25;

    // Cheaper in absolute terms, mildly preferred.
    if (a.price && input.price && a.price < input.price) score += 10;

    // Complete records present better.
    if (a.areaSqft) score += 8;
    if (a.image) score += 4;

    return { a, score };
  });

  scored.sort((x, y) => y.score - x.score);

  // Keep at most one off-plan project so the list isn't dominated by new stock.
  const out: DealAlternative[] = [];
  let projects = 0;
  for (const { a } of scored) {
    if (a.kind === "project") {
      if (projects >= 1) continue;
      projects += 1;
    }
    out.push(a);
  }
  return out;
}

function listingRationale(
  l: ApiListing,
  psf: number | null,
  subjectPsf: number | null,
  input: DealInput,
): string {
  const bits: string[] = [];

  if (psf && subjectPsf) {
    const diff = ((subjectPsf - psf) / subjectPsf) * 100;
    if (diff > 5) {
      bits.push(`about ${Math.round(diff)}% cheaper per square foot than the property you submitted`);
    } else if (diff < -5) {
      bits.push(`priced ${Math.round(-diff)}% higher per square foot, so worth seeing what the premium buys`);
    } else {
      bits.push("priced at a similar rate per square foot, so it's a direct like-for-like");
    }
  }

  if (input.bedrooms != null && l.bedrooms === input.bedrooms) {
    bits.push("same bedroom count");
  }

  if (bits.length === 0) return "A comparable resale in the same community.";
  return capitalise(bits.join(", ")) + ".";
}

function projectRationale(p: ApiProject, input: DealInput): string {
  const parts: string[] = [];

  if (input.purchaseType === "ready") {
    parts.push("An off-plan alternative in the same community");
    if (p.completionDate) parts.push(`handing over ${p.completionDate}`);
    parts.push(
      "you would trade immediate rental income for a staged payment plan and a lower entry cost",
    );
  } else {
    parts.push("Another off-plan option in the same community");
    if (p.developerName) parts.push(`by ${p.developerName}`);
    parts.push("worth comparing on payment terms and handover date");
  }

  return capitalise(parts.join(", ")) + ".";
}

/** Listings quote size in sqft or sqm depending on source. Normalise to sqft. */
function normaliseSqft(size: number | null | undefined, unit: string | undefined): number | null {
  if (!size || size <= 0) return null;
  const u = (unit ?? "").toLowerCase();
  if (u.includes("m") && !u.includes("ft")) return Math.round(size * 10.7639);
  return Math.round(size);
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
