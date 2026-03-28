import { connectDB } from "@/lib/mongodb";
import Developer from "@/models/Developer";
import Project from "@/models/Project";
import DeveloperDetailClient from "./DeveloperDetailClient";
import { notFound } from "next/navigation";

export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function DeveloperDetailPage({ params }: Props) {
  const { slug } = await params;
  await connectDB();

  const developer = await Developer.findOne({
    slug,
    publishStatus: "Published",
  }).lean();

  if (!developer) return notFound();

  // Use case-insensitive regex to match developerName in projects
  // This handles mismatches like "Deniz Development" vs "Deniz Developments"
  const escapedName = developer.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const projects = await Project.find({
    publishStatus: "Published",
    developerName: { $regex: new RegExp(`^${escapedName}`, "i") },
  })
    .select(
      "name slug status community startingPrice completionDate featuredImage imageGallery propertyType developerName"
    )
    .sort({ createdAt: -1 })
    .lean();

  return (
    <DeveloperDetailClient
      developer={JSON.parse(JSON.stringify(developer))}
      projects={JSON.parse(JSON.stringify(projects))}
    />
  );
}
