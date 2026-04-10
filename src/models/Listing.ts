import mongoose, { Schema, Document, Model } from "mongoose";

/* ── Sub-document schemas (shared with Project) ──────────────────────── */

const ImageGalleryItemSchema = new Schema(
  { url: { type: String, default: "" }, alt: { type: String, default: "" },
    caption: { type: String, default: "" }, order: { type: Number, default: 0 } },
  { _id: false }
);

const VideoSchema = new Schema(
  { url: { type: String, default: "" }, title: { type: String, default: "" },
    thumbnail: { type: String, default: "" }, description: { type: String, default: "" } },
  { _id: false }
);

const SeoSchema = new Schema(
  { metaTitle: { type: String, default: "" }, metaDescription: { type: String, default: "" },
    metaKeywords: { type: [String], default: [] }, ogTitle: { type: String, default: "" },
    ogDescription: { type: String, default: "" }, ogImage: { type: String, default: "" },
    ogType: { type: String, default: "website" }, twitterCard: { type: String, default: "summary_large_image" },
    twitterTitle: { type: String, default: "" }, twitterDescription: { type: String, default: "" },
    canonicalUrl: { type: String, default: "" }, robots: { type: String, default: "index, follow" },
    structuredData: { type: Schema.Types.Mixed, default: null } },
  { _id: false }
);

/* ── Main interface ──────────────────────────────────────────────────── */

export interface IListing extends Document {
  name: string;
  slug: string;
  source: string;
  publishStatus: string;

  listingType: string;
  propertyType: string;
  propertyId: string;
  furnishing: string;

  bedrooms: number | null;
  bathrooms: number | null;
  bedroomLabel: string;
  size: number | null;
  sizeUnit: string;

  price: number | null;
  displayPrice: string;
  currency: string;
  pricePerSqft: number | null;

  community: string;
  subCommunity: string;
  city: string;
  country: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  mapUrl: string;
  googleMapsUrl: string;

  description: string;
  features: string[];
  amenities: string[];

  featuredImage: string;
  imageGallery: { url: string; alt: string; caption: string; order: number }[];
  localImages: { url: string; alt: string; caption: string; order: number }[];
  videoUrl: string;
  videos: { url: string; title: string; thumbnail: string; description: string }[];

  agentId: number | null;
  agencyId: number | null;
  agentName: string;
  whatsappNumber: string;
  contactPhone: string;

  seo: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string[];
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    ogType: string;
    twitterCard: string;
    twitterTitle: string;
    twitterDescription: string;
    canonicalUrl: string;
    robots: string;
    structuredData: Record<string, unknown> | null;
  };

  tags: string[];
  areas: string[];

  wpPostId: number | null;
  wpOnly: boolean;
  needsReview: boolean;

  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

/* ── Schema ──────────────────────────────────────────────────────────── */

const ListingSchema = new Schema<IListing>(
  {
    name:              { type: String, required: true },
    slug:              { type: String, required: true, unique: true, index: true },
    source:            { type: String, default: "wordpress" },
    publishStatus:     { type: String, default: "published", index: true },

    listingType:       { type: String, default: "Sale", index: true },
    propertyType:      { type: String, default: "" },
    propertyId:        { type: String, default: "", index: true },
    furnishing:        { type: String, default: "" },

    bedrooms:          { type: Number, default: null, index: true },
    bathrooms:         { type: Number, default: null },
    bedroomLabel:      { type: String, default: "" },
    size:              { type: Number, default: null },
    sizeUnit:          { type: String, default: "sqft" },

    price:             { type: Number, default: null, index: true },
    displayPrice:      { type: String, default: "" },
    currency:          { type: String, default: "AED" },
    pricePerSqft:      { type: Number, default: null },

    community:         { type: String, default: "", index: true },
    subCommunity:      { type: String, default: "" },
    city:              { type: String, default: "Dubai" },
    country:           { type: String, default: "UAE" },
    address:           { type: String, default: "" },
    latitude:          { type: Number, default: null },
    longitude:         { type: Number, default: null },
    mapUrl:            { type: String, default: "" },
    googleMapsUrl:     { type: String, default: "" },

    description:       { type: String, default: "" },
    features:          { type: [String], default: [] },
    amenities:         { type: [String], default: [] },

    featuredImage:     { type: String, default: "" },
    imageGallery:      { type: [ImageGalleryItemSchema], default: [] },
    localImages:       { type: [ImageGalleryItemSchema], default: [] },
    videoUrl:          { type: String, default: "" },
    videos:            { type: [VideoSchema], default: [] },

    agentId:           { type: Number, default: null },
    agencyId:          { type: Number, default: null },
    agentName:         { type: String, default: "" },
    whatsappNumber:    { type: String, default: "" },
    contactPhone:      { type: String, default: "" },

    seo:               { type: SeoSchema, default: () => ({}) },

    tags:              { type: [String], default: [] },
    areas:             { type: [String], default: [] },

    wpPostId:          { type: Number, default: null },
    wpOnly:            { type: Boolean, default: true },
    needsReview:       { type: Boolean, default: true },

    viewCount:         { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Listing: Model<IListing> =
  mongoose.models.Listing || mongoose.model<IListing>("Listing", ListingSchema);

export default Listing;
