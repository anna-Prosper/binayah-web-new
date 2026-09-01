import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

/**
 * On-demand ISR revalidation.
 *
 * Offer and guide pages render from MongoDB but are ISR-cached (1h / 24h), so
 * a document edit is otherwise invisible until the window lapses, with no way
 * to force it. POST here after changing DB-backed content to publish it
 * immediately.
 *
 * Use the no-body form. It revalidates the route patterns below, which is what
 * every offer/guide edit actually needs:
 *
 *   curl -X POST https://www.binayah.ae/api/revalidate \
 *     -H "x-admin-secret: $ADMIN_SECRET"
 *
 * `paths` exists for one-off literal routes, and it is a trap for offers and
 * guides. revalidatePath("/offers/some-slug") matches a literal path, not the
 * dynamic /[locale]/offers/[slug] route these pages are served from, so it
 * returns 200 and changes nothing. It looks like it works on a brand new page
 * only because nothing was cached there yet. If an edit is not showing up on
 * production and this endpoint said "revalidated", this is why.
 */
const DEFAULT_TARGETS: { path: string; type: "page" | "layout" }[] = [
  // Route-pattern form revalidates every dynamic instance — all locales, all
  // slugs — which is what "an offer/guide changed" almost always means.
  { path: "/[locale]/offers", type: "page" },
  { path: "/[locale]/offers/[slug]", type: "page" },
  { path: "/[locale]/pulse/guides", type: "page" },
  { path: "/[locale]/pulse/guides/[slug]", type: "page" },
];

export async function POST(req: NextRequest) {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }
  const provided = req.headers.get("x-admin-secret") || "";
  if (provided !== adminSecret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let paths: string[] = [];
  try {
    const body = await req.json();
    if (Array.isArray(body?.paths)) paths = body.paths.filter((p: unknown) => typeof p === "string");
  } catch {
    // No body — fall through to the defaults.
  }

  const revalidated: string[] = [];
  if (paths.length) {
    for (const p of paths) {
      revalidatePath(p);
      revalidated.push(p);
    }
  } else {
    for (const t of DEFAULT_TARGETS) {
      revalidatePath(t.path, t.type);
      revalidated.push(`${t.path} (${t.type})`);
    }
  }

  return NextResponse.json({ revalidated, at: new Date().toISOString() });
}
