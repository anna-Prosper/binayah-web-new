import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Playfair_Display, Noto_Sans_Arabic } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { canonical as makeCanonical, altLangs } from "@/lib/site";
import { CSP_NONCE } from "@/lib/csp";
import ProdAnalytics from "@/components/ProdAnalytics";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/JsonLd";
import FavoritesDrawer from "@/components/FavoritesDrawer";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { CompareProvider } from "@/context/CompareContext";
import { SubscriptionsProvider } from "@/context/SubscriptionsContext";
import "../globals.css";
import Providers from "../providers";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import LiveChatBanner from "@/components/LiveChatBanner";
import GuideDownloadPopup from "@/components/GuideDownloadPopup";
import GlobalImageFallback from "@/components/GlobalImageFallback";
import ChunkReloadGuard from "@/components/ChunkReloadGuard";
import WhatsAppButton from "@/components/WhatsAppButton";
import AIChatWidget from "@/components/AIChatWidget";
import ScrollToTop from "@/components/ScrollToTop";

// GTM container id — only used for the no-JS <noscript> fallback iframe below.
// The JS-driven analytics (GTM/GA/Clarity/LiveChat) live in <ProdAnalytics>,
// which host-gates them on the client so this layout stays statically cacheable.
const GTM_ID = "GTM-PG6Z43HD";

// Prebuild all locales so next-intl static rendering can kick in (paired with
// setRequestLocale in the layout + pages). Required for the ISR/edge cache.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "cyrillic-ext"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-arabic",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.binayah.ae";

const OG_LOCALE: Record<string, string> = {
  en: "en_AE",
  ar: "ar_AE",
  ru: "ru_RU",
  zh: "zh_CN",
  vi: "vi_VN",
  he: "he_IL",
  fr: "fr_FR",
};

// Tells every browser the site is designed for light only — stops mobile
// browsers (Samsung Internet, Android Chrome with system dark mode, etc.)
// from forcibly inverting colors via their "force dark mode" feature.
export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#0B3D2E",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const verificationOther: Record<string, string> = {};
  if (process.env.BING_VERIFICATION_CODE) verificationOther["msvalidate.01"] = process.env.BING_VERIFICATION_CODE;
  if (process.env.YANDEX_VERIFICATION_CODE) verificationOther["yandex-verification"] = process.env.YANDEX_VERIFICATION_CODE;
  const verificationGoogle = process.env.GOOGLE_VERIFICATION_CODE;
  const hasVerification = !!verificationGoogle || Object.keys(verificationOther).length > 0;

  const titles: Record<string, string> = {
    en: "Binayah Properties, Dubai Real Estate & Investments",
    ru: "Binayah Properties, Недвижимость в Дубае",
    ar: "بناية للعقارات, العقارات في دبي والاستثمار",
    zh: "Binayah Properties, 迪拜房地产与投资",
    vi: "Binayah Properties, Bất động sản & Đầu tư tại Dubai",
    he: "Binayah Properties, נדל\"ן והשקעות בדובאי",
    fr: "Binayah Properties, Immobilier à Dubaï & Investissement",
  };
  const descriptions: Record<string, string> = {
    en: "Binayah Properties, Dubai's trusted real estate partner. Buy, rent or invest in luxury homes, off-plan projects & enjoy full property management.",
    ru: "Binayah Properties, ваш надёжный партнёр по недвижимости в Дубае с 2007 года. Купить, снять или инвестировать в жильё, новостройки и управление недвижимостью.",
    ar: "بناية للعقارات, شريكك الموثوق في عقارات دبي. شراء أو إيجار أو استثمار في المنازل الفاخرة والمشاريع على الخارطة.",
    zh: "Binayah Properties, 迪拜值得信赖的房产合作伙伴。购买、租赁或投资豪华住宅、期房项目，享受全面的物业管理服务。",
    vi: "Binayah Properties, đối tác bất động sản đáng tin cậy tại Dubai. Mua, thuê hoặc đầu tư vào nhà sang trọng, dự án off-plan và quản lý bất động sản toàn diện.",
    he: "Binayah Properties, שותף הנדל\"ן המהימן בדובאי. קנו, השכירו או השקיעו בבתי יוקרה, בפרויקטים על הנייר, ותיהנו מניהול נכסים מלא.",
    fr: "Binayah Properties, votre partenaire immobilier de confiance à Dubaï. Achetez, louez ou investissez dans des biens de luxe et des projets sur plan, avec une gestion locative complète.",
  };

  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: makeCanonical(locale, "/"),
      languages: altLangs("/"),
    },
    authors: [{ name: "Binayah Properties" }],
    creator: "Binayah Properties",
    publisher: "Binayah Properties",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/icon.png", type: "image/png", sizes: "512x512" },
      ],
      apple: "/icon.png",
      shortcut: "/favicon.ico",
    },
    manifest: "/site.webmanifest",
    openGraph: {
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
      type: "website",
      siteName: "Binayah Properties",
      url: makeCanonical(locale, "/"),
      locale: OG_LOCALE[locale] ?? "en_AE",
      images: [
        {
          url: "/assets/og-image.webp",
          width: 1200,
          height: 630,
          alt: "Binayah Properties, Dubai Real Estate",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
      images: ["/assets/og-image.webp"],
    },
    ...(hasVerification && {
      verification: {
        ...(verificationGoogle ? { google: verificationGoogle } : {}),
        ...(Object.keys(verificationOther).length > 0 ? { other: verificationOther } : {}),
      },
    }),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Enable next-intl static rendering — without this, getMessages()/getTranslations()
  // read headers() to resolve the locale, which forces every route to render
  // dynamically and disables the ISR/edge cache site-wide.
  setRequestLocale(locale);

  const messages = await getMessages();
  // Static per-deploy nonce (see src/lib/csp.ts) — read as a constant, NOT from
  // headers(), so this layout (and thus every page) can be statically cached.
  const nonce = CSP_NONCE;

  return (
    <html
      lang={locale}
      dir={locale === "ar" || locale === "he" ? "rtl" : "ltr"} // ar, he are rtl; vi, zh, ru, en are ltr
      suppressHydrationWarning
      className={`${jakarta.variable} ${playfair.variable} ${notoArabic.variable}`}
    >
      <head>
        {/* Preconnect to image/API origins — starts TLS handshake during HTML parse */}
        <link rel="preconnect" href="https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://binayah-api.onrender.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.binayah.ae" />
        <link rel="dns-prefetch" href="https://sm-automation-5464.s3.ap-south-1.amazonaws.com" />
      </head>
      <body className={jakarta.className}>
        {/* Google Tag Manager (noscript) — must be immediately after <body>.
            Rendered unconditionally so the HTML stays static/cacheable; the
            no-JS fallback only fires for JS-disabled clients (prod is the only
            public host — staging/previews are SSO-protected). */}
        {(
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}
        <OrganizationJsonLd nonce={nonce} />
        <WebSiteJsonLd nonce={nonce} />
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <FavoritesProvider>
              <CompareProvider>
                <SubscriptionsProvider>
                  <ChunkReloadGuard />
                  {children}
                  <WhatsAppButton />
                  {/* AI live-chat button — mounted globally so it appears on
                      every page (not just home/services/property/project). */}
                  <AIChatWidget />
                  {/* Scroll-to-top — global (was homepage-only). All floating
                      action buttons are mounted here once, so no page double-
                      mounts them and the stack is identical everywhere. */}
                  <ScrollToTop />
                  <FavoritesDrawer />
                  <GlobalImageFallback />
                  <Analytics />
                  <SpeedInsights />
                  <LiveChatBanner />
                  <GuideDownloadPopup />
                  {/* Analytics (GTM/GA/Clarity/LiveChat) — host-gated on the
                      client so this layout stays statically cacheable. */}
                  <ProdAnalytics nonce={nonce} />
                </SubscriptionsProvider>
              </CompareProvider>
            </FavoritesProvider>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
