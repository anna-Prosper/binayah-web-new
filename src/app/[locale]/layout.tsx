import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display, Noto_Sans_Arabic } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { OrganizationJsonLd } from "@/components/JsonLd";
import FavoritesDrawer from "@/components/FavoritesDrawer";
import { FavoritesProvider } from "@/context/FavoritesContext";
import { CompareProvider } from "@/context/CompareContext";
import { SubscriptionsProvider } from "@/context/SubscriptionsContext";
import "../globals.css";
import Providers from "../providers";

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
  title: "Binayah Properties — Dubai Real Estate",
  description: "Dubai's trusted property partner. Find luxury homes, off-plan investments, and expert property management services.",
  metadataBase: new URL(siteUrl),
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "Binayah Properties — Dubai Real Estate",
    description: "Dubai's trusted property partner for buying, selling & renting properties.",
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
    title: "Binayah Properties — Dubai Real Estate",
    description: "Dubai's trusted property partner for buying, selling & renting properties.",
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

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      suppressHydrationWarning
      className={`${jakarta.variable} ${playfair.variable} ${notoArabic.variable}`}
    >
      <body className={jakarta.className}>
        <OrganizationJsonLd />
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <FavoritesProvider>
              <CompareProvider>
                <SubscriptionsProvider>
                  {children}
                  <FavoritesDrawer />
                </SubscriptionsProvider>
              </CompareProvider>
            </FavoritesProvider>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
