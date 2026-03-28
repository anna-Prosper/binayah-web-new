export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";

/* ─────────────────────────────────────────────
   GET /api/search/suggest?q=...

   Powered by GPT-5.4-nano:
   1. Parses natural language query into structured intent
   2. Fetches matching projects from MongoDB
   3. Returns typed suggestions for the Navbar dropdown

   Cost: ~$0.000130 per request (150 input + 80 output tokens)
   Latency: ~500ms with 350ms debounce = feels instant
───────────────────────────────────────────── */

interface ParsedIntent {
  community?: string;
  city?: string;
  propertyType?: string;
  bedrooms?: number | null;
  maxPrice?: number | null;
  minPrice?: number | null;
  status?: "off-plan" | "ready" | null;
  keywords?: string[];
  searchQuery: string; // cleaned query for MongoDB text search
}

interface Suggestion {
  label: string;
  sublabel?: string;
  href: string;
  type: "project" | "community" | "search" | "intent";
  icon?: "map" | "trend" | "search";
}

/* ── Dubai communities for fast local matching ── */
const KNOWN_COMMUNITIES = [
  "Downtown Dubai", "Dubai Marina", "Palm Jumeirah", "Business Bay",
  "JBR", "Jumeirah Beach Residence", "DIFC", "Dubai Hills", "Dubai Hills Estate",
  "Creek Harbour", "Dubai Creek Harbour", "JVC", "Jumeirah Village Circle",
  "JLT", "Jumeirah Lake Towers", "City Walk", "Bluewaters", "Meydan",
  "Arabian Ranches", "Damac Hills", "Tilal Al Ghaf", "Emaar South",
  "Town Square", "Sobha Hartland", "Al Furjan", "Motor City", "Sports City",
  "The Valley", "Dubai South", "Al Barsha", "Jumeirah", "Al Quoz",
];

/* ── Call GPT-5.4-nano to parse natural language ── */
async function parseWithAI(query: string): Promise<ParsedIntent> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Fallback: basic keyword extraction without AI
    return { searchQuery: query };
  }

  const systemPrompt = `You are a Dubai real estate search parser. 
Parse the user's query and return ONLY a JSON object with these optional fields:
- community: string (Dubai community/area name, normalised)
- city: string (Dubai, Abu Dhabi, Sharjah, etc.)
- propertyType: string (apartment, villa, townhouse, penthouse, studio)
- bedrooms: number (number of bedrooms, null if not specified)
- maxPrice: number (max price in AED, null if not specified — convert "2M" to 2000000)
- minPrice: number (min price in AED, null if not specified)
- status: "off-plan" | "ready" | null
- keywords: string[] (other important words like developer name, project name)
- searchQuery: string (cleaned search terms for text search, remove price/bed/type words)

Examples:
"3 bed apartment palm jumeirah" → {"community":"Palm Jumeirah","propertyType":"apartment","bedrooms":3,"searchQuery":"palm jumeirah"}
"off plan under 2m marina" → {"community":"Dubai Marina","status":"off-plan","maxPrice":2000000,"searchQuery":"marina"}
"invest dubai hills villa" → {"community":"Dubai Hills Estate","propertyType":"villa","keywords":["invest"],"searchQuery":"dubai hills villa"}
"شقة دبي مارينا" → {"community":"Dubai Marina","propertyType":"apartment","searchQuery":"dubai marina"}

Return ONLY valid JSON, no other text.`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-5.4-nano",
        max_tokens: 200,
        temperature: 0,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user",   content: query },
        ],
      }),
      signal: AbortSignal.timeout(4000), // 4s timeout
    });

    if (!res.ok) throw new Error(`OpenAI ${res.status}`);

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim() ?? "{}";
    const parsed = JSON.parse(text);
    return { searchQuery: query, ...parsed };

  } catch (err) {
    console.error("[search/suggest] AI parse error:", err);
    return { searchQuery: query };
  }
}

/* ── Build MongoDB filter from parsed intent ── */
function buildFilter(intent: ParsedIntent) {
  const filter: Record<string, unknown> = { publishStatus: "Published" };

  if (intent.community) {
    filter.community = { $regex: intent.community.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
  }
  if (intent.city) {
    filter.city = { $regex: intent.city, $options: "i" };
  }
  if (intent.propertyType) {
    filter.$or = [
      { propertyType: { $regex: intent.propertyType, $options: "i" } },
      { unitTypes:    { $elemMatch: { $regex: intent.propertyType, $options: "i" } } },
    ];
  }
  if (intent.bedrooms) {
    filter.$or = [
      { bedrooms: { $regex: String(intent.bedrooms), $options: "i" } },
      { unitTypes: { $elemMatch: { $regex: `${intent.bedrooms}\\s*bed`, $options: "i" } } },
    ];
  }
  if (intent.maxPrice) filter.startingPrice = { $lte: intent.maxPrice };
  if (intent.status === "off-plan") filter.status = { $regex: "off.plan|launch", $options: "i" };
  if (intent.status === "ready")    filter.status = { $regex: "ready|completed", $options: "i" };

  // Text search fallback using searchQuery keywords
  if (!intent.community && intent.searchQuery.trim()) {
    const words = intent.searchQuery.trim().split(/\s+/).filter((w) => w.length > 2);
    if (words.length > 0) {
      filter.$or = [
        { name:          { $regex: words.join("|"), $options: "i" } },
        { community:     { $regex: words.join("|"), $options: "i" } },
        { developerName: { $regex: words.join("|"), $options: "i" } },
        { tags:          { $elemMatch: { $regex: words.join("|"), $options: "i" } } },
      ];
    }
  }

  return filter;
}

/* ── Format price for display ── */
function fmtPrice(price?: number | null): string {
  if (!price) return "";
  if (price >= 1_000_000) return `From AED ${(price / 1_000_000).toFixed(1)}M`;
  if (price >= 1_000)     return `From AED ${(price / 1_000).toFixed(0)}K`;
  return `AED ${price.toLocaleString()}`;
}

/* ─────────────────────────────────────────────
   Handler
───────────────────────────────────────────── */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (!q || q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    // 1. Parse with GPT-5.4-nano (parallel with DB connection)
    const [intent] = await Promise.all([
      parseWithAI(q),
      connectDB(),
    ]);

    // 2. Query MongoDB
    const filter = buildFilter(intent);
    const projects = await Project.find(filter)
      .select("name slug community city startingPrice status developerName")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean() as any[];

    // 3. Build suggestions array
    const suggestions: Suggestion[] = [];

    // Project results
    for (const p of projects) {
      const price = fmtPrice(p.startingPrice);
      suggestions.push({
        label:    p.name,
        sublabel: [p.community, p.city, price].filter(Boolean).join(" · "),
        href:     `/project/${p.slug}`,
        type:     "project",
        icon:     "trend",
      });
    }

    // Community suggestion (if community was parsed)
    if (intent.community && !projects.some((p) => p.community?.toLowerCase() === intent.community?.toLowerCase())) {
      const communitySlug = intent.community.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      suggestions.push({
        label:    intent.community,
        sublabel: "Browse community",
        href:     `/communities/${communitySlug}`,
        type:     "community",
        icon:     "map",
      });
    }

    // If no project results but query matches a known community
    if (suggestions.length === 0) {
      const matchedCommunity = KNOWN_COMMUNITIES.find((c) =>
        c.toLowerCase().includes(q.toLowerCase()) || q.toLowerCase().includes(c.toLowerCase().split(" ")[0])
      );
      if (matchedCommunity) {
        const slug = matchedCommunity.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        suggestions.push({
          label:    matchedCommunity,
          sublabel: "Browse community",
          href:     `/communities/${slug}`,
          type:     "community",
          icon:     "map",
        });
      }
    }

    // Always add a full search fallback
    suggestions.push({
      label:    `Search "${q}"`,
      sublabel: "See all matching properties",
      href:     `/search?q=${encodeURIComponent(q)}`,
      type:     "search",
      icon:     "search",
    });

    // Intent-based suggestion (invest, rent, buy)
    const lq = q.toLowerCase();
    if (lq.includes("invest") || lq.includes("roi") || lq.includes("yield")) {
      suggestions.unshift({
        label:    "Off-Plan Investment Properties",
        sublabel: "High-yield Dubai off-plan projects",
        href:     "/off-plan",
        type:     "intent",
        icon:     "trend",
      });
    }

    return NextResponse.json(
      { suggestions: suggestions.slice(0, 6) },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );

  } catch (err) {
    console.error("[search/suggest]", err);
    // Graceful fallback — never error to the user
    return NextResponse.json({
      suggestions: [
        {
          label: `Search "${q}"`,
          sublabel: "Browse all properties",
          href: `/search?q=${encodeURIComponent(q)}`,
          type: "search",
          icon: "search",
        },
      ],
    });
  }
}
