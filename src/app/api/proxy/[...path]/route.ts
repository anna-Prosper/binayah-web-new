/**
 * Catch-all proxy for protected Render API endpoints.
 * Browser calls /api/proxy/dld/areas → this route → Render with x-api-key.
 * The API key never leaves the server.
 *
 * Proxied paths: dld/*, chat, property-matcher
 */
import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "";
const API_KEY = process.env.API_KEY || "";

async function proxy(req: NextRequest, pathParts: string[], method: string): Promise<NextResponse> {
  const path = pathParts.join("/");
  const search = req.nextUrl.search;
  const upstream = `${API_BASE}/api/${path}${search}`;

  const headers: Record<string, string> = {
    "x-api-key": API_KEY,
  };

  // Forward Content-Type for POST requests
  const ct = req.headers.get("content-type");
  if (ct) headers["content-type"] = ct;

  const body = method === "POST" || method === "PUT" ? await req.arrayBuffer() : undefined;

  let res: Response;
  try {
    res = await fetch(upstream, {
      method,
      headers,
      body: body ? Buffer.from(body) : undefined,
      signal: AbortSignal.timeout(30_000),
      // @ts-expect-error – Next.js fetch needs duplex for streaming POST
      duplex: body ? "half" : undefined,
    });
  } catch {
    return NextResponse.json({ error: "Upstream request failed" }, { status: 502 });
  }

  // Pipe the response body directly — handles both JSON and SSE streaming
  const responseHeaders = new Headers();
  const contentType = res.headers.get("content-type");
  if (contentType) responseHeaders.set("content-type", contentType);
  const cacheControl = res.headers.get("cache-control");
  if (cacheControl) responseHeaders.set("cache-control", cacheControl);

  return new NextResponse(res.body, {
    status: res.status,
    headers: responseHeaders,
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxy(req, path, "GET");
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxy(req, path, "POST");
}
