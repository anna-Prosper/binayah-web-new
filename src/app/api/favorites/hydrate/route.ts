import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { serverApiUrl, serverFetch } from "@/lib/api";

interface FavProperty {
  _id: string;
  title?: string;
  name?: string;
  slug: string;
  featuredImage?: string;
  imageGallery?: string[];
  price?: number;
  startingPrice?: number;
  currency?: string;
  community?: string;
  bedrooms?: number;
  listingType?: string;
}

async function getUserFavoriteIds(userId: string): Promise<string[]> {
  const client = await clientPromise;
  const col = client.db("binayah_web_new_dev").collection("favorites");
  const doc = await col.findOne({ userId });
  return (doc?.propertyIds ?? []) as string[];
}

async function fetchOneProperty(
  id: string
): Promise<{ id: string; data: FavProperty | null; notFound: boolean }> {
  const [listingRes, projectRes] = await Promise.allSettled([
    serverFetch(serverApiUrl(`/api/listings/${id}`)),
    serverFetch(serverApiUrl(`/api/projects/${id}`)),
  ]);

  if (listingRes.status === "fulfilled" && listingRes.value.ok) {
    const data = (await listingRes.value.json()) as FavProperty;
    return { id, data, notFound: false };
  }
  if (projectRes.status === "fulfilled" && projectRes.value.ok) {
    const data = (await projectRes.value.json()) as FavProperty;
    return { id, data, notFound: false };
  }

  // Only mark as gone when both endpoints explicitly returned 404.
  // Network errors, 5xx, or cold-start timeouts must NOT remove saved items.
  const listing404 =
    listingRes.status === "fulfilled" && listingRes.value.status === 404;
  const project404 =
    projectRes.status === "fulfilled" && projectRes.value.status === 404;

  return { id, data: null, notFound: listing404 && project404 };
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let ids: unknown;
  try {
    const body = await req.json();
    ids = body.ids;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ properties: [], stale: [] });
  }

  if (ids.length > 50) {
    return NextResponse.json({ error: "Too many ids" }, { status: 400 });
  }

  // Security: verify every requested id is in the user's own favorites list
  const userFavIds = await getUserFavoriteIds(session.user.id);
  const userFavSet = new Set(userFavIds);
  const hasUnauthorized = (ids as string[]).some((id) => !userFavSet.has(id));
  if (hasUnauthorized) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Fan out to Fastify — listing first, then project fallback
  const results = await Promise.allSettled(
    (ids as string[]).map((id) => fetchOneProperty(id))
  );

  const properties: FavProperty[] = [];
  const stale: string[] = [];

  for (const result of results) {
    if (result.status === "fulfilled") {
      if (result.value.data !== null) {
        properties.push(result.value.data);
      } else if (result.value.notFound) {
        stale.push(result.value.id);
      }
      // if notFound===false and data===null: network error — silently drop for now
    }
  }

  return NextResponse.json(
    { properties, stale },
    {
      headers: {
        "Cache-Control": "private, no-store",
      },
    }
  );
}
