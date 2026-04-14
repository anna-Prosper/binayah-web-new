import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { type NextRequest, NextResponse } from "next/server";

// Maps Vercel's 2-letter country code → our locale
const GEO_LOCALE_MAP: Record<string, string> = {
  IN: "in", // India
  RU: "ru", // Russia
  KZ: "kz", // Kazakhstan
  BY: "ru", // Belarus → Russian
  UA: "ru", // Ukraine → Russian (cyrillic speakers)
};

const LOCALE_COOKIE = "BINAYAH_LOCALE";
const intlMiddleware = createMiddleware(routing);

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

  // If the user already has an explicit locale in the URL path,
  // save it as their preference cookie and let next-intl handle it normally.
  const hasLocalePrefix = /^\/(ru|kz|in)(\/|$)/.test(pathname);
  if (hasLocalePrefix) {
    const matchedLocale = pathname.match(/^\/(ru|kz|in)/)?.[1];
    const response = intlMiddleware(request);
    if (matchedLocale) {
      response.cookies.set(LOCALE_COOKIE, matchedLocale, {
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: "/",
        sameSite: "lax",
      });
    }
    return response;
  }

  // If user has a saved preference, honour it via next-intl cookie mechanism
  const savedLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (savedLocale && savedLocale !== "en" && routing.locales.includes(savedLocale as any)) {
    // Redirect to their preferred locale path
    const url = request.nextUrl.clone();
    url.pathname = `/${savedLocale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  // First visit — detect from Vercel's geo header (free, no API needed)
  const country = request.headers.get("x-vercel-ip-country") ?? "";
  const geoLocale = GEO_LOCALE_MAP[country.toUpperCase()];

  if (geoLocale && geoLocale !== "en") {
    const url = request.nextUrl.clone();
    url.pathname = `/${geoLocale}${pathname === "/" ? "" : pathname}`;
    const response = NextResponse.redirect(url);
    // Save geo choice as cookie so we don't redirect on every request
    response.cookies.set(LOCALE_COOKIE, geoLocale, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
      sameSite: "lax",
    });
    return response;
  }

  // Default: English — fall through to next-intl
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!_next|_vercel|.*\\..*).*)",
  ],
};
