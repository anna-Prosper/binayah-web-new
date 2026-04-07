/**
 * GET /api/places?q=Amaranta+2
 *
 * Uses Places API (New) first, then falls back to the legacy
 * autocomplete endpoint when the Google project only has the older
 * Places API enabled.
 */

import { NextRequest, NextResponse } from "next/server";

const AUTOCOMPLETE_NEW_URL = "https://places.googleapis.com/v1/places:autocomplete";
const AUTOCOMPLETE_LEGACY_URL = "https://maps.googleapis.com/maps/api/place/autocomplete/json";
const LANGUAGE = "en";
const REGION_CODE = "ae";
const UAE_VIEWPORT = {
  high: { latitude: 26.5, longitude: 56.5 },
  low: { latitude: 22.5, longitude: 51.4 },
} as const;
const FIELD_MASK = [
  "suggestions.placePrediction.placeId",
  "suggestions.placePrediction.text.text",
  "suggestions.placePrediction.structuredFormat.mainText.text",
  "suggestions.placePrediction.structuredFormat.secondaryText.text",
].join(",");

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ predictions: [] });
  }

  const key = String(process.env.GOOGLE_PLACES_API_KEY || "").replace(/^"|"$/g, "").trim();
  if (!key) {
    return NextResponse.json({ error: "Places API not configured." }, { status: 503 });
  }

  try {
    const nextResult = await fetchPlacesNew(q, key);
    if (nextResult.ok) {
      return NextResponse.json({ predictions: nextResult.predictions });
    }

    if (!shouldFallbackToLegacy(nextResult.status, nextResult.errorMessage)) {
      console.error("[places]", nextResult.status, nextResult.errorMessage);
      return NextResponse.json({ predictions: [] });
    }

    const legacyResult = await fetchPlacesLegacy(q, key);
    if (legacyResult.ok) {
      console.warn("[places] Falling back to legacy autocomplete because Places API (New) is unavailable.");
      return NextResponse.json({ predictions: legacyResult.predictions });
    }

    console.error("[places]", legacyResult.status, legacyResult.errorMessage || nextResult.errorMessage);
    return NextResponse.json({ predictions: [] });
  } catch (err) {
    console.error("[places]", err);
    return NextResponse.json({ predictions: [] });
  }
}

async function fetchPlacesNew(query: string, key: string) {
  const response = await fetch(AUTOCOMPLETE_NEW_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": FIELD_MASK,
    },
    body: JSON.stringify({
      input: query,
      includedRegionCodes: [REGION_CODE],
      languageCode: LANGUAGE,
      locationBias: {
        rectangle: UAE_VIEWPORT,
      },
      regionCode: REGION_CODE,
    }),
    cache: "no-store",
  });

  const responseText = await response.text();
  const data = parseAutocompleteResponse(responseText);

  if (!response.ok) {
    return {
      errorMessage: data?.error?.message || responseText,
      ok: false as const,
      predictions: [] as PlacePrediction[],
      status: response.status,
    };
  }

  const predictions = (data.suggestions ?? [])
    .map(normalizePredictionFromNew)
    .filter((prediction): prediction is PlacePrediction => Boolean(prediction));

  return {
    ok: true as const,
    predictions,
    status: response.status,
  };
}

async function fetchPlacesLegacy(query: string, key: string) {
  const params = new URLSearchParams({
    components: `country:${REGION_CODE}`,
    input: query,
    key,
    language: LANGUAGE,
  });

  const response = await fetch(`${AUTOCOMPLETE_LEGACY_URL}?${params.toString()}`, {
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({} as LegacyAutocompleteResponse));
  const serviceStatus = String(data.status || "").trim();

  if (!response.ok || (serviceStatus && serviceStatus !== "OK" && serviceStatus !== "ZERO_RESULTS")) {
    return {
      errorMessage: data.error_message || serviceStatus || `HTTP ${response.status}`,
      ok: false as const,
      predictions: [] as PlacePrediction[],
      status: response.status,
    };
  }

  const predictions = (data.predictions ?? [])
    .map(normalizePredictionFromLegacy)
    .filter((prediction): prediction is PlacePrediction => Boolean(prediction));

  return {
    ok: true as const,
    predictions,
    status: response.status,
  };
}

function shouldFallbackToLegacy(status: number, errorMessage: string) {
  if (status !== 403) return false;

  return /places api \(new\)|permission|not been used|api .*disabled|enable it/i.test(errorMessage);
}

function normalizePredictionFromNew(suggestion: GoogleSuggestion): PlacePrediction | null {
  const prediction = suggestion.placePrediction;
  if (!prediction) {
    return null;
  }

  const description = normalizeText(prediction.text?.text)
    || [normalizeText(prediction.structuredFormat?.mainText?.text), normalizeText(prediction.structuredFormat?.secondaryText?.text)]
      .filter(Boolean)
      .join(", ");

  const placeId = normalizeText(prediction.placeId);
  if (!placeId || !description) {
    return null;
  }

  return {
    placeId,
    description,
    ...parseAddressComponents(
      normalizeText(prediction.structuredFormat?.mainText?.text),
      normalizeText(prediction.structuredFormat?.secondaryText?.text),
      description,
    ),
  };
}

function normalizePredictionFromLegacy(prediction: LegacyPrediction): PlacePrediction | null {
  const description = normalizeText(prediction.description);
  const placeId = normalizeText(prediction.place_id);
  if (!placeId || !description) {
    return null;
  }

  return {
    placeId,
    description,
    ...parseAddressComponents(
      normalizeText(prediction.structured_formatting?.main_text),
      normalizeText(prediction.structured_formatting?.secondary_text),
      description,
    ),
  };
}

function parseAddressComponents(mainText: string, secondaryText: string, description: string) {
  const secondaryTerms = splitAddressTerms(secondaryText);
  const descriptionTerms = splitAddressTerms(description);

  const city = normalizeCity(secondaryTerms.at(-1) ?? descriptionTerms.at(-1) ?? "");
  const area = secondaryTerms.length >= 2
    ? secondaryTerms.at(-2) ?? ""
    : descriptionTerms.length >= 2
      ? descriptionTerms.at(-2) ?? ""
      : "";

  const buildingParts = descriptionTerms.slice(0, -2);
  const building = mainText || buildingParts.join(", ") || descriptionTerms[0] || "";

  return { area, building, city };
}

function splitAddressTerms(value: string | undefined) {
  return normalizeText(value)
    .split(",")
    .map((term) => term.trim())
    .filter(Boolean)
    .filter((term) => !/united arab emirates|uae/i.test(term));
}

const UAE_CITIES: Record<string, string> = {
  dubai: "Dubai",
  "abu dhabi": "Abu Dhabi",
  sharjah: "Sharjah",
  ajman: "Ajman",
  "ras al-khaimah": "RAK",
  "ras al khaimah": "RAK",
  "umm al-quwain": "UAE",
  fujairah: "UAE",
};

function normalizeCity(raw: string): string {
  const lc = raw.toLowerCase().trim();
  return UAE_CITIES[lc] ?? raw;
}

function parseAutocompleteResponse(value: string): GoogleAutocompleteResponse {
  if (!value.trim()) {
    return {};
  }

  try {
    return JSON.parse(value) as GoogleAutocompleteResponse;
  } catch {
    return {};
  }
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

interface PlacePrediction {
  area: string;
  building: string;
  city: string;
  description: string;
  placeId: string;
}

interface GoogleAutocompleteResponse {
  error?: {
    message?: string;
    status?: string;
  };
  suggestions?: GoogleSuggestion[];
}

interface GoogleSuggestion {
  placePrediction?: GooglePlacePrediction;
}

interface GooglePlacePrediction {
  placeId?: string;
  text?: {
    text?: string;
  };
  structuredFormat?: {
    mainText?: {
      text?: string;
    };
    secondaryText?: {
      text?: string;
    };
  };
}

interface LegacyAutocompleteResponse {
  error_message?: string;
  predictions?: LegacyPrediction[];
  status?: string;
}

interface LegacyPrediction {
  description?: string;
  place_id?: string;
  structured_formatting?: {
    main_text?: string;
    secondary_text?: string;
  };
}
