/* eslint-disable i18next/no-literal-string */
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { pickRouteMessages } from "@/i18n/client-namespaces";
import { notFound } from "next/navigation";
import PropertyTypeLanding from "@/components/PropertyTypeLanding";
import SearchPageClient from "@/app/_clients/search/SearchPageClient";
import { findPropertyTypePage } from "@/lib/property-type-pages";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";

// EFFECTIVE WINDOW: 3600, not the 86400 declared here. The page body is static
// copy, but the hero shows a LIVE inventory count via getCachedSearch, and a
// route's window is the MINIMUM across every fetch in its render. That call was
// pinning this page to a 10-minute rebuild until it was moved to the 1h cache;
// an hour is the right floor for an inventory number. Verify in
// .next/prerender-manifest.json — the export alone proves nothing.
export const revalidate = 86400;
interface Props { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const page = findPropertyTypePage("offices");
  if (!page) return {};
  const c = page[locale as keyof typeof page] as any || page.en;
  const url = canonical(locale, "/offices");
  return {
    title: c.metaTitle,
    description: c.metaDesc,
    keywords: c.keywords,
    alternates: { canonical: url, languages: altLangs("/offices") },
    openGraph: {
      title: c.metaTitle, description: c.metaDesc, url,
      type: "website", locale: OG_LOCALE[locale] ?? "en_AE",
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title: c.metaTitle, description: c.metaDesc },
  };
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const page = findPropertyTypePage("offices");
  if (!page) return notFound();
  const c = page[locale as keyof typeof page] as any || page.en;
  return (
    <NextIntlClientProvider messages={pickRouteMessages(await getMessages(), ["propertyDetail"])}>
      <PropertyTypeLanding
        locale={locale}
        slug="offices"
        icon={page.icon}
        searchType={page.searchType}
        c={c}
        searchSlot={<SearchPageClient defaultType="Commercial" syncUrl={false} />}
      />
    </NextIntlClientProvider>
  );
}
