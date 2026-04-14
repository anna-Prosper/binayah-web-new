import { connectDB } from "./mongodb";
import Project from "@/models/Project";
import Building from "@/models/Building";
import Listing from "@/models/Listing";
import Community from "@/models/Community";
import Article from "@/models/Article";
import Developer from "@/models/Developer";
import Agent from "@/models/Agent";
import ConstructionUpdate from "@/models/ConstructionUpdate";
import { cache } from "react";

// ═══════════════════════════════════════════════
// PROJECTS
// ═══════════════════════════════════════════════

const PROJECT_BASE = {
  publishStatus: "published",
  featuredImage: { $exists: true, $nin: [null, ""] },
};

export const getPublishedProjects = cache(async (limit?: number) => {
  await connectDB();
  const query = Project.find(PROJECT_BASE)
    .sort({ createdAt: -1 })
    .lean();
  if (limit) query.limit(limit);
  return query;
});

export const getProjectBySlug = cache(async (slug: string) => {
  await connectDB();
  return Project.findOne({ slug, publishStatus: "published" }).lean();
});

export const getProjectsByCity = cache(async (city: string, limit?: number) => {
  await connectDB();
  const query = Project.find({ ...PROJECT_BASE, city })
    .sort({ createdAt: -1 })
    .lean();
  if (limit) query.limit(limit);
  return query;
});

export const getProjectsByCommunity = cache(async (community: string) => {
  await connectDB();
  return Project.find({ ...PROJECT_BASE, community })
    .sort({ createdAt: -1 })
    .lean();
});

export const getProjectsByDeveloper = cache(async (developerName: string) => {
  await connectDB();
  return Project.find({ ...PROJECT_BASE, developerName })
    .sort({ createdAt: -1 })
    .lean();
});

export const getProjectsByStatus = cache(async (status: string, limit?: number) => {
  await connectDB();
  const query = Project.find({ ...PROJECT_BASE, status })
    .sort({ createdAt: -1 })
    .lean();
  if (limit) query.limit(limit);
  return query;
});

export const searchProjects = cache(async (searchTerm: string, limit = 20) => {
  await connectDB();
  return Project.find({
    ...PROJECT_BASE,
    $or: [
      { name: { $regex: searchTerm, $options: "i" } },
      { community: { $regex: searchTerm, $options: "i" } },
      { developerName: { $regex: searchTerm, $options: "i" } },
      { city: { $regex: searchTerm, $options: "i" } },
    ],
  })
    .sort({ viewCount: -1 })
    .limit(limit)
    .lean();
});

export const getFeaturedProjects = cache(async () => {
  return getPublishedProjects(6);
});

export const getOffPlanProjects = cache(async () => {
  return getPublishedProjects(8);
});

// ═══════════════════════════════════════════════
// BUILDINGS
// ═══════════════════════════════════════════════

export const getBuildings = cache(async (limit?: number) => {
  await connectDB();
  const query = Building.find({ publishStatus: "published" })
    .sort({ name: 1 })
    .lean();
  if (limit) query.limit(limit);
  return query;
});

export const getBuildingBySlug = cache(async (slug: string) => {
  await connectDB();
  return Building.findOne({ slug, publishStatus: "published" }).lean();
});

export const getBuildingsByLocation = cache(async (location: string) => {
  await connectDB();
  return Building.find({ publishStatus: "published", location })
    .sort({ name: 1 })
    .lean();
});

// ═══════════════════════════════════════════════
// LISTINGS
// ═══════════════════════════════════════════════

export const getListings = cache(async (limit?: number) => {
  await connectDB();
  const query = Listing.find({ publishStatus: "published" })
    .sort({ createdAt: -1 })
    .lean();
  if (limit) query.limit(limit);
  return query;
});

export const getListingBySlug = cache(async (slug: string) => {
  await connectDB();
  return Listing.findOne({ slug, publishStatus: "published" }).lean();
});

export const getListingsByType = cache(async (listingType: string, limit?: number) => {
  await connectDB();
  const query = Listing.find({ publishStatus: "published", listingType })
    .sort({ createdAt: -1 })
    .lean();
  if (limit) query.limit(limit);
  return query;
});

export const getListingsByCommunity = cache(async (community: string) => {
  await connectDB();
  return Listing.find({ publishStatus: "published", community })
    .sort({ createdAt: -1 })
    .lean();
});

// ═══════════════════════════════════════════════
// COMMUNITIES
// ═══════════════════════════════════════════════

export const getCommunities = cache(async () => {
  await connectDB();
  return Community.find({ publishStatus: "published" })
    .sort({ name: 1 })
    .lean();
});

export const getCommunityBySlug = cache(async (slug: string) => {
  await connectDB();
  return Community.findOne({ slug, publishStatus: "published" }).lean();
});

// ═══════════════════════════════════════════════
// ARTICLES
// ═══════════════════════════════════════════════

export const getArticles = cache(async (limit?: number) => {
  await connectDB();
  const query = Article.find({ publishStatus: "published" })
    .sort({ createdAt: -1 })
    .lean();
  if (limit) query.limit(limit);
  return query;
});

export const getArticleBySlug = cache(async (slug: string) => {
  await connectDB();
  return Article.findOne({ slug, publishStatus: "published" }).lean();
});

export const getArticlesByCategory = cache(async (category: string, limit?: number) => {
  await connectDB();
  const query = Article.find({ publishStatus: "published", category })
    .sort({ createdAt: -1 })
    .lean();
  if (limit) query.limit(limit);
  return query;
});

// ═══════════════════════════════════════════════
// DEVELOPERS
// ═══════════════════════════════════════════════

export const getDevelopers = cache(async () => {
  await connectDB();
  return Developer.find({ publishStatus: "published" })
    .sort({ name: 1 })
    .lean();
});

export const getDeveloperBySlug = cache(async (slug: string) => {
  await connectDB();
  return Developer.findOne({ slug, publishStatus: "published" }).lean();
});

export const getDeveloperWithProjects = cache(async (slug: string) => {
  await connectDB();
  const developer = await Developer.findOne({ slug, publishStatus: "published" }).lean();
  if (!developer) return null;
  const projects = await Project.find({
    ...PROJECT_BASE,
    developerName: developer.name,
  })
    .sort({ createdAt: -1 })
    .lean();
  return { developer, projects };
});

// ═══════════════════════════════════════════════
// AGENTS
// ═══════════════════════════════════════════════

export const getAgents = cache(async () => {
  await connectDB();
  return Agent.find({ publishStatus: "published" })
    .sort({ name: 1 })
    .lean();
});

export const getAgentBySlug = cache(async (slug: string) => {
  await connectDB();
  return Agent.findOne({ slug, publishStatus: "published" }).lean();
});

// ═══════════════════════════════════════════════
// CONSTRUCTION UPDATES
// ═══════════════════════════════════════════════

export const getConstructionUpdates = cache(async (limit?: number) => {
  await connectDB();
  const query = ConstructionUpdate.find()
    .sort({ publishedAt: -1 })
    .lean();
  if (limit) query.limit(limit);
  return query;
});

export const getConstructionUpdateBySlug = cache(async (slug: string) => {
  await connectDB();
  return ConstructionUpdate.findOne({ slug }).lean();
});

export const getConstructionUpdatesByDeveloper = cache(async (developerName: string) => {
  await connectDB();
  return ConstructionUpdate.find({ developerName })
    .sort({ progress: 1 })
    .lean();
});

// ═══════════════════════════════════════════════
// COUNTS & STATS
// ═══════════════════════════════════════════════

export const getStats = cache(async () => {
  await connectDB();
  const [projectCount, buildingCount, listingCount, communityCount, developerCount] =
    await Promise.all([
      Project.countDocuments({ publishStatus: "published" }),
      Building.countDocuments({ publishStatus: "published" }),
      Listing.countDocuments({ publishStatus: "published" }),
      Community.countDocuments({ publishStatus: "published" }),
      Developer.countDocuments({ publishStatus: "published" }),
    ]);
  return { projectCount, buildingCount, listingCount, communityCount, developerCount };
});
