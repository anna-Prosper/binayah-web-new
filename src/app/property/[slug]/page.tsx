import { connectDB } from "@/lib/mongodb";
import Listing from "@/models/Listing";
import { notFound } from "next/navigation";
import PropertyDetailClient from "./PropertyDetailClient";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connectDB();
  const { slug } = await params;
  const listing = await Listing.findOne({ slug, publishStatus: "published" }).lean();
  if (!listing) return { title: "Not Found" };
  const l = listing as any;
  const seo = l.seo || {};
  return {
    title: seo.metaTitle || `${l.name} | Binayah Properties`,
    description: seo.metaDescription ||
      `${l.propertyType || "Property"} for ${l.listingType || "Sale"} in ${l.community || "Dubai"}`,
    openGraph: {
      title: seo.ogTitle || seo.metaTitle || l.name,
      description: seo.ogDescription || seo.metaDescription || "",
      images: seo.ogImage ? [{ url: seo.ogImage }] : l.featuredImage ? [{ url: l.featuredImage }] : [],
    },
  };
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connectDB();
  const { slug } = await params;
  const listing = await Listing.findOne({ slug, publishStatus: "published" }).lean();

  if (!listing) notFound();

  const serialized = JSON.parse(JSON.stringify(listing));

  // Map new field names to what PropertyDetailClient expects
  serialized.title = serialized.name;
  serialized.cleanDescription = serialized.description;
  serialized.images = (serialized.imageGallery || []).map((item: any) =>
    typeof item === "object" && item.url ? item.url : item
  );

  // Fetch similar listings
  const similar = await Listing.find({
    publishStatus: "published",
    slug: { $ne: slug },
    $or: [
      ...(serialized.community ? [{ community: serialized.community }] : []),
      ...(serialized.propertyType ? [{ propertyType: serialized.propertyType }] : []),
    ],
  })
    .select("name slug listingType propertyType bedrooms bathrooms size sizeUnit price currency community city featuredImage imageGallery")
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

  const similarSerialized = JSON.parse(JSON.stringify(similar)).map((s: any) => ({
    ...s,
    title: s.name,
    images: (s.imageGallery || []).map((item: any) =>
      typeof item === "object" && item.url ? item.url : item
    ),
  }));

  return (
    <PropertyDetailClient
      listing={serialized}
      similarListings={similarSerialized}
    />
  );
}
