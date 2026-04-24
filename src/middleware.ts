import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { type NextRequest, NextResponse } from "next/server";

const GEO_LOCALE_MAP: Record<string, string> = {
  CN: "zh", TW: "zh", HK: "zh",
  RU: "ru", BY: "ru", KZ: "ru", UA: "ru", KG: "ru", MD: "ru", TJ: "ru", UZ: "ru", AM: "ru", AZ: "ru",
  AE: "ar", SA: "ar", EG: "ar", QA: "ar", KW: "ar", BH: "ar", OM: "ar",
  JO: "ar", LB: "ar", IQ: "ar", SY: "ar", YE: "ar", LY: "ar", TN: "ar", DZ: "ar", MA: "ar",
};

const LOCALE_COOKIE = "BINAYAH_LOCALE";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const intlMiddleware = createMiddleware(routing);
const LOCALE_PREFIX_REGEX = /^\/(ru|zh|ar)(\/|$)/;

const isDev = process.env.NODE_ENV === "development";
const CSP = [
  "default-src 'self'",
  isDev ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'" : "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "media-src 'self' https:",
  "connect-src 'self' https://binayah-api.onrender.com https://api.openai.com https://binayah-news-scraper.onrender.com",
  "frame-src https://www.google.com https://maps.google.com",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(self), payment=()",
};

function applySecurityHeaders(response: NextResponse) {
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) response.headers.set(k, v);
  return response;
}

function setLocaleCookie(response: NextResponse, locale: string) {
  response.cookies.set(LOCALE_COOKIE, locale, {
    maxAge: COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
  });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.match(/\.(ico|png|jpg|svg|webp|woff2?)$/)
  ) {
    return NextResponse.next();
  }

  const prefixMatch = pathname.match(LOCALE_PREFIX_REGEX);
  if (prefixMatch) {
    const response = intlMiddleware(request);
    setLocaleCookie(response, prefixMatch[1]);
    response.headers.set("Content-Security-Policy", CSP);
    applySecurityHeaders(response);
    return response;
  }

  const savedLocale = request.cookies.get(LOCALE_COOKIE)?.value;

  if (savedLocale === "en") {
    const response = intlMiddleware(request);
    setLocaleCookie(response, "en");
    response.headers.set("Content-Security-Policy", CSP);
    applySecurityHeaders(response);
    return response;
  }

  if (savedLocale && savedLocale !== "en" && routing.locales.includes(savedLocale as (typeof routing.locales)[number])) {
    const url = request.nextUrl.clone();
    url.pathname = `/${savedLocale}${pathname === "/" ? "" : pathname}`;
    const response = NextResponse.redirect(url);
    response.headers.set("Content-Security-Policy", CSP);
    applySecurityHeaders(response);
    return response;
  }

  const country = request.headers.get("x-vercel-ip-country") ?? "";
  const geoLocale = GEO_LOCALE_MAP[country.toUpperCase()];

  if (geoLocale && geoLocale !== "en") {
    const url = request.nextUrl.clone();
    url.pathname = `/${geoLocale}${pathname === "/" ? "" : pathname}`;
    const response = NextResponse.redirect(url);
    setLocaleCookie(response, geoLocale);
    response.headers.set("Content-Security-Policy", CSP);
    applySecurityHeaders(response);
    return response;
  }

  const response = intlMiddleware(request);
  setLocaleCookie(response, "en");
  response.headers.set("Content-Security-Policy", CSP);
    applySecurityHeaders(response);
  return response;
}

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)" ],
};
