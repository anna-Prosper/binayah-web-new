// Parses structured NearbyItem[] from a project's locationDescription field.
// Also provides a Google Maps Distance Matrix fallback when lat/lng is available.

export interface NearbyItem {
  name: string;
  type: string;
  distance: string;
}

// Infer POI type from name
function inferType(name: string): string {
  const n = name.toLowerCase();
  if (/metro|tube|station|transit|tram/.test(n)) return "metro";
  if (/airport|dxb|dwc|maktoum/.test(n)) return "airport";
  if (/mall|shop|retail|souk|market/.test(n)) return "mall";
  if (/beach|marina|waterfront|canal|creek|jbr|corniche/.test(n)) return "beach";
  if (/park|garden|recreation|reserve/.test(n)) return "park";
  if (/school|university|college|gems|international school/.test(n)) return "school";
  if (/hospital|clinic|medical|healthcare|health city/.test(n)) return "hospital";
  if (/golf|club/.test(n)) return "park";
  if (/road|highway|street|ave|blvd/.test(n)) return "skip"; // not a POI
  return "landmark";
}

// Parse "X Minutes to Place Name" patterns
const TIME_PATTERN =
  /^(\d+)\s*(?:minutes?|mins?|min)\s*(?:to|from|away|walk|drive|by car|by metro)?\s*(?:to|from)?\s*(.+)/i;

// Parse "Close to" / "Near" / "Easy access to" patterns
const PROXIMITY_PATTERN = /^(?:close to|near|easy access to|adjacent to|next to)\s+(.+)/i;

/**
 * Parse nearby items from a location description string.
 * Returns structured NearbyItem[] from bullet-point distance data.
 */
export function parseNearbyFromDescription(description?: string | null): NearbyItem[] {
  if (!description) return [];

  const items: NearbyItem[] = [];

  // Split on bullet characters and newlines, treat each segment as a potential item
  const segments = description
    .split(/[•●◦▪■\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  for (const seg of segments) {
    // Skip headers like "Key Connectivities" or long intro paragraphs
    if (seg.length > 120 || !/\d|close|near|adjacent|easy access/i.test(seg)) continue;

    const timeMatch = seg.match(TIME_PATTERN);
    if (timeMatch) {
      const [, time, rawName] = timeMatch;
      const name = rawName
        .replace(/\s*\([^)]*\)/g, "") // remove "(DXB)" style suffixes
        .replace(/\s*&\s*/g, " & ")
        .trim();
      const type = inferType(name);
      if (type === "skip") continue;

      // Determine walk vs drive from context
      const isWalk = /walk|foot|minute.*walk/i.test(seg);
      const minutes = parseInt(time, 10);
      const unit = isWalk || minutes <= 5 ? "min walk" : "min drive";

      items.push({ name, type, distance: `${time} ${unit}` });
      continue;
    }

    const proximityMatch = seg.match(PROXIMITY_PATTERN);
    if (proximityMatch) {
      const name = proximityMatch[1]
        .replace(/\s*\([^)]*\)/g, "")
        .trim();
      const type = inferType(name);
      if (type === "skip") continue;
      items.push({ name, type, distance: "Nearby" });
    }
  }

  return items;
}

/**
 * Fetch real distances from Google Maps Distance Matrix API.
 * Requires GOOGLE_PLACES_API_KEY env var. Returns [] if key not set.
 *
 * Call server-side only (uses process.env).
 */
export async function fetchNearbyFromGoogleMaps(
  lat: number,
  lng: number
): Promise<NearbyItem[]> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) return [];

  // Preset destination POIs for Dubai context
  const destinations = [
    { name: "Nearest Metro Station", query: "metro station" },
    { name: "Nearest Shopping Mall", query: "shopping mall" },
    { name: "Nearest Beach / Waterfront", query: "beach waterfront" },
    { name: "Nearest Hospital", query: "hospital" },
    { name: "Dubai International Airport", query: "Dubai International Airport" },
    { name: "Downtown Dubai", query: "Downtown Dubai" },
  ];

  try {
    // Step 1: Find each destination using Places Nearby Search
    const placeRequests = destinations.map(async (dest) => {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&rankby=distance&type=${encodeURIComponent(dest.query)}&key=${key}`;
      const res = await fetch(url, { next: { revalidate: 86400 } });
      if (!res.ok) return null;
      const data = await res.json();
      const place = data.results?.[0];
      if (!place) return null;
      return {
        placeId: place.place_id,
        name: place.name as string,
        destName: dest.name,
        query: dest.query,
      };
    });

    const places = (await Promise.all(placeRequests)).filter(Boolean);
    if (places.length === 0) return [];

    // Step 2: Distance Matrix from origin to all found places
    const destinations_str = places
      .map((p) => `place_id:${p!.placeId}`)
      .join("|");
    const matrixUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${lat},${lng}&destinations=${encodeURIComponent(destinations_str)}&mode=driving&key=${key}`;
    const matrixRes = await fetch(matrixUrl, { next: { revalidate: 86400 } });
    if (!matrixRes.ok) return [];
    const matrix = await matrixRes.json();

    const elements: any[] = matrix.rows?.[0]?.elements || [];
    const items: NearbyItem[] = [];

    elements.forEach((el, i) => {
      const place = places[i];
      if (!place || el.status !== "OK") return;
      const mins = Math.round((el.duration.value as number) / 60);
      const unit = mins <= 15 ? "min walk" : "min drive";
      items.push({
        name: place.name || place.destName,
        type: inferType(place.destName),
        distance: `${mins} ${unit}`,
      });
    });

    return items;
  } catch {
    return [];
  }
}
