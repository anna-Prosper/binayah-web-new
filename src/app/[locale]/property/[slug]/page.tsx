import { notFound } from "next/navigation";
import PropertyDetailClient from "@/app/_clients/property/[slug]/PropertyDetailClient";
import { getListing } from "@/lib/api";
import { formatPropertyTypeLabel } from "@/lib/property-types";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { canonical as makeCanonical, altLangs, OG_LOCALE } from "@/lib/site";
import { getNonce } from "@/lib/nonce";

export const revalidate = 1800;

// Opt into ISR. Without generateStaticParams a [slug] route is fully dynamic
// (private, no-store) regardless of `revalidate`. Returning [] prerenders
// nothing at build (light build) while making every slug ISR-cached on-demand.
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const data = await getListing(slug);
  // Missing/delisted listing → real 404 (status code), not a soft 200+noindex
  // page, so Google drops the URL instead of parking it under "Excluded by noindex".
  if (!data) notFound();
  const { listing } = data;
  const seo = listing.seo || {};

  // Keep the title within Google's ~60-char SERP display limit: name + area +
  // brand. Beds/price live in the description and the RealEstateListing schema,
  // so they don't need to (and shouldn't) bloat the title past the cut-off.
  const rawName = String(listing.name || listing.title || "Property");
  const name = rawName.length > 45 ? `${rawName.slice(0, 44).trimEnd()}…` : rawName;
  const titleFallback = `${name} | ${listing.community || "Dubai"} | Binayah`;

  const descFallback = seo.metaDescription ||
    `${formatPropertyTypeLabel(listing.propertyType, listing.propertyType || "Property")} for ${listing.listingType || "sale"} in ${listing.community || "Dubai"}${listing.bedrooms != null ? `, ${listing.bedrooms === 0 ? "Studio" : `${listing.bedrooms} bedroom`}` : ""}${listing.size ? `, ${listing.size} ${listing.sizeUnit || "sqft"}` : ""}${listing.price ? `. Listed at ${listing.currency || "AED"} ${Math.round(listing.price).toLocaleString("en-AE")}` : ""}. View photos, floor plans and contact agent.`;

  return {
    title: seo.metaTitle || titleFallback,
    description: descFallback,
    alternates: {
      // Always self-referential. Migrated listings carry stale seo.canonicalUrl
      // values (legacy binayah.com paths that now 404), so honoring the stored
      // value risks canonicalising to a dead URL — same rationale as project/[slug].
      canonical: makeCanonical(locale, `/property/${slug}`),
      languages: altLangs(`/property/${slug}`),
    },
    openGraph: {
      title: seo.ogTitle || seo.metaTitle || titleFallback,
      description: descFallback,
      // opengraph-image.tsx serves the dynamic branded OG image (price/beds/photo overlay).
      type: "website",
      url: makeCanonical(locale, `/property/${slug}`),
      locale: OG_LOCALE[locale] ?? "en_AE",
    },
    twitter: {
      card: "summary_large_image",
      title: seo.ogTitle || seo.metaTitle || titleFallback,
      description: descFallback,
    },
  };
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const data = await getListing(slug);
  if (!data) return notFound();
  const { listing, similarListings } = data;
  const nonce = await getNonce();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: listing.name || listing.title,
    description: listing.cleanDescription || listing.description || undefined,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.binayah.ae"}/${locale}/property/${slug}`,
    ...(listing.featuredImage ? { image: [listing.featuredImage] } : {}),
    ...(listing.price ? {
      offers: {
        "@type": "Offer",
        price: listing.price,
        priceCurrency: listing.currency || "AED",
        availability: "https://schema.org/InStock",
      },
    } : {}),
    ...(listing.bedrooms != null ? { numberOfRooms: listing.bedrooms } : {}),
    ...(listing.bathrooms != null ? { numberOfBathroomsTotal: listing.bathrooms } : {}),
    ...(listing.size ? {
      floorSize: {
        "@type": "QuantitativeValue",
        value: listing.size,
        unitCode: listing.sizeUnit === "sqm" ? "MTK" : "FTK",
      },
    } : {}),
    address: {
      "@type": "PostalAddress",
      ...(listing.community ? { addressLocality: listing.community } : {}),
      addressRegion: listing.city || "Dubai",
      addressCountry: "AE",
    },
    ...(listing.latitude && listing.longitude ? {
      geo: {
        "@type": "GeoCoordinates",
        latitude: listing.latitude,
        longitude: listing.longitude,
      },
    } : {}),
  };

  const localePrefix = locale === "en" ? "" : `/${locale}`;
  const isRent = listing.listingType === "Rent";
  const breadcrumbs = [
    { name: "Home", href: `${localePrefix}/` },
    { name: isRent ? "Rent" : "Buy", href: `${localePrefix}/${isRent ? "rent" : "buy"}` },
    { name: listing.name || listing.title, href: `${localePrefix}/property/${slug}` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <BreadcrumbJsonLd items={breadcrumbs} />
      <PropertyDetailClient listing={listing} similarListings={similarListings} />
    </>
  );
}
