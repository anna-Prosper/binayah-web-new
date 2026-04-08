import { NextRequest, NextResponse } from "next/server";

type ValuationEndpoint = "config" | "document" | "report" | "stream" | "unlock";

const endpointPattern = /\/(config|document|report|stream|unlock)$/;

export function resolveValuationUpstreamUrl(endpoint: ValuationEndpoint): string {
  const explicitBaseUrl = cleanText(
    process.env.VALUATION_API_BASE_URL ?? process.env.NEXT_PUBLIC_VALUATION_API_BASE_URL,
  );
  const fallbackUrl = cleanText(
    process.env.VALUATION_API_URL ?? process.env.NEXT_PUBLIC_VALUATION_API_URL,
  );
  const candidate = explicitBaseUrl || fallbackUrl;

  if (!candidate) {
    return "";
  }

  let url: URL;

  try {
    url = new URL(candidate);
  } catch {
    return "";
  }

  const currentPath = normalizePathname(url.pathname);

  if (explicitBaseUrl) {
    url.pathname = joinPath(currentPath, endpoint);
    return url.toString();
  }

  if (currentPath.endsWith("/api/valuation")) {
    url.pathname = joinPath(currentPath, endpoint);
    return url.toString();
  }

  if (endpointPattern.test(currentPath)) {
    url.pathname = currentPath.replace(endpointPattern, `/${endpoint}`);
    return url.toString();
  }

  url.pathname = joinPath(currentPath, `api/valuation/${endpoint}`);
  return url.toString();
}

export async function proxyValuationJson(
  request: NextRequest,
  endpoint: Exclude<ValuationEndpoint, "stream">,
) {
  return proxyValuationRequest(request, endpoint, "json");
}

export async function proxyValuationStream(request: NextRequest) {
  return proxyValuationRequest(request, "stream", "stream");
}

async function proxyValuationRequest(
  request: NextRequest,
  endpoint: ValuationEndpoint,
  responseMode: "json" | "stream",
) {
  const upstreamUrl = resolveValuationUpstreamUrl(endpoint);

  if (!upstreamUrl) {
    console.error(
      `[valuation-api] Missing upstream URL for "${endpoint}". Set VALUATION_API_BASE_URL or NEXT_PUBLIC_VALUATION_API_BASE_URL in the deployment environment.`,
    );
    return NextResponse.json(
      {
        error:
          "Valuation API not configured. Set VALUATION_API_BASE_URL in the deployment environment and redeploy.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const requestHeaders = new Headers();
  const requestContentType = request.headers.get("content-type");

  if (requestContentType) {
    requestHeaders.set("Content-Type", requestContentType);
  }

  requestHeaders.set(
    "Accept",
    responseMode === "stream"
      ? "application/x-ndjson, application/json"
      : "application/json",
  );

  const method = request.method.toUpperCase();
  const body =
    method === "GET" || method === "HEAD" ? undefined : await request.text();

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      method,
      headers: requestHeaders,
      body,
      signal: request.signal,
      cache: "no-store",
    });

    if (responseMode === "stream") {
      return new Response(upstreamResponse.body, {
        status: upstreamResponse.status,
        headers: {
          "Content-Type":
            upstreamResponse.headers.get("content-type") ||
            "application/x-ndjson; charset=utf-8",
          "Cache-Control": "no-store",
        },
      });
    }

    const responseText = await upstreamResponse.text();

    return new Response(responseText || "{}", {
      status: upstreamResponse.status,
      headers: {
        "Content-Type":
          upstreamResponse.headers.get("content-type") || "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(`[valuation-api] Failed to reach upstream for "${endpoint}"`, {
      upstreamUrl,
      error,
    });
    return NextResponse.json(
      {
        error:
          "Could not reach the valuation service. Check VALUATION_API_BASE_URL and the upstream server availability.",
      },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}

function joinPath(basePath: string, suffix: string) {
  const normalizedBase = normalizePathname(basePath);
  const normalizedSuffix = cleanText(suffix).replace(/^\/+/, "");

  if (!normalizedSuffix) {
    return normalizedBase || "/";
  }

  if (!normalizedBase || normalizedBase === "/") {
    return `/${normalizedSuffix}`;
  }

  return `${normalizedBase}/${normalizedSuffix}`.replace(/\/{2,}/g, "/");
}

function normalizePathname(value: string) {
  const normalized = cleanText(value);

  if (!normalized || normalized === "/") {
    return "";
  }

  return normalized.replace(/\/+$/, "");
}

function cleanText(value: string | undefined | null) {
  return String(value ?? "").trim();
}
