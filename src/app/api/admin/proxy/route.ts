import { NextRequest, NextResponse } from "next/server";
import { serverApiUrl } from "@/lib/api";
import { cookies } from "next/headers";
import { isAdminSession } from "@/lib/admin-auth";

// BFF proxy for the admin panel → forwards to the Render API with the admin
// secret (which never touches browser JS).
//
// Auth: accept EITHER the NextAuth admin session (same gate that lets the admin
// load the page) OR the legacy admin_secret cookie. Previously this required
// the cookie only, so a Google-authenticated admin whose 8h secret cookie had
// expired got silent 401s (e.g. Chat Transcripts showing "- sessions").
async function proxyAdmin(req: NextRequest, method: string) {
  const cookieStore = await cookies();
  const cookieSecret = cookieStore.get("admin_secret")?.value;

  const authorized = !!cookieSecret || (await isAdminSession());
  if (!authorized) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const secret = cookieSecret || process.env.ADMIN_SECRET || "";
  if (!secret) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const { searchParams } = req.nextUrl;
  const path = searchParams.get("path") || "";
  if (!path || !path.startsWith("/api/admin/")) {
    return NextResponse.json({ error: "invalid path" }, { status: 400 });
  }

  // Forward every query param except our own `path` (page, limit, filters…).
  const forwarded = new URLSearchParams(searchParams);
  forwarded.delete("path");
  const qs = forwarded.toString();
  const upstream = serverApiUrl(path) + (qs ? `?${qs}` : "");

  const headers: Record<string, string> = {
    "x-admin-secret": secret,
    "Content-Type": "application/json",
  };

  let body: string | undefined;
  if (method !== "GET") {
    try { body = await req.text(); } catch { /* no body */ }
  }

  const res = await fetch(upstream, { method, headers, body });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function GET(req: NextRequest) { return proxyAdmin(req, "GET"); }
export async function POST(req: NextRequest) { return proxyAdmin(req, "POST"); }
export async function PATCH(req: NextRequest) { return proxyAdmin(req, "PATCH"); }
export async function DELETE(req: NextRequest) { return proxyAdmin(req, "DELETE"); }
