import mongoose, { Schema, Document, Model } from "mongoose";

const VideoSchema = new Schema(
  { title: { type: String, default: "" }, url: { type: String, default: "" } },
  { _id: false }
);

export interface IConstructionUpdate extends Document {
  title: string;
  slug: string;
  mainTitle: string;
  developerName: string;
  projectLocation: string;
  progress: number | null;
  launchDate: string;
  completionDate: string;
  thumbnail: string;
  videos: { title: string; url: string }[];
  wpPostId: number | null;
  publishedAt: string;
}

const ConstructionUpdateSchema = new Schema<IConstructionUpdate>(
  {
    title:           { type: String, required: true },
    slug:            { type: String, required: true, unique: true, index: true },
    mainTitle:       { type: String, default: "" },
    developerName:   { type: String, default: "", index: true },
    projectLocation: { type: String, default: "" },
    progress:        { type: Number, default: null },
    launchDate:      { type: String, default: "" },
    completionDate:  { type: String, default: "" },
    thumbnail:       { type: String, default: "" },
    videos:          { type: [VideoSchema], default: [] },
    wpPostId:        { type: Number, default: null },
    publishedAt:     { type: String, default: "" },
  },
  { timestamps: true }
);

const ConstructionUpdate: Model<IConstructionUpdate> =
  mongoose.models.ConstructionUpdate ||
  mongoose.model<IConstructionUpdate>("ConstructionUpdate", ConstructionUpdateSchema, "construction_updates");

export default ConstructionUpdate;
