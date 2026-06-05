/* eslint-disable i18next/no-literal-string */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PropertyTypeLanding from "@/components/PropertyTypeLanding";
import { findPropertyTypePage } from "@/lib/property-type-pages";
import { canonical, altLangs, OG_LOCALE, DEFAULT_OG_IMAGE } from "@/lib/site";

export const revalidate = 86400;
interface Props { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const page = findPropertyTypePage("apartments");
  if (!page) return {};
  const c = page[locale as keyof typeof page] as any || page.en;
  const url = canonical(locale, "/apartments");
  return {
    title: c.metaTitle,
    description: c.metaDesc,
    keywords: c.keywords,
    alternates: { canonical: url, languages: altLangs("/apartments") },
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
  const page = findPropertyTypePage("apartments");
  if (!page) return notFound();
  const c = page[locale as keyof typeof page] as any || page.en;
  return (
    <PropertyTypeLanding
      locale={locale}
      slug="apartments"
      icon={page.icon}
      searchType={page.searchType}
      c={c}
    />
  );
}
