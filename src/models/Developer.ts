import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDeveloper extends Document {
  name: string;
  slug: string;
  wpId: number;
  description: string;
  logo: string;
  address: string;
  email: string;
  phone: string;
  facebook: string;
  twitter: string;
  website: string;
  projectCount: number;
  metaTitle: string;
  metaDescription: string;
  viewCount: number;
  featured: boolean;
  publishStatus: string;
  createdAt: string;
  updatedAt: string;
}

const DeveloperSchema = new Schema<IDeveloper>(
  {
    name: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    wpId: Number,
    description: String,
    logo: String,
    address: String,
    email: String,
    phone: String,
    facebook: String,
    twitter: String,
    website: String,
    projectCount: { type: Number, default: 0 },
    metaTitle: String,
    metaDescription: String,
    viewCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    publishStatus: { type: String, default: "Published" },
  },
  { timestamps: true }
);

const Developer: Model<IDeveloper> =
  mongoose.models.Developer || mongoose.model<IDeveloper>("Developer", DeveloperSchema);

export default Developer;
