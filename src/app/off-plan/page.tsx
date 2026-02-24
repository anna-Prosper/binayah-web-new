import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";
import OffPlanPageClient from "./OffPlanPageClient";

export const dynamic = "force-dynamic";

const CARD_FIELDS = "name slug status developerName community startingPrice completionDate shortOverview featuredImage imageGallery";

export default async function OffPlanPage() {
  await connectDB();

  const initialProjects = await Project.find({ publishStatus: "Published" })
    .select(CARD_FIELDS)
    .sort({ createdAt: -1 })
    .limit(12)
    .lean();

  const totalCount = await Project.countDocuments({ publishStatus: "Published" });

  return (
    <OffPlanPageClient
      initialProjects={JSON.parse(JSON.stringify(initialProjects))}
      totalCount={totalCount}
    />
  );
}
