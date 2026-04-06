import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";
import { notFound } from "next/navigation";
import ProjectDetailClient from "./ProjectDetailClient";

export const revalidate = 60;

const MOCK_PROJECT = {
  _id: "mock-binghatti-hillcrest",
  name: "Binghatti Hillcrest",
  slug: "binghatti-hillcrest",
  status: "Off-Plan",
  projectType: "Residential",
  propertyType: "Apartment",
  developerName: "Binghatti Developers",
  community: "Arjan",
  city: "Dubai",
  country: "UAE",
  startingPrice: 799999,
  displayPrice: "AED 799,999",
  currency: "AED",
  priceRange: "AED 799,999 – AED 2,100,000",
  unitTypes: ["Studio", "1 BR", "2 BR"],
  unitSizeMin: 333,
  unitSizeMax: 1028,
  completionDate: "2026-12-31",
  constructionStatus: "Under Construction",
  availabilityStatus: "Available",
  totalUnits: 322,
  shortOverview: "Binghatti Hillcrest is a striking modern residential development of studio, 1 & 2-bedroom apartments in Arjan, Dubai by Binghatti Developers. Combining modern architectural elegance with urban functional living, this development offers residents a gracious lifestyle in one of the most emerging neighbourhoods of the city.",
  fullDescription: "<p>Binghatti Hillcrest is a striking modern residential development of studio, 1 & 2-bedroom apartments in Arjan, Dubai by Binghatti Developers. Combining modern architectural elegance with urban functional living, this development offers residents a gracious lifestyle in one of the most emerging neighbourhoods of the city.</p><p>The project has a designer-architectural philosophy behind it that presents an ideal balance between luxury, convenience and usability. Through a basement, ground floor, four residential levels and one roof level, the project includes 322 residential units and 28 retail outlets.</p>",
  featuredImage: "https://manage.tanamiproperties.com/Banner/3136/Large/35769.webp",
  imageGallery: [
    "https://manage.tanamiproperties.com/Gallery/3136/Thumb/35788.webp",
    "https://manage.tanamiproperties.com/Gallery/3136/Thumb/35800.webp",
    "https://manage.tanamiproperties.com/Gallery/3136/Thumb/35799.webp",
    "https://manage.tanamiproperties.com/Gallery/3136/Thumb/35798.webp",
    "https://manage.tanamiproperties.com/Gallery/3136/Thumb/35797.webp",
    "https://manage.tanamiproperties.com/Gallery/3136/Thumb/35796.webp",
  ],
  keyHighlights: [
    "Premium development with eye-catching façade and strong modern identity",
    "322 residential units across basement, ground and 4 residential levels",
    "28 integrated retail outlets for community convenience",
    "Thoughtfully designed with open floor plans and natural light",
    "Premium quality finishes with meticulous attention to detail",
    "High investment potential in an emerging Dubai location",
  ],
  investmentHighlights: [
    "Freehold ownership for all nationalities",
    "High rental yield in Arjan — up to 7% ROI",
    "Golden Visa eligible for units AED 2M+",
    "Established developer with strong delivery track record",
    "Proximity to Al Barsha & Mall of the Emirates",
    "Below market entry price for Dubai apartment",
  ],
  amenities: ["Swimming Pool", "Fitness Centre", "24/7 Security", "Landscaped Areas", "Parking Spaces", "Retail Outlets", "Kids Play Area", "Lobby"],
  nearbyAttractions: [
    { name: "Mall of the Emirates", type: "mall", distance: "10 min drive" },
    { name: "Dubai Miracle Garden", type: "landmark", distance: "5 min drive" },
    { name: "Al Barsha Pond Park", type: "park", distance: "7 min drive" },
    { name: "Mediclinic Parkview Hospital", type: "hospital", distance: "3 min drive" },
    { name: "Dubai Hills Mall", type: "mall", distance: "12 min drive" },
    { name: "Metro Station (planned)", type: "transport", distance: "8 min drive" },
  ],
  faqs: [
    { question: "What is the payment plan?", answer: "10% down payment on booking, 50% during construction in monthly installments, and 40% on handover in Q4 2026." },
    { question: "Who is eligible to buy?", answer: "Binghatti Hillcrest is a freehold development open to all nationalities." },
    { question: "What unit types are available?", answer: "Studio, 1-bedroom, and 2-bedroom apartments ranging from 333 to 1,028 sq ft." },
    { question: "When is the expected handover?", answer: "Q4 2026, subject to construction progress and regulatory approvals." },
    { question: "Is this Golden Visa eligible?", answer: "Units valued at AED 2M+ qualify for the UAE Golden Visa." },
  ],
  downPayment: "10%",
  paymentPlanSummary: "10/50/40 Payment Plan",
  paymentPlanDetails: "10% on booking, 50% during construction in monthly installments, 40% on handover (Q4 2026).",
  floorPlans: [
    { bedrooms: "Studio", category: "Studio", size: "346 – 367 Sq Ft", unitInfo: "346 – 367 Sq Ft", imageUrl: "https://manage.tanamiproperties.com/Project/Floor_Image/3136/Gallery/62848.jpg" },
    { bedrooms: "1", category: "1 Bedroom", size: "669 – 718 Sq Ft", unitInfo: "669 – 718 Sq Ft", imageUrl: "https://manage.tanamiproperties.com/Project/Floor_Image/3136/Gallery/62836.jpg" },
    { bedrooms: "2", category: "2 Bedrooms", size: "1,029 – 1,249 Sq Ft", unitInfo: "1,029 – 1,249 Sq Ft", imageUrl: "https://manage.tanamiproperties.com/Project/Floor_Image/3136/Gallery/62834.jpg" },
  ],
  masterPlanImages: ["https://manage.tanamiproperties.com/Project/LayoutPlan/3136/Gallery/3171.webp"],
  brochureUrl: "https://www.tanamiproperties.com/Projects/Binghatti-Hillcrest-Brochure-Download",
  mapUrl: "",
  publishStatus: "Published",
};

function cleanWpHtml(html: string): string {
  if (!html) return "";
  let clean = html;
  clean = clean.replace(/^<h4[^>]*>[\s\S]*?<\/h4>\s*/i, "");
  clean = clean.replace(/[A-Za-z0-9+/=]{40,}/g, "");
  clean = clean.replace(/<[^>]*>(\s*Get Exclusive Access[^<]*)<\/[^>]*>/gi, "");
  clean = clean.replace(/<(\w+)[^>]*>\s*<\/\1>/g, "");
  clean = clean.replace(/ style="[^"]*"/gi, "");
  clean = clean.replace(/\n{3,}/g, "\n\n").trim();
  return clean;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === "binghatti-hillcrest") {
    return { title: "Binghatti Hillcrest | Binayah Properties", description: MOCK_PROJECT.shortOverview };
  }
  try {
    await connectDB();
    const project = await Project.findOne({ slug, publishStatus: "Published" }).lean();
    if (!project) return { title: "Not Found" };
    return {
      title: (project as any).metaTitle || `${(project as any).name} | Binayah Properties`,
      description: (project as any).metaDescription || (project as any).shortOverview,
    };
  } catch {
    return { title: "Binayah Properties" };
  }
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Serve mock project for preview
  if (slug === "binghatti-hillcrest") {
    return <ProjectDetailClient serverProject={MOCK_PROJECT as any} />;
  }

  try {
    await connectDB();
    const project = await Project.findOne({ slug, publishStatus: "Published" }).lean();
    if (!project) notFound();
    const serialized = JSON.parse(JSON.stringify(project));
    if (serialized.fullDescription) serialized.fullDescription = cleanWpHtml(serialized.fullDescription);
    if (serialized.shortOverview) serialized.shortOverview = serialized.shortOverview.replace(/<[^>]*>/g, "").trim();
    return <ProjectDetailClient serverProject={serialized} />;
  } catch {
    notFound();
  }
}