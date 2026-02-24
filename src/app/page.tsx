import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";
import Listing from "@/models/Listing";
import Article from "@/models/Article";
import HomePageClient from "@/components/HomePageClient";

export const revalidate = 60;

const PROJECT_CARD = "name slug status developerName community city startingPrice completionDate shortOverview featuredImage imageGallery propertyType";
const LISTING_CARD = "title slug propertyId listingType propertyType bedrooms bathrooms size sizeUnit price currency community city featuredImage imageGallery";
const ARTICLE_CARD = "title slug category featuredImage publishedAt";

export default async function HomePage() {
  await connectDB();

  const [listings, projects, articles] = await Promise.all([
    Listing.find({ publishStatus: "Published" })
      .select(LISTING_CARD)
      .sort({ createdAt: -1 })
      .limit(3)
      .lean(),
    Project.find({ publishStatus: "Published" })
      .select(PROJECT_CARD)
      .sort({ createdAt: -1 })
      .limit(4)
      .lean(),
    Article.find({
      publishStatus: "Published",
      $or: [
        { content: { $regex: /\S/ } },
        { excerpt: { $regex: /\S/ } },
      ],
    })
      .select(ARTICLE_CARD)
      .sort({ createdAt: -1 })
      .limit(3)
      .lean(),
  ]);

  return (
    <HomePageClient
      featuredListings={JSON.parse(JSON.stringify(listings))}
      offPlanProjects={JSON.parse(JSON.stringify(projects))}
      latestArticles={JSON.parse(JSON.stringify(articles))}
    />
  );
}
