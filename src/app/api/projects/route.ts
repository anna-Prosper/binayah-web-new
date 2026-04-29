import { NextRequest, NextResponse } from "next/server";
import { serverApiUrl } from "@/lib/api";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const upstream = `${serverApiUrl("/api/projects")}?${url.searchParams.toString()}`;
  try {
    const res = await fetch(upstream, { next: { revalidate: 600 } });
    if (!res.ok) {
      return NextResponse.json(
        { results: [], error: `Upstream ${res.status}` },
        { status: 200 }
      );
    }
    const data = await res.json();
    // binayah-api returns either { results: [...] } or [...] depending on endpoint shape — normalize
    const results = Array.isArray(data) ? data : (data.results ?? []);
    return NextResponse.json({ results }, { status: 200 });
  } catch (err) {
    console.error("[/api/projects] proxy failed:", err);
    return NextResponse.json(
      { results: [], error: (err as Error).message },
      { status: 200 }
    );
  }
}
