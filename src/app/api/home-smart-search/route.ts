export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Community from "@/models/Community";
import Developer from "@/models/Developer";
import Project from "@/models/Project";
import {
  buildHomeSearchSummary,
  buildHomeSearchTags,
  createEmptyHomeSearchDraft,
  createGroupedHomeSearchSuggestions,
  HomeSearchCandidate,
  HomeSearchDraft,
  HOME_SEARCH_BATHROOM_OPTIONS,
  HOME_SEARCH_BEDROOM_OPTIONS,
  HOME_SEARCH_PROPERTY_TYPES,
  normalizeSearchText,
  normalizeTabToIntent,
  parseHomeSearchQuery,
  resolveBudgetLabel,
} from "@/lib/home-smart-search";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-5.4-nano";
const NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
};

const SYSTEM_PROMPT = `You parse home-page Dubai property search queries into structured filters for a smart search bar.

Return only JSON matching the schema.

Rules:
- Prefer provided candidate communities, projects, and developers when they match.
- Never invent a community, project, or developer that is not present in the candidate lists.
- intent must be one of: buy, rent, off-plan, or null.
- propertyType must be one of the allowed property types or null.
- bedrooms must be one of the allowed bedroom values or null.
- bathrooms must be one of the allowed bathroom values or null.
- furnishing must be Furnished, Unfurnished, or null.
- budgetMin and budgetMax must be numbers or null.
- isQuestion should be true only when the user is clearly asking for advice or a conversational answer instead of a listing search.
- Keep reasoning short.`;

export async function GET(request: NextRequest) {
  const query = String(request.nextUrl.searchParams.get("q") || "").trim();
  const tab = request.nextUrl.searchParams.get("tab");
  const defaultIntent = normalizeTabToIntent(tab);

  if (query.length < 2) {
    const draft = createEmptyHomeSearchDraft(defaultIntent);
    return NextResponse.json(
      {
        draft,
        suggestions: createGroupedHomeSearchSuggestions({ draft, query: "" }),
      },
      { headers: NO_STORE_HEADERS },
    );
  }

  const suggestions = await loadSuggestionCandidates(query);

  let draft = parseHomeSearchQuery(query, {
    communities: suggestions.communities,
    defaultIntent,
    developers: suggestions.developers,
    projects: suggestions.projects,
  });

  draft = await enhanceDraftWithAi(query, draft, defaultIntent, suggestions).catch(() => draft);

  return NextResponse.json(
    {
      draft,
      suggestions: createGroupedHomeSearchSuggestions({
        draft,
        query,
        suggestions,
      }),
    },
    { headers: NO_STORE_HEADERS },
  );
}

async function loadSuggestionCandidates(query: string) {
  const escaped = escapeRegex(query);
  const searchRegex = new RegExp(escaped, "i");

  try {
    await connectDB();
  } catch (error) {
    console.warn("[home-smart-search] DB unavailable:", (error as Error).message);
    return { communities: [] as HomeSearchCandidate[], developers: [] as HomeSearchCandidate[], projects: [] as HomeSearchCandidate[] };
  }

  const [communitiesResult, projectsResult, developersResult] = await Promise.allSettled([
    Community.find({
      publishStatus: "Published",
      $or: [
        { name: searchRegex },
        { displayName: searchRegex },
      ],
    })
      .select("name displayName city projectCount")
      .sort({ featured: -1, order: 1, projectCount: -1, name: 1 })
      .limit(5)
      .lean(),
    Project.find({
      publishStatus: "Published",
      $or: [
        { name: searchRegex },
        { community: searchRegex },
        { developerName: searchRegex },
      ],
    })
      .select("name community city developerName propertyType completionDate")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    Developer.find({
      publishStatus: "Published",
      name: searchRegex,
    })
      .select("name description projectCount")
      .sort({ featured: -1, projectCount: -1, name: 1 })
      .limit(5)
      .lean(),
  ]);

  return {
    communities: communitiesResult.status === "fulfilled"
      ? communitiesResult.value.map((community: any) => ({
        city: community.city || "Dubai",
        count: community.projectCount || 0,
        kind: "community" as const,
        name: community.displayName || community.name,
        subtitle: community.city ? `${community.city} community` : "Community",
      }))
      : [],
    developers: developersResult.status === "fulfilled"
      ? developersResult.value.map((developer: any) => ({
        count: developer.projectCount || 0,
        kind: "developer" as const,
        name: developer.name,
        subtitle: developer.description || "Developer",
      }))
      : [],
    projects: projectsResult.status === "fulfilled"
      ? projectsResult.value.map((project: any) => ({
        city: project.city || "Dubai",
        community: project.community || "",
        completionDate: project.completionDate || "",
        developerName: project.developerName || "",
        kind: "project" as const,
        name: project.name,
        propertyType: project.propertyType || "Apartment",
        subtitle: [project.developerName, project.community].filter(Boolean).join(" · "),
      }))
      : [],
  };
}

async function enhanceDraftWithAi(
  query: string,
  draft: HomeSearchDraft,
  defaultIntent: HomeSearchDraft["intent"],
  suggestions: {
    communities: HomeSearchCandidate[];
    developers: HomeSearchCandidate[];
    projects: HomeSearchCandidate[];
  },
) {
  const apiKey = String(process.env.OPENAI_API_KEY || "").trim();
  if (!apiKey || query.trim().length < 8) {
    return draft;
  }

  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.1,
      max_completion_tokens: 350,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "home_smart_search_parse",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              parsed: {
                type: "object",
                additionalProperties: false,
                properties: {
                  intent: { type: ["string", "null"] },
                  location: { type: ["string", "null"] },
                  project: { type: ["string", "null"] },
                  developer: { type: ["string", "null"] },
                  city: { type: ["string", "null"] },
                  propertyType: { type: ["string", "null"] },
                  bedrooms: { type: ["string", "null"] },
                  bathrooms: { type: ["string", "null"] },
                  furnishing: { type: ["string", "null"] },
                  budgetMin: { type: ["number", "null"] },
                  budgetMax: { type: ["number", "null"] },
                },
                required: ["intent", "location", "project", "developer", "city", "propertyType", "bedrooms", "bathrooms", "furnishing", "budgetMin", "budgetMax"],
              },
              confidence: { type: "number" },
              isQuestion: { type: "boolean" },
              reasoning: { type: "string" },
            },
            required: ["parsed", "confidence", "isQuestion", "reasoning"],
          },
        },
      },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: JSON.stringify({
            allowedBathrooms: HOME_SEARCH_BATHROOM_OPTIONS,
            allowedBedrooms: HOME_SEARCH_BEDROOM_OPTIONS,
            allowedPropertyTypes: HOME_SEARCH_PROPERTY_TYPES,
            candidateCommunities: suggestions.communities.slice(0, 5),
            candidateDevelopers: suggestions.developers.slice(0, 5),
            candidateProjects: suggestions.projects.slice(0, 5),
            defaultIntent,
            heuristicDraft: draft,
            query,
          }),
        },
      ],
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    console.error("[home-smart-search:ai]", response.status, body);
    return draft;
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) return draft;

  let parsed: any;
  try {
    parsed = JSON.parse(content);
  } catch {
    return draft;
  }

  const aiDraft = normalizeAiDraft(parsed?.parsed, suggestions, defaultIntent);
  const merged: HomeSearchDraft = {
    ...draft,
    ...Object.fromEntries(Object.entries(aiDraft).filter(([, value]) => value != null)),
    budgetLabel: resolveBudgetLabel(aiDraft.budgetMin ?? draft.budgetMin, aiDraft.budgetMax ?? draft.budgetMax, (aiDraft.intent ?? draft.intent) === "rent" ? "rent" : "buy"),
    budgetMax: aiDraft.budgetMax ?? draft.budgetMax,
    budgetMin: aiDraft.budgetMin ?? draft.budgetMin,
    confidence: Math.max(draft.confidence, sanitizeNumber(parsed?.confidence, draft.confidence) ?? draft.confidence),
    isQuestion: Boolean(parsed?.isQuestion) && countSignals(aiDraft) < 3,
    summary: "",
    tags: [],
  };

  merged.summary = buildHomeSearchSummary(merged, query);
  merged.tags = buildHomeSearchTags(merged);

  return merged;
}

function normalizeAiDraft(
  raw: Record<string, unknown> | null | undefined,
  suggestions: {
    communities: HomeSearchCandidate[];
    developers: HomeSearchCandidate[];
    projects: HomeSearchCandidate[];
  },
  defaultIntent: HomeSearchDraft["intent"],
) {
  const intent = sanitizeIntent(raw?.intent, defaultIntent);
  const location = resolveCandidate(raw?.location, suggestions.communities);
  const project = resolveCandidate(raw?.project, suggestions.projects);
  const matchedDeveloper = resolveCandidate(raw?.developer, suggestions.developers);
  const propertyType = sanitizePropertyType(raw?.propertyType) || project?.propertyType || null;
  const city = sanitizeCity(raw?.city) || location?.city || project?.city || null;

  return {
    bathrooms: sanitizeDiscrete(raw?.bathrooms, HOME_SEARCH_BATHROOM_OPTIONS),
    bedrooms: sanitizeDiscrete(raw?.bedrooms, HOME_SEARCH_BEDROOM_OPTIONS),
    budgetMax: sanitizeNumber(raw?.budgetMax, null),
    budgetMin: sanitizeNumber(raw?.budgetMin, null),
    city,
    developer: matchedDeveloper?.name || project?.developerName || null,
    furnishing: sanitizeFurnishing(raw?.furnishing),
    intent,
    location: location?.name || project?.community || null,
    project: project?.name || null,
    propertyType,
  };
}

function resolveCandidate(raw: unknown, candidates: HomeSearchCandidate[]) {
  const value = String(raw ?? "").trim();
  if (!value) return null;

  const normalized = normalizeSearchText(value);
  let exact = candidates.find((candidate) => normalizeSearchText(candidate.name) === normalized);
  if (exact) return exact;

  exact = candidates.find((candidate) => normalizeSearchText(candidate.name).includes(normalized) || normalized.includes(normalizeSearchText(candidate.name)));
  if (exact) return exact;

  return null;
}

function sanitizeIntent(value: unknown, defaultIntent: HomeSearchDraft["intent"]) {
  const normalized = normalizeSearchText(String(value ?? ""));
  if (normalized === "buy") return "buy";
  if (normalized === "rent") return "rent";
  if (normalized === "off_plan" || normalized === "offplan") return "off-plan";
  return defaultIntent ?? null;
}

function sanitizePropertyType(value: unknown) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;

  return HOME_SEARCH_PROPERTY_TYPES.find((option) => option.toLowerCase() === raw.toLowerCase()) ?? null;
}

function sanitizeFurnishing(value: unknown) {
  const raw = String(value ?? "").trim().toLowerCase();
  if (raw === "furnished") return "Furnished" as const;
  if (raw === "unfurnished") return "Unfurnished" as const;
  return null;
}

function sanitizeCity(value: unknown) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  return raw;
}

function sanitizeDiscrete<T extends readonly string[]>(value: unknown, allowed: T): T[number] | null {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  return (allowed.find((option) => option.toLowerCase() === raw.toLowerCase()) ?? null) as T[number] | null;
}

function sanitizeNumber(value: unknown, fallback: number | null) {
  if (value == null) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function countSignals(value: Partial<HomeSearchDraft>) {
  return Object.values({
    intent: value.intent,
    location: value.location,
    project: value.project,
    developer: value.developer,
    propertyType: value.propertyType,
    bedrooms: value.bedrooms,
    bathrooms: value.bathrooms,
    budgetMin: value.budgetMin,
    budgetMax: value.budgetMax,
  }).filter((entry) => entry != null && entry !== "").length;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
