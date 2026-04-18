import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";

async function getFavoritesCollection() {
  const client = await clientPromise;
  return client.db("binayah_web_new_dev").collection("favorites");
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ ids: [] }, { status: 401 });

  const col = await getFavoritesCollection();
  const doc = await col.findOne({ userId: session.user.id });
  return NextResponse.json({ ids: doc?.propertyIds ?? [] });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const col = await getFavoritesCollection();
  await col.updateOne(
    { userId: session.user.id },
    { $addToSet: { propertyIds: id }, $set: { updatedAt: new Date() } },
    { upsert: true }
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const col = await getFavoritesCollection();
  await col.updateOne(
    { userId: session.user.id },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { $pull: { propertyIds: id } as any, $set: { updatedAt: new Date() } }
  );
  return NextResponse.json({ ok: true });
}
