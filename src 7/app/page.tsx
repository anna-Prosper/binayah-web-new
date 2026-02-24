import { connectDB } from "@/lib/mongodb";
import Project from "@/models/Project";
import Listing from "@/models/Listing";
import Article from "@/models/Article";
import Developer from "@/models/Developer";
import HomePageClient from "@/components/HomePageClient";

export const dynamic = "force-dynamic";

const PROJECT_CARD = "name slug status developerName community city startingPrice completionDate shortOverview featuredImage imageGallery propertyType";
const LISTING_CARD = "title slug propertyId listingType propertyType bedrooms bathrooms size sizeUnit price currency community city featuredImage images";
const ARTICLE_CARD = "title slug category featuredImage publishedAt";

export default async function HomePage() {
  await connectDB();

  const [listings, projects, articles, developers] = await Promise.all([
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
    Developer.find({ logo: { $exists: true, $ne: "" } })
      .select("name slug logo")
      .lean(),
  ]);

  // Build a logo map for top developers
  const devLogoMap: Record<string, string> = {};
  (developers as any[]).forEach((d) => {
    if (d.slug && d.logo) devLogoMap[d.slug] = d.logo;
  });

  return (
    <HomePageClient
      featuredListings={JSON.parse(JSON.stringify(listings))}
      offPlanProjects={JSON.parse(JSON.stringify(projects))}
      latestArticles={JSON.parse(JSON.stringify(articles))}
      developerLogos={devLogoMap}
    />
  );
}
