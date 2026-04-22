import OffPlanPageClient from "@/app/off-plan/OffPlanPageClient";

export const metadata = {
  title: "Off-Plan Properties in Dubai | Binayah Properties",
  description: "Discover Dubai's best off-plan developments. High-ROI projects in prime locations with flexible payment plans. Browse with Binayah Properties.",
};
import { serverApiUrl, serverFetch } from "@/lib/api";

export const revalidate = 300;

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
    featuredImage: "/assets/dubai-hero.webp",
    imageGallery: ["/assets/dubai-hero.webp"],
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
    featuredImage: "/assets/dubai-hero.webp",
    imageGallery: ["/assets/dubai-hero.webp"],
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
    featuredImage: "/assets/dubai-hero.webp",
    imageGallery: ["/assets/dubai-hero.webp"],
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
    featuredImage: "/assets/amenities-placeholder.webp",
    imageGallery: ["/assets/amenities-placeholder.webp"],
  },
];

export default async function OffPlanPage() {
  let initialProjects = FALLBACK_PROJECTS as any[];
  let totalCount = FALLBACK_PROJECTS.length;

  try {
    const res = await serverFetch(serverApiUrl("/api/projects?limit=12"));
    if (res.ok) {
      const dbProjects = await res.json();
      if (dbProjects.length > 0) {
        initialProjects = dbProjects;
        // Fetch total count via a large query to get actual total
        // Use a reasonable upper-bound for totalCount so load-more works
        // The client fetches in batches; actual total determined as batches return empty
        totalCount = 500;
      }
    }
  } catch (err) {
    console.warn("[OffPlanPage] API unavailable, using fallback:", (err as Error).message);
  }

  return (
    <OffPlanPageClient
      initialProjects={JSON.parse(JSON.stringify(initialProjects))}
      totalCount={totalCount}
    />
  );
}
