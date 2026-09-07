/**
 * News topicality — which /news articles are allowed to be indexed.
 *
 * binayah.ae is a Dubai real-estate brokerage. The /news feed is populated from
 * a general UAE news scrape, so a large slice of it (theme-park openings, film
 * tributes, chip fabs, restaurant reviews) has nothing to do with property.
 * Google grades topical authority: publishing that kind of thing under the same
 * domain dilutes the terms we actually compete on, and it burns crawl budget.
 *
 * So: off-topic articles get `robots: { index: false, follow: true }` and are
 * left out of the sitemap. They are NOT deleted — the page stays live and
 * reachable, it just stops competing in search and still passes link equity.
 *
 * The SAME predicate must drive both the meta robots tag and the sitemap,
 * otherwise we submit URLs that self-noindex ("Submitted URL marked noindex" in
 * GSC). That is why this lives in one exported function and is imported by both
 * `news/[slug]/page.tsx` and `sitemap.ts` rather than being written out twice.
 *
 * Bias: DEFAULT TO INDEXABLE. A wrongly-noindexed good article costs real
 * traffic; a borderline off-topic article left indexed costs almost nothing.
 * Any single signal anywhere in title/excerpt/tags keeps the article.
 */

/** The fields the classifier reads. All optional — callers pass what they have. */
export type NewsTopicalityInput = {
  title?: string | null;
  excerpt?: string | null;
  metaDescription?: string | null;
  category?: string | null;
  tags?: string[] | null;
};

// Real-estate signals: transactions, asset types, regulators, developers.
const REAL_ESTATE_SIGNALS = [
  // core vocabulary
  "property", "properties", "real estate", "realty", "housing", "homebuyer",
  "home buyer", "house price", "home price", "square foot", "sq ft", "sqft",
  // asset types
  "villa", "villas", "apartment", "apartments", "townhouse", "townhouses",
  "penthouse", "penthouses", "studio flat", "flat for", "residential", "tower",
  "high-rise", "waterfront home", "mansion", "plot", "land sale",
  // transaction / tenure
  "off-plan", "off plan", "freehold", "leasehold", "title deed", "oqood",
  "handover", "mortgage", "down payment", "payment plan", "escrow",
  // supply side — permits and construction are property-market news
  "building permit", "construction", "built-up", "master plan", "masterplan",
  "municipality", "units delivered", "new supply",
  "rent", "rents", "rental", "rentals", "tenant", "tenants", "landlord",
  "lease", "leasing", "eviction", "service charge", "sales transaction",
  // regulators / registries
  "dld", "dubai land department", "rera", "ejari", "dubai rest", "smart rental",
  "rental index", "mollak", "trakhees", "adrec", "dmt ", "abu dhabi real estate",
  // investment vocabulary — deliberately NARROW. Generic business words
  // ("investor", "investment", "market impact") appear in almost every scraped
  // business story and would rescue airline and retail news, so they are not here.
  "yield", "yields", "roi", "return on investment", "capital appreciation",
  "rental income", "property investment", "real estate investment",
  "price per sq", "transaction volume", "sales value", "property price",
  // developers
  "emaar", "damac", "nakheel", "sobha", "aldar", "meraas", "binghatti",
  "azizi", "danube", "ellington", "omniyat", "select group", "deyaar",
  "union properties", "dubai holding", "wasl", "eagle hills", "arada",
  "samana", "tiger group", "mag ", "shapoorji", "imtiaz", "bloom holding",
  // Dubai communities that only ever come up in a property context
  "dubai marina", "downtown dubai", "palm jumeirah", "palm jebel ali",
  "business bay", "jumeirah village", "jvc", "dubai hills", "arabian ranches",
  "dubai creek harbour", "emirates hills", "bluewaters", "difc",
  "mbr city", "mohammed bin rashid city", "dubai south", "expo city",
  "damac hills", "town square", "al barari", "dubai islands", "the valley",
  "emaar beachfront", "jumeirah beach residence", "jbr ", "al furjan",
  "dubai investments park", "silicon oasis",
  "saadiyat", "al reem island", "hudayriyat",
];

// Relocation / living-in-Dubai signals. A buyer moving here plausibly wants
// these, so they are defensible on the same domain and stay indexable.
const RELOCATION_SIGNALS = [
  "visa", "visas", "golden visa", "residency", "residence permit", "emirates id",
  "expat", "expats", "expatriate", "relocation", "relocating", "moving to dubai",
  "moving to the uae", "cost of living", "school", "schools", "tuition",
  "nursery", "university", "salary", "salaries", "wages", "payroll",
  "dewa", "sewa", "addc", "utility bill", "utilities", "electricity bill",
  "water bill",
  "metro", "etihad rail", "rta", "commute", "traffic", "toll", "salik", "parking fee",
  "health insurance", "medical insurance",
  "income tax", "household budget", "family budget",
];

const ALL_SIGNALS = [...REAL_ESTATE_SIGNALS, ...RELOCATION_SIGNALS];

// The scraped feed's `category` is a coarse bucket, NOT a topical guarantee —
// "Market Report" currently holds a chiplet-fab announcement and an oil-supply
// warning. So category is deliberately kept OUT of the signal haystack, and only
// "Weekly Report" (our own in-house market reports, whose headlines are often
// just numbers) is trusted as an automatic keep.
const ALWAYS_INDEXABLE_CATEGORIES = new Set(["weekly report"]);

/**
 * A signal matches on a word boundary so "rent" doesn't fire on "different"
 * and "roi" doesn't fire on "Detroit". Multi-word signals and ones that end in
 * a space (e.g. "mag ") are matched literally, which is the point of the space.
 */
function haystackHasSignal(haystack: string, signal: string): boolean {
  const isWordChar = (c: string | undefined) => !!c && /[a-z0-9]/.test(c);
  // Signals that deliberately end with a space carry their own right boundary.
  const needsRightBoundary = !signal.endsWith(" ");
  // Every occurrence is checked, not just the first: "rent" appearing inside
  // "different" early in the text must not hide a real standalone "rent" later.
  for (let i = haystack.indexOf(signal); i !== -1; i = haystack.indexOf(signal, i + 1)) {
    if (isWordChar(haystack[i - 1])) continue;
    if (needsRightBoundary && isWordChar(haystack[i + signal.length])) continue;
    return true;
  }
  return false;
}

/**
 * True when the article is on-topic enough to index (property, or the adjacent
 * relocation/living cluster). False only when NOTHING in the article's text
 * touches either cluster.
 */
export function isIndexableNewsArticle(article: NewsTopicalityInput): boolean {
  const category = (article.category || "").trim().toLowerCase();
  if (ALWAYS_INDEXABLE_CATEGORIES.has(category)) return true;

  const haystack = [
    article.title || "",
    article.excerpt || "",
    article.metaDescription || "",
    ...(Array.isArray(article.tags) ? article.tags : []),
  ]
    .join(" • ")
    .toLowerCase()
    // Curly quotes become spaces so "Dubai\u2019s rental market" still matches
    // "rental" on a clean word boundary. Hyphens and brackets are already
    // non-word characters as far as the boundary check is concerned.
    .replace(/[\u2018\u2019\u201c\u201d]/g, " ");

  // Nothing to judge (missing/empty article data) → keep it indexable.
  if (!haystack.replace(/[^a-z0-9]/g, "")) return true;

  return ALL_SIGNALS.some((s) => haystackHasSignal(haystack, s));
}
