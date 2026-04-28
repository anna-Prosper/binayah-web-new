import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { serverApiUrl } from "@/lib/api";

/**
 * Session-gated proxy to GET /api/market-report/by-email on Fastify.
 * Keeps x-admin-secret server-side and never exposes it to the client.
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret) {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  try {
    const res = await fetch(
      serverApiUrl(`/api/market-report/by-email?email=${encodeURIComponent(session.user.email)}`),
      {
        headers: { "x-admin-secret": adminSecret },
        signal: AbortSignal.timeout(8000),
      }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Failed to reach API" }, { status: 502 });
  }
}
