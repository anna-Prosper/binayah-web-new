import { NextRequest, NextResponse } from "next/server";
import { serverApiUrl } from "@/lib/api";
import { isAdminSession } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const days = req.nextUrl.searchParams.get("days") || "30";
  const upstream = serverApiUrl(`/api/track/stats?days=${days}`);
  try {
    const res = await fetch(upstream, { next: { revalidate: 300 } });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 502 });
  }
}
