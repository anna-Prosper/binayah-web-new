import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { type NextRequest, NextResponse } from "next/server";

// Maps Vercel's 2-letter country code -> our locale
const GEO_LOCALE_MAP: Record<string, string> = {
  // Chinese
  CN: "zh",
  TW: "zh",
  HK: "zh",
  // Russian-speaking countries
  RU: "ru",
  BY: "ru",
  KZ: "ru",
  UA: "ru",
  KG: "ru",
  MD: "ru",
  TJ: "ru",
  UZ: "ru",
  AM: "ru",
  AZ: "ru",
  // MENA / Gulf -> Arabic
  AE: "ar",
  SA: "ar",
  EG: "ar",
  QA: "ar",
  KW: "ar",
  BH: "ar",
  OM: "ar",
  JO: "ar",
  LB: "ar",
  IQ: "ar",
  SY: "ar",
  YE: "ar",
  LY: "ar",
  TN: "ar",
  DZ: "ar",
  MA: "ar",
};

const LOCALE_COOKIE = "BINAYAH_LOCALE";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year
const intlMiddleware = createMiddleware(routing);

// Only non-default locales appear as URL prefixes (localePrefix: 'as-needed')
const LOCALE_PREFIX_REGEX = /^\/(ru|zh|ar)(\/|$)/;

function setLocaleCookie(response: NextResponse, locale: string) {
  response.cookies.set(LOCALE_COOKIE, locale, {
    maxAge: COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
  });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.match(/\.(ico|png|jpg|svg|webp|woff2?)$/)
  ) {
    return NextResponse.next();
  }

  // 1) URL already carries an explicit non-default locale prefix.
  //    Honor it, save the cookie, and LET next-intl handle it.
  //    This MUST run before the saved-locale redirect so that visiting
  //    /ru/foo while cookie=en does not ping-pong, and so that shared
  //    URLs like /zh/projects/sensia never get double-prefixed.
  const prefixMatch = pathname.match(LOCALE_PREFIX_REGEX);
  if (prefixMatch) {
    const matchedLocale = prefixMatch[1];
    const response = intlMiddleware(request);
    setLocaleCookie(response, matchedLocale);
    return response;
  }

  // 2) No URL prefix -> English is the intended locale for this path.
  //    If user has a saved non-English preference, redirect them to /<locale><path>.
  //    If saved preference is 'en' (explicit choice), honor it and DO NOT geo-redirect.
  const savedLocale = request.cookies.get(LOCALE_COOKIE)?.value;

  if (savedLocale === "en") {
    // User explicitly chose English — fall through to intlMiddleware, refresh cookie.
    const response = intlMiddleware(request);
    setLocaleCookie(response, "en");
    return response;
  }

  if (savedLocale && savedLocale !== "en" && routing.locales.includes(savedLocale as (typeof routing.locales)[number])) {
    const url = request.nextUrl.clone();
    url.pathname = `/${savedLocale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  // 3) First visit, no cookie -> geo-detect.
  const country = request.headers.get("x-vercel-ip-country") ?? "";
  const geoLocale = GEO_LOCALE_MAP[country.toUpperCase()];

  if (geoLocale && geoLocale !== "en") {
    const url = request.nextUrl.clone();
    url.pathname = `/${geoLocale}${pathname === "/" ? "" : pathname}`;
    const response = NextResponse.redirect(url);
    setLocaleCookie(response, geoLocale);
    return response;
  }

  // 4) Default: English. Write cookie so we do not geo-detect again next request.
  const response = intlMiddleware(request);
  setLocaleCookie(response, "en");
  return response;
}

export const config = {
  matcher: [
    "/((?!_next|_vercel|.*\\..*).*)",
  ],
};
