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
