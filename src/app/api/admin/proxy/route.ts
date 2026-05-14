import { NextRequest, NextResponse } from "next/server";
import { serverApiUrl } from "@/lib/api";
import { cookies } from "next/headers";

// BFF proxy for admin panel — reads the httpOnly admin_secret cookie and
// forwards requests to the Render API. The secret never touches browser JS.
async function proxyAdmin(req: NextRequest, method: string) {
  const cookieStore = await cookies();
  const secret = cookieStore.get("admin_secret")?.value;
  if (!secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const path = searchParams.get("path") || "";
  if (!path || !path.startsWith("/api/admin/")) {
    return NextResponse.json({ error: "invalid path" }, { status: 400 });
  }

  const upstream = serverApiUrl(path);
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
