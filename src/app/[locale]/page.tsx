import HomePageClient from "@/components/HomePageClient";
import { serverApiUrl, serverFetch } from "@/lib/api";

export const revalidate = 300;

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
    featuredImage: "/assets/amenities-placeholder.webp",
    imageGallery: ["/assets/amenities-placeholder.webp"],
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
    featuredImage: "/assets/dubai-hero.webp",
    imageGallery: ["/assets/dubai-hero.webp"],
    propertyType: "Apartment",
    unitTypes: ["Studio", "1 BR", "2 BR"],
    unitSizeMin: 333,
    unitSizeMax: 1028,
  },
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
    featuredImage: "/assets/dubai-hero.webp",
    imageGallery: ["/assets/dubai-hero.webp"],
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
    featuredImage: "/assets/dubai-hero.webp",
    imageGallery: ["/assets/dubai-hero.webp"],
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
    featuredImage: "/assets/amenities-placeholder.webp",
    imageGallery: ["/assets/amenities-placeholder.webp"],
    propertyType: "Villa",
  },
];

const FALLBACK_ARTICLES = [
  {
    _id: "fallback-article-1",
    title: "Best Off-Plan Under AED 2 Million — Golden Visa Eligible",
    slug: "best-offplan-under-2m",
    category: "Investment",
    featuredImage: "/assets/dubai-hero.webp",
    publishedAt: "2026-02-09",
  },
  {
    _id: "fallback-article-2",
    title: "Tax Benefits of Owning Property in Dubai — The Complete Picture",
    slug: "tax-benefits-dubai-property",
    category: "Guides",
    featuredImage: "/assets/dubai-hero.webp",
    publishedAt: "2026-02-07",
  },
  {
    _id: "fallback-article-3",
    title: "Is Dubai Property a Good Investment in 2026?",
    slug: "dubai-property-investment-2026",
    category: "Market Insights",
    featuredImage: "/assets/dubai-hero.webp",
    publishedAt: "2026-02-07",
  },
];

export default async function HomePage() {
  let listings = FALLBACK_LISTINGS as any[];
  let projects = FALLBACK_PROJECTS as any[];
  let articles = FALLBACK_ARTICLES as any[];

  try {
    const [projectsRes, listingsRes, articlesRes] = await Promise.all([
      serverFetch(serverApiUrl("/api/projects?limit=4")),
      serverFetch(serverApiUrl("/api/listings?limit=3")),
      serverFetch(serverApiUrl("/api/news?limit=3")),
    ]);

    if (projectsRes.ok) {
      const dbProjects = await projectsRes.json();
      if (dbProjects.length > 0) projects = dbProjects;
    }
    if (listingsRes.ok) {
      const dbListings = await listingsRes.json();
      if (dbListings.length > 0) listings = dbListings;
    }
    if (articlesRes.ok) {
      const dbArticles = await articlesRes.json();
      if (dbArticles.length > 0) articles = dbArticles;
    }
  } catch (err) {
    console.warn("[HomePage] API unavailable, using fallback data:", (err as Error).message);
  }

  return (
    <HomePageClient
      featuredListings={listings.filter(Boolean)}
      offPlanProjects={projects.filter(Boolean)}
      latestArticles={articles.filter(Boolean)}
    />
  );
}
