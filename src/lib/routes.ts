/**
 * Route builders — the single place that knows what a URL on this site looks
 * like.
 *
 * Before this existed, project URLs were hand-built as `/project/${slug}`
 * template literals in 169 places across 48 files, with exactly one of them
 * going through a helper. `canonical()` in lib/site.ts is a locale/domain
 * prefixer — you hand it a path you already constructed — so it never knew
 * what a project path was either.
 *
 * That made the URL shape unchangeable in practice: a Sept 2026 review of
 * moving project pages under /off-plan/ found the move would be a 48-file
 * mechanical sweep with no build error and no test to catch a miss, across
 * JSON-LD `url` fields, canonicals feeding hreflang, a `callbackUrl` query
 * param, and 52 hardcoded hrefs in offers data. The move was not made (the
 * pages rank for project names, not "off plan" queries — see the GSC evidence
 * in that review), but the fragility it exposed is real regardless.
 *
 * Use these builders for new code, and prefer them when touching old code.
 * Changing a URL shape then means editing the constant here, not sweeping the
 * codebase.
 *
 * NOTE these return LOCALE-LESS paths. Pass the result to `canonical(locale,
 * path)` for an absolute canonical URL, or to a `@/navigation` Link/router
 * which applies the locale prefix itself. Never hand-prefix a locale onto one
 * of these (see the locale-link-double-prefix trap).
 */

/** The path segment that project detail pages live under. */
export const PROJECT_SEGMENT = "project";

/** Sub-pages of a project detail page. */
export type ProjectSubPage = "floor-plans" | "payment-plan" | "location" | "faq";

/**
 * Path for an off-plan project detail page, or one of its sub-pages.
 *
 *   projectUrl("emaar-valia")                 -> "/project/emaar-valia"
 *   projectUrl("emaar-valia", "floor-plans")  -> "/project/emaar-valia/floor-plans"
 */
export function projectUrl(slug: string, sub?: ProjectSubPage): string {
  const base = `/${PROJECT_SEGMENT}/${slug}`;
  return sub ? `${base}/${sub}` : base;
}

/** The Next.js route *pattern* for a project page, as /api/revalidate needs it. */
export function projectRoutePattern(sub?: ProjectSubPage): string {
  const base = `/[locale]/${PROJECT_SEGMENT}/[slug]`;
  return sub ? `${base}/${sub}` : base;
}

/** Path for a secondary-market property listing. */
export function propertyUrl(slug: string): string {
  return `/property/${slug}`;
}

/** Path for a community page. */
export function communityUrl(slug: string): string {
  return `/communities/${slug}`;
}

/** Path for a developer page. */
export function developerUrl(slug: string): string {
  return `/developers/${slug}`;
}

/** Path for the off-plan hub, or a type/emirate landing page under it. */
export function offPlanUrl(segment?: string): string {
  return segment ? `/off-plan/${segment}` : "/off-plan";
}

/** Path for the per-community off-plan landing page. */
export function offPlanInUrl(community: string): string {
  return `/off-plan-in/${community}`;
}
