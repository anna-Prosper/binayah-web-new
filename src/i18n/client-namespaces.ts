/**
 * Which translation namespaces get serialised into the HTML for the client.
 *
 * Why this exists: `NextIntlClientProvider messages={messages}` in
 * [locale]/layout.tsx used to pass the WHOLE catalogue — all 80 namespaces,
 * ~179KB of en.json (more for ru/ar) — into every single page's RSC payload.
 * On the homepage that was ~182KB of the 449KB inline flight payload, shipping
 * `privacyPolicy`, `termsOfService`, `projectDetail`, `dealCheck` and 70 other
 * namespaces the page never renders. It inflated the document to 710KB, which
 * is the dominant cost behind the poor mobile LCP.
 *
 * The split is two-level, because the layout is statically cached and cannot
 * read the pathname (doing so calls headers() and forces every route dynamic,
 * killing the ISR/edge cache — see the setRequestLocale comment in the layout):
 *
 *   1. The layout provider ships BASE_CLIENT_NAMESPACES — just what the
 *      always-mounted chrome needs (~12% of the catalogue).
 *   2. A page needing more wraps its own subtree in a second
 *      NextIntlClientProvider carrying its extra namespaces. next-intl
 *      serialises only what each provider is explicitly given, so the nested
 *      one adds its slice rather than re-sending everything.
 *
 * Rules when editing:
 * - Top-level namespaces only. Nested paths like "home.hero" resolve under
 *   "home", so listing "home" covers them.
 * - `t.raw()` / `t.has()` read whole subtrees, so a namespace is all-or-nothing.
 *   Never prune keys inside a namespace.
 * - A missing namespace does NOT throw: next-intl logs via onError and renders
 *   the raw key path ("footer.copyright") as visible page text. Silent, so it
 *   is guarded by scripts/i18n-namespace-audit.mjs rather than a type check.
 */

type Msgs = Record<string, unknown>;

/**
 * Needed by the client chrome mounted on EVERY page in [locale]/layout.tsx
 * (Navbar + its search/user menus, Footer, WhatsAppButton, AIChatWidget,
 * ScrollToTop, FavoritesDrawer, CookieConsent, CampaignPopup, LiveChatBanner)
 * plus the shared enum/label dictionaries those pull in.
 */
export const BASE_CLIENT_NAMESPACES = [
  "aiChat",
  "breadcrumbs",
  "common",
  "cookieConsent",
  "countryCode",
  "enums",
  "favoritesDrawer",
  "footer",
  "guidePopup",
  "listProperty",
  "liveChat",
  "nav",
  "newsletter",
  "notificationsBell",
  "propertyComparison",
  "savedProperties",
  "scrollToTop",
  "search",
  "share",
  "signIn",
  "subscribe",
  "userMenu",
  "whatsapp",
] as const;

/**
 * Extra namespaces the homepage's own client components read, on top of the
 * base chrome set. Sources: HeroSection ("home.hero", "nav"), CryptoBanner,
 * AIPulseBanner, FeaturedPropertiesClient, OffPlanSectionClient, ValuationStrip
 * /ValuationCTA ("home.sections.valuation", "valuationBanner"), PropertyMatcher,
 * MarketDashboard, ROICalculator, MortgageCalculator, TestimonialsSection,
 * InquirySection, NewsletterStrip, and the server-rendered slots' client
 * descendants (services / communities / news / listProperty).
 */
export const HOME_CLIENT_NAMESPACES = [
  "communities",
  "contact",
  "home",
  "inquiry",
  "marketDashboard",
  "mortgageCalculator",
  "news",
  "offPlan",
  "propertyMatcher",
  "roiCalculator",
  "services",
  "valuation",
  "valuationBanner",
] as const;

function pick(messages: Msgs, keys: readonly string[]): Msgs {
  const wanted = new Set(keys);
  const out: Msgs = {};
  for (const key of Object.keys(messages)) {
    if (wanted.has(key)) out[key] = messages[key];
  }
  return out;
}

/** The chrome-only slice for the root layout's provider. */
export function pickBaseMessages(messages: Msgs): Msgs {
  return pick(messages, BASE_CLIENT_NAMESPACES);
}

/**
 * A page's slice, for a nested provider.
 *
 * MUST include the base namespaces: next-intl's IntlProvider REPLACES the
 * context rather than merging with an outer provider, so anything rendered
 * inside this provider only sees what is passed here. Omitting the base set
 * made the layout's Footer render raw key paths ("footer.copyright"), because
 * `children` is nested inside the page's provider.
 *
 * This still cuts the payload hard: base + one route's namespaces is a small
 * fraction of the 80-namespace catalogue. The overlap with the layout's own
 * provider is a few KB of chrome strings, not the whole catalogue.
 */
export function pickRouteMessages(messages: Msgs, namespaces: readonly string[]): Msgs {
  return pick(messages, [...BASE_CLIENT_NAMESPACES, ...namespaces]);
}
