import mongoose, { Schema, Document, Model } from "mongoose";

/* ── Sub-document interfaces ─────────────────────────────────────────────── */

export interface IPriceByType {
  type: string;
  size: string;
  priceMin: number | null;
  priceMax: number | null;
}

export interface IImageGalleryItem {
  url: string;
  alt: string;
  caption: string;
  order: number;
}

export interface IVideo {
  url: string;
  title: string;
  thumbnail: string;
  description: string;
}

export interface IFloorPlan {
  title: string;
  type: string;
  beds: string;
  baths: string;
  size: string;
  features: string[];
  image: string;
  pdf: string;
  priceFrom: number | null;
  priceTo: number | null;
}

export interface IPaymentPlanStep {
  title: string;
  percentage: string;
  amount: string;
}

export interface INearbyAttraction {
  name: string;
  type: string;
  distance: string;
  image: string;
}

export interface IFaq {
  question: string;
  answer: string;
}

export interface ITestimonial {
  name: string;
  unit: string;
  rating: number | null;
  text: string;
  avatar: string;
}

export interface IInvestmentStat {
  value: string;
  label: string;
}

export interface ISeo {
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
}

/* ── Main project interface ──────────────────────────────────────────────── */

export interface IProject extends Document {
  name: string;
  slug: string;
  source: string;
  publishStatus: string;

  status: string;
  projectType: string;
  propertyType: string;
  constructionStatus: string;
  availabilityStatus: string;
  completionDate: string;

  developerId: number | null;
  developerName: string;
  developerLogo: string;
  developerDescription: string;

  community: string;
  city: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  mapUrl: string;
  googleMapsUrl: string;
  locationDescription: string;

  startingPrice: number | null;
  priceMax: number | null;
  displayPrice: string;
  priceRange: string;
  priceUSD: string;
  currency: string;
  priceByType: IPriceByType[];

  unitTypes: string[];
  unitSizeMin: number | null;
  unitSizeMax: number | null;
  unitSizeUnit: string;
  totalUnits: number | null;
  titleType: string;
  ownershipEligibility: string;

  shortOverview: string;
  fullDescription: string;
  keyHighlights: string[];
  investmentHighlights: string[];
  investmentStats: IInvestmentStat[];

  amenities: string[];

  featuredImage: string;
  imageGallery: IImageGalleryItem[];
  masterPlanImages: string[];
  localImages: IImageGalleryItem[];
  videoUrl: string;
  videos: IVideo[];
  brochureUrl: string;
  qrCode: string;

  floorPlans: IFloorPlan[];

  downPayment: string;
  paymentPlanSummary: string;
  paymentPlanDetails: string;
  paymentPlanSteps: IPaymentPlanStep[];
  acceptedPaymentMethods: string[];

  nearbyAttractions: INearbyAttraction[];
  faqs: IFaq[];
  testimonials: ITestimonial[];

  whatsappNumber: string;
  contactPhone: string;
  ctaHeadline: string;
  ctaSubheadline: string;
  targetBuyers: string[];

  relatedProjectSlugs: string[];

  seo: ISeo;
  translations: Record<string, unknown>;

  tags: string[];
  areas: string[];
  sourceRefs: string[];

  wpPostId: number | null;
  wpOnly: boolean;
  needsReview: boolean;
  reviewReason: string;
  probableDupOf: string | null;
  descriptionScore: number | null;
  content_wp_needs_refresh: boolean;
  content_nextjs_needs_refresh: boolean;

  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

/* ── Sub-schemas ─────────────────────────────────────────────────────────── */

const PriceByTypeSchema = new Schema(
  { type: { type: String, default: "" }, size: { type: String, default: "" },
    priceMin: { type: Number, default: null }, priceMax: { type: Number, default: null } },
  { _id: false }
);

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

const FloorPlanSchema = new Schema(
  { title: { type: String, default: "" }, type: { type: String, default: "" },
    beds: { type: String, default: "" }, baths: { type: String, default: "" },
    size: { type: String, default: "" }, features: { type: [String], default: [] },
    image: { type: String, default: "" }, pdf: { type: String, default: "" },
    priceFrom: { type: Number, default: null }, priceTo: { type: Number, default: null } },
  { _id: false }
);

const PaymentPlanStepSchema = new Schema(
  { title: { type: String, default: "" }, percentage: { type: String, default: "" },
    amount: { type: String, default: "" } },
  { _id: false }
);

const NearbyAttractionSchema = new Schema(
  { name: { type: String, default: "" }, type: { type: String, default: "" },
    distance: { type: String, default: "" }, image: { type: String, default: "" } },
  { _id: false }
);

const FaqSchema = new Schema(
  { question: { type: String, default: "" }, answer: { type: String, default: "" } },
  { _id: false }
);

const TestimonialSchema = new Schema(
  { name: { type: String, default: "" }, unit: { type: String, default: "" },
    rating: { type: Number, default: null }, text: { type: String, default: "" },
    avatar: { type: String, default: "" } },
  { _id: false }
);

const InvestmentStatSchema = new Schema(
  { value: { type: String, default: "" }, label: { type: String, default: "" } },
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

/* ── Main schema ─────────────────────────────────────────────────────────── */

const ProjectSchema = new Schema<IProject>(
  {
    name:                  { type: String, required: true },
    slug:                  { type: String, required: true, unique: true, index: true },
    source:                { type: String, default: "wordpress" },
    publishStatus:         { type: String, default: "published", index: true },

    status:                { type: String, default: "", index: true },
    projectType:           { type: String, default: "" },
    propertyType:          { type: String, default: "" },
    constructionStatus:    { type: String, default: "" },
    availabilityStatus:    { type: String, default: "" },
    completionDate:        { type: String, default: "" },

    developerId:           { type: Number, default: null },
    developerName:         { type: String, default: "", index: true },
    developerLogo:         { type: String, default: "" },
    developerDescription:  { type: String, default: "" },

    community:             { type: String, default: "", index: true },
    city:                  { type: String, default: "Dubai", index: true },
    country:               { type: String, default: "UAE" },
    latitude:              { type: Number, default: null },
    longitude:             { type: Number, default: null },
    mapUrl:                { type: String, default: "" },
    googleMapsUrl:         { type: String, default: "" },
    locationDescription:   { type: String, default: "" },

    startingPrice:         { type: Number, default: null, index: true },
    priceMax:              { type: Number, default: null },
    displayPrice:          { type: String, default: "" },
    priceRange:            { type: String, default: "" },
    priceUSD:              { type: String, default: "" },
    currency:              { type: String, default: "AED" },
    priceByType:           { type: [PriceByTypeSchema], default: [] },

    unitTypes:             { type: [String], default: [] },
    unitSizeMin:           { type: Number, default: null },
    unitSizeMax:           { type: Number, default: null },
    unitSizeUnit:          { type: String, default: "sqft" },
    totalUnits:            { type: Number, default: null },
    titleType:             { type: String, default: "" },
    ownershipEligibility:  { type: String, default: "" },

    shortOverview:         { type: String, default: "" },
    fullDescription:       { type: String, default: "" },
    keyHighlights:         { type: [String], default: [] },
    investmentHighlights:  { type: [String], default: [] },
    investmentStats:       { type: [InvestmentStatSchema], default: [] },

    amenities:             { type: [String], default: [] },

    featuredImage:         { type: String, default: "" },
    imageGallery:          { type: [ImageGalleryItemSchema], default: [] },
    masterPlanImages:      { type: [String], default: [] },
    localImages:           { type: [ImageGalleryItemSchema], default: [] },
    videoUrl:              { type: String, default: "" },
    videos:                { type: [VideoSchema], default: [] },
    brochureUrl:           { type: String, default: "" },
    qrCode:                { type: String, default: "" },

    floorPlans:            { type: [FloorPlanSchema], default: [] },

    downPayment:           { type: String, default: "" },
    paymentPlanSummary:    { type: String, default: "" },
    paymentPlanDetails:    { type: String, default: "" },
    paymentPlanSteps:      { type: [PaymentPlanStepSchema], default: [] },
    acceptedPaymentMethods:{ type: [String], default: [] },

    nearbyAttractions:     { type: [NearbyAttractionSchema], default: [] },
    faqs:                  { type: [FaqSchema], default: [] },
    testimonials:          { type: [TestimonialSchema], default: [] },

    whatsappNumber:        { type: String, default: "" },
    contactPhone:          { type: String, default: "" },
    ctaHeadline:           { type: String, default: "" },
    ctaSubheadline:        { type: String, default: "" },
    targetBuyers:          { type: [String], default: [] },

    relatedProjectSlugs:   { type: [String], default: [] },

    seo:                   { type: SeoSchema, default: () => ({}) },
    translations:          { type: Schema.Types.Mixed, default: {} },

    tags:                  { type: [String], default: [] },
    areas:                 { type: [String], default: [] },
    sourceRefs:            { type: [String], default: [] },

    wpPostId:              { type: Number, default: null },
    wpOnly:                { type: Boolean, default: true },
    needsReview:           { type: Boolean, default: true },
    reviewReason:          { type: String, default: "" },
    probableDupOf:         { type: String, default: null },
    descriptionScore:      { type: Number, default: null },
    content_wp_needs_refresh:     { type: Boolean, default: false },
    content_nextjs_needs_refresh: { type: Boolean, default: false },

    viewCount:             { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Project: Model<IProject> =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);

export default Project;
