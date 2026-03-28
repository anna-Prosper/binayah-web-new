import { connectDB } from "@/lib/mongodb";
import Developer from "@/models/Developer";
import Project from "@/models/Project";
import DevelopersPageClient from "./DevelopersPageClient";

export const revalidate = 300;

export default async function DevelopersPage() {
  await connectDB();

  const [rawDevelopers, totalCount, projectCounts] = await Promise.all([
    Developer.find({ publishStatus: "Published" })
      .select("name slug logo description")
      .sort({ name: 1 })
      .lean(),
    Developer.countDocuments({ publishStatus: "Published" }),
    Project.aggregate([
      { $match: { publishStatus: "Published" } },
      { $group: { _id: "$developerName", count: { $sum: 1 } } },
    ]),
  ]);

  // Serialize lean docs to plain objects first
  const developers = JSON.parse(JSON.stringify(rawDevelopers));

  // Build count map
  const countMap = new Map<string, number>();
  for (const pc of projectCounts) {
    if (pc._id) countMap.set(pc._id.toLowerCase(), pc.count);
  }

  // Merge real counts and sort by project count desc
  const withCounts = developers.map((dev: any) => ({
    ...dev,
    projectCount: countMap.get((dev.name || "").toLowerCase()) || 0,
  }));
  withCounts.sort(
    (a: any, b: any) =>
      b.projectCount - a.projectCount ||
      (a.name || "").localeCompare(b.name || "")
  );

  return (
    <DevelopersPageClient
      initialDevelopers={withCounts}
      totalCount={totalCount}
    />
  );
}
