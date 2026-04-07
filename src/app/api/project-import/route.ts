import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";

export const dynamic = "force-dynamic";

const IMPORT_SECRET = process.env.PROJECT_IMPORT_SECRET;

const KNOWN_CITIES = [
  "Dubai", "Abu Dhabi", "Sharjah", "Ras Al Khaimah",
  "Ajman", "Umm Al Quwain", "Fujairah",
];

function slugify(value: string) {
  return String(value || "")
    .toLowerCase().trim()
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
  } catch { return ""; }
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

function formatMoney(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString()}`;
}

function splitAddress(address?: string) {
  const parts = String(address || "").split(",").map((p) => p.trim()).filter(Boolean);
  if (!parts.length) return { city: "Dubai", community: "" };
  const last = parts[parts.length - 1];
  const first = parts[0];
  if (KNOWN_CITIES.some((c) => c.toLowerCase() === last.toLowerCase()))
    return { city: last, community: parts.slice(0, -1).join(", ") };
  if (KNOWN_CITIES.some((c) => c.toLowerCase() === first.toLowerCase()))
    return { city: first, community: parts.slice(1).join(", ") };
  return { city: "Dubai", community: parts.join(", ") };
}

function normalizeDeveloper(dev?: string) {
  if (!dev) return "";
  return String(dev)
    .replace(/\bDeveloper\b/gi, "")
    .replace(/\bView developer details\b/gi, "")
    .replace(/\s{2,}/g, " ").trim();
}

function cleanDescription(desc?: string) {
  if (!desc) return "";
  return String(desc).replace(/Show full description/gi, "").replace(/\s{2,}/g, " ").trim();
}

function toParagraphHtml(text: string) {
  if (!text) return "";
  const safe = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<p>${safe}</p>`;
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

// ─── New format mapper (all_projects structure) ────────────────────────────────

function mapNewFormat(data: any) {
  const p = data.all_projects;
  const hero = p.hero_stats || {};
  const overview = p.overview || {};
  const details = p.project_details || {};
  const sidebar = p.property_sidebar?.project_info || {};
  const locationInfo = p.location_and_nearby?.info || {};
  const wp = p.wordpress_data || {};

  const name = String(
    overview.title || sidebar.title || hero.hero_stats?.title || wp.title || ""
  ).trim();

  const slug = slugify(name);

  const city = locationInfo.city || sidebar.city || hero.hero_location?.split(",").pop()?.trim() || "Dubai";
  const community = locationInfo.community || sidebar.community || hero.hero_location || "";

  // Price — parse from hero_price_aed
  const priceRaw = hero.hero_price_aed || "";
  const priceNum = parsePriceCandidate(priceRaw);

  // Images
  const galleryImages = unique([
    ...(hero.hero_gallery || []),
  ]);
  const featuredImage = hero.hero_image || galleryImages[0] || "";

  // Unit types from available_units
  const unitTypes = unique(
    (p.available_units || p.floor_plans || []).map((u: any) => u.title || u.beds || "")
  );

  // Floor plans
  const floorPlans = (p.floor_plans || p.available_units || []).map((fp: any) => ({
    title: fp.title || "",
    beds: fp.beds || "",
    size: fp.size || "",
    image: fp.image || "",
    pdf: fp.pdf || "",
  }));

  // Payment plan
  const paymentPlan = p.payment_plan?.steps?.length
    ? {
        structure: p.payment_plan_details?.structure_text || "",
        steps: p.payment_plan.steps.map((s: any) => ({
          percent: s.percent || "",
          title: s.title || "",
          description: s.amount || "",
        })),
      }
    : undefined;

  // Amenities
  const amenities = unique([
    ...(details.amenities || []),
  ]);

  // Key highlights
  const highlights = p.key_highlights || [];

  const description = cleanDescription(overview.full_desc || wp.content || "");
  const shortOverview = overview.short_desc || description.slice(0, 280).trim();
  const fullDescription = toParagraphHtml(description);

  // Video tour
  const videoTour = p.video_tour?.url
    ? { url: p.video_tour.url, title: p.video_tour.title || "", thumbnail: p.video_tour.thumbnail || "" }
    : undefined;

  // Master plan
  const masterPlanImage = details.master_plan_image || "";

  // FAQs
  const faqs = (p.property_faqs || []).map((f: any) => ({
    question: f.question || f.q || "",
    answer: f.answer || f.a || "",
  }));

  const mapped = {
    name,
    slug,
    source: "tanami",
    status: hero.hero_status || sidebar.status || "Off-Plan",
    projectType: "Residential",
    propertyType: hero.hero_type || sidebar.property_type || "Apartment",
    developerName: normalizeDeveloper(
      details.developer_name || hero.hero_developer || sidebar.developer || ""
    ),
    developerLogo: details.developer_logo || "",
    community,
    city,
    country: locationInfo.country || "UAE",
    mapUrl: p.location_nearby?.google_map_url || locationInfo.google_map_url || "",
    startingPrice: priceNum?.amount ?? null,
    displayPrice: priceRaw,
    currency: priceNum?.currency || "AED",
    priceRange: priceRaw,
    unitTypes,
    sizeRange: hero.stat_size_range || "",
    handover: hero.stat_handover || "",
    ownership: hero.stat_ownership || "",
    totalUnits: sidebar.total_units || "",
    shortOverview,
    fullDescription,
    featuredImage,
    imageGallery: galleryImages,
    masterPlanImage,
    floorPlans: floorPlans.length ? floorPlans : undefined,
    paymentPlan,
    amenities: amenities.length ? amenities : undefined,
    highlights: highlights.length ? highlights : undefined,
    videoTour,
    brochureUrl: p.brochure_url || "",
    faqs: faqs.length ? faqs : undefined,
    publishStatus: "Draft",
  };

  return stripEmpty(mapped);
}

// ─── Legacy flat format mapper ─────────────────────────────────────────────────

function mapLegacyFormat(payload: any) {
  const name = String(payload?.title || payload?.name || "").trim();
  const sourceUrl = String(payload?.url || "").trim();
  const slug = slugify(payload?.slug || extractSlugFromUrl(sourceUrl) || name);
  const { city, community } = splitAddress(payload?.address || payload?.location || "");

  const priceNum = parsePriceCandidate(payload?.price);
  const description = cleanDescription(payload?.description || "");

  const images = unique([...(payload?.images || [])]);

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
    startingPrice: priceNum?.amount ?? null,
    displayPrice: payload?.price || "",
    currency: priceNum?.currency || "AED",
    priceRange: payload?.price || "",
    bedrooms: payload?.beds ? String(payload.beds) : "",
    shortOverview: description.slice(0, 280).trim(),
    fullDescription: toParagraphHtml(description),
    featuredImage: payload?.thumbnail || images[0] || "",
    imageGallery: images,
    publishStatus: "Draft",
  };

  return stripEmpty(mapped);
}

// ─── Auto-detect format ────────────────────────────────────────────────────────

function mapPayloadToProject(payload: any) {
  // New format: has all_projects key
  if (payload?.all_projects) {
    return mapNewFormat(payload);
  }
  // Legacy flat format
  return mapLegacyFormat(payload);
}

// ─── Route handlers ────────────────────────────────────────────────────────────

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
      if (!project.name || !project.slug) throw new Error("Missing title/slug");

      const filter = { slug: project.slug };
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