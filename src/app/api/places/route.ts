/**
 * GET /api/places?q=Amaranta+2
 *
 * Proxies Google Places Autocomplete API, filtered to UAE properties.
 * Keeps GOOGLE_PLACES_API_KEY server-side — never exposed to the browser.
 *
 * Returns:
 *   { predictions: PlacePrediction[] }
 *
 * Each prediction:
 *   { placeId, description, building, area, city }
 */

import { NextRequest, NextResponse } from "next/server";

const UAE_LOCATION = "25.2048,55.2708"; // Dubai centre
const UAE_RADIUS   = 300_000;            // 300 km covers all UAE emirates
const LANGUAGE     = "en";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) {
    return NextResponse.json({ predictions: [] });
  }

  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "Places API not configured." }, { status: 503 });
  }

  const url = new URL("https://maps.googleapis.com/maps/api/place/autocomplete/json");
  url.searchParams.set("input", q);
  url.searchParams.set("key", key);
  url.searchParams.set("language", LANGUAGE);
  url.searchParams.set("components", "country:ae");           // restrict to UAE
  url.searchParams.set("location", UAE_LOCATION);
  url.searchParams.set("radius", String(UAE_RADIUS));
  url.searchParams.set("strictbounds", "false");
  // Bias toward establishments and sub-localities (buildings, communities)
  url.searchParams.set("types", "establishment|sublocality|neighborhood|premise|street_address");

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 60 } });
    const data = await res.json() as GoogleAutocompleteResponse;

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("[places]", data.status, data.error_message);
      return NextResponse.json({ predictions: [] });
    }

    const predictions = (data.predictions ?? []).map((p) => ({
      placeId:     p.place_id,
      description: p.description,
      ...parseAddressComponents(p),
    }));

    return NextResponse.json({ predictions });
  } catch (err) {
    console.error("[places]", err);
    return NextResponse.json({ predictions: [] });
  }
}

// ─── Parse address from prediction terms ─────────────────────────────────────
// Google returns terms like:
//   "Amaranta 2, Villanova, Dubai, United Arab Emirates"
//   terms: [{Amaranta 2}, {Villanova}, {Dubai}, {United Arab Emirates}]

function parseAddressComponents(prediction: GooglePrediction) {
  const terms = prediction.terms ?? [];
  const uaeIndex = terms.findIndex((t) =>
    /united arab emirates|uae/i.test(t.value)
  );

  // Terms before UAE: [...building/cluster, area, city]
  const meaningful = uaeIndex > 0 ? terms.slice(0, uaeIndex) : terms.slice(0, -1);

  const city = normalizeCity(meaningful.at(-1)?.value ?? "");
  const area = meaningful.length >= 2 ? meaningful.at(-2)?.value ?? "" : "";
  // Everything before area is the building/unit description
  const buildingParts = meaningful.slice(0, -2).map((t) => t.value).join(", ");
  const building = buildingParts || (meaningful[0]?.value ?? "");

  return { building, area, city };
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

// ─── Google API types ─────────────────────────────────────────────────────────

interface GooglePrediction {
  place_id: string;
  description: string;
  terms: { value: string; offset: number }[];
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

interface GoogleAutocompleteResponse {
  status: string;
  error_message?: string;
  predictions: GooglePrediction[];
}