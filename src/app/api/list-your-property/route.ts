import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const VALID_PROPERTY_TYPES = [
  "Apartment",
  "Villa",
  "Townhouse",
  "Penthouse",
  "Studio",
  "Duplex",
  "Office",
  "Retail",
  "Warehouse",
  "Plot",
  "Other",
];

const PHONE_RE = /^\+?[0-9 ()-]{7,20}$/;

function isFiniteNonNegative(v: unknown): boolean {
  if (v === null || v === undefined) return true; // optional fields
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 && n <= 1e12;
}

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = await clientPromise;
  const col = client.db("binayah_web_new_dev").collection("property_submissions");

  const submissions = await col
    .find(
      { userId: session.user.id },
      { projection: { propertyType: 1, community: 1, askingPrice: 1, status: 1, createdAt: 1 } }
    )
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray();

  return NextResponse.json({ submissions });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { propertyType, listingType, community, bedrooms, areaSqft, askingPrice, description, phone } = body;

  // Required field validation
  if (!propertyType || !listingType || !community || !phone) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Phone validation
  if (!PHONE_RE.test(String(phone))) {
    return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
  }

  // propertyType enum validation
  if (!VALID_PROPERTY_TYPES.includes(propertyType)) {
    return NextResponse.json({ error: "Invalid property type" }, { status: 400 });
  }

  // String length validation
  if (description && String(description).length > 2000) {
    return NextResponse.json({ error: "Description must be 2000 characters or fewer" }, { status: 400 });
  }
  if (String(community).length > 200) {
    return NextResponse.json({ error: "Community name too long" }, { status: 400 });
  }

  // Numeric field validation
  for (const [name, val] of [["bedrooms", bedrooms], ["areaSqft", areaSqft], ["askingPrice", askingPrice]] as [string, unknown][]) {
    if (val !== null && val !== undefined && val !== "") {
      if (!isFiniteNonNegative(val)) {
        return NextResponse.json({ error: `Invalid value for ${name}` }, { status: 400 });
      }
    }
  }

  const client = await clientPromise;
  const col = client.db("binayah_web_new_dev").collection("property_submissions");

  // Rate limit: max 5 submissions per hour per user
  const oneHourAgo = new Date(Date.now() - 3_600_000);
  const recentCount = await col.countDocuments({
    userId: session.user.id,
    createdAt: { $gt: oneHourAgo },
  });
  if (recentCount >= 5) {
    return NextResponse.json(
      { error: "Too many submissions, please try again later." },
      { status: 429 }
    );
  }

  const doc = {
    userId: session.user.id,
    userEmail: session.user.email,
    userName: session.user.name,
    propertyType,
    listingType,
    community,
    bedrooms: bedrooms !== null && bedrooms !== undefined && bedrooms !== "" ? Number(bedrooms) : null,
    areaSqft: areaSqft !== null && areaSqft !== undefined && areaSqft !== "" ? Number(areaSqft) : null,
    askingPrice: askingPrice !== null && askingPrice !== undefined && askingPrice !== "" ? Number(askingPrice) : null,
    description: description || null,
    phone,
    status: "under_review",
    createdAt: new Date(),
  };

  const result = await col.insertOne(doc);

  // Audit trail
  const eventsCol = client.db("binayah_web_new_dev").collection("submission_events");
  await eventsCol.insertOne({
    submissionId: result.insertedId,
    userId: session.user.id,
    userEmail: session.user.email,
    event: "created",
    at: new Date(),
  });

  // TODO: send email notification when SMTP_USER / SMTP_PASS are configured
  console.log("[list-your-property] New submission:", {
    userEmail: session.user.email,
    propertyType,
    listingType,
    community,
    phone,
  });

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { id?: string; action?: string; propertyType?: string; community?: string; askingPrice?: number | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { id, action } = body;
  if (!id || !action) return NextResponse.json({ error: "id and action required" }, { status: 400 });

  let objectId: ObjectId;
  try {
    objectId = new ObjectId(id);
  } catch {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const client = await clientPromise;
  const col = client.db("binayah_web_new_dev").collection("property_submissions");

  if (action === "cancel") {
    const result = await col.updateOne(
      { _id: objectId, userId: session.user.id, status: { $in: ["under_review", "new"] } },
      { $set: { status: "cancelled", cancelledAt: new Date() } }
    );
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Not found or already processed" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  }

  if (action === "edit") {
    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (body.propertyType && VALID_PROPERTY_TYPES.includes(body.propertyType)) {
      update.propertyType = body.propertyType;
    }
    if (body.community) {
      update.community = String(body.community).slice(0, 200);
    }
    if (body.askingPrice !== undefined) {
      update.askingPrice = body.askingPrice !== null && body.askingPrice !== 0 ? Number(body.askingPrice) : null;
    }
    const result = await col.updateOne(
      { _id: objectId, userId: session.user.id, status: { $in: ["under_review", "new"] } },
      { $set: update }
    );
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Not found or already processed" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
