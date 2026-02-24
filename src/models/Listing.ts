import mongoose, { Schema, Document, Model } from "mongoose";

export interface IListing extends Document {
  title: string;
  slug: string;
  wpId: number;
  propertyId: string;
  description: string;
  listingType: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  size: number;
  sizeUnit: string;
  price: number;
  currency: string;
  community: string;
  subCommunity: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  featuredImage: string;
  imageGallery: string[];
  amenities: string[];
  agent: string;
  metaTitle: string;
  metaDescription: string;
  viewCount: number;
  publishStatus: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

const ListingSchema = new Schema<IListing>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    wpId: Number,
    propertyId: { type: String, unique: true, index: true },
    description: String,
    listingType: { type: String, default: "Sale", index: true },
    propertyType: String,
    bedrooms: { type: Number, index: true },
    bathrooms: Number,
    size: Number,
    sizeUnit: { type: String, default: "sqft" },
    price: { type: Number, index: true },
    currency: { type: String, default: "AED" },
    community: { type: String, default: "", index: true },
    subCommunity: String,
    city: { type: String, default: "Dubai" },
    address: String,
    latitude: Number,
    longitude: Number,
    featuredImage: String,
    imageGallery: { type: [String], default: [] },
    amenities: { type: [String], default: [] },
    agent: String,
    metaTitle: String,
    metaDescription: String,
    viewCount: { type: Number, default: 0 },
    publishStatus: { type: String, default: "Published" },
    publishedAt: String,
  },
  { timestamps: true }
);

const Listing: Model<IListing> =
  mongoose.models.Listing || mongoose.model<IListing>("Listing", ListingSchema);

export default Listing;
