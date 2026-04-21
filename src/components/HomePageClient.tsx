"use client";

import dynamic from "next/dynamic";
// Above-the-fold: loaded eagerly
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AIPulseBanner from "@/components/AIPulseBanner";

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
const ServicesSection      = dynamic(() => import("@/components/ServicesSection"));
const TestimonialsSection  = dynamic(() => import("@/components/TestimonialsSection"));
const InquirySection       = dynamic(() => import("@/components/InquirySection"));
const NewsSection          = dynamic(() => import("@/components/NewsSection"));
const NewsletterStrip      = dynamic(() => import("@/components/NewsletterStrip"));
const Footer               = dynamic(() => import("@/components/Footer"));
const WhatsAppButton       = dynamic(() => import("@/components/WhatsAppButton"));
const AIChatWidget         = dynamic(() => import("@/components/AIChatWidget"));
const ScrollToTop          = dynamic(() => import("@/components/ScrollToTop"));

interface Listing {
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
  featuredListings?: Listing[];
  offPlanProjects?: Listing[];
  latestArticles?: Article[];
}

export default function HomePageClient({ featuredListings = [], offPlanProjects = [], latestArticles = [] }: HomePageClientProps) {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <AIPulseBanner />
      <ValuationStrip />
      <StatsSection />
      <WhatWeOffer />
      <FeaturedPropertiesClient listings={featuredListings} />
      <CryptoBanner />
      <OffPlanSectionClient projects={offPlanProjects} />
      <CommunitiesSection />
      <PropertyMatcher />
      <MarketDashboard />
      <ROICalculator />
      <ValuationCTA />
      <ServicesSection />
      <TestimonialsSection />
      <InquirySection />
      <NewsSection articles={latestArticles} />
      <MortgageCalculator />
      <FAQSection />
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