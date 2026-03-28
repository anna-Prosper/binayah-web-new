export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";

/* ─────────────────────────────────────────────
   Auth helper — validates API key from header
   Set INGEST_API_KEY in your .env.local
───────────────────────────────────────────── */
function isAuthorized(req: NextRequest): boolean {
  const key = req.headers.get("x-api-key");
  return !!key && key === process.env.INGEST_API_KEY;
}

/* ─────────────────────────────────────────────
   Slug generator — SEO-friendly URL from name
───────────────────────────────────────────── */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/* ─────────────────────────────────────────────
   Map JSON payload → Project schema fields
   Handles both our enriched-project.json shape
   and a flat shape for manual entries
───────────────────────────────────────────── */
function mapPayload(body: any): Partial<typeof Project.prototype> {
  // Support both top-level fields and nested dubai_project shape
  const p = body.dubai_project ?? body;
  const hero    = p.hero_stats    ?? {};
  const overview = p.overview     ?? {};
  const sidebar  = p.sidebar      ?? {};
  const dev      = p.developer    ?? {};
  const meta     = p.meta         ?? {};
  const loc      = p.location_info ?? p.location ?? {};
  const payment  = p.payment_plan_details ?? p.payment_plan ?? {};

  // Resolve name
  const name: string =
    p.name ||
    overview.title ||
    p.wordpress_format?.post_title ||
    "";

  // Resolve slug — use provided or generate
  const rawSlug: string =
    p.seo?.slug ||
    p.slug ||
    generateSlug(name);

  return {
    name,
    slug:               rawSlug,
    source:             p.source             ?? meta.source_url ? "monitoring" : "manual",
    sourceId:           p.source_id          ?? p.sourceId ?? "",
    sourceUrl:          p.source_url         ?? meta.source_url ?? "",
    status:             p.status             ?? hero.hero_status ?? "New Launch",
    projectType:        p.project_type       ?? sidebar.project_details?.project_type ?? "Residential",
    propertyType:       p.property_type      ?? sidebar.project_details?.property_type ?? "Residential",
    developerName:      p.developer_name     ?? p.developerName ?? hero.hero_developer ?? dev.name ?? "",
    community:          p.community          ?? loc.community ?? sidebar.project_details?.community ?? "",
    city:               p.city               ?? loc.city ?? "Dubai",
    country:            p.country            ?? loc.country ?? "UAE",
    address:            p.address            ?? "",
    latitude:           p.latitude           ?? null,
    longitude:          p.longitude          ?? null,
    mapUrl:             p.map_url            ?? loc.google_map ?? loc.google_map_url ?? "",
    startingPrice:      p.starting_price     ?? p.startingPrice ?? null,
    displayPrice:       p.display_price      ?? hero.hero_price_aed ?? "",
    currency:           p.currency           ?? "AED",
    priceRange:         p.price_range        ?? "",
    bedrooms:           p.bedrooms           ?? hero.stat_unit_types ?? "",
    unitTypes:          p.unit_types         ?? (hero.stat_unit_types ? [hero.stat_unit_types] : []),
    totalUnits:         p.total_units        ?? null,
    completionDate:     p.completion_date    ?? p.completionDate ?? hero.stat_handover ?? "",
    constructionStatus: p.construction_status ?? "",
    downPayment:        p.down_payment       ?? payment.notes?.[0] ?? "",
    paymentPlanSummary: p.payment_plan_summary ?? payment.structure_text ?? "",
    paymentPlanDetails: typeof p.payment_plan_details === "string"
      ? p.payment_plan_details
      : JSON.stringify(p.payment_plan_details ?? p.payment_plan ?? {}),
    shortOverview:      p.short_overview     ?? overview.short ?? p.shortOverview ?? "",
    fullDescription:    p.full_description   ?? overview.description ?? p.wordpress_format?.post_content ?? "",
    keyHighlights:      p.key_highlights     ?? p.keyHighlights ?? [],
    investmentHighlights: p.investment_highlights?.items ?? p.investmentHighlights ?? [],
    amenities:          p.amenities          ?? dev.amenities ?? [],
    nearbyAttractions:  p.nearby_attractions ?? p.nearbyAttractions ?? p.location?.nearby ?? [],
    faqs:               p.faqs               ?? [],
    floorPlans:         p.floor_plans        ?? p.floorPlans ?? [],
    unitSizeMin:        p.unit_size_min      ?? p.unitSizeMin ?? null,
    unitSizeMax:        p.unit_size_max      ?? p.unitSizeMax ?? null,
    availabilityStatus: sidebar.project_details?.availability ?? "Available",
    featuredImage:      p.featured_image     ?? hero.hero_image ?? meta.featured_image_url ?? "",
    imageGallery:       p.image_gallery      ?? hero.hero_gallery ?? p.imageGallery ?? [],
    masterPlanImages:   p.master_plan_images ?? [],
    masterPlanUrl:      p.master_plan_url    ?? "",
    masterPlanDescription: p.master_plan_description ?? "",
    videos:             p.videos             ?? [],
    videoUrl:           p.video_url          ?? p.video_tour?.url ?? "",
    whatsappNumber:     p.whatsapp_number    ?? "971549988811",
    brochureUrl:        p.brochure_url       ?? meta.brochure_url ?? "",
    metaTitle:          p.seo?.meta_title    ?? p.metaTitle ?? "",
    metaDescription:    p.seo?.meta_description ?? p.metaDescription ?? "",
    focusKeyword:       p.seo?.focus_keyword ?? "",
    tags:               p.tags              ?? p.meta?.tags ?? [],
    areas:              p.areas             ?? [],
    publishStatus:      "Published",
    publishedAt:        new Date().toISOString(),
  };
}

/* ═══════════════════════════════════════════
   POST /api/ingest/project
   Creates a new project page from JSON.
   Returns 409 if slug already exists.
═══════════════════════════════════════════ */
export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized — invalid or missing API key" },
      { status: 401 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  // Validate minimum required fields
  const name =
    body.name ||
    body.dubai_project?.overview?.title ||
    body.dubai_project?.wordpress_format?.post_title ||
    "";

  if (!name) {
    return NextResponse.json(
      { success: false, message: "Missing required field: name" },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const data = mapPayload(body);

    // Ensure slug is unique — append timestamp if collision
    const exists = await Project.findOne({ slug: data.slug }).lean();
    if (exists) {
      // Duplicate — check if we should update instead
      return NextResponse.json(
        {
          success: false,
          message: "Project with this slug already exists. Use PATCH to update.",
          existingSlug: data.slug,
          existingId: (exists as any)._id,
        },
        { status: 409 }
      );
    }

    const project = await Project.create(data);

    // Revalidate the new page immediately so it goes live
    revalidatePath(`/project/${data.slug}`);
    revalidatePath("/off-plan");
    revalidatePath("/");

    return NextResponse.json(
      {
        success: true,
        message: "Project page created successfully",
        slug: data.slug,
        id: project._id,
        url: `/project/${data.slug}`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[ingest/project POST]", error);
    // Mongoose duplicate key
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "Duplicate key — project already exists", detail: error.message },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Server error", detail: error.message },
      { status: 500 }
    );
  }
}

/* ═══════════════════════════════════════════
   PATCH /api/ingest/project
   Updates an existing project — fills missing
   fields only (does not overwrite existing data
   unless force=true is passed in body).
   Matches by slug or sourceId.
═══════════════════════════════════════════ */
export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { success: false, message: "Unauthorized — invalid or missing API key" },
      { status: 401 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const slug     = body.slug     ?? body.dubai_project?.slug;
  const sourceId = body.source_id ?? body.sourceId;
  const force    = body.force === true; // if true, overwrite all fields

  if (!slug && !sourceId) {
    return NextResponse.json(
      { success: false, message: "Provide slug or source_id to identify the project" },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    // Find existing project
    const filter = slug ? { slug } : { sourceId };
    const existing = await Project.findOne(filter).lean() as any;

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }

    const incoming = mapPayload(body);

    let updateFields: Record<string, any>;

    if (force) {
      // Overwrite everything except _id and createdAt
      const { slug: _s, ...rest } = incoming as any;
      updateFields = rest;
    } else {
      // Fill gaps only — only update fields that are empty/null/undefined in DB
      updateFields = {};
      for (const [key, value] of Object.entries(incoming)) {
        if (key === "slug" || key === "publishedAt") continue;
        const current = existing[key];
        const isEmpty =
          current === null ||
          current === undefined ||
          current === "" ||
          (Array.isArray(current) && current.length === 0);
        if (isEmpty && value !== null && value !== undefined && value !== "") {
          updateFields[key] = value;
        }
      }
    }

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({
        success: true,
        message: "No missing fields to update — project already complete",
        slug: existing.slug,
        id: existing._id,
        updated: 0,
      });
    }

    await Project.updateOne(filter, { $set: updateFields });

    // Revalidate the page
    revalidatePath(`/project/${existing.slug}`);
    revalidatePath("/off-plan");

    return NextResponse.json({
      success: true,
      message: force ? "Project updated (force)" : "Project gaps filled",
      slug: existing.slug,
      id: existing._id,
      updated: Object.keys(updateFields).length,
      updatedFields: Object.keys(updateFields),
    });
  } catch (error: any) {
    console.error("[ingest/project PATCH]", error);
    return NextResponse.json(
      { success: false, message: "Server error", detail: error.message },
      { status: 500 }
    );
  }
}
