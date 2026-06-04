import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Playfair_Display, Noto_Sans_Arabic } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { canonical as makeCanonical, altLangs } from "@/lib/site";
import { OrganizationJsonLd } from "@/components/JsonLd";
import FavoritesDrawer from "@/components/FavoritesDrawer";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { CompareProvider } from "@/context/CompareContext";
import { SubscriptionsProvider } from "@/context/SubscriptionsContext";
import Script from "next/script";
import "../globals.css";
import Providers from "../providers";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import LiveChatBanner from "@/components/LiveChatBanner";
import GlobalImageFallback from "@/components/GlobalImageFallback";
import WhatsAppButton from "@/components/WhatsAppButton";

const GA_ID = "G-9FZKWX04K3";
const CLARITY_ID = "wuee1w39pj";
const LIVECHAT_LICENSE = "6313921";
const PROD_HOSTS = new Set(["www.binayah.ae", "binayah.ae", "binayah.ru", "www.binayah.ru"]);

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
    en: "Binayah Properties — Dubai Real Estate & Investments",
    ru: "Binayah Properties — Недвижимость в Дубае",
    ar: "بناية للعقارات — العقارات في دبي والاستثمار",
    zh: "Binayah Properties — 迪拜房地产与投资",
  };
  const descriptions: Record<string, string> = {
    en: "Binayah Properties — Dubai's trusted real estate partner. Buy, rent or invest in luxury homes, off-plan projects & enjoy full property management.",
    ru: "Binayah Properties — ваш надёжный партнёр по недвижимости в Дубае с 2007 года. Купить, снять или инвестировать в жильё, новостройки и управление недвижимостью.",
    ar: "بناية للعقارات — شريكك الموثوق في عقارات دبي. شراء أو إيجار أو استثمار في المنازل الفاخرة والمشاريع على الخارطة.",
    zh: "Binayah Properties — 迪拜值得信赖的房产合作伙伴。购买、租赁或投资豪华住宅、期房项目，享受全面的物业管理服务。",
  };

  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: makeCanonical(locale, "/"),
      languages: altLangs("/"),
    },
    keywords: [
      "Dubai real estate",
      "Dubai properties",
      "buy property Dubai",
      "Dubai apartments for sale",
      "Dubai villas for rent",
      "off-plan Dubai",
      "Dubai property investment",
      "Binayah Properties",
    ],
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
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/icon.png" },
      ],
      apple: "/icon.png",
    },
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
          alt: "Binayah Properties — Dubai Real Estate",
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

  const messages = await getMessages();
  const requestHeaders = await headers();
  const nonce = requestHeaders.get("x-nonce") ?? "";
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host") || "";
  const isProdHost = PROD_HOSTS.has(host);

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
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
        <OrganizationJsonLd nonce={nonce} />
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <FavoritesProvider>
              <CompareProvider>
                <SubscriptionsProvider>
                  {children}
                  <WhatsAppButton />
                  <FavoritesDrawer />
                  <GlobalImageFallback />
                  <Analytics />
                  <SpeedInsights />
                  <LiveChatBanner />
                  {isProdHost && (
                    <>
                      <Script
                        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
                        strategy="lazyOnload"
                      />
                      <Script id="ga-init" strategy="lazyOnload">
                        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
                      </Script>
                      <Script id="clarity-init" strategy="lazyOnload">
                        {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "${CLARITY_ID}");`}
                      </Script>
                      <Script id="livechat-init" strategy="lazyOnload">
                        {`window.__lc = window.__lc || {};
window.__lc.license = ${LIVECHAT_LICENSE};
window.__lc.integration_name = "manual_channels";
window.__lc.product_name = "livechat";
(function(n,t,c){function i(n){return e._h?e._h.apply(null,n):e._q.push(n)}var e={_q:[],_h:null,_v:"2.0",on:function(){i(["on",c.call(arguments)])},once:function(){i(["once",c.call(arguments)])},off:function(){i(["off",c.call(arguments)])},get:function(){if(!e._h)throw new Error("[LiveChatWidget] You can't use getters before load.");return i(["get",c.call(arguments)])},call:function(){i(["call",c.call(arguments)])},init:function(){var n=t.createElement("script");n.async=!0,n.type="text/javascript",n.src="https://cdn.livechatinc.com/tracking.js",t.head.appendChild(n)}};!n.__lc.asyncInit&&e.init(),n.LiveChatWidget=n.LiveChatWidget||e})(window,document,[].slice);`}
                      </Script>
                    </>
                  )}
                </SubscriptionsProvider>
              </CompareProvider>
            </FavoritesProvider>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
