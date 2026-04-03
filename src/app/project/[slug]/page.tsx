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
  sizeRange: "333 to 1,028 Sq Ft",
  handover: "Q4 2026",
  ownership: "Freehold",
  totalUnits: "322",
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
  highlights: [
    "Premium development with eye-catching façade and strong modern identity",
    "322 residential units across basement, ground and 4 residential levels",
    "28 integrated retail outlets for community convenience",
    "Thoughtfully designed with open floor plans and natural light",
    "Premium quality finishes with meticulous attention to detail",
    "High investment potential in an emerging Dubai location",
  ],
  amenities: ["Swimming pool", "Fitness centre", "24/7 security", "Landscaped areas", "Parking spaces", "Retail outlets"],
  floorPlans: [
    { title: "Studio", beds: "Studio", size: "346 to 367 Sq Ft", image: "https://manage.tanamiproperties.com/Project/Floor_Image/3136/Gallery/62848.jpg", pdf: "" },
    { title: "1 Bedroom", beds: "1", size: "669 to 718 Sq Ft", image: "https://manage.tanamiproperties.com/Project/Floor_Image/3136/Gallery/62836.jpg", pdf: "" },
    { title: "2 Bedrooms", beds: "2", size: "1,029 to 1,249 Sq Ft", image: "https://manage.tanamiproperties.com/Project/Floor_Image/3136/Gallery/62834.jpg", pdf: "" },
  ],
  paymentPlan: {
    structure: "10/50/40",
    steps: [
      { percent: "10", title: "Down Payment", description: "On Booking Date" },
      { percent: "50", title: "During Construction", description: "Monthly installments" },
      { percent: "40", title: "On Handover", description: "Q4 2026" },
    ],
  },
  masterPlanImage: "https://manage.tanamiproperties.com/Project/LayoutPlan/3136/Gallery/3171.webp",
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