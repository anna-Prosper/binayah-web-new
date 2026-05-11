import { NextRequest, NextResponse } from "next/server";
import { serverApiUrl } from "@/lib/api";

export const runtime = "nodejs";

const EMPTY = {
  projects: [],
  listings: [],
  projectCount: 0,
  listingCount: 0,
  totalCount: 0,
  pageSize: 24,
  projectsPage: 1,
  listingsPage: 1,
  projectTotalPages: 1,
  listingTotalPages: 1,
};

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const query = url.searchParams.toString();
  const upstream = serverApiUrl(`/api/search${query ? `?${query}` : ""}`);

  if (upstream.startsWith("/")) {
    return NextResponse.json(
      { ...EMPTY, error: "API base URL is not configured" },
      { status: 200 }
    );
  }

  try {
    const res = await fetch(upstream, { next: { revalidate: 60 } });
    if (!res.ok) {
      return NextResponse.json(
        { ...EMPTY, error: `Upstream ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const pageSize = Number(data.pageSize) || EMPTY.pageSize;
    const projectCount = Number(data.projectCount ?? data.projects?.length ?? 0);
    const listingCount = Number(data.listingCount ?? data.listings?.length ?? 0);
    return NextResponse.json({
      projects: Array.isArray(data.projects) ? data.projects : [],
      listings: Array.isArray(data.listings) ? data.listings : [],
      projectCount,
      listingCount,
      totalCount: Number(data.totalCount ?? projectCount + listingCount),
      pageSize,
      projectsPage: Number(data.projectsPage) || 1,
      listingsPage: Number(data.listingsPage) || 1,
      projectTotalPages: Number(data.projectTotalPages) || Math.max(1, Math.ceil(projectCount / pageSize)),
      listingTotalPages: Number(data.listingTotalPages) || Math.max(1, Math.ceil(listingCount / pageSize)),
      facets: data.facets && typeof data.facets === "object" ? data.facets : {},
    });
  } catch (err) {
    console.error("[/api/search] proxy failed:", err);
    return NextResponse.json(
      { ...EMPTY, error: (err as Error).message },
      { status: 502 }
    );
  }
}
