import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAgent extends Document {
  name: string;
  slug: string;
  wpId: number;
  bio: string;
  photo: string;
  position: string;
  email: string;
  mobile: string;
  officePhone: string;
  languages: string[];
  facebook: string;
  twitter: string;
  linkedin: string;
  whatsapp: string;
  viewCount: number;
  publishStatus: string;
  createdAt: string;
  updatedAt: string;
}

const AgentSchema = new Schema<IAgent>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    wpId: Number,
    bio: String,
    photo: String,
    position: String,
    email: String,
    mobile: String,
    officePhone: String,
    languages: { type: [String], default: [] },
    facebook: String,
    twitter: String,
    linkedin: String,
    whatsapp: String,
    viewCount: { type: Number, default: 0 },
    publishStatus: { type: String, default: "published" },
  },
  { timestamps: true }
);

const Agent: Model<IAgent> =
  mongoose.models.Agent || mongoose.model<IAgent>("Agent", AgentSchema);

export default Agent;
