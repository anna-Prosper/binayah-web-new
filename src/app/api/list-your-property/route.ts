import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { propertyType, listingType, community, bedrooms, areaSqft, askingPrice, description, phone } = body;

  if (!propertyType || !listingType || !community || !phone) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const client = await clientPromise;
  const col = client.db("binayah_web_new_dev").collection("property_submissions");

  const doc = {
    userId: session.user.id,
    userEmail: session.user.email,
    userName: session.user.name,
    propertyType,
    listingType,
    community,
    bedrooms: bedrooms ? Number(bedrooms) : null,
    areaSqft: areaSqft ? Number(areaSqft) : null,
    askingPrice: askingPrice ? Number(askingPrice) : null,
    description,
    phone,
    status: "new",
    createdAt: new Date(),
  };

  await col.insertOne(doc);

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
