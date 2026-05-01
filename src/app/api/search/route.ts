import { NextRequest, NextResponse } from "next/server";
import { serverApiUrl } from "@/lib/api";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const query = url.searchParams.toString();
  const upstream = serverApiUrl(`/api/search${query ? `?${query}` : ""}`);

  if (upstream.startsWith("/")) {
    return NextResponse.json(
      { projects: [], listings: [], projectCount: 0, listingCount: 0, error: "API base URL is not configured" },
      { status: 200 }
    );
  }

  try {
    const res = await fetch(upstream, { next: { revalidate: 60 } });
    if (!res.ok) {
      return NextResponse.json(
        { projects: [], listings: [], projectCount: 0, listingCount: 0, error: `Upstream ${res.status}` },
        { status: 200 }
      );
    }

    const data = await res.json();
    return NextResponse.json({
      projects: Array.isArray(data.projects) ? data.projects : [],
      listings: Array.isArray(data.listings) ? data.listings : [],
      projectCount: Number(data.projectCount ?? data.projects?.length ?? 0),
      listingCount: Number(data.listingCount ?? data.listings?.length ?? 0),
    });
  } catch (err) {
    console.error("[/api/search] proxy failed:", err);
    return NextResponse.json(
      { projects: [], listings: [], projectCount: 0, listingCount: 0, error: (err as Error).message },
      { status: 200 }
    );
  }
}
