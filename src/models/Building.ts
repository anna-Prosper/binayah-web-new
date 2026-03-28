import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBuilding extends Document {
  name: string;
  slug: string;
  wpId: number;
  location: string;
  sublocation: string;
  developer: string;
  projectStatus: string;
  projectType: string;
  ownershipType: string;
  grossFloorArea: string;
  publishStatus: string;
  createdAt: string;
  updatedAt: string;
}

const BuildingSchema = new Schema<IBuilding>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    wpId: Number,
    location: { type: String, default: "", index: true },
    sublocation: String,
    developer: String,
    projectStatus: String,
    projectType: String,
    ownershipType: String,
    grossFloorArea: String,
    publishStatus: { type: String, default: "Published" },
  },
  { timestamps: true }
);

BuildingSchema.index({ city: 1 });

const Building: Model<IBuilding> =
  mongoose.models.Building || mongoose.model<IBuilding>("Building", BuildingSchema);

export default Building;
