import OffPlanPageClient from "@/app/off-plan/OffPlanPageClient";

export const metadata = {
  title: "Off-Plan Properties in Dubai | Binayah Properties",
  description: "Discover Dubai's best off-plan developments. High-ROI projects in prime locations with flexible payment plans. Browse with Binayah Properties.",
};
import { serverApiUrl, serverFetch } from "@/lib/api";

export const revalidate = 300;

const BATCH_SIZE = 12;

const FALLBACK_PROJECTS = [
  { _id: "fallback-1", name: "Binghatti Hillcrest", slug: "__fallback__", status: "Off-Plan", developerName: "Binghatti Developers", community: "Arjan", startingPrice: 799999, completionDate: "2026-12-01", shortOverview: "Studio, 1 & 2-bedroom apartments in Arjan, Dubai combining modern architectural elegance with urban living.", featuredImage: "/assets/dubai-hero.webp", imageGallery: ["/assets/dubai-hero.webp"] },
  { _id: "fallback-2", name: "Emaar Beachfront", slug: "__fallback__", status: "Off-Plan", developerName: "Emaar Properties", community: "Dubai Harbour", startingPrice: 1850000, completionDate: "2027-06-01", shortOverview: "Stunning beachfront residences with panoramic sea views in Dubai Harbour.", featuredImage: "/assets/dubai-hero.webp", imageGallery: ["/assets/dubai-hero.webp"] },
  { _id: "fallback-3", name: "Sobha Hartland II", slug: "__fallback__", status: "Off-Plan", developerName: "Sobha Realty", community: "MBR City", startingPrice: 1200000, completionDate: "2027-03-01", shortOverview: "Premium residences surrounded by an 8 million sq ft greenbelt in Mohammed Bin Rashid City.", featuredImage: "/assets/dubai-hero.webp", imageGallery: ["/assets/dubai-hero.webp"] },
  { _id: "fallback-4", name: "Tilal Al Ghaf Villas", slug: "__fallback__", status: "Off-Plan", developerName: "Majid Al Futtaim", community: "Tilal Al Ghaf", startingPrice: 3500000, completionDate: "2026-09-01", shortOverview: "Luxury villas surrounding a crystal lagoon with world-class amenities.", featuredImage: "/assets/amenities-placeholder.webp", imageGallery: ["/assets/amenities-placeholder.webp"] },
];

// URL-synced load-more: ?page=N renders N*BATCH_SIZE projects on initial SSR so
// (a) Google indexes every page, (b) deep-linking back to "page 3" works after
// the user closes a tab, (c) browser back from a project detail returns to the
// correct scroll position. Click "Load more" → router.replace updates the URL
// to ?page=N+1 and fetches one more batch on top.
export default async function OffPlanPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Math.min(50, parseInt(sp.page ?? "1") || 1));
  const limit = page * BATCH_SIZE;

  let initialProjects = FALLBACK_PROJECTS as any[];
  let totalCount = FALLBACK_PROJECTS.length;

  try {
    const res = await serverFetch(serverApiUrl(`/api/projects?limit=${limit}`));
    if (res.ok) {
      const dbProjects = await res.json();
      if (dbProjects.length > 0) {
        initialProjects = dbProjects;
        // Upper-bound estimate; the client confirms when batches return empty.
        totalCount = dbProjects.length === limit ? Math.max(500, limit) : dbProjects.length;
      }
    }
  } catch (err) {
    console.warn("[OffPlanPage] API unavailable, using fallback:", (err as Error).message);
  }

  return (
    <OffPlanPageClient
      initialProjects={JSON.parse(JSON.stringify(initialProjects))}
      totalCount={totalCount}
      initialPage={page}
      batchSize={BATCH_SIZE}
    />
  );
}
