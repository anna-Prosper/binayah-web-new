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
// Separate cookie for binayah.ru so .ae locale preference doesn't bleed over
const RU_LOCALE_COOKIE = "BINAYAH_LOCALE_RU";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const intlMiddleware = createMiddleware(routing);
const LOCALE_PREFIX_REGEX = /^\/(ru|zh|ar)(\/|$)/;

const isDev = process.env.NODE_ENV === "development";
// Vercel Live ships the preview-feedback widget from vercel.live (loaded on
// preview deployments only). It opens a websocket back to vercel.live and
// embeds an iframe. Whitelist all three or the widget breaks with a CSP error.
const VERCEL_LIVE = "https://vercel.live";
const VERCEL_LIVE_WSS = "wss://*.pusher.com";
const GTAG = "https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com";
const CLARITY = "https://www.clarity.ms https://*.clarity.ms";
const LIVECHAT = "https://cdn.livechatinc.com https://*.livechatinc.com";
const LIVECHAT_WSS = "wss://*.livechatinc.com";
const CSP = [
  "default-src 'self'",
  isDev
    ? `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${VERCEL_LIVE} ${GTAG} ${CLARITY} ${LIVECHAT}`
    : `script-src 'self' 'unsafe-inline' ${VERCEL_LIVE} ${GTAG} ${CLARITY} ${LIVECHAT}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "media-src 'self' https:",
  `connect-src 'self' https://binayah-api.onrender.com https://api.openai.com https://binayah-news-scraper.onrender.com ${VERCEL_LIVE} ${VERCEL_LIVE_WSS} ${GTAG} ${CLARITY} ${LIVECHAT} ${LIVECHAT_WSS}`,
  `frame-src https://www.google.com https://maps.google.com ${VERCEL_LIVE} ${LIVECHAT}`,
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

function isStagingHost(host: string | null): boolean {
  if (!host) return false;
  return host === "staging.binayahhub.com" || host.endsWith(".vercel.app");
}

const DOMAIN_LOCALE_MAP: Record<string, string> = {
  "binayah.ru": "ru",
  "www.binayah.ru": "ru",
  "binayah.cn": "zh",
  "www.binayah.cn": "zh",
};

function getDomainLocale(host: string | null): string | null {
  if (!host) return null;
  return DOMAIN_LOCALE_MAP[host.toLowerCase()] ?? null;
}

// Pick the highest-q-weighted supported locale from Accept-Language.
// "en" is the implicit default — returned as-is so caller can short-circuit
// without an unnecessary redirect.
const SUPPORTED_LOCALES = new Set<string>(routing.locales);
function pickAcceptLanguage(header: string | null): string | null {
  if (!header) return null;
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, qPart] = part.trim().split(";");
      const q = qPart?.startsWith("q=") ? parseFloat(qPart.slice(2)) : 1;
      return { lang: tag.toLowerCase().slice(0, 2), q: Number.isFinite(q) ? q : 0 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { lang } of ranked) {
    if (SUPPORTED_LOCALES.has(lang)) return lang;
  }
  return null;
}

function applySecurityHeaders(response: NextResponse, request: NextRequest) {
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) response.headers.set(k, v);
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (isStagingHost(host)) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}

function setLocaleCookie(response: NextResponse, locale: string) {
  response.cookies.set(LOCALE_COOKIE, locale, {
    maxAge: COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
  });
}

function setGeoCookie(response: NextResponse, request: NextRequest) {
  const country = request.headers.get("x-vercel-ip-country");
  if (country && /^[A-Z]{2}$/.test(country)) {
    response.cookies.set("BINAYAH_GEO", country, {
      maxAge: COOKIE_MAX_AGE,
      path: "/",
      sameSite: "lax",
    });
  }
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
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const domainLocale = getDomainLocale(host);

  // --- binayah.ru (and other domain-mapped hosts) ---
  // When NEXT_DEFAULT_LOCALE=ru, next-intl serves Russian at / with no prefix —
  // no manual redirect needed. Just pass through to intlMiddleware.
  if (domainLocale) {
    const response = intlMiddleware(request);
    if (prefixMatch) {
      response.cookies.set(RU_LOCALE_COOKIE, prefixMatch[1], { maxAge: COOKIE_MAX_AGE, path: "/", sameSite: "lax" });
    }
    response.headers.set("Content-Security-Policy", CSP);
    applySecurityHeaders(response, request);
    return response;
  }

  // --- binayah.ae / Vercel ---
  if (prefixMatch) {
    const response = intlMiddleware(request);
    setLocaleCookie(response, prefixMatch[1]);
    response.headers.set("Content-Security-Policy", CSP);
    applySecurityHeaders(response, request);
    setGeoCookie(response, request);
    return response;
  }

  const savedLocale = request.cookies.get(LOCALE_COOKIE)?.value;

  if (savedLocale === "en") {
    const response = intlMiddleware(request);
    setLocaleCookie(response, "en");
    response.headers.set("Content-Security-Policy", CSP);
    applySecurityHeaders(response, request);
    setGeoCookie(response, request);
    return response;
  }

  if (savedLocale && savedLocale !== "en" && routing.locales.includes(savedLocale as (typeof routing.locales)[number])) {
    const url = request.nextUrl.clone();
    url.pathname = `/${savedLocale}${pathname === "/" ? "" : pathname}`;
    const response = NextResponse.redirect(url);
    response.headers.set("Content-Security-Policy", CSP);
    applySecurityHeaders(response, request);
    setGeoCookie(response, request);
    return response;
  }

  // Browser preference (Accept-Language) takes priority over IP geo:
  // a Russian traveler in Dubai with a Russian browser should see Russian,
  // not Arabic. en short-circuits to the default branch (no redirect).
  const acceptLang = pickAcceptLanguage(request.headers.get("accept-language"));
  if (acceptLang && acceptLang !== "en") {
    const url = request.nextUrl.clone();
    url.pathname = `/${acceptLang}${pathname === "/" ? "" : pathname}`;
    const response = NextResponse.redirect(url);
    setLocaleCookie(response, acceptLang);
    response.headers.set("Content-Security-Policy", CSP);
    applySecurityHeaders(response, request);
    setGeoCookie(response, request);
    return response;
  }

  // Skip geo lookup if Accept-Language explicitly asked for English —
  // honor the user's stated preference over country guess.
  const country = acceptLang === "en" ? "" : (request.headers.get("x-vercel-ip-country") ?? "");
  const geoLocale = GEO_LOCALE_MAP[country.toUpperCase()];

  if (geoLocale && geoLocale !== "en") {
    const url = request.nextUrl.clone();
    url.pathname = `/${geoLocale}${pathname === "/" ? "" : pathname}`;
    const response = NextResponse.redirect(url);
    setLocaleCookie(response, geoLocale);
    response.headers.set("Content-Security-Policy", CSP);
    applySecurityHeaders(response, request);
    setGeoCookie(response, request);
    return response;
  }

  const response = intlMiddleware(request);
  setLocaleCookie(response, "en");
  response.headers.set("Content-Security-Policy", CSP);
  applySecurityHeaders(response, request);
  setGeoCookie(response, request);
  return response;
}

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)" ],
};
