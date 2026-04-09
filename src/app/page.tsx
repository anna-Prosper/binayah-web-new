import HomePageClient from "@/components/HomePageClient";

export const dynamic = "force-dynamic";

const FALLBACK_LISTINGS = [
  {
    _id: "fallback-listing-1",
    title: "Luxury 2BR Apartment in Dubai Marina",
    slug: "__fallback__",
    propertyId: "BIN-001",
    listingType: "Sale",
    propertyType: "Apartment",
    bedrooms: 2,
    bathrooms: 2,
    size: 1250,
    sizeUnit: "sqft",
    price: 2400000,
    currency: "AED",
    community: "Dubai Marina",
    city: "Dubai",
    featuredImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop",
    imageGallery: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop"],
  },
];

const FALLBACK_PROJECTS = [
  {
    _id: "fallback-project-1",
    name: "Binghatti Hillcrest",
    slug: "binghatti-hillcrest",
    status: "Off-Plan",
    developerName: "Binghatti Developers",
    community: "Arjan",
    city: "Dubai",
    startingPrice: 799999,
    currency: "AED",
    handover: "Q4 2026",
    completionDate: "2026-12-01",
    shortOverview: "Striking modern residential development of studio, 1 & 2-bedroom apartments in Arjan, Dubai.",
    featuredImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop",
    imageGallery: ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop"],
    propertyType: "Apartment",
    unitTypes: ["Studio", "1 BR", "2 BR"],
    unitSizeMin: 333,
    unitSizeMax: 1028,
  },
,
  {
    _id: "fallback-project-2",
    name: "Emaar Beachfront",
    slug: "binghatti-hillcrest",
    status: "Off-Plan",
    developerName: "Emaar Properties",
    community: "Dubai Harbour",
    city: "Dubai",
    startingPrice: 1850000,
    currency: "AED",
    handover: "Q2 2027",
    featuredImage: "https://images.unsplash.com/photo-1582407947304-fd86f28320c5?w=800&h=600&fit=crop",
    imageGallery: ["https://images.unsplash.com/photo-1582407947304-fd86f28320c5?w=800&h=600&fit=crop"],
    propertyType: "Apartment",
  },
  {
    _id: "fallback-project-3",
    name: "Sobha Hartland II",
    slug: "binghatti-hillcrest",
    status: "Off-Plan",
    developerName: "Sobha Realty",
    community: "MBR City",
    city: "Dubai",
    startingPrice: 1200000,
    currency: "AED",
    handover: "Q1 2027",
    featuredImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop",
    imageGallery: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop"],
    propertyType: "Apartment",
  },
  {
    _id: "fallback-project-4",
    name: "Tilal Al Ghaf Villas",
    slug: "binghatti-hillcrest",
    status: "Off-Plan",
    developerName: "Majid Al Futtaim",
    community: "Tilal Al Ghaf",
    city: "Dubai",
    startingPrice: 3500000,
    currency: "AED",
    handover: "Q3 2026",
    featuredImage: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
    imageGallery: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop"],
    propertyType: "Villa",
  },
];

const FALLBACK_ARTICLES = [
  {
    _id: "fallback-article-1",
    title: "Best Off-Plan Under AED 2 Million — Golden Visa Eligible",
    slug: "best-offplan-under-2m",
    category: "Investment",
    featuredImage: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop",
    publishedAt: "2026-02-09",
  },
  {
    _id: "fallback-article-2",
    title: "Tax Benefits of Owning Property in Dubai — The Complete Picture",
    slug: "tax-benefits-dubai-property",
    category: "Guides",
    featuredImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop",
    publishedAt: "2026-02-07",
  },
  {
    _id: "fallback-article-3",
    title: "Is Dubai Property a Good Investment in 2026?",
    slug: "dubai-property-investment-2026",
    category: "Market Insights",
    featuredImage: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&h=360&fit=crop",
    publishedAt: "2026-02-07",
  },
];

export default async function HomePage() {
  let listings = FALLBACK_LISTINGS as any[];
  let projects = FALLBACK_PROJECTS as any[];
  let articles = FALLBACK_ARTICLES as any[];

  try {
    const { connectDB } = await import("@/lib/mongodb");
    const Project = (await import("@/models/Project")).default;
    const Listing = (await import("@/models/Listing")).default;
    const Article = (await import("@/models/Article")).default;

    await connectDB();

    const PROJECT_CARD = "name slug status developerName community city startingPrice completionDate shortOverview featuredImage imageGallery propertyType unitTypes unitSizeMin unitSizeMax currency handover";
    const LISTING_CARD = "title slug propertyId listingType propertyType bedrooms bathrooms size sizeUnit price currency community city featuredImage imageGallery";
    const ARTICLE_CARD = "title slug category featuredImage publishedAt";

    const [dbListings, dbProjects, dbArticles] = await Promise.all([
      Listing.find({ publishStatus: "Published" }).select(LISTING_CARD).sort({ createdAt: -1 }).limit(3).lean(),
      Project.find({ publishStatus: "published" }).select(PROJECT_CARD).sort({ createdAt: -1 }).limit(4).lean(),
      Article.find({ publishStatus: "Published", $or: [{ content: { $regex: /\S/ } }, { excerpt: { $regex: /\S/ } }] })
        .select(ARTICLE_CARD).sort({ createdAt: -1 }).limit(3).lean(),
    ]);

    if (dbListings.length > 0) listings = dbListings as any[];
    if (dbProjects.length > 0) projects = dbProjects as any[];
    if (dbArticles.length > 0) articles = dbArticles as any[];
  } catch (err) {
    console.warn("[HomePage] DB unavailable, using fallback data:", (err as Error).message);
  }

  return (
    <HomePageClient
      featuredListings={JSON.parse(JSON.stringify(listings)).filter(Boolean)}
      offPlanProjects={JSON.parse(JSON.stringify(projects)).filter(Boolean)}
      latestArticles={JSON.parse(JSON.stringify(articles)).filter(Boolean)}
    />
  );
}