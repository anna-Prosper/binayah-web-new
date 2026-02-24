import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICommunity extends Document {
  name: string;
  slug: string;
  wpId: number;
  displayName: string;
  archiveName: string;
  city: string;
  description: string;
  featuredImage: string;
  imageGallery: string[];
  metaTitle: string;
  metaDescription: string;
  viewCount: number;
  projectCount: number;
  featured: boolean;
  order: number;
  publishStatus: string;
  createdAt: string;
  updatedAt: string;
}

const CommunitySchema = new Schema<ICommunity>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    wpId: Number,
    displayName: String,
    archiveName: String,
    city: { type: String, default: "Dubai", index: true },
    description: String,
    featuredImage: String,
    imageGallery: { type: [String], default: [] },
    metaTitle: String,
    metaDescription: String,
    viewCount: { type: Number, default: 0 },
    projectCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    publishStatus: { type: String, default: "Published" },
  },
  { timestamps: true }
);

const Community: Model<ICommunity> =
  mongoose.models.Community || mongoose.model<ICommunity>("Community", CommunitySchema);

export default Community;
