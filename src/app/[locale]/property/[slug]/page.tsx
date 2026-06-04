import { notFound } from "next/navigation";
import PropertyDetailClient from "@/app/_clients/property/[slug]/PropertyDetailClient";
import { getListing } from "@/lib/api";
import { formatPropertyTypeLabel } from "@/lib/property-types";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { canonical as makeCanonical, altLangs } from "@/lib/site";

export const revalidate = 1800;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const data = await getListing(slug);
  if (!data) return { title: "Not Found" };
  const { listing } = data;
  const seo = listing.seo || {};

  const priceStr = listing.price
    ? ` | ${listing.currency || "AED"} ${listing.price >= 1_000_000 ? (listing.price / 1_000_000).toFixed(1) + "M" : Math.round(listing.price / 1000) + "K"}`
    : "";
  const bedsStr = listing.bedrooms != null
    ? ` | ${listing.bedrooms === 0 ? "Studio" : `${listing.bedrooms} BR`}`
    : "";
  const titleFallback = `${listing.name || listing.title}${bedsStr}${priceStr} | ${listing.community || "Dubai"} | Binayah`;

  const descFallback = seo.metaDescription ||
    `${formatPropertyTypeLabel(listing.propertyType, listing.propertyType || "Property")} for ${listing.listingType || "sale"} in ${listing.community || "Dubai"}${listing.bedrooms != null ? `, ${listing.bedrooms === 0 ? "Studio" : `${listing.bedrooms} bedroom`}` : ""}${listing.size ? `, ${listing.size} ${listing.sizeUnit || "sqft"}` : ""}${listing.price ? `. Listed at ${listing.currency || "AED"} ${listing.price >= 1_000_000 ? (listing.price / 1_000_000).toFixed(1) + "M" : Math.round(listing.price / 1000) + "K"}` : ""}. View photos, floor plans and contact agent.`;

  return {
    title: seo.metaTitle || titleFallback,
    description: descFallback,
    alternates: {
      canonical: seo.canonicalUrl || makeCanonical(locale, `/property/${slug}`),
      languages: altLangs(`/property/${slug}`),
    },
    openGraph: {
      title: seo.ogTitle || seo.metaTitle || titleFallback,
      description: descFallback,
      // opengraph-image.tsx serves the dynamic branded OG image (price/beds/photo overlay).
      type: "website",
      url: makeCanonical(locale, `/property/${slug}`),
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: listing.name || listing.title,
    description: listing.cleanDescription || listing.description || undefined,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://binayah.ae"}/${locale}/property/${slug}`,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <BreadcrumbJsonLd items={breadcrumbs} />
      <PropertyDetailClient listing={listing} similarListings={similarListings} />
    </>
  );
}
