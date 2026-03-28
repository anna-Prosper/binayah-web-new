"use client";

import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AIPulseBanner from "@/components/AIPulseBanner";
import ValuationBanner from "@/components/ValuationBanner";   // ← NEW (strip after AIPulseBanner)
import StatsSection from "@/components/StatsSection";
import FeaturedPropertiesClient from "@/components/FeaturedPropertiesServer";
import OffPlanSectionClient from "@/components/OffPlanSectionServer";
import CommunitiesSection from "@/components/CommunitiesSection";
import PropertyMatcher from "@/components/PropertyMatcher";
import ValuationEntry from "@/components/ValuationEntry";      // ← NEW (tool section)
import MarketDashboard from "@/components/MarketDashboard";
import ROICalculator from "@/components/ROICalculator";
import DevelopersSection from "@/components/DevelopersSection";
import ServicesSection from "@/components/ServicesSection";
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
      <ValuationBanner />           {/* High-visibility owner prompt, right below the AI bar */}
      <StatsSection />
      <FeaturedPropertiesClient listings={featuredListings} />
      <OffPlanSectionClient projects={offPlanProjects} />
      <CommunitiesSection />
      <PropertyMatcher />
      <ValuationEntry />             {/* Full tool explainer + mock result + CTA, in the tools zone */}
      <MarketDashboard />
      <ROICalculator />
      <DevelopersSection logos={developerLogos} />
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
