import { notFound } from "next/navigation";
import PropertyDetailClient from "@/app/property/[slug]/PropertyDetailClient";
import { serverApiUrl, serverFetch } from "@/lib/api";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  try {
    const res = await serverFetch(serverApiUrl(`/api/listings/${slug}`));
    if (!res.ok) return { title: "Not Found" };
    const { listing } = await res.json();
    const seo = listing.seo || {};
    return {
      title: seo.metaTitle || `${listing.name} | Binayah Properties`,
      description:
        seo.metaDescription ||
        `${listing.propertyType || "Property"} for ${listing.listingType || "Sale"} in ${listing.community || "Dubai"}`,
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
  } catch {
    return { title: "Binayah Properties" };
  }
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  try {
    const res = await serverFetch(serverApiUrl(`/api/listings/${slug}`));
    if (res.status === 404) return notFound();
    if (!res.ok) return notFound();
    const { listing, similarListings } = await res.json();
    return <PropertyDetailClient listing={listing} similarListings={similarListings} />;
  } catch {
    return notFound();
  }
}
