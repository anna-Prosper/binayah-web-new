import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";

export const dynamic = "force-dynamic";

const IMPORT_SECRET = process.env.PROJECT_IMPORT_SECRET;

const KNOWN_CITIES = [
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ras Al Khaimah",
  "Ajman",
  "Umm Al Quwain",
  "Fujairah",
];

function slugify(value: string) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractSlugFromUrl(url?: string) {
  if (!url) return "";
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || "";
  } catch {
    return "";
  }
}

function parsePriceCandidate(input?: string) {
  if (!input) return null;
  const cleaned = String(input).replace(/,/g, " ");
  const currencyMatch = cleaned.match(/\b(AED|USD|EUR|GBP|CNY|RUB)\b/i);
  const currency = currencyMatch ? currencyMatch[1].toUpperCase() : "AED";
  const numMatch = cleaned.match(/(\d+(?:\.\d+)?)(\s*[MK])?/i);
  if (!numMatch) return null;
  let amount = parseFloat(numMatch[1]);
  const suffix = (numMatch[2] || "").trim().toUpperCase();
  if (suffix === "M") amount *= 1_000_000;
  if (suffix === "K") amount *= 1_000;
  if (!Number.isFinite(amount)) return null;
  return { amount: Math.round(amount), currency };
}

function collectPrices(price?: string, features?: string[]) {
  const values: { amount: number; currency: string }[] = [];
  const p = parsePriceCandidate(price);
  if (p) values.push(p);
  for (const f of features || []) {
    const v = parsePriceCandidate(f);
    if (v) values.push(v);
  }
  if (!values.length) return null;
  const currency = values[0].currency;
  const amounts = values.map((v) => v.amount).sort((a, b) => a - b);
  return { currency, min: amounts[0], max: amounts[amounts.length - 1] };
}

function formatMoney(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString()}`;
}

function splitAddress(address?: string) {
  const parts = String(address || "").split(",").map((p) => p.trim()).filter(Boolean);
  if (!parts.length) return { city: "Dubai", community: "" };
  const last = parts[parts.length - 1];
  const first = parts[0];
  const lastIsCity = KNOWN_CITIES.some((c) => c.toLowerCase() === last.toLowerCase());
  const firstIsCity = KNOWN_CITIES.some((c) => c.toLowerCase() === first.toLowerCase());
  if (lastIsCity) {
    return { city: last, community: parts.slice(0, -1).join(", ") };
  }
  if (firstIsCity) {
    return { city: first, community: parts.slice(1).join(", ") };
  }
  return { city: "Dubai", community: parts.join(", ") };
}

function normalizeDeveloper(dev?: string) {
  if (!dev) return "";
  return String(dev)
    .replace(/\bDeveloper\b/gi, "")
    .replace(/\bView developer details\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function cleanDescription(desc?: string) {
  if (!desc) return "";
  return String(desc)
    .replace(/Show full description/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function toParagraphHtml(text: string) {
  if (!text) return "";
  const safe = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<p>${safe}</p>`;
}

function deriveUnitTypes(beds?: string) {
  if (!beds) return [] as string[];
  const trimmed = String(beds).trim();
  if (!trimmed) return [];
  const num = parseInt(trimmed, 10);
  if (!Number.isNaN(num)) {
    return [num === 0 ? "Studio" : `${num} Bedroom`];
  }
  return [trimmed];
}

function unique(arr: string[]) {
  return Array.from(new Set(arr.filter(Boolean)));
}

function stripEmpty<T extends Record<string, any>>(obj: T) {
  const out: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || value === null) continue;
    if (typeof value === "string" && value.trim() === "") continue;
    if (Array.isArray(value) && value.length === 0) continue;
    out[key] = value;
  }
  return out;
}

function mapPayloadToProject(payload: any) {
  const name = String(payload?.title || payload?.name || "").trim();
  const sourceUrl = String(payload?.url || "").trim();
  const slug = slugify(payload?.slug || extractSlugFromUrl(sourceUrl) || name);
  const { city, community } = splitAddress(payload?.address || payload?.location || "");

  const prices = collectPrices(payload?.price, payload?.features);
  const startingPrice = prices ? prices.min : null;
  const currency = prices ? prices.currency : "AED";
  const priceRange = prices && prices.min !== prices.max
    ? `${formatMoney(prices.min, currency)} - ${formatMoney(prices.max, currency)}`
    : prices
      ? formatMoney(prices.min, currency)
      : "";

  const description = cleanDescription(payload?.description || "");
  const shortOverview = description ? description.slice(0, 280).trim() : "";
  const fullDescription = description ? toParagraphHtml(description) : "";

  const images = unique([...(payload?.images || [])]);
  const localImages = unique([...(payload?.local_images || [])]);
  const masterPlanImages = images.filter((u) => /master[_-]?plan/i.test(u));

  const mapped = {
    name,
    slug,
    source: "propertyfinder",
    sourceUrl,
    status: "Off-Plan",
    projectType: "Residential",
    propertyType: "Apartment",
    developerName: normalizeDeveloper(payload?.developer || ""),
    community,
    city,
    country: "UAE",
    address: payload?.address || "",
    latitude: payload?.latitude ? Number(payload.latitude) : undefined,
    longitude: payload?.longitude ? Number(payload.longitude) : undefined,
    mapUrl: payload?.map_url || "",
    startingPrice,
    displayPrice: payload?.price || "",
    currency,
    priceRange,
    bedrooms: payload?.beds ? String(payload.beds) : "",
    bathrooms: payload?.baths ? String(payload.baths) : "",
    unitTypes: deriveUnitTypes(payload?.beds),
    shortOverview,
    fullDescription,
    featuredImage: payload?.thumbnail || images[0] || "",
    imageGallery: images,
    localImages,
    masterPlanImages,
    publishStatus: "Draft",
  };
  return stripEmpty(mapped);
}

export async function POST(req: NextRequest) {
  if (!IMPORT_SECRET) {
    return NextResponse.json({ error: "Import not configured" }, { status: 500 });
  }

  const secret = req.headers.get("x-import-secret");
  if (secret !== IMPORT_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const body = await req.json();
  const items = Array.isArray(body) ? body : [body];

  let processed = 0;
  let inserted = 0;
  let updated = 0;
  const errors: { index: number; error: string }[] = [];

  for (let i = 0; i < items.length; i++) {
    const payload = items[i];
    try {
      const project = mapPayloadToProject(payload);
      if (!project.name || !project.slug) {
        throw new Error("Missing title/slug");
      }

      const filter = project.sourceUrl
        ? { sourceUrl: project.sourceUrl }
        : { slug: project.slug };

      const existing = await Project.findOne(filter).select("_id").lean();
      if (existing) {
        await Project.updateOne(filter, { $set: project });
        updated++;
      } else {
        await Project.create(project);
        inserted++;
      }
      processed++;
    } catch (err: any) {
      errors.push({ index: i, error: err?.message || "Unknown error" });
    }
  }

  return NextResponse.json({ processed, inserted, updated, errors });
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
