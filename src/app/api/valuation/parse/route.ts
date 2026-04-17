import { NextRequest, NextResponse } from "next/server";
import { MERGED_PROPERTY_TYPES, normalizePropertyType } from "@/lib/property-types";

export const dynamic = "force-dynamic";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-5.4-nano";
const VALID_TYPES = MERGED_PROPERTY_TYPES;
const VALID_BEDS = ["Studio", "1", "2", "3", "4", "5", "6", "7", "7+"] as const;
const VALID_MAIDS = ["Yes", "No"] as const;

const SYSTEM_PROMPT = `You parse UAE property valuation search queries into structured form fields.

You must return only JSON matching the provided schema.

Rules:
- Prefer the provided candidate values for unit, area, and city whenever possible.
- When you choose a candidate for unit, area, or city, copy its canonical text exactly as provided.
- Never invent a building or community name when no strong candidate exists.
- Do not copy generic search text into unit. Amenities and modifiers like "with pool", "furnished", "vacant", or repeated "in" phrases are not unit names.
- Common variants like "1bhk", "1 br", "1 bedroom", and misspellings like "appartment" should still be parsed into beds/type when clear.
- If a field is unclear, return null for that field.
- If multiple candidates are plausible, choose the best one, set needsConfirmation to true, and add short ambiguity notes.
- Extract only these fields: unit, area, city, type, beds, maids, size.
- type must be one of: Apartment, Villa, Commercial, Plot, or null. Fold townhouse into Villa, and fold penthouse or studio into Apartment.
- beds must be one of: Studio, 1, 2, 3, 4, 5, 6, 7, 7+, or null.
- maids must be "Yes" if the query indicates a maid/staff/helper/service room, "No" only if the query explicitly excludes it, otherwise null.
- Preserve size units like sq ft or sqm when present.
- confidence is a number from 0 to 1.
- reasoning should be brief and factual.`;

type ParsedFieldValue = string | null;

interface ParsedValuationPayload {
  area: ParsedFieldValue;
  beds: ParsedFieldValue;
  city: ParsedFieldValue;
  maids: ParsedFieldValue;
  size: ParsedFieldValue;
  type: ParsedFieldValue;
  unit: ParsedFieldValue;
}

interface ParseCandidatePayload {
  kind?: string;
  parsed?: Partial<Record<keyof ParsedValuationPayload, string | null | undefined>>;
  subtitle?: string;
  title?: string;
}

interface ParseRequestBody {
  candidates?: ParseCandidatePayload[];
  parserResult?: Partial<Record<keyof ParsedValuationPayload, string | null | undefined>>;
  query?: string;
}

interface NormalizedSuggestion {
  ambiguities: string[];
  confidence: number;
  needsConfirmation: boolean;
  parsed: ParsedValuationPayload;
  reasoning: string;
}

interface AllowedValueOption {
  canonical: string;
  compact: string;
  forms: Set<string>;
  loose: string;
  numericTokens: Set<string>;
  tokens: Set<string>;
}

interface AllowedValueResolution {
  rejected: boolean;
  value: string | null;
}

const TYPE_HINTS: [RegExp, (typeof VALID_TYPES)[number]][] = [
  [/\b(?:apartment|appartment|appartement|apt|flat)\b/i, "Apartment"],
  [/\b(?:penthouse|studio|duplex|hotel apartment|hotel apartments|hotel apt)\b/i, "Apartment"],
  [/\b(?:villa|townhouse|compound)\b/i, "Villa"],
  [/\b(?:commercial|office|shop|retail|warehouse)\b/i, "Commercial"],
  [/\b(?:plot|land)\b/i, "Plot"],
];

const BED_HINTS: [RegExp, (typeof VALID_BEDS)[number]][] = [
  [/\bstudio\b/i, "Studio"],
  [/\b1\s*(?:bed(?:room)?|br|bdr|bhk)\b/i, "1"],
  [/\b2\s*(?:bed(?:room)?|br|bdr|bhk)\b/i, "2"],
  [/\b3\s*(?:bed(?:room)?|br|bdr|bhk)\b/i, "3"],
  [/\b4\s*(?:bed(?:room)?|br|bdr|bhk)\b/i, "4"],
  [/\b5\s*(?:bed(?:room)?|br|bdr|bhk)\b/i, "5"],
  [/\b6\s*(?:bed(?:room)?|br|bdr|bhk)\b/i, "6"],
  [/\b7\+\s*(?:bed(?:room)?|br|bdr|bhk)\b/i, "7+"],
  [/\b7\s*(?:bed(?:room)?|br|bdr|bhk)\b/i, "7"],
];

const UNIT_NOISE_TOKENS = new Set([
  "apartment", "appartment", "appartement", "apartments", "villa", "villas", "townhouse", "townhouses", "penthouse", "studio",
  "bed", "beds", "bedroom", "bedrooms", "br", "bdr", "bhk",
  "with", "without", "in", "at", "on", "for", "near", "and", "or",
  "pool", "gym", "parking", "furnished", "unfurnished", "upgraded", "vacant", "tenanted",
]);

export async function POST(request: NextRequest) {
  const apiKey = String(process.env.OPENAI_API_KEY || "").trim();
  if (!apiKey) {
    return NextResponse.json({ error: "AI not configured." }, { status: 503, headers: noStoreHeaders });
  }

  let payload: ParseRequestBody;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400, headers: noStoreHeaders });
  }

  const query = normalizeText(payload.query);
  if (query.length < 3) {
    return NextResponse.json({ suggestion: null }, { headers: noStoreHeaders });
  }

  const parserResult = sanitizeParsedPayload(payload.parserResult);
  const candidates = sanitizeCandidates(payload.candidates);

  try {
    const response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.1,
        max_completion_tokens: 400,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "valuation_parse",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                parsed: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    unit: { type: ["string", "null"] },
                    area: { type: ["string", "null"] },
                    city: { type: ["string", "null"] },
                    type: { type: ["string", "null"] },
                    beds: { type: ["string", "null"] },
                    maids: { type: ["string", "null"] },
                    size: { type: ["string", "null"] },
                  },
                  required: ["unit", "area", "city", "type", "beds", "maids", "size"],
                },
                confidence: { type: "number" },
                needsConfirmation: { type: "boolean" },
                ambiguities: {
                  type: "array",
                  items: { type: "string" },
                },
                reasoning: { type: "string" },
              },
              required: ["parsed", "confidence", "needsConfirmation", "ambiguities", "reasoning"],
            },
          },
        },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: JSON.stringify({
              query,
              parserResult,
              candidates,
              allowedValues: {
                beds: VALID_BEDS,
                maids: VALID_MAIDS,
                propertyTypes: VALID_TYPES,
              },
            }),
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      console.error("[valuation-parse]", response.status, errorBody);
      return NextResponse.json({ suggestion: null }, { status: response.status, headers: noStoreHeaders });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    const suggestion = normalizeSuggestion(content, query, parserResult, candidates);

    return NextResponse.json({ suggestion }, { headers: noStoreHeaders });
  } catch (error) {
    console.error("[valuation-parse]", error);
    return NextResponse.json({ suggestion: null }, { headers: noStoreHeaders });
  }
}

const noStoreHeaders = {
  "Cache-Control": "no-store",
};

function sanitizeCandidates(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .slice(0, 6)
    .map((candidate) => {
      const safeCandidate = candidate && typeof candidate === "object" ? candidate as ParseCandidatePayload : {};
      return {
        kind: normalizeText(safeCandidate.kind),
        parsed: sanitizeParsedPayload(safeCandidate.parsed),
        subtitle: normalizeText(safeCandidate.subtitle),
        title: normalizeText(safeCandidate.title),
      };
    });
}

function sanitizeParsedPayload(value: unknown): ParsedValuationPayload {
  const safeValue = value && typeof value === "object"
    ? value as Partial<Record<keyof ParsedValuationPayload, string | null | undefined>>
    : {};

  return {
    unit: normalizeNullableText(safeValue.unit),
    area: normalizeNullableText(safeValue.area),
    city: normalizeNullableText(safeValue.city),
    type: normalizePropertyTypeValue(safeValue.type),
    beds: normalizeNullableText(safeValue.beds),
    maids: normalizeNullableText(safeValue.maids),
    size: normalizeNullableText(safeValue.size),
  };
}

function normalizeSuggestion(
  content: unknown,
  query: string,
  parserResult: ParsedValuationPayload,
  candidates: ReturnType<typeof sanitizeCandidates>,
): NormalizedSuggestion | null {
  if (typeof content !== "string" || !content.trim()) {
    return null;
  }

  let parsedJson: any;
  try {
    parsedJson = JSON.parse(content);
  } catch {
    return null;
  }

  const allowedUnits = buildAllowedValueOptions(candidates, parserResult, "unit");
  const allowedAreas = buildAllowedValueOptions(candidates, parserResult, "area");
  const allowedCities = buildAllowedValueOptions(candidates, parserResult, "city");

  const parsed = sanitizeParsedPayload(parsedJson?.parsed);
  const resolvedUnit = resolveAllowedValue(parsed.unit, allowedUnits);
  const resolvedArea = resolveAllowedValue(parsed.area, allowedAreas);
  const resolvedCity = resolveAllowedValue(parsed.city, allowedCities);
  const parserType = normalizePropertyTypeValue(parserResult.type);
  const parserBeds = normalizeEnumValue(parserResult.beds, VALID_BEDS);
  const normalized: NormalizedSuggestion = {
    parsed: {
      unit: sanitizeResolvedUnitValue(resolvedUnit.value),
      area: resolvedArea.value,
      city: resolvedCity.value,
      type: normalizePropertyTypeValue(parsed.type) ?? parserType ?? inferTypeFromQuery(query),
      beds: normalizeEnumValue(parsed.beds, VALID_BEDS) ?? parserBeds ?? inferBedsFromQuery(query),
      maids: normalizeEnumValue(parsed.maids, VALID_MAIDS),
      size: normalizeSizeValue(parsed.size),
    },
    confidence: clampConfidence(parsedJson?.confidence),
    needsConfirmation: Boolean(parsedJson?.needsConfirmation),
    ambiguities: Array.isArray(parsedJson?.ambiguities)
      ? parsedJson.ambiguities.map((item: unknown) => normalizeText(item)).filter(Boolean).slice(0, 4)
      : [],
    reasoning: normalizeText(parsedJson?.reasoning) || "AI-assisted parse.",
  };

  const filledFields = Object.values(normalized.parsed).filter(Boolean).length;
  if (!filledFields) {
    return null;
  }

  if (resolvedUnit.rejected) {
    normalized.needsConfirmation = true;
    pushAmbiguity(normalized.ambiguities, "Building match needs review.");
  }

  if (resolvedArea.rejected) {
    normalized.needsConfirmation = true;
    pushAmbiguity(normalized.ambiguities, "Area match needs review.");
  }

  if (resolvedCity.rejected) {
    normalized.needsConfirmation = true;
    pushAmbiguity(normalized.ambiguities, "City match needs review.");
  }

  return normalized;
}

function buildAllowedValueOptions(
  candidates: ReturnType<typeof sanitizeCandidates>,
  parserResult: ParsedValuationPayload,
  key: keyof Pick<ParsedValuationPayload, "unit" | "area" | "city">,
) {
  const values = new Map<string, AllowedValueOption>();

  const addValue = (value: ParsedFieldValue) => {
    const canonical = normalizeNullableText(value);
    if (!canonical) {
      return;
    }

    if (key === "unit" && isLikelyNoisyUnitCandidate(canonical)) {
      return;
    }

    const comparable = normalizeComparableValue(canonical);
    if (values.has(comparable)) {
      return;
    }

    values.set(comparable, {
      canonical,
      compact: normalizeCompactValue(canonical),
      forms: buildComparableForms(canonical),
      loose: normalizeLooseValue(canonical),
      numericTokens: new Set(getNumericTokens(canonical)),
      tokens: new Set(getComparableTokens(canonical)),
    });
  };

  for (const candidate of candidates) {
    addValue(candidate.parsed[key]);
  }

  addValue(parserResult[key]);

  return Array.from(values.values());
}

function resolveAllowedValue(value: ParsedFieldValue, allowedValues: AllowedValueOption[]): AllowedValueResolution {
  const normalizedValue = normalizeNullableText(value);
  if (!normalizedValue) {
    return { rejected: false, value: null };
  }

  if (!allowedValues.length) {
    return { rejected: false, value: normalizedValue };
  }

  const valueForms = buildComparableForms(normalizedValue);
  const exactMatch = allowedValues.find((candidate) =>
    hasSharedForm(candidate.forms, valueForms),
  );

  if (exactMatch) {
    return { rejected: false, value: exactMatch.canonical };
  }

  const looseValue = normalizeLooseValue(normalizedValue);
  const compactValue = normalizeCompactValue(normalizedValue);
  const tokens = getComparableTokens(normalizedValue);
  const numericTokens = getNumericTokens(normalizedValue);

  if (compactValue.length < 4 && tokens.length < 2 && numericTokens.length === 0) {
    return { rejected: true, value: null };
  }

  const rankedMatches = allowedValues
    .map((candidate) => ({
      candidate,
      score: scoreAllowedValue(candidate, looseValue, compactValue, tokens, numericTokens),
    }))
    .filter((entry) => entry.score >= 24)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return right.candidate.canonical.length - left.candidate.canonical.length;
    });

  const bestMatch = rankedMatches[0];
  const secondBest = rankedMatches[1];

  if (!bestMatch) {
    return { rejected: true, value: null };
  }

  if (secondBest && bestMatch.score < secondBest.score + 12) {
    return { rejected: true, value: null };
  }

  return { rejected: false, value: bestMatch.candidate.canonical };
}

function scoreAllowedValue(
  candidate: AllowedValueOption,
  looseValue: string,
  compactValue: string,
  tokens: string[],
  numericTokens: string[],
) {
  const matchedTokens = tokens.filter((token) => candidate.tokens.has(token));
  const matchedNumbers = numericTokens.filter((token) => candidate.numericTokens.has(token));
  let score = 0;

  if (compactValue.length >= 4 && (candidate.compact.includes(compactValue) || compactValue.includes(candidate.compact))) {
    score += 22;
  }

  if (looseValue.length >= 4 && (candidate.loose.includes(looseValue) || looseValue.includes(candidate.loose))) {
    score += 18;
  }

  score += matchedTokens.length * 10;
  score += matchedNumbers.length * 20;

  if (tokens.length > 0 && matchedTokens.length === tokens.length) {
    score += 14;
  }

  if (numericTokens.length > 0 && matchedNumbers.length === numericTokens.length) {
    score += 12;
  }

  return score;
}

function buildComparableForms(value: string) {
  const forms = new Set<string>();
  const add = (entry: string) => {
    const normalized = normalizeNullableText(entry);
    if (!normalized) {
      return;
    }

    forms.add(normalizeComparableValue(normalized));
    forms.add(normalizeLooseValue(normalized));
    forms.add(normalizeCompactValue(normalized));
  };

  add(value);
  add(value.replace(/\(([^)]+)\)/g, " "));

  const parentheticalMatches = value.match(/\(([^)]+)\)/g) ?? [];
  for (const match of parentheticalMatches) {
    add(match.replace(/[()]/g, ""));
  }

  const aliases = COMMON_VALUE_ALIASES[normalizeComparableValue(value)] ?? [];
  for (const alias of aliases) {
    add(alias);
  }

  return forms;
}

function hasSharedForm(left: Set<string>, right: Set<string>) {
  for (const value of left) {
    if (right.has(value)) {
      return true;
    }
  }

  return false;
}

function getComparableTokens(value: string) {
  return normalizeLooseValue(value).match(/[a-z0-9]+/g)?.filter((token) => token.length > 1 || /^\d+$/.test(token)) ?? [];
}

function getNumericTokens(value: string) {
  return getComparableTokens(value).filter((token) => /^\d+$/.test(token));
}

function normalizeEnumValue<T extends readonly string[]>(value: ParsedFieldValue, allowedValues: T): T[number] | null {
  const normalized = normalizeComparableValue(value);
  if (!normalized) {
    return null;
  }

  const match = allowedValues.find((entry) => normalizeComparableValue(entry) === normalized);
  return match ?? null;
}

function normalizePropertyTypeValue(value: ParsedFieldValue) {
  const normalized = normalizePropertyType(value ?? "", "");
  return normalizeEnumValue(
    typeof normalized === "string" ? normalized : String(normalized ?? ""),
    VALID_TYPES,
  );
}

function normalizeSizeValue(value: ParsedFieldValue) {
  const normalized = normalizeNullableText(value);
  if (!normalized) {
    return null;
  }

  return /(\d[\d,.]*)\s*(sq\.?\s*ft|sqft|sf|sqm|sq m|m2)$/iu.test(normalized)
    ? normalized
    : null;
}

function clampConfidence(value: unknown) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 0;
  }

  return Math.max(0, Math.min(1, numeric));
}

function normalizeComparableValue(value: unknown) {
  return normalizeText(value).toLowerCase();
}

function normalizeLooseValue(value: unknown) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeCompactValue(value: unknown) {
  return normalizeLooseValue(value).replace(/\s+/g, "");
}

function normalizeNullableText(value: unknown): string | null {
  const normalized = normalizeText(value);
  return normalized || null;
}

function pushAmbiguity(ambiguities: string[], value: string) {
  const normalized = normalizeText(value);
  if (!normalized || ambiguities.includes(normalized) || ambiguities.length >= 4) {
    return;
  }

  ambiguities.push(normalized);
}

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

function inferTypeFromQuery(query: string): (typeof VALID_TYPES)[number] | null {
  for (const [pattern, type] of TYPE_HINTS) {
    if (pattern.test(query)) {
      return type;
    }
  }

  return null;
}

function inferBedsFromQuery(query: string): (typeof VALID_BEDS)[number] | null {
  for (const [pattern, beds] of BED_HINTS) {
    if (pattern.test(query)) {
      return beds;
    }
  }

  return null;
}

function isLikelyNoisyUnitCandidate(value: string) {
  const tokens = getComparableTokens(value);
  if (!tokens.length) {
    return true;
  }

  const nonNoiseTokens = tokens.filter((token) => !UNIT_NOISE_TOKENS.has(token));
  if (!nonNoiseTokens.length) {
    return true;
  }

  const noiseTokens = tokens.length - nonNoiseTokens.length;
  return noiseTokens >= 3 && nonNoiseTokens.length <= 3;
}

function sanitizeResolvedUnitValue(value: string | null) {
  if (!value) {
    return null;
  }

  if (isLikelyNoisyUnitCandidate(value)) {
    return null;
  }

  return value;
}

const COMMON_VALUE_ALIASES: Record<string, string[]> = {
  rak: ["ras al khaimah", "ras al-khaimah"],
};
