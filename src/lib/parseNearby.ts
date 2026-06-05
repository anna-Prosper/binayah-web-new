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
  // Use GOOGLE_PLACES_API_KEY if set, otherwise fall back to the Maps Embed key
  // Note: requires Distance Matrix API + billing enabled on the GCP project
  const key = process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "";
  if (!key) return [];

  // Preset Dubai POI destinations — address strings for Distance Matrix
  const POI_DESTINATIONS = [
    { address: "nearest metro station near " + lat + "," + lng, label: "Metro Station", type: "metro" },
    { address: "nearest shopping mall near " + lat + "," + lng, label: "Shopping Mall", type: "mall" },
    { address: "nearest beach Dubai", label: "Beach / Waterfront", type: "beach" },
    { address: "nearest hospital near " + lat + "," + lng, label: "Hospital", type: "hospital" },
    { address: "Dubai International Airport", label: "Dubai Airport (DXB)", type: "airport" },
    { address: "Downtown Dubai", label: "Downtown Dubai", type: "landmark" },
  ];

  try {
    // Use Distance Matrix API (requires billing + Distance Matrix API enabled on GCP project)
    const destParam = POI_DESTINATIONS.map((d) => encodeURIComponent(d.address)).join("|");
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${lat},${lng}&destinations=${destParam}&mode=driving&key=${key}`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return [];
    const data = await res.json();
    if (data.status !== "OK") return [];

    const elements: any[] = data.rows?.[0]?.elements || [];
    const items: NearbyItem[] = [];

    elements.forEach((el, i) => {
      const poi = POI_DESTINATIONS[i];
      if (!poi || el.status !== "OK") return;
      const mins = Math.round((el.duration.value as number) / 60);
      const unit = mins <= 10 ? "min walk" : "min drive";
      items.push({ name: poi.label, type: poi.type, distance: `${mins} ${unit}` });
    });

    return items;
  } catch {
    return [];
  }
}
