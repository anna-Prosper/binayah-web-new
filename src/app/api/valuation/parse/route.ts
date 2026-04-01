import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-5.4-nano";
const VALID_TYPES = ["Apartment", "Villa", "Townhouse", "Penthouse", "Studio"] as const;
const VALID_BEDS = ["Studio", "1", "2", "3", "4", "5", "6", "7", "7+"] as const;
const VALID_MAIDS = ["Yes", "No"] as const;

const SYSTEM_PROMPT = `You parse UAE property valuation search queries into structured form fields.

You must return only JSON matching the provided schema.

Rules:
- Prefer the provided candidate values for unit, area, and city whenever possible.
- Never invent a building or community name when no strong candidate exists.
- If a field is unclear, return null for that field.
- If multiple candidates are plausible, choose the best one, set needsConfirmation to true, and add short ambiguity notes.
- Extract only these fields: unit, area, city, type, beds, maids, size.
- type must be one of: Apartment, Villa, Townhouse, Penthouse, Studio, or null.
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
        max_tokens: 400,
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
    const suggestion = normalizeSuggestion(content, parserResult, candidates);

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
    type: normalizeNullableText(safeValue.type),
    beds: normalizeNullableText(safeValue.beds),
    maids: normalizeNullableText(safeValue.maids),
    size: normalizeNullableText(safeValue.size),
  };
}

function normalizeSuggestion(
  content: unknown,
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

  const allowedUnits = buildAllowedValueSet(candidates, parserResult, "unit");
  const allowedAreas = buildAllowedValueSet(candidates, parserResult, "area");
  const allowedCities = buildAllowedValueSet(candidates, parserResult, "city");

  const parsed = sanitizeParsedPayload(parsedJson?.parsed);
  const normalized: NormalizedSuggestion = {
    parsed: {
      unit: constrainFreeTextToAllowed(parsed.unit, allowedUnits),
      area: constrainFreeTextToAllowed(parsed.area, allowedAreas),
      city: constrainFreeTextToAllowed(parsed.city, allowedCities),
      type: normalizeEnumValue(parsed.type, VALID_TYPES),
      beds: normalizeEnumValue(parsed.beds, VALID_BEDS),
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

  if (normalized.parsed.unit && allowedUnits.size > 0 && !allowedUnits.has(normalizeComparableValue(normalized.parsed.unit))) {
    normalized.parsed.unit = null;
    normalized.needsConfirmation = true;
  }

  if (normalized.parsed.area && allowedAreas.size > 0 && !allowedAreas.has(normalizeComparableValue(normalized.parsed.area))) {
    normalized.parsed.area = null;
    normalized.needsConfirmation = true;
  }

  if (normalized.parsed.city && allowedCities.size > 0 && !allowedCities.has(normalizeComparableValue(normalized.parsed.city))) {
    normalized.parsed.city = null;
    normalized.needsConfirmation = true;
  }

  return normalized;
}

function buildAllowedValueSet(
  candidates: ReturnType<typeof sanitizeCandidates>,
  parserResult: ParsedValuationPayload,
  key: keyof Pick<ParsedValuationPayload, "unit" | "area" | "city">,
) {
  const values = new Set<string>();

  for (const candidate of candidates) {
    const value = candidate.parsed[key];
    if (value) {
      values.add(normalizeComparableValue(value));
    }
  }

  if (parserResult[key]) {
    values.add(normalizeComparableValue(parserResult[key]));
  }

  return values;
}

function constrainFreeTextToAllowed(value: ParsedFieldValue, allowedValues: Set<string>) {
  const normalizedValue = normalizeComparableValue(value);
  if (!normalizedValue) {
    return null;
  }

  if (!allowedValues.size || allowedValues.has(normalizedValue)) {
    return normalizeNullableText(value);
  }

  return null;
}

function normalizeEnumValue<T extends readonly string[]>(value: ParsedFieldValue, allowedValues: T): T[number] | null {
  const normalized = normalizeComparableValue(value);
  if (!normalized) {
    return null;
  }

  const match = allowedValues.find((entry) => normalizeComparableValue(entry) === normalized);
  return match ?? null;
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

function normalizeNullableText(value: unknown): string | null {
  const normalized = normalizeText(value);
  return normalized || null;
}

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}
