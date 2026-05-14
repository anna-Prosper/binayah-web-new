import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display, Noto_Sans_Arabic } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { OrganizationJsonLd } from "@/components/JsonLd";
import FavoritesDrawer from "@/components/FavoritesDrawer";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { CompareProvider } from "@/context/CompareContext";
import { SubscriptionsProvider } from "@/context/SubscriptionsContext";
import "../globals.css";
import Providers from "../providers";
import { Analytics } from "@vercel/analytics/next";

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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://binayah.com";

export const metadata: Metadata = {
  // 56 chars — within recommended 50–60 range
  title: "Binayah Properties — Dubai Real Estate & Investments",
  // 154 chars — within recommended 120–160 range
  description: "Binayah Properties — Dubai's trusted real estate partner. Buy, rent or invest in luxury homes, off-plan projects & enjoy full property management.",
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
    languages: {
      en: "/en",
      ar: "/ar",
      "x-default": "/en",
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
    title: "Binayah Properties — Dubai Real Estate & Investments",
    description: "Binayah Properties — Dubai's trusted real estate partner. Buy, rent or invest in luxury homes, off-plan projects & enjoy full property management.",
    type: "website",
    url: siteUrl,
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
    title: "Binayah Properties — Dubai Real Estate & Investments",
    description: "Binayah Properties — Dubai's trusted real estate partner. Buy, rent or invest in luxury homes, off-plan projects & enjoy full property management.",
    images: ["/assets/og-image.webp"],
  },
};

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
  const nonce = (await headers()).get("x-nonce") ?? "";

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
        <link rel="dns-prefetch" href="https://www.binayah.com" />
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
                  <FavoritesDrawer />
                  <Analytics />
                </SubscriptionsProvider>
              </CompareProvider>
            </FavoritesProvider>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
