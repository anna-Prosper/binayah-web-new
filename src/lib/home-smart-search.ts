export const HOME_SEARCH_TABS = ["Buy", "Rent", "Off-Plan"] as const;
export const HOME_SEARCH_PROPERTY_TYPES = ["Apartment", "Villa", "Townhouse", "Penthouse", "Studio", "Compound", "Duplex", "Hotel Apartment"] as const;
export const HOME_SEARCH_BEDROOM_OPTIONS = ["Studio", "1", "2", "3", "4", "5", "6", "7", "7+"] as const;
export const HOME_SEARCH_BATHROOM_OPTIONS = ["1", "2", "3", "4", "5", "6", "7", "7+"] as const;
export const HOME_SEARCH_BUY_BUDGETS = ["Up to 500K", "500K - 1M", "1M - 2M", "2M - 5M", "5M - 10M", "10M+"] as const;
export const HOME_SEARCH_RENT_BUDGETS = ["Up to 100K", "100K - 200K", "200K - 350K", "350K - 500K", "500K+"] as const;

export type HomeSearchTab = (typeof HOME_SEARCH_TABS)[number];
export type HomeSearchIntent = "buy" | "rent" | "off-plan";
export type HomeSearchSuggestionKind = "smart-search" | "community" | "project" | "developer" | "place" | "ask-ai";

export interface HomeSearchCandidate {
  aliases?: string[];
  city?: string;
  community?: string;
  completionDate?: string;
  count?: number;
  developerName?: string;
  kind: "community" | "project" | "developer" | "place";
  name: string;
  propertyType?: string;
  subtitle?: string;
}

export interface HomeSearchTag {
  key: string;
  label: string;
  value: string;
}

export interface HomeSearchDraft {
  bathrooms: string | null;
  bedrooms: string | null;
  budgetLabel: string | null;
  budgetMax: number | null;
  budgetMin: number | null;
  city: string | null;
  confidence: number;
  developer: string | null;
  furnishing: "Furnished" | "Unfurnished" | null;
  intent: HomeSearchIntent | null;
  isQuestion: boolean;
  location: string | null;
  project: string | null;
  propertyType: string | null;
  summary: string;
  tags: HomeSearchTag[];
}

export interface HomeSearchSuggestion {
  badge?: string;
  id: string;
  kind: HomeSearchSuggestionKind;
  parsed?: Partial<HomeSearchDraft>;
  query: string;
  subtitle?: string;
  title: string;
}

export interface HomeSearchSuggestionGroups {
  askAi: HomeSearchSuggestion[];
  communities: HomeSearchSuggestion[];
  developers: HomeSearchSuggestion[];
  places: HomeSearchSuggestion[];
  projects: HomeSearchSuggestion[];
  smart: HomeSearchSuggestion[];
}

export interface HomeSearchRoutePayload {
  draft: HomeSearchDraft;
  suggestions: HomeSearchSuggestionGroups;
}

interface BudgetRange {
  label: string;
  max: number | null;
  min: number;
}

interface ParseBudgetResult {
  budgetLabel: string | null;
  budgetMax: number | null;
  budgetMin: number | null;
}

interface CandidateMatch {
  candidate: HomeSearchCandidate;
  score: number;
}

const STATIC_LOCATIONS: HomeSearchCandidate[] = [
  { kind: "community", name: "Dubai Marina", city: "Dubai", aliases: ["marina"] },
  { kind: "community", name: "Downtown Dubai", city: "Dubai", aliases: ["downtown"] },
  { kind: "community", name: "Business Bay", city: "Dubai" },
  { kind: "community", name: "Palm Jumeirah", city: "Dubai", aliases: ["palm"] },
  { kind: "community", name: "JBR", city: "Dubai", aliases: ["jumeirah beach residence"] },
  { kind: "community", name: "Dubai Hills Estate", city: "Dubai", aliases: ["dubai hills", "hills"] },
  { kind: "community", name: "Creek Harbour", city: "Dubai", aliases: ["dubai creek harbour", "creek harbor", "creek"] },
  { kind: "community", name: "JVC", city: "Dubai", aliases: ["jumeirah village circle", "jvt", "jumeirah village triangle"] },
  { kind: "community", name: "DIFC", city: "Dubai", aliases: ["dubai international financial centre"] },
  { kind: "community", name: "MBR City", city: "Dubai", aliases: ["mbr", "mohammed bin rashid city", "meydan"] },
  { kind: "community", name: "Jumeirah", city: "Dubai" },
  { kind: "community", name: "Arabian Ranches", city: "Dubai" },
  { kind: "community", name: "Al Reem Island", city: "Abu Dhabi" },
  { kind: "community", name: "Saadiyat Island", city: "Abu Dhabi" },
  { kind: "community", name: "Yas Island", city: "Abu Dhabi" },
];

const CITY_ALIASES: Record<string, string> = {
  abu_dhabi: "Abu Dhabi",
  ajman: "Ajman",
  dubai: "Dubai",
  fujairah: "Fujairah",
  rak: "RAK",
  "ras_al_khaimah": "RAK",
  sharjah: "Sharjah",
};

const QUESTION_PATTERNS = [
  /^(what|how|why|when|where|who|which|should|can|could|would|is|are|do)\b/i,
  /\?$/,
  /\b(compare|difference|best|better|worth|roi|yield|mortgage|visa|tax|legal|advice|recommend)\b/i,
];

const SEARCH_SIGNAL_PATTERNS = [
  /\b(apartment|villa|townhouse|penthouse|studio|duplex|compound|hotel apartment)\b/i,
  /\b(off[\s-]?plan|new launch|buy|rent|lease|sale|resale|secondary)\b/i,
  /\b(bed|bedroom|bath|bathroom|br|bhk)\b/i,
  /\b(under|below|upto|up to|budget|aed|million|mn|m\b|k\b)\b/i,
];

const INTENT_PATTERNS: Array<[RegExp, HomeSearchIntent]> = [
  [/\b(off[\s-]?plan|offplan|new launch|launching|handover)\b/i, "off-plan"],
  [/\b(rent|rental|lease|tenant|leasing)\b/i, "rent"],
  [/\b(buy|sale|purchase|own|investment|investor|resale|secondary|ready)\b/i, "buy"],
];

const PROPERTY_TYPE_PATTERNS: Array<[RegExp, HomeSearchDraft["propertyType"]]> = [
  [/\b(hotel apartment|hotel apt)\b/i, "Hotel Apartment"],
  [/\btownhouse\b/i, "Townhouse"],
  [/\bpenthouse\b/i, "Penthouse"],
  [/\bcompound\b/i, "Compound"],
  [/\bduplex\b/i, "Duplex"],
  [/\bstudio\b/i, "Studio"],
  [/\b(villa|villas)\b/i, "Villa"],
  [/\b(apartment|apartments|appartment|apt|flat)\b/i, "Apartment"],
];

const FURNISHING_PATTERNS: Array<[RegExp, HomeSearchDraft["furnishing"]]> = [
  [/\b(unfurnished|without furniture)\b/i, "Unfurnished"],
  [/\b(furnished|fully furnished|semi furnished|semi-furnished)\b/i, "Furnished"],
];

const BUY_BUDGET_RANGES: BudgetRange[] = [
  { label: "Up to 500K", min: 0, max: 500_000 },
  { label: "500K - 1M", min: 500_000, max: 1_000_000 },
  { label: "1M - 2M", min: 1_000_000, max: 2_000_000 },
  { label: "2M - 5M", min: 2_000_000, max: 5_000_000 },
  { label: "5M - 10M", min: 5_000_000, max: 10_000_000 },
  { label: "10M+", min: 10_000_000, max: null },
];

const RENT_BUDGET_RANGES: BudgetRange[] = [
  { label: "Up to 100K", min: 0, max: 100_000 },
  { label: "100K - 200K", min: 100_000, max: 200_000 },
  { label: "200K - 350K", min: 200_000, max: 350_000 },
  { label: "350K - 500K", min: 350_000, max: 500_000 },
  { label: "500K+", min: 500_000, max: null },
];

export function getBudgetOptionsForIntent(intent: HomeSearchIntent | null) {
  return intent === "rent" ? [...HOME_SEARCH_RENT_BUDGETS] : [...HOME_SEARCH_BUY_BUDGETS];
}

export function createEmptyHomeSearchDraft(defaultIntent?: HomeSearchIntent | null): HomeSearchDraft {
  return {
    bathrooms: null,
    bedrooms: null,
    budgetLabel: null,
    budgetMax: null,
    budgetMin: null,
    city: null,
    confidence: 0,
    developer: null,
    furnishing: null,
    intent: defaultIntent ?? null,
    isQuestion: false,
    location: null,
    project: null,
    propertyType: null,
    summary: defaultIntent ? `${formatIntentLabel(defaultIntent)} properties` : "Search properties",
    tags: [],
  };
}

export function normalizeTabToIntent(tab?: string | null): HomeSearchIntent | null {
  const normalized = normalizeSearchText(tab);
  if (normalized === "buy") return "buy";
  if (normalized === "rent") return "rent";
  if (normalized === "off_plan" || normalized === "offplan") return "off-plan";
  return null;
}

export function formatIntentLabel(intent: HomeSearchIntent) {
  if (intent === "off-plan") return "Off-Plan";
  if (intent === "rent") return "Rent";
  return "Buy";
}

export function getHomeSearchPlaceholderPool(intent: HomeSearchIntent | null) {
  if (intent === "rent") {
    return [
      '"Furnished 1BR in Downtown under 140K"',
      '"2 bed in Marina with balcony"',
      '"Family townhouse in Dubai Hills"',
      '"Rent apartment near DIFC"',
    ];
  }

  if (intent === "off-plan") {
    return [
      '"Off-plan in Creek Harbour under 2M"',
      '"Emaar projects in Dubai Harbour"',
      '"New launch apartment in Arjan"',
      '"Off-plan villa by Sobha"',
    ];
  }

  return [
    '"3 bed villa in Palm under 5M"',
    '"Studio in JVC for investment"',
    '"2BR Marina apartment"',
    '"Family townhouse in Dubai Hills"',
  ];
}

export function parseHomeSearchQuery(
  input: string,
  options: {
    communities?: HomeSearchCandidate[];
    defaultIntent?: HomeSearchIntent | null;
    developers?: HomeSearchCandidate[];
    projects?: HomeSearchCandidate[];
  } = {},
): HomeSearchDraft {
  const query = input.trim();
  const normalizedQuery = normalizeSearchText(query);
  const intent = detectIntent(query, options.defaultIntent ?? null);
  const propertyType = detectPropertyType(query);
  const bedrooms = detectBedrooms(query);
  const bathrooms = detectBathrooms(query);
  const furnishing = detectFurnishing(query);
  const city = detectCity(query);
  const budget = parseBudgetFromQuery(query, intent);

  const communities = dedupeCandidates([...(options.communities ?? []), ...STATIC_LOCATIONS], "community");
  const developers = dedupeCandidates(options.developers ?? [], "developer");
  const projects = dedupeCandidates(options.projects ?? [], "project");

  const matchedProject = findBestCandidateMatch(normalizedQuery, projects);
  const matchedDeveloper = findBestCandidateMatch(normalizedQuery, developers);
  const matchedLocation = findBestCandidateMatch(normalizedQuery, communities);

  const draft: HomeSearchDraft = {
    bathrooms,
    bedrooms,
    budgetLabel: budget.budgetLabel,
    budgetMax: budget.budgetMax,
    budgetMin: budget.budgetMin,
    city: matchedLocation?.candidate.city || matchedProject?.candidate.city || city,
    confidence: 0,
    developer: matchedDeveloper?.candidate.name || matchedProject?.candidate.developerName || null,
    furnishing,
    intent,
    isQuestion: false,
    location: matchedLocation?.candidate.name || matchedProject?.candidate.community || null,
    project: matchedProject?.candidate.name || null,
    propertyType: matchedProject?.candidate.propertyType || propertyType,
    summary: "Search properties",
    tags: [],
  };

  const structuredSignalCount = countStructuredSignals(draft);
  const questionMatch = QUESTION_PATTERNS.some((pattern) => pattern.test(query));
  const searchMatch = SEARCH_SIGNAL_PATTERNS.some((pattern) => pattern.test(query));
  draft.isQuestion = questionMatch && structuredSignalCount < 3 && !searchMatch;
  draft.tags = buildHomeSearchTags(draft);
  draft.summary = buildHomeSearchSummary(draft, query);
  draft.confidence = computeDraftConfidence(draft, structuredSignalCount, matchedProject, matchedDeveloper, matchedLocation);

  return draft;
}

export function buildHomeSearchTags(draft: HomeSearchDraft) {
  const tags: HomeSearchTag[] = [];

  if (draft.intent) tags.push({ key: "intent", label: "Mode", value: formatIntentLabel(draft.intent) });
  if (draft.project) tags.push({ key: "project", label: "Project", value: draft.project });
  if (draft.location) tags.push({ key: "location", label: "Location", value: draft.location });
  if (draft.developer) tags.push({ key: "developer", label: "Developer", value: draft.developer });
  if (draft.propertyType) tags.push({ key: "type", label: "Type", value: draft.propertyType });
  if (draft.bedrooms) tags.push({ key: "beds", label: "Beds", value: draft.bedrooms === "Studio" ? "Studio" : `${draft.bedrooms} BR` });
  if (draft.bathrooms) tags.push({ key: "baths", label: "Baths", value: draft.bathrooms === "7+" ? "7+ Bath" : `${draft.bathrooms} Bath` });
  if (draft.furnishing) tags.push({ key: "furnishing", label: "Finish", value: draft.furnishing });
  if (draft.budgetLabel) tags.push({ key: "budget", label: "Budget", value: `AED ${draft.budgetLabel}` });

  return tags;
}

export function buildHomeSearchSummary(draft: HomeSearchDraft, rawQuery = "") {
  const lead = draft.intent ? formatIntentLabel(draft.intent) : "Search";
  const descriptors: string[] = [];

  if (draft.furnishing) descriptors.push(draft.furnishing.toLowerCase());
  if (draft.bedrooms) descriptors.push(draft.bedrooms === "Studio" ? "studio" : `${draft.bedrooms}-bed`);
  if (draft.propertyType) descriptors.push(draft.propertyType.toLowerCase());
  else descriptors.push(draft.project ? "project" : "property");

  let summary = `${lead} ${descriptors.join(" ")}`.replace(/\s+/g, " ").trim();

  if (draft.project) summary += ` at ${draft.project}`;
  else if (draft.location) summary += ` in ${draft.location}`;
  else if (draft.city) summary += ` in ${draft.city}`;

  if (draft.developer && draft.developer !== draft.project) summary += ` by ${draft.developer}`;
  if (draft.budgetLabel) summary += ` ${formatBudgetSummary(draft.budgetLabel)}`;

  if (!draft.tags.length && rawQuery.trim()) {
    return `Search for "${rawQuery.trim()}"`;
  }

  return summary;
}

export function buildHomeSearchUrl(args: {
  activeTab?: HomeSearchTab | null;
  draft?: Partial<HomeSearchDraft> | null;
  manual?: Partial<HomeSearchDraft> | null;
  query?: string;
}) {
  const intent = normalizeFinalIntent(args.draft?.intent, args.manual?.intent, normalizeTabToIntent(args.activeTab));
  const params = new URLSearchParams();

  if (intent === "off-plan") {
    params.set("status", "Off-Plan");
    params.set("intent", "off-plan");
  } else {
    params.set("status", "Secondary");
    params.set("intent", intent === "rent" ? "rent" : "buy");
  }

  const propertyType = args.manual?.propertyType || args.draft?.propertyType;
  const location = args.manual?.location || args.draft?.location;
  const city = args.manual?.city || args.draft?.city;
  const bedrooms = args.manual?.bedrooms || args.draft?.bedrooms;
  const bathrooms = args.manual?.bathrooms || args.draft?.bathrooms;
  const developer = args.manual?.developer || args.draft?.developer;
  const budgetLabel = args.manual?.budgetLabel || args.draft?.budgetLabel;
  const budgetMin = args.manual?.budgetMin ?? args.draft?.budgetMin ?? null;
  const budgetMax = args.manual?.budgetMax ?? args.draft?.budgetMax ?? null;

  if (propertyType) params.set("type", propertyType);
  if (location) params.set("location", location);
  if (city) params.set("city", city);
  if (bedrooms) params.set("bedrooms", bedrooms);
  if (bathrooms) params.set("bathrooms", bathrooms);
  if (developer) params.set("developer", developer);
  if (budgetLabel) params.set("budget", budgetLabel);
  if (budgetMin != null) params.set("budgetMin", String(budgetMin));
  if (budgetMax != null) params.set("budgetMax", String(budgetMax));

  const q = String(args.query ?? "").trim();
  if (q) params.set("q", q);

  return `/search?${params.toString()}`;
}

export function createGroupedHomeSearchSuggestions(args: {
  draft: HomeSearchDraft;
  places?: HomeSearchCandidate[];
  query: string;
  suggestions?: {
    communities?: HomeSearchCandidate[];
    developers?: HomeSearchCandidate[];
    projects?: HomeSearchCandidate[];
  };
}) {
  const query = args.query.trim();
  const smart: HomeSearchSuggestion[] = [];
  const draftSummary = buildHomeSearchSummary(args.draft, query);

  if (query) {
    smart.push({
      badge: args.draft.isQuestion ? "AI" : "Search",
      id: "smart-primary",
      kind: args.draft.isQuestion ? "ask-ai" : "smart-search",
      parsed: args.draft,
      query,
      subtitle: args.draft.isQuestion ? "Open Binayah AI chat with this question" : "Use the interpreted filters below",
      title: args.draft.isQuestion ? `Ask Binayah AI: ${query}` : draftSummary,
    });
  }

  if (!args.draft.isQuestion && query) {
    smart.push({
      badge: "Exact",
      id: "smart-exact",
      kind: "smart-search",
      parsed: args.draft,
      query,
      subtitle: "Search exactly what you typed",
      title: `Search for "${query}"`,
    });
  }

  const communities = (args.suggestions?.communities ?? []).slice(0, 4).map((candidate) => ({
    badge: candidate.city || "Area",
    id: `community-${slugify(candidate.name)}`,
    kind: "community" as const,
    parsed: {
      city: candidate.city ?? null,
      location: candidate.name,
    },
    query: candidate.name,
    subtitle: candidate.city ? `${candidate.city} community` : "Community",
    title: candidate.name,
  }));

  const projects = (args.suggestions?.projects ?? []).slice(0, 4).map((candidate) => ({
    badge: candidate.propertyType || "Project",
    id: `project-${slugify(candidate.name)}`,
    kind: "project" as const,
    parsed: {
      city: candidate.city ?? null,
      developer: candidate.developerName ?? null,
      intent: "off-plan" as const,
      location: candidate.community ?? null,
      project: candidate.name,
      propertyType: candidate.propertyType ?? null,
    },
    query: candidate.name,
    subtitle: [candidate.developerName, candidate.community].filter(Boolean).join(" · ") || "Off-plan project",
    title: candidate.name,
  }));

  const developers = (args.suggestions?.developers ?? []).slice(0, 4).map((candidate) => ({
    badge: candidate.count ? `${candidate.count} projects` : "Developer",
    id: `developer-${slugify(candidate.name)}`,
    kind: "developer" as const,
    parsed: {
      developer: candidate.name,
      intent: args.draft.intent === "rent" ? "buy" : args.draft.intent,
    },
    query: candidate.name,
    subtitle: candidate.subtitle || "Developer",
    title: candidate.name,
  }));

  const places = (args.places ?? []).slice(0, 4).map((candidate) => ({
    badge: candidate.city || "Place",
    id: `place-${slugify(candidate.name)}`,
    kind: "place" as const,
    parsed: {
      city: candidate.city ?? null,
      location: candidate.name,
    },
    query: candidate.name,
    subtitle: candidate.subtitle || candidate.city || "Place suggestion",
    title: candidate.name,
  }));

  const askAi = query && !args.draft.isQuestion ? [{
    badge: "AI",
    id: "ask-ai-secondary",
    kind: "ask-ai" as const,
    query,
    subtitle: "Ask Binayah AI instead of searching listings",
    title: `Ask Binayah AI about "${query}"`,
  }] : [];

  return { askAi, communities, developers, places, projects, smart };
}

export function normalizeSearchText(value: string | null | undefined) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\s/g, "_");
}

export function formatCompactPrice(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return null;
  if (value >= 1_000_000) return `${trimDecimal(value / 1_000_000)}M`;
  if (value >= 1_000) return `${trimDecimal(value / 1_000)}K`;
  return `${Math.round(value)}`;
}

export function resolveBudgetLabel(min: number | null, max: number | null, intent: "buy" | "rent") {
  return findBudgetLabel(min, max, intent);
}

function detectIntent(query: string, defaultIntent: HomeSearchIntent | null) {
  for (const [pattern, intent] of INTENT_PATTERNS) {
    if (pattern.test(query)) return intent;
  }
  return defaultIntent;
}

function detectPropertyType(query: string) {
  for (const [pattern, propertyType] of PROPERTY_TYPE_PATTERNS) {
    if (pattern.test(query)) return propertyType;
  }
  return null;
}

function detectFurnishing(query: string) {
  for (const [pattern, furnishing] of FURNISHING_PATTERNS) {
    if (pattern.test(query)) return furnishing;
  }
  return null;
}

function detectBedrooms(query: string) {
  if (/\bstudio\b/i.test(query)) return "Studio";
  const match = query.match(/\b(7\+|[1-7])\s*(?:bed(?:room)?s?|br|bdr|bhk)\b/i);
  return sanitizeDiscreteOption(match?.[1] || null, HOME_SEARCH_BEDROOM_OPTIONS);
}

function detectBathrooms(query: string) {
  const match = query.match(/\b(7\+|[1-7])\s*(?:bath(?:room)?s?)\b/i);
  return sanitizeDiscreteOption(match?.[1] || null, HOME_SEARCH_BATHROOM_OPTIONS);
}

function detectCity(query: string) {
  const normalized = normalizeSearchText(query);
  for (const [alias, city] of Object.entries(CITY_ALIASES)) {
    if (normalized.includes(alias)) return city;
  }
  return null;
}

function parseBudgetFromQuery(query: string, intent: HomeSearchIntent | null): ParseBudgetResult {
  const chosenIntent = intent === "rent" ? "rent" : "buy";
  const betweenMatch = query.match(/\b(?:between|from)\s+([^\s,]+)\s+(?:and|to|-)\s+([^\s,]+)/i);
  if (betweenMatch) {
    const min = parseMoneyValue(betweenMatch[1], query, betweenMatch.index ?? 0, chosenIntent);
    const max = parseMoneyValue(betweenMatch[2], query, (betweenMatch.index ?? 0) + betweenMatch[0].lastIndexOf(betweenMatch[2]), chosenIntent);
    if (min != null && max != null && max >= min) {
      return {
        budgetLabel: findBudgetLabel(min, max, chosenIntent),
        budgetMax: max,
        budgetMin: min,
      };
    }
  }

  const underMatch = query.match(/\b(?:under|below|max|upto|up to|less than)\s+([^\s,]+)/i);
  if (underMatch) {
    const max = parseMoneyValue(underMatch[1], query, underMatch.index ?? 0, chosenIntent);
    if (max != null) {
      return {
        budgetLabel: findBudgetLabel(null, max, chosenIntent),
        budgetMax: max,
        budgetMin: 0,
      };
    }
  }

  const overMatch = query.match(/\b(?:above|over|from|min|minimum|starting at)\s+([^\s,]+)/i);
  if (overMatch) {
    const min = parseMoneyValue(overMatch[1], query, overMatch.index ?? 0, chosenIntent);
    if (min != null) {
      return {
        budgetLabel: findBudgetLabel(min, null, chosenIntent),
        budgetMax: null,
        budgetMin: min,
      };
    }
  }

  const genericMatch = query.match(/\b(?:aed|budget)\s*([0-9][0-9.,]*\s*(?:k|m|mn|million)?)\b/i) || query.match(/\b([0-9][0-9.,]*\s*(?:k|m|mn|million))\b/i);
  if (genericMatch) {
    const value = parseMoneyValue(genericMatch[1], query, genericMatch.index ?? 0, chosenIntent);
    if (value != null) {
      return {
        budgetLabel: findBudgetLabel(null, value, chosenIntent),
        budgetMax: value,
        budgetMin: 0,
      };
    }
  }

  return { budgetLabel: null, budgetMax: null, budgetMin: null };
}

function parseMoneyValue(fragment: string, query: string, position: number, intent: "buy" | "rent") {
  const cleaned = fragment.toLowerCase().replace(/aed/g, "").trim();
  const match = cleaned.match(/^([0-9][0-9.,]*)(?:\s*(k|m|mn|million))?$/i);
  if (!match) return null;

  let value = Number.parseFloat(match[1].replace(/,/g, ""));
  if (!Number.isFinite(value) || value <= 0) return null;

  const unit = (match[2] || "").toLowerCase();
  if (unit === "m" || unit === "mn" || unit === "million") value *= 1_000_000;
  else if (unit === "k") value *= 1_000;

  const around = query.slice(Math.max(0, position - 16), Math.min(query.length, position + fragment.length + 16));
  if (intent === "rent" && /\b(month|monthly|pm|\/mo|per month)\b/i.test(around)) {
    value *= 12;
  }

  return Math.round(value);
}

function findBudgetLabel(min: number | null, max: number | null, intent: "buy" | "rent") {
  const ranges = intent === "rent" ? RENT_BUDGET_RANGES : BUY_BUDGET_RANGES;

  if (min != null && max != null) {
    const exact = ranges.find((range) => range.min === min && range.max === max);
    if (exact) return exact.label;
  }

  if (max != null) {
    const match = ranges.find((range) => range.max != null && max <= range.max);
    if (match) return match.label;
  }

  if (min != null) {
    const match = [...ranges].reverse().find((range) => min >= range.min);
    if (match) return match.label;
  }

  return null;
}

function computeDraftConfidence(
  draft: HomeSearchDraft,
  structuredSignalCount: number,
  projectMatch: CandidateMatch | null,
  developerMatch: CandidateMatch | null,
  locationMatch: CandidateMatch | null,
) {
  if (draft.isQuestion && structuredSignalCount < 2) {
    return 0.24;
  }

  let confidence = structuredSignalCount * 0.12;
  if (projectMatch && projectMatch.score >= 55) confidence += 0.24;
  if (developerMatch && developerMatch.score >= 45) confidence += 0.12;
  if (locationMatch && locationMatch.score >= 35) confidence += 0.12;
  if (draft.intent) confidence += 0.08;
  if (draft.budgetLabel) confidence += 0.08;

  return Math.max(0.18, Math.min(0.96, confidence));
}

function countStructuredSignals(draft: HomeSearchDraft) {
  return [
    draft.intent,
    draft.location,
    draft.project,
    draft.developer,
    draft.propertyType,
    draft.bedrooms,
    draft.bathrooms,
    draft.budgetLabel,
    draft.furnishing,
  ].filter(Boolean).length;
}

function dedupeCandidates(candidates: HomeSearchCandidate[], kind: HomeSearchCandidate["kind"]) {
  const seen = new Set<string>();
  const output: HomeSearchCandidate[] = [];

  for (const candidate of candidates) {
    if (candidate.kind !== kind) continue;
    const key = `${kind}:${normalizeSearchText(candidate.name)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(candidate);
  }

  return output;
}

function findBestCandidateMatch(query: string, candidates: HomeSearchCandidate[]) {
  let best: CandidateMatch | null = null;

  for (const candidate of candidates) {
    const score = scoreCandidate(query, candidate);
    if (score <= 0) continue;
    if (!best || score > best.score) {
      best = { candidate, score };
    }
  }

  return best;
}

function scoreCandidate(query: string, candidate: HomeSearchCandidate) {
  if (!query) return 0;

  const names = [candidate.name, ...(candidate.aliases ?? [])]
    .map(normalizeSearchText)
    .filter(Boolean);

  let score = 0;

  for (const name of names) {
    if (query === name) score = Math.max(score, 120);
    else if (query.includes(name)) score = Math.max(score, 85 + Math.min(name.length, 20));
    else if (name.includes(query)) score = Math.max(score, 65 + Math.min(query.length, 20));
    else {
      const queryTokens = new Set(query.split("_").filter(Boolean));
      const nameTokens = new Set(name.split("_").filter(Boolean));
      let overlap = 0;
      for (const token of queryTokens) {
        if (nameTokens.has(token)) overlap += 1;
      }
      score = Math.max(score, overlap * 14);
    }
  }

  return score;
}

function sanitizeDiscreteOption<T extends readonly string[]>(value: string | null, allowed: T): T[number] | null {
  if (!value) return null;
  const normalizedValue = value.toLowerCase();
  return (allowed.find((option) => option.toLowerCase() === normalizedValue) ?? null) as T[number] | null;
}

function normalizeFinalIntent(...values: Array<HomeSearchIntent | null | undefined>) {
  for (const value of values) {
    if (value) return value;
  }
  return "buy";
}

function slugify(value: string) {
  return normalizeSearchText(value).replace(/_/g, "-");
}

function trimDecimal(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, "");
}

function formatBudgetSummary(label: string) {
  if (label.startsWith("Up to ")) return `under AED ${label.replace("Up to ", "")}`;
  if (label.endsWith("+")) return `from AED ${label.replace("+", "")}`;
  return `around AED ${label}`;
}
