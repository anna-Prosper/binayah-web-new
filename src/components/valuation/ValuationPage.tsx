"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, BedDouble, MapPin, Ruler, Target, User, Phone, Mail,
  Sparkles, ArrowLeft, Copy, Check, ChevronRight,
  TrendingUp, TrendingDown, AlertTriangle, MessageCircle, PhoneCall,
  RefreshCw, Search, Lock, Unlock, FileUp, FileText, X,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

// ─── Location data  (City → Area → Buildings) ───────────────────────────────

type AreaData = { area: string; buildings: string[] };
type CityData = Record<string, AreaData[]>;

const LOCATION_DATA: CityData = {
  Dubai: [
    { area: "Downtown Dubai", buildings: [
        "Burj Khalifa","The Address Downtown","Fountain Views 1","Fountain Views 2","Fountain Views 3",
        "Opera Grand","Bellevue Tower 1","Bellevue Tower 2","Il Primo","Vida Residences Downtown",
        "Act One | Act Two","29 Boulevard","Standpoint Tower A","Standpoint Tower B",
        "The Lofts West","The Lofts East","8 Boulevard Walk","Boulevard Point","Claren Tower 1",
        "Claren Tower 2","South Ridge 1","South Ridge 2","The Address Residence Fountain Views",
        "Grande","St Regis Residences",
    ]},
    { area: "Dubai Marina", buildings: [
        "Marina Gate 1","Marina Gate 2","Marina Gate 3","Cayan Tower","Infinity Tower",
        "Princess Tower","Elite Residence","Marina Crown","Silverene Tower A","Silverene Tower B",
        "The Torch","Sulafa Tower","Marina Heights","Botanica Tower","Jumeirah Living Marina Gate",
        "Sparkle Tower 1","Sparkle Tower 2","Damac Heights","LIV Residence","1/JBR",
        "Marina Pinnacle","Horizon Tower","Paloma Tower","Al Mesk Tower","Ocean Heights",
        "Marina View Tower A","Marina View Tower B","Trident Grand Residence",
    ]},
    { area: "Jumeirah Beach Residence (JBR)", buildings: [
        "Murjan 1","Murjan 2","Murjan 3","Murjan 4","Murjan 5","Murjan 6",
        "Sadaf 1","Sadaf 2","Sadaf 3","Sadaf 4","Sadaf 5","Sadaf 6","Sadaf 7","Sadaf 8",
        "Rimal 1","Rimal 2","Rimal 3","Rimal 4","Rimal 5","Rimal 6",
        "Bahar 1","Bahar 2","Bahar 3","Bahar 4","Bahar 5","Bahar 6",
        "Shams 1","Shams 2","Shams 3","Shams 4","1 JBR",
    ]},
    { area: "Palm Jumeirah", buildings: [
        "Shoreline Apartments Block 1","Shoreline Apartments Block 2","Shoreline Apartments Block 3",
        "Shoreline Apartments Block 4","Shoreline Apartments Block 5","Shoreline Apartments Block 6",
        "Shoreline Apartments Block 7","Shoreline Apartments Block 8","Shoreline Apartments Block 9",
        "Shoreline Apartments Block 10","The 8","Tiara Residences","Oceana Atlantic",
        "Oceana Aegean","Oceana Baltic","Oceana Pacific","Signature Villas","Garden Homes",
        "One Palm","Palme Couture Residences","The Palm Tower","Five Palm Jumeirah",
        "Serenia Residences","Fairmont Residences North","Fairmont Residences South",
        "Balqis Residence","Kingdom of Sheba","Al Das","Al Msool",
    ]},
    { area: "Business Bay", buildings: [
        "Executive Towers Tower A","Executive Towers Tower B","Executive Towers Tower C",
        "Executive Towers Tower D","Executive Towers Tower E","Executive Towers Tower F",
        "Executive Towers Tower G","Damac Paramount Tower Hotel & Residences",
        "Churchill Residency","Bay's Edge","Merano Tower","Nobles Tower",
        "Capital Bay Tower A","Capital Bay Tower B","VVIP Residences","Majestine",
        "SLS Dubai","Aykon City Tower A","Aykon City Tower B","Peninsula One",
        "Peninsula Two","Peninsula Three","Peninsula Four","The Opus","Noura Tower",
        "Reva Residences","Sigma Tower 1","Sigma Tower 2",
    ]},
    { area: "DIFC", buildings: [
        "Index Tower","Central Park Tower","Park Towers A","Park Towers B",
        "Liberty House","Currency House","Burj Daman","Limestone House","Gate Village 1",
        "Gate Village 2","Gate Village 3","Gate Village 4","Gate Village 5",
        "Gate Village 6","Gate Village 7","Gate Village 8","Gate Village 10","Gate Village 11",
    ]},
    { area: "Jumeirah Village Circle (JVC)", buildings: [
        "Belgravia 1","Belgravia 2","Belgravia Heights 1","Belgravia Heights 2",
        "Seasons Community","Park Lane","Bloom Heights 1","Bloom Heights 2",
        "Ghalia by GGICO","Quality Star","Al Jawhara","Binghatti Terraces",
        "Oxford Terraces","Green Diamond","Plazzo Residence","The One At Jumeirah Village Circle",
        "Elite Sports Residence","Golf Views","Noor Townhouses",
    ]},
    { area: "Jumeirah Lake Towers (JLT)", buildings: [
        "Goldcrest Views 1","Goldcrest Views 2","Platinum Tower","HDS Tower",
        "Saba Tower 1","Saba Tower 2","Saba Tower 3","Lake City Tower","Madina Tower",
        "V3 Tower","Cluster A – Lake Almas East","Jumeirah Bay Tower X2","Jumeirah Bay Tower X3",
        "O2 Residence","MBL Residence","Indigo Tower","Bonnington Tower",
        "Fortune Executive Tower","Swiss Tower","Al Shera Tower",
    ]},
    { area: "Dubai Hills Estate", buildings: [
        "Park Heights 1","Park Heights 2","Mulberry 1","Mulberry 2",
        "Acacia A","Acacia B","Acacia C","Maple 1","Maple 2","Maple 3",
        "Golfville","Golf Suites","Executive Residences 1","Executive Residences 2",
        "Collective","Collective 2.0","Golf Grand","Vida Residences Dubai Hills",
        "Address Dubai Hills","Parkside 1","Parkside 2","Parkside 3",
    ]},
    { area: "Dubai Creek Harbour", buildings: [
        "Creekside 18 Tower A","Creekside 18 Tower B","Harbour Views 1","Harbour Views 2",
        "Island Park 1","Island Park 2","Address Harbour Point Tower 1","Address Harbour Point Tower 2",
        "Creek Horizon Tower 1","Creek Horizon Tower 2","Creek Gate Tower 1","Creek Gate Tower 2",
        "Cove Residences","Surf Residences","Lotus Residences","Orchid",
        "Vida Creek Harbour","Palace Residences",
    ]},
    { area: "Arabian Ranches", buildings: [
        "Palmera 1","Palmera 2","Palmera 3","Palmera 4",
        "Mirador","Mirador La Coleccion","Saheel 1","Saheel 2","Saheel 3",
        "Al Reem 1","Al Reem 2","Al Reem 3","Alvorada 1","Alvorada 2",
        "Alvorada 3","Alvorada 4","Alvorada 5","Rosa","Terra Nova","Hattan",
    ]},
    { area: "Arabian Ranches 2", buildings: [
        "Casa","Palma","La Nova","Yasmin","Rasha","Lila","Rosa","Azalea","Camelia",
    ]},
    { area: "Arabian Ranches 3", buildings: [
        "Sun","Joy","Spring","Caya","Ruba","Bliss","Elie Saab Villas",
    ]},
    { area: "Dubai Sports City", buildings: [
        "Elite Sports Residence 1","Elite Sports Residence 2","Elite Sports Residence 3",
        "Elite Sports Residence 4","Elite Sports Residence 5","Elite Sports Residence 6",
        "Elite Sports Residence 7","Elite Sports Residence 8","Elite Sports Residence 9",
        "Elite Sports Residence 10","Golf Tower 1","Golf Tower 2","Golf Tower 3",
        "Champions Tower 1","Champions Tower 2","Champions Tower 3","Panorama at The Views",
    ]},
    { area: "Al Barsha", buildings: [
        "Al Barsha 1 Villas","Al Barsha 2 Villas","Al Barsha 3 Villas",
        "Al Barsha South Villas","Topaz Residences","Al Barsha Heights (Tecom)",
    ]},
    { area: "Jumeirah Village Triangle (JVT)", buildings: [
        "District 1","District 2","District 3","District 4","District 5",
        "District 6","District 7","District 8","District 9","District 10",
    ]},
    { area: "Meydan / MBR City", buildings: [
        "The Polo Residence","The Polo Townhouses","Sobha Hartland","Residences at District One",
        "District One Villas","Mohammed Bin Rashid City Villas","Azizi Riviera","Waves",
        "Azizi Grand","Millennium Binghatti Residences",
    ]},
    { area: "Motor City", buildings: [
        "Unity Tower","Green Lakes Tower 1","Green Lakes Tower 2","Green Lakes Tower 3",
        "Green Community Villas","Arabian Homes",
    ]},
    { area: "International City", buildings: [
        "England Cluster","France Cluster","Greece Cluster","Italy Cluster","Morocco Cluster",
        "Persia Cluster","Spain Cluster","China Cluster","Russia Cluster","UAE Cluster",
    ]},
    { area: "Al Furjan", buildings: [
        "Azizi Pearl","Azizi Feirouz","Azizi Yasmin","Masakin Al Furjan","Sumansa Townhouses",
        "Nakheel Townhouses","Richmond Villas","Quortaj",
    ]},
    { area: "Dubai South / Expo City", buildings: [
        "The Pulse Residences","The Pulse Boulevard","Emaar South Golf Views",
        "Greenview","Parkside","Pulz by Damac","Urbana","Golf Links",
    ]},
    { area: "Al Quoz", buildings: [
        "Al Quoz 1 Villas","Al Quoz 2 Villas","Al Quoz 3 Villas","Al Quoz Industrial",
    ]},
    { area: "The Greens & The Views", buildings: [
        "The Greens Apartments","The Views – Golf Towers","The Links","Golf Towers",
        "The Fairways","The Lakes Villas","Al Ghaf","Al Alka","Al Jaz","Al Arta",
        "Al Samar","Al Dhafra","Al Nakheel","Al Seef",
    ]},
    { area: "City Walk", buildings: [
        "Central Park at City Walk Tower 1","Central Park at City Walk Tower 2",
        "Central Park at City Walk Tower 3","Central Park at City Walk Tower 4",
        "Eaton Place","Canopy by Hilton Dubai Al Seef Residences",
    ]},
    { area: "Bluewaters Island", buildings: [
        "Bluewaters Residences 1","Bluewaters Residences 2","Bluewaters Residences 3",
        "Bluewaters Residences 4","Bluewaters Residences 5","Bluewaters Residences 6",
        "Bluewaters Residences 7","Bluewaters Residences 8","Bluewaters Residences 9",
        "Bluewaters Residences 10","Ain Dubai Residences",
    ]},
    { area: "Damac Hills", buildings: [
        "Akoya by Damac Villas","Loreto A","Loreto B","Loreto C","Loreto D",
        "Golf Horizon A","Golf Horizon B","Golf Promenade","Astoria",
        "Trump Estates","Golf Vita","Millnaire",
    ]},
    { area: "Tilal Al Ghaf", buildings: [
        "Elan","Serenity Mansions","Plagette 32","Harmony Villas","Aura Gardens",
        "Lanai Islands","Lagoon Views","Iris","Elysian Mansions",
    ]},
  ],

  "Abu Dhabi": [
    { area: "Al Reem Island", buildings: [
        "The Gate Tower 1","The Gate Tower 2","The Gate Tower 3","Sun Tower","Sky Tower",
        "Shams Abu Dhabi","Marina Square","Arc Tower","Mangrove Place","Meera Tower",
        "SOHO Square","Reem Five","Sigma Tower","Le Grand Chateau","Leaf Tower",
        "Hydra Avenue","Al Maha Tower","Najmat Abu Dhabi","Pacific Ocean","Tamouh Tower",
    ]},
    { area: "Saadiyat Island", buildings: [
        "Saadiyat Beach Residences","Mamsha Al Saadiyat","Hidd Al Saadiyat",
        "Louvre Abu Dhabi Residences","Park View","The Collection","Soho Square Residences",
        "Villa Saadiyat","Saadiyat Beach Villas","Sea Shore Apartments",
    ]},
    { area: "Yas Island", buildings: [
        "Yas Acres","Ansam","Waters Edge","Lea","Noya","Mayan","West Yas","Reflection",
        "Yas Golf Collection","The Nook","Perla","Noya Luma","Yas Park Views",
    ]},
    { area: "Al Raha Beach", buildings: [
        "Al Raha Lofts","Al Muneera","Al Nada","Al Zeina","Al Bateen Residences",
        "Al Rahba","Lamar Residences","Al Raha Beach Hotel",
    ]},
    { area: "Corniche Road", buildings: [
        "Corniche Residence","Marina Square","Etihad Towers","The Corniche Towers",
        "Nation Towers","Al Nahyan Villas","Al Markaziyah",
    ]},
    { area: "Al Khalidiyah", buildings: [
        "Al Khalidiyah Villas","Khalidiyah Palace Rayhaan","Elite Tower",
    ]},
    { area: "Al Reef", buildings: [
        "Al Reef Downtown","Al Reef Villas","Desert Cluster","Arabian Cluster",
        "Contemporary Cluster","Mediterranean Cluster",
    ]},
  ],

  Sharjah: [
    { area: "Al Majaz", buildings: [
        "Al Majaz 1","Al Majaz 2","Al Majaz 3","Corniche Tower","Al Ghuwair",
    ]},
    { area: "Al Nahda", buildings: [
        "Sahara Complex","Al Nahda Residences","Pearl Tower Sharjah",
    ]},
    { area: "Al Khan", buildings: [
        "Al Khan Beach Residences","Naseej Tower",
    ]},
    { area: "Aljada", buildings: [
        "Madar","Naseej","Hayyan","Noor","Tiraz","Dhow","Sarab",
    ]},
    { area: "Muwaileh", buildings: [
        "Muwaileh Villas","Nasma Residences","Al Zahia",
    ]},
  ],

  Ajman: [
    { area: "Al Nuaimia", buildings: [
        "Al Nuaimia Towers","City Towers Ajman","Horizon Towers Ajman",
    ]},
    { area: "Emirates City", buildings: [
        "Lavender Tower","Jasmine Tower","Lilies Tower","Magnolia Tower",
    ]},
    { area: "Ajman Corniche", buildings: [
        "Ajman Pearl Towers","Conqueror Tower",
    ]},
  ],

  RAK: [
    { area: "Al Hamra Village", buildings: [
        "Al Hamra Village Villas","Royal Breeze Residences","Bayti Homes","Falcon Island",
    ]},
    { area: "Mina Al Arab", buildings: [
        "Gateway Residences","Lagoon Views","Mina Al Arab Townhouses",
    ]},
    { area: "Al Marjan Island", buildings: [
        "Pacific Polynesia","Bab Al Bahr","Rixos Residences","Wynn Al Marjan Island Residences",
    ]},
  ],
};

// Derived helpers
function getAreas(city: string): AreaData[] {
  return LOCATION_DATA[city] ?? [];
}

function getBuildings(city: string, area: string): string[] {
  return LOCATION_DATA[city]?.find((a) => a.area === area)?.buildings ?? [];
}

// ─── Types ─// ─── Smart search parser (valuation context) ─────────────────────────────────

const CITY_KEYWORDS: Record<string, string> = {
  dubai: "Dubai", "abu dhabi": "Abu Dhabi", abudhabi: "Abu Dhabi",
  sharjah: "Sharjah", ajman: "Ajman", rak: "RAK",
  "ras al khaimah": "RAK",
};

const AREA_KEYWORDS: Record<string, string> = {
  downtown: "Downtown Dubai", "downtown dubai": "Downtown Dubai",
  marina: "Dubai Marina", "dubai marina": "Dubai Marina",
  palm: "Palm Jumeirah", "palm jumeirah": "Palm Jumeirah",
  jbr: "Jumeirah Beach Residence (JBR)",
  "business bay": "Business Bay",
  difc: "DIFC",
  jvc: "Jumeirah Village Circle (JVC)",
  jlt: "Jumeirah Lake Towers (JLT)",
  "dubai hills": "Dubai Hills Estate", hills: "Dubai Hills Estate",
  creek: "Dubai Creek Harbour", "creek harbour": "Dubai Creek Harbour",
  bluewaters: "Bluewaters Island",
  "city walk": "City Walk",
  "arabian ranches": "Arabian Ranches",
  "al barsha": "Al Barsha",
  "al furjan": "Al Furjan",
  "al reem": "Al Reem Island", "reem island": "Al Reem Island",
  saadiyat: "Saadiyat Island",
  yas: "Yas Island",
  corniche: "Corniche Road",
  meydan: "Meydan / MBR City", "mbr city": "Meydan / MBR City",
  "damac hills": "Damac Hills",
  "damac hills 2": "Damac Hills 2 (Akoya Oxygen)", "akoya oxygen": "Damac Hills 2 (Akoya Oxygen)",
  villanova: "Villanova (Dubailand)", amaranta: "Villanova (Dubailand)",
  mudon: "Mudon",
  serena: "Serena (Dubailand)",
  "the valley": "The Valley",
  "emaar south": "Emaar South",
  "town square": "Town Square",
  "silicon oasis": "Silicon Oasis",
  "discovery gardens": "Discovery Gardens",
  jge: "Jumeirah Golf Estates", "jumeirah golf": "Jumeirah Golf Estates",
  dubailand: "Dubailand",
  "nad al sheba": "Nad Al Sheba",
  "dubai south": "Dubai South / Expo City",
  "motor city": "Motor City",
  "sports city": "Dubai Sports City",
  greens: "The Greens & The Views",
};

const VTYPE_KEYWORDS: Record<string, string> = {
  apartment: "Apartment", apt: "Apartment", flat: "Apartment",
  villa: "Villa", townhouse: "Townhouse", penthouse: "Penthouse", studio: "Studio",
};

const VBED_KEYWORDS: Record<string, string> = {
  studio: "Studio",
  "1 bed": "1", "1br": "1", "1 bdr": "1", "1bed": "1", "1 bedroom": "1",
  "2 bed": "2", "2br": "2", "2 bdr": "2", "2bed": "2", "2 bedroom": "2",
  "3 bed": "3", "3br": "3", "3 bdr": "3", "3bed": "3", "3 bedroom": "3",
  "4 bed": "4", "4br": "4", "4bed": "4", "4 bedroom": "4",
  "5 bed": "5", "5br": "5",
};

interface ParsedValuation {
  unit?: string;
  area?: string;
  city?: string;
  type?: string;
  beds?: string;
  size?: string;
}

// Areas that are predominantly villas/townhouses — used for type inference
const VILLA_AREAS = new Set([
  "Palm Jumeirah","Arabian Ranches","Arabian Ranches 2","Arabian Ranches 3",
  "Villanova (Dubailand)","Mudon","Serena (Dubailand)","The Valley",
  "Damac Hills","Damac Hills 2 (Akoya Oxygen)","Tilal Al Ghaf",
  "Jumeirah Golf Estates","Emaar South","Al Furjan","Al Barsha",
  "Nad Al Sheba","Dubailand","Reem (Arabian Ranches)","Jumeirah Village Triangle (JVT)",
  "Saadiyat Island","Yas Island",
]);

// Building name patterns that imply a type
const BUILDING_TYPE_HINTS: [RegExp, string][] = [
  [/villa(s)?/i,           "Villa"],
  [/townhouse(s)?/i,       "Townhouse"],
  [/penthouse(s)?/i,       "Penthouse"],
  [/studio/i,              "Studio"],
  [/tower|residence(s)?|apartment(s)?|flat(s)?|height(s)?|gate|park|view(s)?/i, "Apartment"],
];

function inferTypeFromContext(buildingName: string, areaName: string): string | undefined {
  // Check explicit type words in building name first
  for (const [pattern, type] of BUILDING_TYPE_HINTS) {
    if (pattern.test(buildingName)) return type;
  }
  // Fall back to area-level inference
  if (VILLA_AREAS.has(areaName)) return "Villa";
  return undefined;
}

function resolveCity(area: string): string | undefined {
  // Search all cities for which one contains this area
  for (const [city, areas] of Object.entries(LOCATION_DATA)) {
    if (areas.some((a) => a.area === area)) return city;
  }
  return undefined;
}

function parseValuationSearch(input: string): ParsedValuation {
  const lower = input.toLowerCase().trim();
  const result: ParsedValuation = {};

  // City — explicit keyword match first (longest first)
  const cityEntries = Object.entries(CITY_KEYWORDS).sort((a, b) => b[0].length - a[0].length);
  for (const [kw, val] of cityEntries) {
    if (lower.includes(kw)) { result.city = val; break; }
  }

  // Area — longest match first
  const areaEntries = Object.entries(AREA_KEYWORDS).sort((a, b) => b[0].length - a[0].length);
  for (const [kw, val] of areaEntries) {
    if (lower.includes(kw)) { result.area = val; break; }
  }

  // If area found but no city yet, resolve city from area
  if (result.area && !result.city) {
    result.city = resolveCity(result.area) ?? "Dubai";
  }

  // Property type — explicit keyword first
  for (const [kw, val] of Object.entries(VTYPE_KEYWORDS)) {
    if (lower.includes(kw)) { result.type = val; break; }
  }

  // Bedrooms
  const bedEntries = Object.entries(VBED_KEYWORDS).sort((a, b) => b[0].length - a[0].length);
  for (const [kw, val] of bedEntries) {
    if (lower.includes(kw)) { result.beds = val; break; }
  }

  // Size
  const sizeMatch = lower.match(/(\d[\d,]*)\s*(?:sq\.?\s*ft|sqft|sf|m2|sqm)/);
  if (sizeMatch) result.size = sizeMatch[1].replace(/,/g, "") + " sq ft";

  // Building — search known buildings across all cities if no city detected yet
  const cityKey = result.city || "Dubai";
  const searchCities = result.city ? [result.city] : Object.keys(LOCATION_DATA);

  const buildAllAreas = (cities: string[]) =>
    cities.flatMap((c) => getAreas(c).flatMap((a) => a.buildings.map((b) => ({ b, a: a.area, c }))));

  const buildingPool = result.area
    ? getBuildings(cityKey, result.area).map((b) => ({ b, a: result.area!, c: cityKey }))
    : buildAllAreas(searchCities);

  // Exact substring match (longest first)
  const found = buildingPool
    .sort((x, y) => y.b.length - x.b.length)
    .find(({ b }) => lower.includes(b.toLowerCase()));

  if (found) {
    result.unit = found.b;
    if (!result.area)  result.area = found.a;
    if (!result.city)  result.city = found.c;
    // Infer type from building + area if not already set
    if (!result.type) result.type = inferTypeFromContext(found.b, found.a) ?? undefined;
    return result;
  }

  // Word-level partial match
  const words = lower.split(/[\s,\/]+/).filter((w) => w.length > 3);
  for (const word of words) {
    const isKw = [...Object.values(AREA_KEYWORDS), ...Object.values(CITY_KEYWORDS),
                  ...Object.values(VTYPE_KEYWORDS)].some((v) => v.toLowerCase().includes(word));
    if (isKw) continue;
    const partial = buildingPool
      .sort((x, y) => y.b.length - x.b.length)
      .find(({ b }) => b.toLowerCase().includes(word));
    if (partial) {
      result.unit = partial.b;
      if (!result.area)  result.area = partial.a;
      if (!result.city)  result.city = partial.c;
      if (!result.type) result.type = inferTypeFromContext(partial.b, partial.a) ?? undefined;
      return result;
    }
  }

  // Type inference from area alone (even if no building matched)
  if (!result.type && result.area) {
    result.type = inferTypeFromContext("", result.area) ?? undefined;
  }

  // Last fallback: pass raw stripped input as unit for OpenAI to resolve
  const knownValues = new Set([
    ...Object.values(AREA_KEYWORDS).map(v => v.toLowerCase()),
    ...Object.values(CITY_KEYWORDS).map(v => v.toLowerCase()),
    ...Object.values(VTYPE_KEYWORDS).map(v => v.toLowerCase()),
  ]);
  const stripped = input.split(/[,\/]/)
    .map(s => s.trim())
    .filter(s => s.length > 2 && !knownValues.has(s.toLowerCase()) &&
      !/^\d+$/.test(s) && !/^(bed|bath|br|bdr|sqft|sf|sq)$/i.test(s))
    .join(", ");
  if (stripped) result.unit = stripped;

  return result;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "form" | "processing" | "results";

interface FormData {
  unit: string;
  area: string;
  beds: string;
  baths: string;
  city: string;
  type: string;
  size: string;
  intent: string;
}

interface FieldErrors {
  unit?: string;
  name?: string;
  contact?: string; // covers phone + email together
}

interface GateData {
  name: string;
  phone: string;
  email: string;
}

interface GateErrors {
  name?: string;
  contact?: string;
}

interface ValuationResult {
  currency: string;
  community: string;
  city: string;
  country: string;
  tags: string[];
  fairValueLow: number;
  fairValueHigh: number;
  confidence: "High" | "Medium" | "Low";
  confidenceReason: string;
  fairValueExplanation: string;
  quickSaleLow: number;
  quickSaleHigh: number;
  suggestedListLow: number;
  suggestedListHigh: number;
  comparables: {
    type: "Sale" | "Listing";
    size: string;
    date: string;
    price: number;
    reason: string;
  }[];
  marketRead: string;
  strategy: string;
  strategyBullets: string[];
  movingFactors: string[];
  disclaimer: string;
  sources: { url: string; title: string }[];
}

interface ApiResponse {
  leadId: string;
  createdAt: string;
  currency: string;
  estimate_low: number;
  estimate_high: number;
  estimate_summary: string;
  confidence: "High" | "Medium" | "Low";
  confidence_reason: string;
  recommended_list_price: { low: number; high: number; note: string };
  quick_sale_range: { low: number; high: number; note: string };
  recommendation: string;
  market_read: string;
  disclaimer: string;
  sources: { url: string; title: string }[];
  transactions: { size: string; date: string; price: number; headline: string; notes: string }[];
  listings: { size: string; date: string; price: number; headline: string; notes: string }[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2500;
const STREAM_TIMEOUT_MS = 90_000; // 90s

const processingSteps = [
  { label: "Preparing",         desc: "Validating property details" },
  { label: "Searching market",  desc: "Reviewing live listings and sales" },
  { label: "Building estimate", desc: "Turning research into pricing guidance" },
  { label: "Ready to review",   desc: "Formatting your valuation report" },
];

const phaseMap: Record<string, number> = {
  started: 0,
  searching_web: 1,
  generating_estimate: 2,
  final: 3,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number | null | undefined, currency = "AED") =>
  n == null ? "—" : `${currency} ${Math.round(n).toLocaleString("en-US")}`;

function extractCommunity(unit: string): string {
  if (!unit) return "Your Property";
  return unit.split(",")[0]?.trim() || "Your Property";
}

function validateForm(form: FormData): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.unit.trim() || form.unit.trim().length < 5) {
    errors.unit = "Please enter the building or unit name (at least 5 characters).";
  }
  return errors;
}

function mapApiToResult(api: ApiResponse, form: FormData): ValuationResult {
  const community = extractCommunity(form.unit);
  const propType = form.type?.toLowerCase() || "property";

  const comparables = [
    ...(api.transactions ?? []).map((c) => ({
      type: "Sale" as const,
      size: c.size || "Not stated",
      date: c.date || "Not stated",
      price: c.price,
      reason: [c.headline, c.notes].filter(Boolean).join(". ") || "Relevant comparable.",
    })),
    ...(api.listings ?? []).map((c) => ({
      type: "Listing" as const,
      size: c.size || "Not stated",
      date: c.date || "Not stated",
      price: c.price,
      reason: [c.headline, c.notes].filter(Boolean).join(". ") || "Relevant comparable.",
    })),
  ];

  return {
    currency: api.currency || "AED",
    community,
    city: form.city || "Dubai",
    country: "UAE",
    tags: [form.type, community, form.intent].filter(Boolean) as string[],
    fairValueLow: api.estimate_low,
    fairValueHigh: api.estimate_high,
    fairValueExplanation: api.estimate_summary,
    confidence: api.confidence,
    confidenceReason: api.confidence_reason,
    quickSaleLow: api.quick_sale_range?.low,
    quickSaleHigh: api.quick_sale_range?.high,
    suggestedListLow: api.recommended_list_price?.low,
    suggestedListHigh: api.recommended_list_price?.high,
    comparables,
    marketRead: api.market_read,
    strategy: api.recommendation,
    strategyBullets: [
      api.recommended_list_price?.note,
      api.quick_sale_range?.note,
    ].filter(Boolean) as string[],
    movingFactors: [
      "Specific floor level and direct view (sea, community, or road-facing).",
      "Condition and quality of finishes — upgraded kitchens and bathrooms add material value.",
      `Vacancy status — vacant ${propType}s typically command a 3–8% premium.`,
      "Furnishing level and quality for rental-intent buyers.",
      "Building age, facilities, and service charge ratio.",
      "Proximity to metro, retail, and key landmarks.",
    ],
    disclaimer: api.disclaimer || "AI-assisted market snapshot. Not a formal appraisal.",
    sources: api.sources || [],
  };
}

// Core streaming fetch — throws on failure, returns ApiResponse on success
async function fetchValuation(payload: object): Promise<ApiResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), STREAM_TIMEOUT_MS);

  try {
    const res = await fetch("/api/valuation/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      if (res.status === 429) {
        const retry = errData?.retryAfterSeconds;
        throw new Error(
          retry
            ? `Service at capacity. Retrying in ${retry} seconds…`
            : (errData?.error ?? "Too many requests.")
        );
      }
      throw new Error(errData?.error ?? `Request failed (${res.status}).`);
    }

    if (!res.body) throw new Error("Streaming not supported in this browser.");

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let finalData: ApiResponse | null = null;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (!line.trim()) continue;
        let evt: { event: string; data?: ApiResponse; error?: string };
        try { evt = JSON.parse(line); } catch { continue; }

        if (evt.event === "error") throw new Error(evt.error ?? "Valuation failed.");
        if (evt.event === "final" && evt.data) finalData = evt.data;
      }
    }

    if (!finalData) throw new Error("Stream ended before a result was returned.");
    return finalData;

  } finally {
    clearTimeout(timeout);
  }
}

// ─── Field error component ────────────────────────────────────────────────────

const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
      <AlertTriangle className="h-3 w-3 flex-shrink-0" />
      {message}
    </p>
  ) : null;

// ─── Component ────────────────────────────────────────────────────────────────

const ValuationPage = () => {
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState<FormData>({
    unit: "", area: "", beds: "", baths: "", city: "Dubai",
    type: "", size: "", intent: "",
  });
  const [result, setResult] = useState<ValuationResult | null>(null);
  const [activeProcessStep, setActiveProcessStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showAreaSuggestions, setShowAreaSuggestions] = useState(false);
  const [showBuildingSuggestions, setShowBuildingSuggestions] = useState(false);
  const [smartQuery, setSmartQuery] = useState("");
  const [smartParsed, setSmartParsed] = useState<ParsedValuation>({});
  const [deedFile, setDeedFile] = useState<File | null>(null);
  const [deedParsing, setDeedParsing] = useState(false);
  const [deedParsed, setDeedParsed] = useState(false);
  const deedInputRef = useRef<HTMLInputElement>(null);
  const [showPlaces, setShowPlaces] = useState(false);
  const placesRef = useRef<HTMLDivElement>(null);
  const { results: placesResults, loading: placesLoading } = usePlacesSearch(form.unit, showPlaces);
  const [unlocked, setUnlocked] = useState(false);
  const [gate, setGate] = useState<GateData>({ name: "", phone: "", email: "" });
  const [gateErrors, setGateErrors] = useState<GateErrors>({});
  const [gateSubmitting, setGateSubmitting] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const unitInputRef = useRef<HTMLInputElement>(null);
  const areaSuggestionsRef = useRef<HTMLDivElement>(null);
  const buildingSuggestionsRef = useRef<HTMLDivElement>(null);


  const updateField = useCallback((key: keyof FormData, val: string) => {
    setForm((f) => ({ ...f, [key]: val }));

    // Live validation after first submit attempt
    if (submitAttempted) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        if (key === "unit") {
          if (val.trim().length >= 5) delete next.unit;
          else next.unit = "Please enter the building or unit name (at least 5 characters).";
        }
        return next;
      });
    }
  }, [submitAttempted]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (areaSuggestionsRef.current && !areaSuggestionsRef.current.contains(target)) {
        setShowAreaSuggestions(false);
      }
      if (buildingSuggestionsRef.current && !buildingSuggestionsRef.current.contains(target) &&
          unitInputRef.current && !unitInputRef.current.contains(target)) {
        setShowBuildingSuggestions(false);
      }
      if (placesRef.current && !placesRef.current.contains(target) &&
          unitInputRef.current && !unitInputRef.current.contains(target)) {
        setShowPlaces(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const runValuation = useCallback(async (payload: object, attempt: number) => {
    try {
      const data = await fetchValuation(payload);

      // Update phase to final on success
      setActiveProcessStep(3);
      setResult(mapApiToResult(data as ApiResponse, form));
      setStep("results");
      topRef.current?.scrollIntoView({ behavior: "smooth" });

    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      console.error(`[ValuationPage] attempt ${attempt}:`, err);

      // Detect abort = timeout
      const isTimeout = err instanceof Error && err.name === "AbortError";
      const isRetryable = isTimeout || (
        !msg.includes("Too many requests") &&
        !msg.includes("capacity") &&
        attempt < MAX_RETRIES
      );

      if (isRetryable) {
        const nextAttempt = attempt + 1;
        setRetryCount(nextAttempt);
        setActiveProcessStep(0); // reset progress
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        await runValuation(payload, nextAttempt);
      } else {
        setGlobalError(
          isTimeout
            ? "The request timed out after multiple attempts. Please try again."
            : msg
        );
        setStep("form");
        topRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [form]);

  // Simulate parsing a title deed — in production this would call
  // an OCR/AI endpoint. For now we extract what we can from the filename
  // and fill plausible UAE property details with a realistic delay.
  const handleDeedUpload = async (file: File) => {
    setDeedFile(file);
    setDeedParsing(true);
    setDeedParsed(false);

    // Simulate OCR processing time (1.5–2.5s)
    await new Promise((r) => setTimeout(r, 1800 + Math.random() * 700));

    // Try to extract clues from filename (e.g. "Marina_Gate_2_Unit_2704.pdf")
    const name = file.name.replace(/\.[^.]+$/, "").replace(/[_-]/g, " ");
    const parsed = parseValuationSearch(name);

    // Fill whatever we could extract, leave blanks for the rest
    setForm((f) => ({
      ...f,
      ...(parsed.unit  ? { unit:  parsed.unit  } : {}),
      ...(parsed.area  ? { area:  parsed.area  } : {}),
      ...(parsed.city  ? { city:  parsed.city  } : {}),
      ...(parsed.type  ? { type:  parsed.type  } : {}),
      ...(parsed.beds  ? { beds:  parsed.beds  } : {}),
      ...(parsed.size  ? { size:  parsed.size  } : {}),
    }));

    setDeedParsing(false);
    setDeedParsed(true);
  };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);

    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      // Scroll to first error
      topRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    setFieldErrors({});
    setGlobalError(null);
    setRetryCount(0);
    setStep("processing");
    setActiveProcessStep(0);
    topRef.current?.scrollIntoView({ behavior: "smooth" });

    // Kick off stream — phase updates happen inside runValuation via phaseMap
    // We hook into the stream for phase events separately
    const apiPayload = {
      propertyName: form.unit,
      location: form.area,
      city: form.city,
      propertyType: form.type,
      bedrooms: form.beds,
      bathrooms: form.baths,
      size: form.size,
      ownerName: gate.name,
      email: gate.email,
      phone: gate.phone,
      intent: form.intent,
    };

    // Run with phase tracking
    await runValuationWithPhases(apiPayload, 1);
  };

  // Separate function that also tracks phases (keeps runValuation clean for retries)
  const runValuationWithPhases = async (payload: object, attempt: number) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), STREAM_TIMEOUT_MS);

    try {
      const res = await fetch("/api/valuation/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        if (res.status === 429) {
          const retry = errData?.retryAfterSeconds;
          throw new Error(
            retry
              ? `Service at capacity. Please try again in ${retry} seconds.`
              : (errData?.error ?? "Too many requests.")
          );
        }
        throw new Error(errData?.error ?? `Request failed (${res.status}).`);
      }

      if (!res.body) throw new Error("Streaming not supported in this browser.");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalData: ApiResponse | null = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          let evt: { event: string; data?: ApiResponse; error?: string };
          try { evt = JSON.parse(line); } catch { continue; }

          if (evt.event === "error") throw new Error(evt.error ?? "Valuation failed.");
          if (evt.event in phaseMap) setActiveProcessStep(phaseMap[evt.event]);
          if (evt.event === "final" && evt.data) finalData = evt.data;
        }
      }

      if (!finalData) throw new Error("Stream ended before a result was returned.");

      setResult(mapApiToResult(finalData, form));
      setStep("results");
      topRef.current?.scrollIntoView({ behavior: "smooth" });

    } catch (err) {
      clearTimeout(timeout);
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      const isTimeout = err instanceof Error && err.name === "AbortError";
      const isRetryable = (isTimeout || !msg.includes("Too many requests")) && attempt < MAX_RETRIES;

      console.error(`[ValuationPage] attempt ${attempt}:`, err);

      if (isRetryable) {
        setRetryCount(attempt);
        setActiveProcessStep(0);
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        await runValuationWithPhases(payload, attempt + 1);
      } else {
        setGlobalError(
          isTimeout
            ? "The valuation timed out. Please try again."
            : msg
        );
        setStep("form");
        topRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    } finally {
      clearTimeout(timeout);
    }
  };

  const copySummary = () => {
    if (!result) return;
    const c = result.currency;
    const text = [
      `Valuation for ${result.community}, ${result.city}`,
      `Fair Value: ${fmt(result.fairValueLow, c)} – ${fmt(result.fairValueHigh, c)}`,
      `Suggested List: ${fmt(result.suggestedListLow, c)} – ${fmt(result.suggestedListHigh, c)}`,
      `Quick Sale: ${fmt(result.quickSaleLow, c)} – ${fmt(result.quickSaleHigh, c)}`,
    ].join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <div ref={topRef} className="h-20" />

      <AnimatePresence mode="wait">

        {/* ── Form ── */}
        {step === "form" && (
          <motion.div key="form"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
          >
            {/* Hero */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-8">
              <div className="grid lg:grid-cols-5 gap-12 items-start">
                <div className="lg:col-span-3">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0B3D2E] to-[#1A7A5A] flex items-center justify-center shadow-md">
                      <Target className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase"
                      style={{ background: "linear-gradient(to right, #D4A847, #B8922F)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                      Owner-Ready Valuation
                    </p>
                  </div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6">
                    Understand your property&apos;s{" "}
                    <span style={{ background: "linear-gradient(to right, #D4A847, #B8922F)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                      value
                    </span>{" "}in minutes.
                  </h1>
                  <p className="text-muted-foreground text-lg max-w-lg mb-6">
                    A refined estimate based on recent transactions, active listings, and comparable homes in the same market.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["Recent sales", "Live asking prices", "Expert guidance"].map((t) => (
                      <span key={t} className="inline-flex items-center gap-2 px-4 py-2.5 bg-card text-foreground rounded-xl text-xs font-bold border border-border/50 shadow-sm hover:border-primary/30 hover:shadow-md transition-all duration-300">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <div className="rounded-2xl border border-border/50 bg-card p-6 space-y-5 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(to bottom, #D4A847, #B8922F)" }} />
                      <p className="text-[10px] font-bold tracking-[0.2em] uppercase"
                        style={{ background: "linear-gradient(to right, #D4A847, #B8922F)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                        What You Get
                      </p>
                    </div>
                    {[
                      { icon: TrendingUp, title: "Sharper fair value range",    desc: "Built from same-building sales, nearby comparables, and current asking prices." },
                      { icon: Target,     title: "Actionable pricing guidance", desc: "See fair value, suggested list price, and quick-sale range in one snapshot." },
                      { icon: Sparkles,   title: "Expert follow-up",            desc: "Our valuation team reviews your report and reaches out with tailored advice." },
                    ].map((item) => (
                      <div key={item.title} className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#0B3D2E]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <item.icon className="h-4 w-4 text-[#0B3D2E]" />
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground text-sm">{item.title}</h3>
                          <p className="text-muted-foreground text-sm mt-0.5 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Global error banner */}
            {globalError && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-4">
                <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-6 py-4 text-sm text-destructive font-medium flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{globalError}</span>
                </div>
              </div>
            )}

            {/* Form */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
              <div className="rounded-2xl border border-border/50 bg-card p-8 sm:p-10 shadow-sm">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0B3D2E] to-[#1A7A5A] flex items-center justify-center shadow-md">
                    <Building2 className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold">Tell us about the property</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">All the core details in one screen. The more precise, the tighter the estimate.</p>
                  </div>
                </div>
                <div className="h-px bg-border/50 my-6" />

                {/* ── Title deed upload ── */}
                <div className="mb-6">
                  <input
                    ref={deedInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.heic"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleDeedUpload(file);
                      e.target.value = "";
                    }}
                  />

                  {!deedFile ? (
                    <button type="button"
                      onClick={() => deedInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border-2 border-dashed border-[#0B3D2E]/20 hover:border-[#0B3D2E]/40 hover:bg-[#0B3D2E]/3 text-muted-foreground hover:text-[#0B3D2E] transition-all duration-200 group">
                      <FileUp className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      <div className="text-left">
                        <p className="text-sm font-semibold">Upload title deed</p>
                        <p className="text-xs opacity-70">PDF, JPG or PNG — we&apos;ll extract the property details automatically</p>
                      </div>
                      <span className="ml-auto text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#0B3D2E]/8 text-[#0B3D2E]">Optional</span>
                    </button>
                  ) : (
                    <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl border transition-all duration-300 ${
                      deedParsing ? "border-[#D4A847]/30 bg-[#D4A847]/5" :
                      deedParsed  ? "border-[#0B3D2E]/25 bg-[#0B3D2E]/5" :
                      "border-border bg-muted/30"
                    }`}>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        deedParsing ? "bg-[#D4A847]/15" : deedParsed ? "bg-[#0B3D2E]/10" : "bg-muted"
                      }`}>
                        {deedParsing
                          ? <RefreshCw className="h-4 w-4 text-[#D4A847] animate-spin" />
                          : deedParsed
                          ? <FileText className="h-4 w-4 text-[#0B3D2E]" />
                          : <FileUp className="h-4 w-4 text-muted-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{deedFile.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {deedParsing ? "Reading deed and extracting property details…" :
                           deedParsed  ? "Fields filled from deed — review and adjust below" :
                           "Ready to process"}
                        </p>
                      </div>
                      {!deedParsing && (
                        <button type="button"
                          onClick={() => { setDeedFile(null); setDeedParsed(false); }}
                          className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 p-1">
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmit} noValidate className="space-y-6">

                  {/* Smart search bar */}
                  <div>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none z-10" />
                      <input
                        value={smartQuery}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSmartQuery(val);
                          if (val.trim().length > 2) {
                            const parsed = parseValuationSearch(val);
                            setSmartParsed(parsed);
                            setForm((f) => ({
                              ...f,
                              ...(parsed.unit ? { unit: parsed.unit } : {}),
                              ...(parsed.area ? { area: parsed.area } : {}),
                              ...(parsed.city ? { city: parsed.city } : {}),
                              ...(parsed.type ? { type: parsed.type } : {}),
                              ...(parsed.beds ? { beds: parsed.beds } : {}),
                              ...(parsed.size ? { size: parsed.size } : {}),
                            }));
                          } else if (val.trim().length === 0) {
                            setSmartParsed({});
                            setForm((f) => ({
                              ...f,
                              unit: "",
                              area: "",
                              city: "",
                              type: "",
                              beds: "",
                              size: "",
                            }));
                          }
                        }}
                        placeholder='Try "Marina Gate 1, Dubai Marina, 2BR" or "3 bed villa Dubai Hills"'
                        className="w-full pl-12 pr-16 h-14 bg-background rounded-2xl border-2 border-[#0B3D2E]/20 text-sm focus:outline-none focus:border-[#0B3D2E]/40 focus:ring-2 focus:ring-[#0B3D2E]/10 transition-all placeholder:text-muted-foreground/50"
                      />
                      {smartQuery && (
                        <button type="button"
                          onClick={() => {
                            setSmartQuery("");
                            setSmartParsed({});
                            // Reset only the fields that were auto-filled by smart search
                            setForm((f) => ({
                              ...f,
                              unit: "",
                              area: "",
                              city: "",
                              type: "",
                              beds: "",
                              size: "",
                            }));
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors">
                          Clear
                        </button>
                      )}
                    </div>
                    {Object.keys(smartParsed).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2.5">
                        {smartParsed.city  && <SmartTag label="City"     value={smartParsed.city} />}
                        {smartParsed.area  && <SmartTag label="Area"     value={smartParsed.area} />}
                        {smartParsed.unit  && <SmartTag label="Building" value={smartParsed.unit} />}
                        {smartParsed.type  && <SmartTag label="Type"     value={smartParsed.type} />}
                        {smartParsed.beds  && <SmartTag label="Beds"     value={smartParsed.beds} />}
                        {smartParsed.size  && <SmartTag label="Size"     value={smartParsed.size} />}
                      </div>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-2">
                      Type to auto-fill, or complete the fields below.
                    </p>
                  </div>

                  {/* Row 1 — City → Area → Building (cascading, Property Finder style) */}
                  <div className="grid sm:grid-cols-3 gap-4">

                    {/* City */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 flex items-center gap-1">
                        City
                        <span className="text-[9px] bg-gradient-to-r from-[#D4A847] to-[#B8922F] text-white px-1.5 py-0.5 rounded-full font-bold">Required</span>
                      </label>
                      <Select value={form.city} onValueChange={(v) => {
                        setForm((f) => ({ ...f, city: v, area: "", unit: "" }));
                        if (submitAttempted) setFieldErrors((prev) => {
                          const next = { ...prev };
                          delete (next as any).city;
                          return next;
                        });
                      }}>
                        <SelectTrigger className={`h-12 bg-background ${(fieldErrors as any).city ? "border-destructive" : ""}`}>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <SelectValue placeholder="Select city" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(LOCATION_DATA).map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {(fieldErrors as any).city && (
                        <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3 flex-shrink-0" />{(fieldErrors as any).city}
                        </p>
                      )}
                    </div>

                    {/* Area / Community — searchable */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">Area / Community</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
                        <input
                          value={form.area}
                          onChange={(e) => {
                            setForm((f) => ({ ...f, area: e.target.value, unit: "" }));
                            setShowAreaSuggestions(true);
                          }}
                          onFocus={() => setShowAreaSuggestions(true)}
                          onKeyDown={(e) => { if (e.key === "Escape") setShowAreaSuggestions(false); }}
                          placeholder={form.city ? `Search in ${form.city}…` : "Select city first"}
                          autoComplete="off"
                          disabled={!form.city}
                          className="w-full pl-10 h-12 bg-background rounded-xl border border-border px-3 text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E]/40 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        {showAreaSuggestions && form.city && (() => {
                          const q = form.area.trim().toLowerCase();
                          const matches = getAreas(form.city)
                            .filter((a) => !q || a.area.toLowerCase().includes(q))
                            .slice(0, 8);
                          return matches.length > 0 ? (
                            <div ref={areaSuggestionsRef}
                              className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border border-border bg-card shadow-lg overflow-hidden max-h-56 overflow-y-auto">
                              {matches.map((a) => (
                                <button key={a.area} type="button"
                                  className="w-full text-left px-4 py-3 text-sm hover:bg-muted/50 transition-colors flex items-center gap-2.5 border-b border-border/30 last:border-0"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    setForm((f) => ({ ...f, area: a.area, unit: "" }));
                                    setShowAreaSuggestions(false);
                                  }}>
                                  <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                  <span>{a.area}</span>
                                  <span className="ml-auto text-[10px] text-muted-foreground/60">{a.buildings.length} buildings</span>
                                </button>
                              ))}
                            </div>
                          ) : null;
                        })()}
                      </div>
                    </div>

                    {/* Building + Unit — Google Places live search with local fallback */}
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 flex items-center gap-1">
                        Building / Unit
                        <span className="text-[9px] bg-gradient-to-r from-[#D4A847] to-[#B8922F] text-white px-1.5 py-0.5 rounded-full font-bold">Required</span>
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
                        {placesLoading && (
                          <RefreshCw className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground animate-spin z-10 pointer-events-none" />
                        )}
                        <input
                          ref={unitInputRef}
                          value={form.unit}
                          onChange={(e) => {
                            updateField("unit", e.target.value);
                            setShowBuildingSuggestions(true);
                            setShowPlaces(true);
                          }}
                          onFocus={() => { setShowBuildingSuggestions(true); setShowPlaces(true); }}
                          onKeyDown={(e) => {
                            if (e.key === "Escape") { setShowBuildingSuggestions(false); setShowPlaces(false); }
                          }}
                          placeholder={form.area ? `Search in ${form.area}…` : "Search any building, community, villa…"}
                          autoComplete="off"
                          className={`w-full pl-10 h-12 bg-background rounded-xl border px-3 text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 ${
                            fieldErrors.unit ? "border-destructive" : "border-border focus:border-[#0B3D2E]/40"
                          }`}
                        />

                        {/* Google Places results — shown when available */}
                        {showPlaces && placesResults.length > 0 && (
                          <div ref={placesRef}
                            className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border border-border bg-card shadow-lg overflow-hidden max-h-64 overflow-y-auto">
                            <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 bg-muted/30 border-b border-border/30">
                              Live results
                            </p>
                            {placesResults.map((p) => (
                              <button key={p.placeId} type="button"
                                className="w-full text-left px-4 py-3 text-sm hover:bg-muted/50 transition-colors flex items-start gap-2.5 border-b border-border/30 last:border-0"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  // Fill building field with the full description
                                  updateField("unit", p.building || p.description.split(",")[0].trim());
                                  // Auto-fill area + city from Places response
                                  if (p.area)  setForm((f) => ({ ...f, area: p.area }));
                                  if (p.city && Object.keys(LOCATION_DATA).includes(p.city))
                                    setForm((f) => ({ ...f, city: p.city }));
                                  setShowPlaces(false);
                                  setShowBuildingSuggestions(false);
                                  unitInputRef.current?.blur();
                                }}>
                                <MapPin className="h-3.5 w-3.5 text-[#0B3D2E] flex-shrink-0 mt-0.5" />
                                <div className="min-w-0">
                                  <p className="font-medium text-foreground truncate">
                                    {p.building || p.description.split(",")[0]}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                                    {[p.area, p.city, "UAE"].filter(Boolean).join(", ")}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Local fallback — shown when no Places results yet */}
                        {showBuildingSuggestions && placesResults.length === 0 && !placesLoading && (() => {
                          const q = form.unit.trim().toLowerCase();
                          const pool = form.city && form.area
                            ? getBuildings(form.city, form.area)
                            : form.city
                            ? getAreas(form.city).flatMap((a) => a.buildings)
                            : [];
                          const matches = q.length >= 1
                            ? pool.filter((b) => b.toLowerCase().includes(q)).slice(0, 7)
                            : pool.slice(0, 7);
                          return matches.length > 0 ? (
                            <div ref={buildingSuggestionsRef}
                              className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border border-border bg-card shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                              <p className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 bg-muted/30 border-b border-border/30">
                                Suggestions
                              </p>
                              {matches.map((b) => (
                                <button key={b} type="button"
                                  className="w-full text-left px-4 py-3 text-sm hover:bg-muted/50 transition-colors flex items-center gap-2.5 border-b border-border/30 last:border-0"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    updateField("unit", b);
                                    setShowBuildingSuggestions(false);
                                    unitInputRef.current?.blur();
                                  }}>
                                  <Building2 className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                  <span>{b}</span>
                                </button>
                              ))}
                            </div>
                          ) : null;
                        })()}
                      </div>
                      <FieldError message={fieldErrors.unit} />
                    </div>
                  </div>

                                    {/* Row 2 — Type / Beds / Baths / Size / Intent */}
                  <div className="grid sm:grid-cols-5 gap-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">Type</label>
                      <Select value={form.type} onValueChange={(v) => updateField("type", v)}>
                        <SelectTrigger className="h-12 bg-background"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {["Apartment", "Villa", "Townhouse", "Penthouse", "Studio"].map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">Beds</label>
                      <div className="relative">
                        <BedDouble className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input value={form.beds} onChange={(e) => updateField("beds", e.target.value)}
                          placeholder="2" className="pl-10 h-12 bg-background" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">Baths</label>
                      <div className="relative">
                        <BedDouble className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input value={form.baths} onChange={(e) => updateField("baths", e.target.value)}
                          placeholder="2" className="pl-10 h-12 bg-background" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">Size</label>
                      <div className="relative">
                        <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input value={form.size} onChange={(e) => updateField("size", e.target.value)}
                          placeholder="1,420 sq ft" className="pl-10 h-12 bg-background" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 block">Intent</label>
                      <Select value={form.intent} onValueChange={(v) => updateField("intent", v)}>
                        <SelectTrigger className="h-12 bg-background"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {["Thinking of selling", "Need a fast cash offer", "Curious about market value", "Want to list with an agent"].map((i) => (
                            <SelectItem key={i} value={i}>{i}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>



                  <div>
                    <button type="submit"
                      className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-bold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]"
                      style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)", boxShadow: "0 4px 20px rgba(11,61,46,0.3)" }}>
                      <Sparkles className="h-4 w-4" />
                      Get Quick Valuation
                    </button>
                    <p className="text-xs text-muted-foreground mt-3">
                      Views, upgrades, floor, vacancy, furnishings, and condition help refine the estimate.
                    </p>
                  </div>
                </form>
              </div>
            </section>
          </motion.div>
        )}

        {/* ── Processing ── */}
        {step === "processing" && (
          <motion.div key="processing"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
            className="max-w-3xl mx-auto px-4 sm:px-6 py-20"
          >
            <div className="rounded-2xl border border-border bg-card p-8 sm:p-12">
              <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "#D4A847" }}>Valuation Snapshot</p>
              <h2 className="text-3xl font-bold mb-2">{extractCommunity(form.unit)}</h2>
              <p className="text-muted-foreground mb-3">Key pricing guidance first, then comparable sales, and supporting sources.</p>
              <span className="inline-block px-3 py-1 rounded-full border border-border text-sm font-medium">{form.city}</span>

              {/* Retry notice */}
              {retryCount > 0 && (
                <div className="mt-4 flex items-center gap-2 text-sm text-[#D4A847]">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Retrying… attempt {retryCount + 1} of {MAX_RETRIES + 1}
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
                {processingSteps.map((ps, i) => (
                  <div key={ps.label} className={`rounded-xl border p-4 transition-all duration-500 ${
                    i <= activeProcessStep ? "border-[#0B3D2E]/30 bg-[#0B3D2E]/5" : "border-border bg-muted/30"
                  }`}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className={`h-2 w-2 rounded-full transition-colors duration-500 ${
                        i < activeProcessStep ? "bg-[#0B3D2E]"
                          : i === activeProcessStep ? "animate-pulse bg-[#0B3D2E]"
                          : "bg-muted-foreground/30"
                      }`} />
                      <span className="text-sm font-bold">{ps.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{ps.desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-4">
                {[1, 2].map((n) => (
                  <div key={n} className="rounded-xl bg-secondary/50 p-6 space-y-3 animate-pulse">
                    <div className="h-4 w-1/3 bg-[#0B3D2E]/10 rounded" />
                    <div className="h-3 w-2/3 bg-[#0B3D2E]/5 rounded" />
                    <div className="h-3 w-1/2 bg-[#0B3D2E]/5 rounded" />
                    <div className="h-3 w-3/4 bg-[#0B3D2E]/5 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Results ── */}
        {step === "results" && result && (
          <motion.div key="results"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
            className="max-w-4xl mx-auto px-4 sm:px-6 py-12"
          >
            {/* Back */}
            <button onClick={() => { setStep("form"); setResult(null); setUnlocked(false); setGate({ name: "", phone: "", email: "" }); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-[#0B3D2E]/20 text-sm font-semibold text-[#0B3D2E] hover:bg-[#0B3D2E] hover:text-white hover:border-transparent transition-all duration-300 mb-8">
              <ArrowLeft className="h-4 w-4" /> New Search
            </button>

            {/* Header */}
            <div className="rounded-2xl border border-border/50 bg-card p-8 mb-4 shadow-sm">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0B3D2E] to-[#1A7A5A] flex items-center justify-center shadow-md">
                  <Target className="h-4 w-4 text-white" />
                </div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase"
                  style={{ background: "linear-gradient(to right, #D4A847, #B8922F)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Valuation Snapshot
                </p>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-2">{result.community}, {result.city}, {result.country}</h2>
              <p className="text-muted-foreground mb-4">Key pricing guidance first, then comparable sales and market context.</p>
              <div className="flex flex-wrap gap-2">
                {result.tags.map((t) => (
                  <span key={t} className="px-4 py-1.5 rounded-full text-sm font-medium text-foreground"
                    style={{ background: "linear-gradient(135deg, rgba(11,61,46,0.08), rgba(26,122,90,0.12))", border: "1px solid rgba(11,61,46,0.15)" }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Price section — numbers blurred until unlocked ── */}
            <div className="relative">

              {/* Fair Value + Confidence */}
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div className="rounded-2xl overflow-hidden shadow-sm">
                  <div className="bg-gradient-to-br from-[#D4A847] via-[#C9A83E] to-[#B8922F] p-8 text-white">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/70 font-bold mb-2">Fair Value</p>
                    <p className={`text-2xl sm:text-3xl font-bold transition-all duration-500 select-none ${!unlocked ? "blur-md" : ""}`}>
                      {fmt(result.fairValueLow, result.currency)} – {fmt(result.fairValueHigh, result.currency)}
                    </p>
                    <p className={`text-sm text-white/80 mt-3 leading-relaxed transition-all duration-500 ${!unlocked ? "blur-sm opacity-60" : ""}`}>{result.fairValueExplanation}</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-border/50 bg-card p-8 border-l-[3px] border-l-[#0B3D2E] shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">Confidence</p>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className={`h-5 w-5 ${
                      result.confidence === "High" ? "text-[#0B3D2E]"
                        : result.confidence === "Medium" ? "text-[#D4A847]"
                        : "text-destructive"
                    }`} />
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                      result.confidence === "High" ? "bg-[#0B3D2E]/10 text-[#0B3D2E]"
                        : result.confidence === "Medium" ? "bg-[#D4A847]/15 text-[#B8922F]"
                        : "bg-destructive/10 text-destructive"
                    }`}>
                      {result.confidence}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{result.confidenceReason}</p>
                </div>
              </div>

              {/* Price bars */}
              <div className="rounded-2xl border border-border/50 bg-card p-8 mb-4 shadow-sm">
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="w-1 h-6 rounded-full bg-gradient-to-b from-[#D4A847] to-[#B8922F]" />
                  <p className="text-sm font-semibold text-foreground">Price Comparison</p>
                  {!unlocked && <Lock className="h-3.5 w-3.5 text-muted-foreground ml-auto" />}
                </div>
                <PriceBar label="Quick sale"     low={result.quickSaleLow}     high={result.quickSaleHigh}     min={result.quickSaleLow} max={result.suggestedListHigh} color="#D4A847" currency={result.currency} blurred={false} />
                <PriceBar label="Fair value"     low={result.fairValueLow}     high={result.fairValueHigh}     min={result.quickSaleLow} max={result.suggestedListHigh} color="#0B3D2E" currency={result.currency} blurred={!unlocked} />
                <PriceBar label="Suggested list" low={result.suggestedListLow} high={result.suggestedListHigh} min={result.quickSaleLow} max={result.suggestedListHigh} color="#1A7A5A" currency={result.currency} blurred={!unlocked} />
                <p className="text-[10px] text-muted-foreground mt-4 bg-muted/30 rounded-xl p-3 border border-border/30">{result.disclaimer}</p>
              </div>

              {/* Suggested + Quick sale cards */}
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div className="rounded-2xl border border-border/50 bg-card p-6 border-l-[3px] border-l-[#0B3D2E] shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-[#0B3D2E]/10 flex items-center justify-center">
                      <TrendingUp className="h-3.5 w-3.5 text-[#0B3D2E]" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Suggested List Price</p>
                  </div>
                  <p className={`text-xl font-bold transition-all duration-500 select-none ${!unlocked ? "blur-md" : ""}`}>
                    {fmt(result.suggestedListLow, result.currency)} – {fmt(result.suggestedListHigh, result.currency)}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/50 bg-card p-6 border-l-[3px] border-l-[#D4A847] shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-[#D4A847]/10 flex items-center justify-center">
                      <TrendingDown className="h-3.5 w-3.5 text-[#D4A847]" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Quick Sale Range</p>
                  </div>
                  <p className="text-xl font-bold">
                    {fmt(result.quickSaleLow, result.currency)} – {fmt(result.quickSaleHigh, result.currency)}
                  </p>
                </div>
              </div>

              {/* Copy — only shown when unlocked */}
              {unlocked && (
                <div className="flex justify-end mb-4">
                  <button onClick={copySummary} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied!" : "Copy summary"}
                  </button>
                </div>
              )}
            </div>

            {/* ── Comparables — price + reasoning blurred until unlocked ── */}
            <div className="rounded-2xl border border-border/50 bg-card p-8 mb-4 shadow-sm">
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0B3D2E] to-[#1A7A5A] flex items-center justify-center shadow-md">
                  <Building2 className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-xl font-bold">Comparable evidence</h3>
                {!unlocked && <Lock className="h-3.5 w-3.5 text-muted-foreground ml-auto" />}
              </div>
              <p className="text-sm text-muted-foreground mb-6 ml-[46px]">Strongest sales and active listings used in the estimate</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-muted-foreground border-b border-border">
                      <th className="pb-3 pr-4">Type</th>
                      <th className="pb-3 pr-4">Size</th>
                      <th className="pb-3 pr-4">Date</th>
                      <th className="pb-3 pr-4">Price</th>
                      <th className="pb-3">Why It Matters</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.comparables.map((c, i) => {
                      const isFirst = i === 0;
                      return (
                      <tr key={i} className="border-b border-border/50 last:border-0">
                        <td className="py-3 pr-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            c.type === "Sale" ? "bg-[#0B3D2E]/10 text-[#0B3D2E]" : "bg-[#D4A847]/15 text-[#B8922F]"
                          }`}>{c.type}</span>
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">{c.size}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{c.date}</td>
                        <td className={`py-3 pr-4 font-bold transition-all duration-500 select-none ${!unlocked && !isFirst ? "blur-md" : ""}`}>
                          {fmt(c.price, result.currency)}
                        </td>
                        <td className={`py-3 text-muted-foreground max-w-xs transition-all duration-500 select-none ${!unlocked && !isFirst ? "blur-sm" : ""}`}>
                          {c.reason}
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Gate card — inline unlock prompt ── */}
            {!unlocked && (
              <GateCard
                gate={gate}
                gateErrors={gateErrors}
                gateSubmitting={gateSubmitting}
                onChange={(field, val) => {
                  setGate((g) => ({ ...g, [field]: val }));
                  setGateErrors((prev) => {
                    const next = { ...prev };
                    if (field === "name") { if (val.trim().length >= 2) delete next.name; }
                    if (field === "phone" || field === "email") {
                      const phone = field === "phone" ? val : gate.phone;
                      const email = field === "email" ? val : gate.email;
                      if (phone.trim().length > 5 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) delete next.contact;
                    }
                    return next;
                  });
                }}
                onUnlock={async () => {
                  const errs: GateErrors = {};
                  if (!gate.name.trim() || gate.name.trim().length < 2) errs.name = "Your name is required.";
                  const hasPhone = gate.phone.trim().length > 5;
                  const hasEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(gate.email.trim());
                  if (!hasPhone && !hasEmail) errs.contact = "Please add a phone or email so we can follow up.";
                  if (Object.keys(errs).length) { setGateErrors(errs); return; }
                  setGateSubmitting(true);
                  fetch("/api/leads", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name: gate.name, phone: gate.phone, email: gate.email,
                      source_page: "valuation", community: form.unit,
                      emirate: form.city, interest_type: form.intent || "valuation",
                      calculator_inputs: { ...form, ...gate },
                    }),
                  }).catch(() => {});
                  await new Promise((r) => setTimeout(r, 400));
                  setGateSubmitting(false);
                  setUnlocked(true);
                }}
              />
            )}

            {/* ── Market read — body blurred ── */}
            <div className="rounded-2xl border border-border/50 bg-card p-8 mb-4 shadow-sm">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(to bottom, #D4A847, #B8922F)" }} />
                <h3 className="text-xl font-bold">Market read</h3>
                {!unlocked && <Lock className="h-3.5 w-3.5 text-muted-foreground ml-auto" />}
              </div>
              <p className={`text-muted-foreground leading-relaxed transition-all duration-500 select-none ${!unlocked ? "blur-sm" : ""}`}>
                {result.marketRead}
              </p>
            </div>

            {/* ── Strategy — text + bullets blurred ── */}
            <div className="rounded-2xl border border-border/50 bg-card p-8 mb-4 shadow-sm">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-xl bg-[#0B3D2E]/10 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-[#0B3D2E]" />
                </div>
                <h3 className="text-xl font-bold">Recommended strategy</h3>
                {!unlocked && <Lock className="h-3.5 w-3.5 text-muted-foreground ml-auto" />}
              </div>
              <p className={`text-muted-foreground leading-relaxed mb-4 transition-all duration-500 select-none ${!unlocked ? "blur-sm" : ""}`}>
                {result.strategy}
              </p>
              <ul className="space-y-2.5">
                {result.strategyBullets.map((b, i) => (
                  <li key={i} className={`flex items-start gap-2.5 text-muted-foreground text-sm transition-all duration-500 select-none ${!unlocked ? "blur-sm" : ""}`}>
                    <ChevronRight className="h-4 w-4 mt-0.5 text-[#0B3D2E] flex-shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Moving factors — always visible ── */}
            <div className="rounded-2xl border border-border/50 bg-card p-8 mb-8 shadow-sm">
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-9 h-9 rounded-xl bg-[#D4A847]/10 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-[#D4A847]" />
                </div>
                <h3 className="text-xl font-bold">What can move this estimate</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4 ml-[46px]">Common reasons real-world pricing can shift</p>
              <ul className="space-y-2.5">
                {result.movingFactors.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-muted-foreground text-sm">
                    <span className="h-2 w-2 rounded-full mt-1.5 flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)" }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="rounded-3xl p-10 sm:p-14 text-center mb-12 relative overflow-hidden border border-border/30"
              style={{ background: "linear-gradient(160deg, hsl(40,20%,96%), hsl(43,40%,95%))" }}>
              <div className="absolute top-0 left-0 w-full h-[2px]"
                style={{ background: "linear-gradient(90deg, transparent, #D4A847, #B8922F, #D4A847, transparent)" }} />
              <div className="absolute inset-0 opacity-[0.04]"
                style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(212,168,71,0.4) 1px, transparent 0)", backgroundSize: "28px 28px" }} />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg"
                  style={{ background: "linear-gradient(135deg, #D4A847, #B8922F)", boxShadow: "0 8px 24px -4px rgba(212,168,71,0.3)" }}>
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-3 text-foreground">Want a detailed appraisal?</h3>
                <p className="text-muted-foreground max-w-lg mx-auto mb-10 leading-relaxed">
                  Our RERA-certified valuation experts can provide a formal appraisal with an on-site inspection. Get a precise figure you can use for selling, financing, or legal purposes.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a href="https://wa.me/971549988811?text=Hi%2C%20I%20just%20used%20the%20online%20valuation%20tool%20and%20would%20like%20a%20detailed%20appraisal."
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-3 w-full sm:w-64 py-4 rounded-full font-bold text-white transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl active:scale-[0.98] text-[15px] shadow-lg"
                    style={{ background: "linear-gradient(to right, #25D366, #1DA851)", boxShadow: "0 8px 24px -4px rgba(37,211,102,0.3)" }}>
                    <MessageCircle className="h-5 w-5" />
                    WhatsApp Inquiry
                  </a>
                  <a href="tel:+971549988811"
                    className="inline-flex items-center justify-center gap-3 w-full sm:w-64 py-4 rounded-full font-bold text-white transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl active:scale-[0.98] text-[15px] shadow-lg"
                    style={{ background: "linear-gradient(to right, #D4A847, #B8922F)", boxShadow: "0 8px 24px -4px rgba(212,168,71,0.3)" }}>
                    <PhoneCall className="h-5 w-5" />
                    Call Now
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};


// ─── Google Places hook ───────────────────────────────────────────────────────

interface PlacePrediction {
  placeId: string;
  description: string;
  building: string;
  area: string;
  city: string;
}

function usePlacesSearch(query: string, enabled: boolean) {
  const [results, setResults] = useState<PlacePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled || query.trim().length < 2) { setResults([]); return; }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/places?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.predictions ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300); // debounce 300ms

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query, enabled]);

  return { results, loading };
}

// ─── SmartTag ────────────────────────────────────────────────────────────────

const SmartTag = ({ label, value }: { label: string; value: string }) => (
  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#0B3D2E]/8 text-[#0B3D2E] border border-[#0B3D2E]/15">
    <span className="opacity-50 font-normal">{label}:</span>
    {value}
  </span>
);

// ─── GateCard ─────────────────────────────────────────────────────────────────

const GateCard = ({
  gate, gateErrors, gateSubmitting, onChange, onUnlock,
}: {
  gate: GateData;
  gateErrors: GateErrors;
  gateSubmitting: boolean;
  onChange: (field: keyof GateData, val: string) => void;
  onUnlock: () => void;
}) => (
  <div className="mb-8">
    {/* Unlock card */}
    <div className="rounded-2xl border-2 border-[#0B3D2E]/20 bg-card p-8 shadow-lg relative overflow-hidden">
      {/* Gold top line */}
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: "linear-gradient(90deg, transparent, #D4A847, #B8922F, #D4A847, transparent)" }} />

      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0B3D2E] to-[#1A7A5A] flex items-center justify-center shadow-md flex-shrink-0">
          <Lock className="h-4.5 w-4.5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-foreground text-lg leading-tight">Unlock the full report</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Comparables, market read, and strategy — free</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
        Enter your name and a contact to reveal the exact figures and get the full report.
        No spam — just one call or message if you want it.
      </p>

      <div className="grid sm:grid-cols-3 gap-4 mb-4">
        {/* Name */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 flex items-center gap-1">
            Name
            <span className="text-[9px] bg-gradient-to-r from-[#D4A847] to-[#B8922F] text-white px-1.5 py-0.5 rounded-full font-bold">Required</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={gate.name} onChange={(e) => onChange("name", e.target.value)}
              placeholder="Your name" autoComplete="name"
              className={`w-full pl-10 h-12 bg-background rounded-xl border px-3 text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 ${
                gateErrors.name ? "border-destructive" : "border-border focus:border-[#0B3D2E]/40"
              }`} />
          </div>
          {gateErrors.name && (
            <p className="text-xs text-destructive mt-1 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 flex-shrink-0" />{gateErrors.name}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 flex items-center gap-1">
            Phone
            <span className="text-[9px] text-muted-foreground/60 font-normal normal-case tracking-normal">or email</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={gate.phone} onChange={(e) => onChange("phone", e.target.value)}
              placeholder="+971 50 000 0000" autoComplete="tel"
              className={`w-full pl-10 h-12 bg-background rounded-xl border px-3 text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 ${
                gateErrors.contact ? "border-destructive" : "border-border focus:border-[#0B3D2E]/40"
              }`} />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5 flex items-center gap-1">
            Email
            <span className="text-[9px] text-muted-foreground/60 font-normal normal-case tracking-normal">or phone</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={gate.email} onChange={(e) => onChange("email", e.target.value)}
              placeholder="owner@example.com" type="email" autoComplete="email"
              className={`w-full pl-10 h-12 bg-background rounded-xl border px-3 text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 ${
                gateErrors.contact ? "border-destructive" : "border-border focus:border-[#0B3D2E]/40"
              }`} />
          </div>
        </div>
      </div>

      {gateErrors.contact && (
        <p className="text-xs text-destructive mb-4 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3 flex-shrink-0" />{gateErrors.contact}
        </p>
      )}

      <button onClick={onUnlock} disabled={gateSubmitting}
        className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-bold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:opacity-70 disabled:cursor-wait"
        style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)", boxShadow: "0 4px 20px rgba(11,61,46,0.3)" }}>
        {gateSubmitting ? (
          <><RefreshCw className="h-4 w-4 animate-spin" /> Unlocking…</>
        ) : (
          <><Unlock className="h-4 w-4" /> See full report</>
        )}
      </button>
    </div>
  </div>
);

// ─── PriceBar ─────────────────────────────────────────────────────────────────

const PriceBar = ({
  label, low, high, min, max, color, currency = "AED", blurred = false,
}: {
  label: string; low: number; high: number; min: number; max: number; color: string; currency?: string; blurred?: boolean;
}) => {
  const range = max - min || 1;
  const leftPct = ((low - min) / range) * 100;
  const widthPct = ((high - low) / range) * 100;

  return (
    <div className="flex items-center gap-3 mb-4 min-w-0">
      <span className="text-sm font-medium w-28 flex-shrink-0">{label}</span>
      <div className="flex-1 h-3 bg-muted rounded-full relative overflow-hidden">
        <div className="h-3 rounded-full absolute top-0"
          style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 3)}%`, backgroundColor: color }} />
      </div>
      <span className={`text-sm text-muted-foreground flex-shrink-0 text-right whitespace-nowrap transition-all duration-500 select-none ${blurred ? "blur-md" : ""}`}>
        {fmt(low, currency)} – {fmt(high, currency)}
      </span>
    </div>
  );
};

export default ValuationPage;