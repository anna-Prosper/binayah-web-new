export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";
import Listing from "@/models/Listing";

const SYSTEM_PROMPT = `You are Binayah Properties' AI assistant — a knowledgeable, friendly real estate advisor for the Dubai property market.

Your expertise: Properties for sale/rent across Dubai, off-plan projects, investment advice, Golden Visa through property, mortgage guidance, rental yields, community comparisons, and property management.

Guidelines:
- Be warm, professional, and concise (under 200 words unless detail is needed)
- Use AED for pricing
- When you have property data in context, reference specific properties with details
- For investment queries, mention ROI potential, rental yields, and capital appreciation
- For Golden Visa: Property must be AED 2M+ at time of purchase, freehold only
- Always invite them to contact Binayah for specifics: +971 54 998 8811 or WhatsApp
- If you don't have specific data, give helpful general Dubai market knowledge
- Mention Binayah's services when relevant: property management, off-plan sales, secondary market, rental services

Binayah Properties info:
- RERA Registration No. 1162
- Office: Mezzanine Floor, Liberty Building, Al Quoz 3, Sheikh Zayed Rd, Dubai
- Phone: +971 54 998 8811 / +971 4 243 8479
- Email: info@binayah.com
- Website: binayah.com`;

// Extract search keywords from the user's message
function extractSearchTerms(message: string): { communities: string[]; types: string[]; bedrooms: number | null; priceMax: number | null; intent: string } {
  const lower = message.toLowerCase();

  const communityMap: Record<string, RegExp> = {
    "Downtown Dubai": /downtown/i,
    "Dubai Marina": /marina/i,
    "Palm Jumeirah": /palm/i,
    "JVC": /jvc|jumeirah village circle/i,
    "Business Bay": /business bay/i,
    "JBR": /jbr/i,
    "Dubai Hills": /dubai hills/i,
    "Creek Harbour": /creek/i,
    "MBR City": /mbr|meydan/i,
    "DAMAC Hills": /damac hills/i,
    "Jumeirah": /\bjumeirah\b(?! village| beach)/i,
    "DIFC": /difc/i,
    "Al Barsha": /barsha/i,
    "Arabian Ranches": /arabian ranches/i,
  };

  const communities: string[] = [];
  for (const [name, pattern] of Object.entries(communityMap)) {
    if (pattern.test(message)) communities.push(name);
  }

  const types: string[] = [];
  if (/\bapartment|flat\b/i.test(lower)) types.push("Apartment");
  if (/\bvilla\b/i.test(lower)) types.push("Villa");
  if (/\btownhouse\b/i.test(lower)) types.push("Townhouse");
  if (/\bpenthouse\b/i.test(lower)) types.push("Penthouse");
  if (/\bstudio\b/i.test(lower)) types.push("Studio");

  let bedrooms: number | null = null;
  const bedMatch = lower.match(/(\d)\s*(bed|br|bedroom)/i);
  if (bedMatch) bedrooms = parseInt(bedMatch[1]);
  if (/\bstudio\b/i.test(lower)) bedrooms = 0;

  let priceMax: number | null = null;
  const priceMatch = lower.match(/(\d[\d,.]*)\s*(m|million|k)/i);
  if (priceMatch) {
    let num = parseFloat(priceMatch[1].replace(/,/g, ""));
    if (/m|million/i.test(priceMatch[2])) num *= 1_000_000;
    else if (/k/i.test(priceMatch[2])) num *= 1_000;
    priceMax = num;
  }

  let intent = "general";
  if (/off[\s-]?plan|new launch|under construction/i.test(lower)) intent = "offplan";
  else if (/\brent\b|rental|lease/i.test(lower)) intent = "rent";
  else if (/\bbuy\b|purchase|sale|invest/i.test(lower)) intent = "buy";
  else if (/yield|roi|return|investment/i.test(lower)) intent = "investment";
  else if (/golden visa|visa/i.test(lower)) intent = "visa";
  else if (/price|cost|how much|affordable|cheap|expensive/i.test(lower)) intent = "pricing";
  else if (communities.length > 0 || types.length > 0) intent = "search";

  return { communities, types, bedrooms, priceMax, intent };
}

async function fetchRelevantData(terms: ReturnType<typeof extractSearchTerms>) {
  const { communities, types, bedrooms, priceMax, intent } = terms;
  let context = "";

  // Fetch relevant projects
  if (intent === "offplan" || intent === "search" || intent === "investment" || intent === "pricing" || intent === "visa") {
    const pFilter: Record<string, any> = { publishStatus: "Published" };
    if (communities.length > 0) pFilter.community = { $regex: communities.join("|"), $options: "i" };
    if (types.length > 0) pFilter.propertyType = { $regex: types.join("|"), $options: "i" };
    if (priceMax) pFilter.startingPrice = { $lte: priceMax };
    if (intent === "visa") pFilter.startingPrice = { $gte: 2_000_000 };

    const projects = await Project.find(pFilter)
      .select("name community developerName startingPrice completionDate propertyType bedrooms shortOverview paymentPlan")
      .sort({ startingPrice: 1 })
      .limit(8)
      .lean();

    if (projects.length > 0) {
      context += "\n\n--- OFF-PLAN PROJECTS IN OUR PORTFOLIO ---\n";
      for (const p of projects as any[]) {
        context += `• ${p.name} | ${p.community} | By ${p.developerName} | From AED ${(p.startingPrice || 0).toLocaleString()} | ${p.propertyType} | ${p.bedrooms || "Various"} | Handover: ${p.completionDate || "TBA"} | Payment: ${p.paymentPlan || "N/A"}\n`;
      }
    }
  }

  // Fetch relevant listings
  if (intent === "rent" || intent === "buy" || intent === "search" || intent === "pricing" || intent === "visa") {
    const lFilter: Record<string, any> = { publishStatus: "Published" };
    if (communities.length > 0) lFilter.community = { $regex: communities.join("|"), $options: "i" };
    if (types.length > 0) lFilter.propertyType = { $regex: types.join("|"), $options: "i" };
    if (intent === "rent") lFilter.listingType = "Rent";
    else if (intent === "buy" || intent === "visa") lFilter.listingType = "Sale";
    if (bedrooms !== null) lFilter.bedrooms = bedrooms;
    if (priceMax) lFilter.price = { $lte: priceMax };
    if (intent === "visa") lFilter.price = { $gte: 2_000_000 };

    const listings = await Listing.find(lFilter)
      .select("title community propertyType bedrooms bathrooms size sizeUnit price currency listingType")
      .sort({ price: 1 })
      .limit(8)
      .lean();

    if (listings.length > 0) {
      context += `\n\n--- ${intent === "rent" ? "RENTAL" : "SECONDARY"} LISTINGS ---\n`;
      for (const l of listings as any[]) {
        context += `• ${l.title} | ${l.community} | ${l.propertyType} | ${l.bedrooms || 0} bed / ${l.bathrooms || 0} bath | ${l.size || "?"} ${l.sizeUnit || "sqft"} | AED ${(l.price || 0).toLocaleString()} ${l.listingType === "Rent" ? "/year" : ""}\n`;
      }
    }
  }

  // For general/investment queries, add market stats
  if (intent === "general" || intent === "investment" || intent === "pricing") {
    const [projectCount, listingCount] = await Promise.all([
      Project.countDocuments({ publishStatus: "Published" }),
      Listing.countDocuments({ publishStatus: "Published" }),
    ]);
    context += `\n\n--- PORTFOLIO SUMMARY ---\nBinayah currently has ${projectCount} off-plan projects and ${listingCount} secondary market listings across Dubai.\n`;
  }

  return context;
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return new Response(JSON.stringify({ error: "AI not configured" }), { status: 500, headers: { "Content-Type": "application/json" } });

    // Get the latest user message
    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === "user");
    let dbContext = "";

    if (lastUserMsg) {
      try {
        await connectDB();
        const terms = extractSearchTerms(lastUserMsg.content);
        dbContext = await fetchRelevantData(terms);
      } catch (err) {
        console.error("DB context fetch failed:", err);
      }
    }

    const systemWithContext = SYSTEM_PROMPT + (dbContext
      ? `\n\nHere is relevant property data from Binayah's current portfolio to help answer this query:${dbContext}\n\nUse this data to give specific, helpful answers. Reference actual properties when relevant.`
      : "");

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: systemWithContext }, ...messages],
        stream: true,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "High demand. Try again." }), { status: 429, headers: { "Content-Type": "application/json" } });
      return new Response(JSON.stringify({ error: "AI error" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
    return new Response(response.body, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" } });
  } catch {
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}