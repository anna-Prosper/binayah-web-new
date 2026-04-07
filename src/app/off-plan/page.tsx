import OffPlanPageClient from "./OffPlanPageClient";

export const revalidate = 60;

const FALLBACK_PROJECTS = [
  {
    _id: "fallback-1",
    name: "Binghatti Hillcrest",
    slug: "__fallback__",
    status: "Off-Plan",
    developerName: "Binghatti Developers",
    community: "Arjan",
    startingPrice: 799999,
    completionDate: "2026-12-01",
    shortOverview: "Studio, 1 & 2-bedroom apartments in Arjan, Dubai combining modern architectural elegance with urban living.",
    featuredImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop",
    imageGallery: ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop"],
  },
  {
    _id: "fallback-2",
    name: "Emaar Beachfront",
    slug: "__fallback__",
    status: "Off-Plan",
    developerName: "Emaar Properties",
    community: "Dubai Harbour",
    startingPrice: 1850000,
    completionDate: "2027-06-01",
    shortOverview: "Stunning beachfront residences with panoramic sea views in Dubai Harbour.",
    featuredImage: "https://images.unsplash.com/photo-1582407947304-fd86f28320c5?w=800&h=600&fit=crop",
    imageGallery: ["https://images.unsplash.com/photo-1582407947304-fd86f28320c5?w=800&h=600&fit=crop"],
  },
  {
    _id: "fallback-3",
    name: "Sobha Hartland II",
    slug: "__fallback__",
    status: "Off-Plan",
    developerName: "Sobha Realty",
    community: "MBR City",
    startingPrice: 1200000,
    completionDate: "2027-03-01",
    shortOverview: "Premium residences surrounded by an 8 million sq ft greenbelt in Mohammed Bin Rashid City.",
    featuredImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop",
    imageGallery: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop"],
  },
  {
    _id: "fallback-4",
    name: "Tilal Al Ghaf Villas",
    slug: "__fallback__",
    status: "Off-Plan",
    developerName: "Majid Al Futtaim",
    community: "Tilal Al Ghaf",
    startingPrice: 3500000,
    completionDate: "2026-09-01",
    shortOverview: "Luxury villas surrounding a crystal lagoon with world-class amenities.",
    featuredImage: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
    imageGallery: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop"],
  },
];

export default async function OffPlanPage() {
  let initialProjects = FALLBACK_PROJECTS as any[];
  let totalCount = FALLBACK_PROJECTS.length;

  try {
    const { connectDB } = await import("@/lib/mongodb");
    const Project = (await import("@/models/Project")).default;

    await connectDB();

    const CARD_FIELDS = "name slug status developerName community startingPrice completionDate shortOverview featuredImage imageGallery";

    const [dbProjects, dbCount] = await Promise.all([
      Project.find({ publishStatus: "Published" })
        .select(CARD_FIELDS)
        .sort({ createdAt: -1 })
        .limit(12)
        .lean(),
      Project.countDocuments({ publishStatus: "Published" }),
    ]);

    if (dbProjects.length > 0) {
      initialProjects = dbProjects as any[];
      totalCount = dbCount;
    }
  } catch (err) {
    console.warn("[OffPlanPage] DB unavailable, using fallback:", (err as Error).message);
  }

  return (
    <OffPlanPageClient
      initialProjects={JSON.parse(JSON.stringify(initialProjects))}
      totalCount={totalCount}
    />
  );
}