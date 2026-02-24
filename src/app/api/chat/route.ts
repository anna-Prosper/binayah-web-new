export const dynamic = "force-dynamic";
import { NextRequest } from "next/server";

const SYSTEM_PROMPT = `You are Binayah Properties' AI assistant — a knowledgeable, friendly real estate advisor for the Dubai property market.
Your expertise: Properties for sale/rent across Dubai, off-plan, investment advice, mortgage guidance, property management.
Guidelines: Be warm & professional, use AED for pricing, keep responses under 150 words, invite them to contact +971 54 998 8811 for specifics.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return new Response(JSON.stringify({ error: "AI not configured" }), { status: 500, headers: { "Content-Type": "application/json" } });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages], stream: true }),
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
