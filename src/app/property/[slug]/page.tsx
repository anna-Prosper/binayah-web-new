import { connectDB } from "@/lib/mongodb";
import Listing from "@/models/Listing";
import { notFound } from "next/navigation";
import PropertyDetailClient from "./PropertyDetailClient";

export const revalidate = 60;

function stripHtml(html: string): string {
  if (!html) return "";
  let text = html.replace(/<[^>]*>/g, " ");
  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ");
  text = text.replace(/\s+/g, " ").trim();
  return text;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connectDB();
  const { slug } = await params;
  const listing = await Listing.findOne({
    slug,
    publishStatus: "Published",
  }).lean();
  if (!listing) return { title: "Not Found" };
  const l = listing as any;
  return {
    title: l.metaTitle || `${l.title} | Binayah Properties`,
    description:
      l.metaDescription ||
      `${l.propertyType || "Property"} for ${l.listingType || "Sale"} in ${l.community || "Dubai"}`,
  };
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connectDB();
  const { slug } = await params;
  const listing = await Listing.findOne({
    slug,
    publishStatus: "Published",
  }).lean();

  if (!listing) notFound();

  const serialized = JSON.parse(JSON.stringify(listing));

  // Clean HTML from description
  if (serialized.description) {
    serialized.cleanDescription = stripHtml(serialized.description);
  }

  // Fetch similar listings (same community or property type)
  const similar = await Listing.find({
    publishStatus: "Published",
    slug: { $ne: slug },
    $or: [
      ...(serialized.community
        ? [{ community: serialized.community }]
        : []),
      ...(serialized.propertyType
        ? [{ propertyType: serialized.propertyType }]
        : []),
    ],
  })
    .select(
      "title slug listingType propertyType bedrooms bathrooms size sizeUnit price currency community city featuredImage images"
    )
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

  return (
    <PropertyDetailClient
      listing={serialized}
      similarListings={JSON.parse(JSON.stringify(similar))}
    />
  );
}
