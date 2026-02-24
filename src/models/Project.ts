import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFloorPlan {
  bedrooms: string;
  category: string;
  size: string;
  unitInfo: string;
  imageUrl: string;
}

export interface INearbyAttraction {
  name: string;
  type?: string;
  distance?: string;
}

export interface IFaq {
  question: string;
  answer: string;
}

export interface IProject extends Document {
  name: string;
  slug: string;
  source: string;
  sourceId: string;
  sourceUrl: string;
  status: string;
  projectType: string;
  propertyType: string;
  developerName: string;
  community: string;
  city: string;
  country: string;
  address: string;
  latitude: number;
  longitude: number;
  mapUrl: string;
  startingPrice: number | null;
  displayPrice: string;
  currency: string;
  priceRange: string;
  priceByType: string[];
  bedrooms: string;
  bathrooms: string;
  unitTypes: string[];
  totalUnits: number | null;
  completionDate: string;
  constructionStatus: string;
  downPayment: string;
  paymentPlanSummary: string;
  paymentPlanDetails: string;
  shortOverview: string;
  fullDescription: string;
  keyHighlights: string[];
  investmentHighlights: string[];
  amenities: string[];
  amenitiesTitle: string;
  amenitiesContent: string;
  nearbyAttractions: INearbyAttraction[];
  faqs: IFaq[];
  floorPlans: IFloorPlan[];
  floorPlanContent: string;
  floorPlanImage: string;
  paymentPlan: string;
  unitSizeMin: number | null;
  unitSizeMax: number | null;
  availabilityStatus: string;
  featuredImage: string;
  imageGallery: string[];
  localImages: string[];
  masterPlanImages: string[];
  masterPlanUrl: string;
  masterPlanDescription: string;
  videos: string[];
  videoUrl: string;
  whatsappNumber: string;
  brochureUrl: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  tags: string[];
  areas: string[];
  viewCount: number;
  publishStatus: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

const FloorPlanSchema = new Schema(
  {
    bedrooms: { type: String, default: "" },
    category: { type: String, default: "" },
    size: { type: String, default: "" },
    unitInfo: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
  },
  { _id: false }
);

const NearbyAttractionSchema = new Schema(
  {
    name: { type: String, default: "" },
    type: { type: String, default: "" },
    distance: { type: String, default: "" },
  },
  { _id: false }
);

const FaqSchema = new Schema(
  {
    question: { type: String, default: "" },
    answer: { type: String, default: "" },
  },
  { _id: false }
);

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    source: { type: String, default: "wordpress" },
    sourceId: String,
    sourceUrl: String,
    status: { type: String, default: "", index: true },
    projectType: { type: String, default: "Residential" },
    propertyType: { type: String, default: "Apartment" },
    developerName: { type: String, default: "", index: true },
    community: { type: String, default: "", index: true },
    city: { type: String, default: "Dubai", index: true },
    country: { type: String, default: "UAE" },
    address: String,
    latitude: Number,
    longitude: Number,
    mapUrl: String,
    startingPrice: { type: Number, default: null, index: true },
    displayPrice: String,
    currency: { type: String, default: "AED" },
    priceRange: String,
    priceByType: [String],
    bedrooms: String,
    bathrooms: String,
    unitTypes: [String],
    totalUnits: Number,
    completionDate: String,
    constructionStatus: String,
    downPayment: String,
    paymentPlanSummary: String,
    paymentPlanDetails: String,
    shortOverview: String,
    fullDescription: String,
    keyHighlights: { type: [String], default: [] },
    investmentHighlights: { type: [String], default: [] },
    amenities: { type: [String], default: [] },
    amenitiesTitle: String,
    amenitiesContent: String,
    nearbyAttractions: { type: [NearbyAttractionSchema], default: [] },
    faqs: { type: [FaqSchema], default: [] },
    floorPlans: { type: [FloorPlanSchema], default: [] },
    floorPlanContent: String,
    floorPlanImage: String,
    paymentPlan: String,
    unitSizeMin: { type: Number, default: null },
    unitSizeMax: { type: Number, default: null },
    availabilityStatus: String,
    featuredImage: String,
    imageGallery: { type: [String], default: [] },
    localImages: { type: [String], default: [] },
    masterPlanImages: { type: [String], default: [] },
    masterPlanUrl: String,
    masterPlanDescription: String,
    videos: { type: [String], default: [] },
    videoUrl: String,
    whatsappNumber: String,
    brochureUrl: String,
    metaTitle: String,
    metaDescription: String,
    focusKeyword: String,
    tags: { type: [String], default: [] },
    areas: { type: [String], default: [] },
    viewCount: { type: Number, default: 0 },
    publishStatus: { type: String, default: "Published", index: true },
    publishedAt: String,
  },
  { timestamps: true }
);

const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);

export default Project;
