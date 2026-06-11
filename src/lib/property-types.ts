const APARTMENT_LIKE_TERMS = [
  "apartment",
  "apartments",
  "appartment",
  "appartments",
  "appartement",
  "apt",
  "flat",
  "studio",
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

// Property name (building/project) is required only when the property type
// calls for one (everything except Plot) AND no community is supplied.
//
// Why this is simpler than it looks: the backend's getMissingRequiredValuationFields
// check is
//   requiresInquiryPropertyName(...) && !propertyName && !community
// — the `!community` clause means a present community always satisfies the
// requirement, regardless of bedrooms or sub-area. The bedrooms-related
// nuance lives inside requiresInquiryPropertyName but is gated out here.
// Villas in a community don't need a building/unit; apartments in a community
// can submit at the community level (the engine handles community cohorts).
export function isPropertyNameRequiredForValuation(args: {
  propertyType: unknown;
  community: unknown;
}): boolean {
  if (!requiresPropertyNameForPropertyType(args.propertyType)) return false;
  return !hasFieldValue(args.community);
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
