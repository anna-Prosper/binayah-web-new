import { notFound } from "next/navigation";
import PropertyDetailClient from "@/app/property/[slug]/PropertyDetailClient";
import { getListing } from "@/lib/api";
import { formatPropertyTypeLabel } from "@/lib/property-types";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getListing(slug);
  if (!data) return { title: "Not Found" };
  const { listing } = data;
  const seo = listing.seo || {};
  return {
    title: seo.metaTitle || `${listing.name} | Binayah Properties`,
    description:
      seo.metaDescription ||
      `${formatPropertyTypeLabel(listing.propertyType, listing.propertyType || "Property")} for ${listing.listingType || "Sale"} in ${listing.community || "Dubai"}`,
    openGraph: {
      title: seo.ogTitle || seo.metaTitle || listing.name,
      description: seo.ogDescription || seo.metaDescription || "",
      images: seo.ogImage
        ? [{ url: seo.ogImage }]
        : listing.featuredImage
        ? [{ url: listing.featuredImage }]
        : [],
    },
  };
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getListing(slug);
  if (!data) return notFound();
  const { listing, similarListings } = data;
  return <PropertyDetailClient listing={listing} similarListings={similarListings} />;
}
