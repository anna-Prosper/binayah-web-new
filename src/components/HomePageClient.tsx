"use client";

import dynamic from "next/dynamic";
// Above-the-fold: loaded eagerly
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AIPulseBanner from "@/components/AIPulseBanner";
import LazyMount from "@/components/LazyMount";

// Below-the-fold: code-split and lazy-loaded
const FAQSection           = dynamic(() => import("@/components/FAQSection"));
const MortgageCalculator   = dynamic(() => import("@/components/MortgageCalculator"));
const CookieConsent        = dynamic(() => import("@/components/CookieConsent"));
const PropertyComparison   = dynamic(() => import("@/components/PropertyComparison"));
const ValuationStrip       = dynamic(() => import("@/components/ValuationStrip"));
const StatsSection         = dynamic(() => import("@/components/StatsSection"));
const WhatWeOffer          = dynamic(() => import("@/components/WhatWeOffer"));
const FeaturedPropertiesClient = dynamic(() => import("@/components/FeaturedPropertiesClient"));
const CryptoBanner         = dynamic(() => import("@/components/CryptoBanner"));
const OffPlanSectionClient = dynamic(() => import("@/components/OffPlanSectionClient"));
const CommunitiesSection   = dynamic(() => import("@/components/CommunitiesSection"));
const PropertyMatcher      = dynamic(() => import("@/components/PropertyMatcher"));
const MarketDashboard      = dynamic(() => import("@/components/MarketDashboard"));
const ROICalculator        = dynamic(() => import("@/components/ROICalculator"));
const ValuationCTA         = dynamic(() => import("@/components/ValuationCTA"));
const ListYourPropertySection = dynamic(() => import("@/components/ListYourPropertySection"));
const ServicesSection      = dynamic(() => import("@/components/ServicesSection"));
const TestimonialsSection  = dynamic(() => import("@/components/TestimonialsSection"));
const InquirySection       = dynamic(() => import("@/components/InquirySection"));
const NewsSection          = dynamic(() => import("@/components/NewsSection"));
const NewsletterStrip      = dynamic(() => import("@/components/NewsletterStrip"));
const Footer               = dynamic(() => import("@/components/Footer"));
const WhatsAppButton       = dynamic(() => import("@/components/WhatsAppButton"));
const AIChatWidget         = dynamic(() => import("@/components/AIChatWidget"));
const ScrollToTop          = dynamic(() => import("@/components/ScrollToTop"));

interface SecondaryListing {
  _id: string;
  title?: string;
  name?: string;
  slug: string;
  listingType?: string;
  propertyType?: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  size?: number | null;
  sizeUnit?: string;
  price?: number | null;
  currency?: string;
  community?: string;
  city?: string;
  featuredImage?: string;
  imageGallery?: string[];
}

interface OffPlanListing {
  _id: string;
  name: string;
  slug: string;
  developerName?: string;
  startingPrice?: number | null;
  community?: string;
  city?: string;
  status?: string;
  propertyType?: string;
  unitTypes?: string[];
  unitSizeMin?: number | null;
  unitSizeMax?: number | null;
  imageGallery?: string[];
  currency?: string;
  handover?: string;
  completionDate?: string;
}

interface Article {
  _id: string;
  title: string;
  slug: string;
  category?: string;
  featuredImage?: string;
  publishedAt?: string;
}

interface HomePageClientProps {
  saleListings?: SecondaryListing[];
  rentalListings?: SecondaryListing[];
  offPlanProjects?: OffPlanListing[];
  latestArticles?: Article[];
}

export default function HomePageClient({ saleListings = [], rentalListings = [], offPlanProjects = [], latestArticles = [] }: HomePageClientProps) {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <AIPulseBanner />
      <ValuationStrip />
      <StatsSection />
      <WhatWeOffer />
      <FeaturedPropertiesClient saleListings={saleListings} rentalListings={rentalListings} />
      <CryptoBanner />
      <OffPlanSectionClient projects={offPlanProjects} />
      <CommunitiesSection />
      <PropertyMatcher />
      <LazyMount minHeight={600}><MarketDashboard /></LazyMount>
      <LazyMount minHeight={420}><ROICalculator /></LazyMount>
      <ValuationCTA />
      <ListYourPropertySection />
      <ServicesSection />
      <TestimonialsSection />
      <InquirySection />
      <NewsSection articles={latestArticles} />
      <LazyMount minHeight={520}><MortgageCalculator /></LazyMount>
      <LazyMount minHeight={400}><FAQSection /></LazyMount>
      <NewsletterStrip />
      <Footer />
      <WhatsAppButton />
      <AIChatWidget />
      <CookieConsent />
      <PropertyComparison />
      <ScrollToTop />
    </div>
  );
}