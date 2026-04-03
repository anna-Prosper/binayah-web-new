export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";

const SYSTEM_PROMPT = `You are Binayah Properties' elite AI property advisor for Dubai. You will receive a buyer profile AND available properties from our database. Prioritize our listings when they match. For database matches include: [VIEW_PROPERTY:slug-here]. Recommend 3 properties with details, then add a Pro Tip and contact info: +971 54 998 8811`;

export async function POST(req: NextRequest) {
  try {
    const { profile } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return new Response(JSON.stringify({ error: "AI not configured" }), { status: 500, headers: { "Content-Type": "application/json" } });

    await connectDB();
    const projects = await Project.find({ publishStatus: "Published" }).select("name slug status propertyType developerName community startingPrice priceRange unitTypes shortOverview").limit(50).lean();

    const listingsContext = projects.length ? "\n\nAVAILABLE LISTINGS:\n" + projects.map((p) => `- ${p.name} (slug: ${p.slug}) | ${p.developerName} | ${p.community} | ${p.propertyType} | ${p.priceRange || `From AED ${p.startingPrice}`} | ${p.status}`).join("\n") : "";

    const userPrompt = `Profile:\n- Purpose: ${profile.purpose}\n- Areas: ${profile.areas?.join(", ")}\n- Budget: ${profile.budget}\n- Bedrooms: ${profile.bedrooms}\n- Type: ${profile.propertyType}\n- Lifestyle: ${profile.lifestyle?.join(", ")}\n- Timeline: ${profile.timeline}${listingsContext}\n\nRecommend 3 best matches.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: userPrompt }], stream: true }),
    });

    if (!response.ok) return new Response(JSON.stringify({ error: "AI error" }), { status: response.status, headers: { "Content-Type": "application/json" } });
    return new Response(response.body, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } });
  } catch {
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
