"use client";

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AIPulseBanner from "@/components/AIPulseBanner";
import ValuationStrip from "@/components/ValuationStrip";
import StatsSection from "@/components/StatsSection";
import WhatWeOffer from "@/components/WhatWeOffer";
import FeaturedPropertiesClient from "@/components/FeaturedPropertiesClient";
import CryptoBanner from "@/components/CryptoBanner";
import OffPlanSectionClient from "@/components/OffPlanSectionClient";
import CommunitiesSection from "@/components/CommunitiesSection";
import PropertyMatcher from "@/components/PropertyMatcher";
import MarketDashboard from "@/components/MarketDashboard";
import ROICalculator from "@/components/ROICalculator";
import ValuationCTA from "@/components/ValuationCTA";
import ServicesSection from "@/components/ServicesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import InquirySection from "@/components/InquirySection";
import NewsSection from "@/components/NewsSection";
import NewsletterStrip from "@/components/NewsletterStrip";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import AIChatWidget from "@/components/AIChatWidget";
import ScrollToTop from "@/components/ScrollToTop";

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
      <NewsletterStrip />
      <Footer />
      <WhatsAppButton />
      <AIChatWidget />
      <ScrollToTop />
    </div>
  );
}