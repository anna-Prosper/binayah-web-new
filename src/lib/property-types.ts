const APARTMENT_LIKE_TERMS = [
  "apartment",
  "apartments",
  "appartment",
  "appartments",
  "appartement",
  "apt",
  "flat",
  "studio",
  "penthouse",
  "hotel apartment",
  "hotel apartments",
  "hotel apt",
  "hotel room",
  "hotel rooms",
  "duplex",
] as const;

const VILLA_LIKE_TERMS = [
  "villa",
  "villas",
  "townhouse",
  "townhouses",
  "compound",
] as const;

const COMMERCIAL_LIKE_TERMS = [
  "commercial",
  "office",
  "offices",
  "shop",
  "shops",
  "retail",
  "warehouse",
] as const;

const PLOT_LIKE_TERMS = [
  "plot",
  "plots",
  "land",
] as const;

export const MERGED_PROPERTY_TYPES = ["Apartment", "Villa", "Commercial", "Plot"] as const;
export type MergedPropertyType = (typeof MERGED_PROPERTY_TYPES)[number];

export const valuationPropertyTypeOptions = [
  { value: "Apartment", label: "Apartment" },
  { value: "Villa", label: "Villa / Townhouse" },
  { value: "Commercial", label: "Commercial" },
  { value: "Plot", label: "Plot" },
] as const;

export const residentialPropertyTypeOptions = valuationPropertyTypeOptions.slice(0, 2);
export const homeSearchPropertyTypeOptions = residentialPropertyTypeOptions;

export function normalizePropertyType(value: unknown, fallback = ""): MergedPropertyType | string {
  const rawValue = String(value ?? "").trim();
  const normalizedValue = normalizePropertyTypeKey(rawValue);

  if (!normalizedValue) {
    return fallback;
  }

  if (matchesPropertyTypeGroup(normalizedValue, APARTMENT_LIKE_TERMS)) {
    return "Apartment";
  }

  if (matchesPropertyTypeGroup(normalizedValue, VILLA_LIKE_TERMS)) {
    return "Villa";
  }

  if (matchesPropertyTypeGroup(normalizedValue, COMMERCIAL_LIKE_TERMS)) {
    return "Commercial";
  }

  if (matchesPropertyTypeGroup(normalizedValue, PLOT_LIKE_TERMS)) {
    return "Plot";
  }

  return rawValue || fallback;
}

export function formatPropertyTypeLabel(value: unknown, fallback = "") {
  const normalizedValue = normalizePropertyType(value, "");

  if (!normalizedValue) {
    return fallback;
  }

  if (normalizedValue === "Villa") {
    return "Villa / Townhouse";
  }

  return normalizedValue;
}

export function requiresPropertyNameForPropertyType(value: unknown) {
  const normalizedValue = normalizePropertyType(value, "");
  return normalizedValue !== "Plot";
}

// ───────────────────────────────────────────────────────────────────────────
// Field-required predicates — these mirror the backend rules in
// lib/inquiry.js (getMissingRequiredValuationFields + requiresInquiryPropertyName)
// so the web form doesn't over-require fields the server would happily accept.
// Keep both copies (this TS file + lib/property-types.js) in sync.
// ───────────────────────────────────────────────────────────────────────────

function hasFieldValue(value: unknown): boolean {
  return Boolean(String(value ?? "").trim());
}

// Community is required only when no propertyName/building has been provided.
// Backend rule: missingFields.push("community") only when BOTH community AND
// propertyName are empty.
export function isCommunityRequiredForValuation(args: {
  propertyName: unknown;
}): boolean {
  return !hasFieldValue(args.propertyName);
}

// Property name (building/project) is required when the property type calls
// for one (everything except Plot) AND we don't have an alternative location
// anchor strong enough for the engine to resolve a cohort. The backend relaxes
// the requirement when community + bedrooms are both present (allowing a
// community-level valuation like "Studio JVC" or "2BR Dubai Marina").
export function isPropertyNameRequiredForValuation(args: {
  propertyType: unknown;
  community: unknown;
  bedrooms: unknown;
}): boolean {
  if (!requiresPropertyNameForPropertyType(args.propertyType)) return false;
  if (!hasFieldValue(args.community)) return true;
  // Has community: bedrooms turns the inquiry into a community-level
  // valuation, which the engine handles without a specific building.
  if (hasFieldValue(args.bedrooms)) return false;
  return true;
}

// Bedrooms is required for residential stock (anything except Plot). Studio is
// represented as bedrooms = "0" and counts as supplied.
export function isBedroomsRequiredForValuation(propertyType: unknown): boolean {
  return requiresPropertyNameForPropertyType(propertyType);
}

function matchesPropertyTypeGroup(normalizedValue: string, allowedTerms: readonly string[]) {
  return allowedTerms.some(
    (term) => normalizedValue === term || normalizedValue.includes(term),
  );
}

function normalizePropertyTypeKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
