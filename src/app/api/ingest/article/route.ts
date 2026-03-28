export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import Article from "@/models/Article";

/* ─────────────────────────────────────────────
   Auth helper
───────────────────────────────────────────── */
function isAuthorized(req: NextRequest): boolean {
  const key = req.headers.get("x-api-key");
  return !!key && key === process.env.INGEST_API_KEY;
}

/* ─────────────────────────────────────────────
   Slug generator
───────────────────────────────────────────── */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/* ─────────────────────────────────────────────
   Reading time estimator (~200 words/min)
───────────────────────────────────────────── */
function estimateReadTime(content: string): string {
  const words = content.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min read`;
}

/* ═══════════════════════════════════════════
   POST /api/ingest/article
   Creates a new news/blog article from JSON.

   Expected JSON payload:
   {
     "title":            "Article title",           // required
     "content":          "<p>HTML content</p>",     // required
     "excerpt":          "Short summary",           // optional — auto-generated if missing
     "slug":             "article-url-slug",        // optional — generated from title
     "category":         "Market News",             // optional
     "tags":             ["dubai", "real estate"],  // optional
     "featured_image":   "https://...",             // optional
     "author":           "Binayah Editorial",       // optional
     "published_at":     "2025-08-01",              // optional — defaults to now
     "seo": {
       "meta_title":       "...",                   // optional
       "meta_description": "..."                    // optional
     }
   }
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

  // Validate required fields
  if (!body.title || !body.content) {
    return NextResponse.json(
      { success: false, message: "Missing required fields: title, content" },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const slug = body.slug ?? generateSlug(body.title);

    // Check for duplicate
    const exists = await Article.findOne({ slug }).lean();
    if (exists) {
      return NextResponse.json(
        {
          success: false,
          message: "Article with this slug already exists",
          existingSlug: slug,
          existingId: (exists as any)._id,
        },
        { status: 409 }
      );
    }

    // Auto-generate excerpt from content if not provided
    const excerpt =
      body.excerpt ||
      body.content
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 200) + "...";

    const article = await Article.create({
      title:           body.title,
      slug,
      content:         body.content,
      excerpt,
      category:        body.category        ?? "Market News",
      tags:            body.tags            ?? [],
      featuredImage:   body.featured_image  ?? body.featuredImage ?? "",
      author:          body.author          ?? "Binayah Editorial",
      readTime:        body.read_time       ?? estimateReadTime(body.content),
      metaTitle:       body.seo?.meta_title       ?? body.metaTitle       ?? body.title,
      metaDescription: body.seo?.meta_description ?? body.metaDescription ?? excerpt.slice(0, 160),
      publishedAt:     body.published_at    ?? new Date().toISOString(),
      publishStatus:   "Published",
    });

    // Revalidate article page + news listing
    revalidatePath(`/news/${slug}`);
    revalidatePath("/news");
    revalidatePath("/");

    return NextResponse.json(
      {
        success: true,
        message: "Article created successfully",
        slug,
        id: article._id,
        url: `/news/${slug}`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[ingest/article POST]", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "Duplicate key — article already exists", detail: error.message },
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
   PATCH /api/ingest/article
   Updates an existing article by slug.
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

  if (!body.slug) {
    return NextResponse.json(
      { success: false, message: "Provide slug to identify the article" },
      { status: 400 }
    );
  }

  try {
    await connectDB();

    const existing = await Article.findOne({ slug: body.slug }).lean() as any;
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Article not found" },
        { status: 404 }
      );
    }

    const allowed = ["title", "content", "excerpt", "category", "tags",
      "featuredImage", "author", "readTime", "metaTitle", "metaDescription",
      "publishedAt", "publishStatus"];

    const updateFields: Record<string, any> = {};
    for (const key of allowed) {
      // Map snake_case aliases
      const value = body[key] ?? body[key.replace(/([A-Z])/g, "_$1").toLowerCase()];
      if (value !== undefined) updateFields[key] = value;
    }
    // SEO aliases
    if (body.seo?.meta_title)       updateFields.metaTitle       = body.seo.meta_title;
    if (body.seo?.meta_description) updateFields.metaDescription = body.seo.meta_description;

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({
        success: true,
        message: "Nothing to update",
        slug: body.slug,
      });
    }

    await Article.updateOne({ slug: body.slug }, { $set: updateFields });

    revalidatePath(`/news/${body.slug}`);
    revalidatePath("/news");

    return NextResponse.json({
      success: true,
      message: "Article updated",
      slug: body.slug,
      updatedFields: Object.keys(updateFields),
    });
  } catch (error: any) {
    console.error("[ingest/article PATCH]", error);
    return NextResponse.json(
      { success: false, message: "Server error", detail: error.message },
      { status: 500 }
    );
  }
}
