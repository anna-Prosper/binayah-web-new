"use client";

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AIPulseBanner from "@/components/AIPulseBanner";
import ValuationStrip from "@/components/ValuationStrip";
import StatsSection from "@/components/StatsSection";
import WhatWeOffer from "@/components/WhatWeOffer";
import FeaturedPropertiesClient from "@/components/FeaturedPropertiesServer";
import OffPlanSectionClient from "@/components/OffPlanSectionServer";
import CommunitiesSection from "@/components/CommunitiesSection";
import PropertyMatcher from "@/components/PropertyMatcher";
import MarketDashboard from "@/components/MarketDashboard";
import ROICalculator from "@/components/ROICalculator";
import ValuationCTA from "@/components/ValuationCTA";
import ServicesSection from "@/components/ServicesSection";
import DevelopersSection from "@/components/DevelopersSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import InquirySection from "@/components/InquirySection";
import NewsSection from "@/components/NewsSection";
import NewsletterStrip from "@/components/NewsletterStrip";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import AIChatWidget from "@/components/AIChatWidget";
import ScrollToTop from "@/components/ScrollToTop";

interface Props {
  featuredListings: any[];
  offPlanProjects: any[];
  latestArticles: any[];
  developerLogos?: Record<string, string>;
}

export default function HomePageClient({ featuredListings, offPlanProjects, latestArticles, developerLogos }: Props) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <AIPulseBanner />
      <ValuationStrip />
      <StatsSection />
      <WhatWeOffer />
      <FeaturedPropertiesClient listings={featuredListings} />
      <OffPlanSectionClient projects={offPlanProjects} />
      <CommunitiesSection />
      <PropertyMatcher />
      <MarketDashboard />
      <ROICalculator />
      <ValuationCTA />
      <ServicesSection />
      <DevelopersSection logos={developerLogos} />
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