/**
 * GET /api/places?q=Amaranta+2
 *
 * Proxies Places API (New) Autocomplete, filtered to UAE properties.
 * Keeps GOOGLE_PLACES_API_KEY server-side — never exposed to the browser.
 *
 * Returns:
 *   { predictions: PlacePrediction[] }
 *
 * Each prediction:
 *   { placeId, description, building, area, city }
 */

import { NextRequest, NextResponse } from "next/server";

const AUTOCOMPLETE_URL = "https://places.googleapis.com/v1/places:autocomplete";
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

  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "Places API not configured." }, { status: 503 });
  }

  try {
    const res = await fetch(AUTOCOMPLETE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      body: JSON.stringify({
        input: q,
        includedRegionCodes: [REGION_CODE],
        languageCode: LANGUAGE,
        locationBias: {
          rectangle: UAE_VIEWPORT,
        },
        regionCode: REGION_CODE,
      }),
      cache: "no-store",
    });

    const responseText = await res.text();
    const data = parseAutocompleteResponse(responseText);

    if (!res.ok) {
      const errorMessage = data?.error?.message || responseText;
      console.error("[places]", res.status, errorMessage);
      return NextResponse.json({ predictions: [] });
    }

    const predictions = (data.suggestions ?? [])
      .map(normalizePrediction)
      .filter((prediction): prediction is PlacePrediction => Boolean(prediction));

    return NextResponse.json({ predictions });
  } catch (err) {
    console.error("[places]", err);
    return NextResponse.json({ predictions: [] });
  }
}

function normalizePrediction(suggestion: GoogleSuggestion): PlacePrediction | null {
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
    ...parseAddressComponents(prediction, description),
  };
}

function parseAddressComponents(prediction: GooglePlacePrediction, description: string) {
  const mainText = normalizeText(prediction.structuredFormat?.mainText?.text);
  const secondaryTerms = splitAddressTerms(prediction.structuredFormat?.secondaryText?.text);
  const descriptionTerms = splitAddressTerms(description);

  const city = normalizeCity(secondaryTerms.at(-1) ?? descriptionTerms.at(-1) ?? "");
  const area = secondaryTerms.length >= 2
    ? secondaryTerms.at(-2) ?? ""
    : descriptionTerms.length >= 2
      ? descriptionTerms.at(-2) ?? ""
      : "";

  const buildingParts = descriptionTerms.slice(0, -2);
  const building = mainText || buildingParts.join(", ") || descriptionTerms[0] || "";

  return { building, area, city };
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

// ─── Places API (New) types ───────────────────────────────────────────────────

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
