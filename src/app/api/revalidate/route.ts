import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { projectRoutePattern } from "@/lib/routes";

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
// `type` is optional: revalidatePath's second argument is for ROUTE PATTERNS
// containing dynamic segments. A literal path like /sitemap.xml takes the
// one-argument form, and that is the call shape verified to actually refresh
// it — passing a type alongside a non-dynamic path is not the same request.
const DEFAULT_TARGETS: { path: string; type?: "page" | "layout" }[] = [
  // Route-pattern form revalidates every dynamic instance — all locales, all
  // slugs — which is what "an offer/guide changed" almost always means.
  { path: "/[locale]/offers", type: "page" },
  { path: "/[locale]/offers/[slug]", type: "page" },
  { path: "/[locale]/pulse/guides", type: "page" },
  { path: "/[locale]/pulse/guides/[slug]", type: "page" },
  // Projects and properties. Added when their `revalidate` was raised from 30
  // minutes to 24 hours: at 3,083 projects x 4 sub-routes x 7 locales, a
  // 30-minute timer was regenerating 86k pages around the clock and ISR
  // writes alone came to 63% of the hosting bill. A day-long window is only
  // safe because an edit can be published immediately from here — without
  // these entries a corrected price would have sat stale for 24 hours.
  // Built from lib/routes.ts so the project URL shape lives in one place — a
  // stale pattern here does not error, it silently makes revalidation a no-op.
  { path: projectRoutePattern(), type: "page" },
  { path: projectRoutePattern("floor-plans"), type: "page" },
  { path: projectRoutePattern("payment-plan"), type: "page" },
  { path: projectRoutePattern("location"), type: "page" },
  { path: "/[locale]/property/[slug]", type: "page" },
  // News articles. Same reasoning as projects above: a scraped article's body
  // is immutable once published, and 1,029 articles x 7 locales on an hourly
  // timer is the single largest remaining source of ISR writes. The page now
  // exports a 7-day window (effective window still 3600 — see the note there),
  // which is only safe to pursue because an edit or a retraction can be
  // published immediately from here.
  { path: "/[locale]/news/[slug]", type: "page" },
  // Community buy/rent landing pages. Raised from 30 minutes (826 prerendered
  // pages across the two routes — previously the largest bucket in the
  // prerender manifest, now 3600). Listed here so a listing correction on a
  // community page can still be published without waiting out the window.
  { path: "/[locale]/buy-property-in/[community]", type: "page" },
  { path: "/[locale]/rent-property-in/[community]", type: "page" },
  // The sitemap reads news, offers and projects straight from the API and the
  // DB, so its contents drift the moment any of those change — but it was not
  // in this list, so the no-body form never refreshed it. After the news feed
  // stopped listing 31 contentless articles, the live sitemap went on
  // submitting 28 URLs that return 404 until /sitemap.xml was revalidated by
  // hand. No `type`: it is a literal path, not a route pattern.
  { path: "/sitemap.xml" },
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
      if (t.type) revalidatePath(t.path, t.type);
      else revalidatePath(t.path);
      revalidated.push(t.type ? `${t.path} (${t.type})` : t.path);
    }
  }

  return NextResponse.json({ revalidated, at: new Date().toISOString() });
}
