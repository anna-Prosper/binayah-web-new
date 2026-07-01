"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
// Above-the-fold: loaded eagerly
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AIPulseBanner from "@/components/AIPulseBanner";
import LazyMount from "@/components/LazyMount";
import DeferUntilIdle from "@/components/DeferUntilIdle";
import type { GoogleReviewsData } from "@/lib/googleReviews";

// Below-the-fold: code-split and lazy-loaded
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
  googleReviews?: GoogleReviewsData | null;
  // Server-rendered slots (real visible HTML, crawlable without JS).
  introSlot?: ReactNode;
  faqSlot?: ReactNode;
}

export default function HomePageClient({ saleListings = [], rentalListings = [], offPlanProjects = [], latestArticles = [], googleReviews = null, introSlot = null, faqSlot = null }: HomePageClientProps) {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <main>
        {/* Above-the-fold: keep eager so LCP isn't gated on hydration */}
        <HeroSection />
        <AIPulseBanner />

        {/* Inventory first — surface real listings + off-plan projects right after the
            hero, before the valuation tool (visitors come to browse properties). */}
        <LazyMount minHeight={720}><FeaturedPropertiesClient saleListings={saleListings} rentalListings={rentalListings} /></LazyMount>
        <ValuationStrip />
        <LazyMount minHeight={720}><OffPlanSectionClient projects={offPlanProjects} /></LazyMount>
        <LazyMount minHeight={180}><CryptoBanner /></LazyMount>

        {/* Below-fold: defer hydration via IntersectionObserver — slashes initial TBT */}
        <LazyMount minHeight={400}><WhatWeOffer /></LazyMount>
        <LazyMount minHeight={520}><CommunitiesSection /></LazyMount>
        <LazyMount minHeight={520}><PropertyMatcher /></LazyMount>
        <LazyMount minHeight={600}><MarketDashboard /></LazyMount>
        <LazyMount minHeight={420}><ROICalculator /></LazyMount>
        <LazyMount minHeight={240}><ValuationCTA /></LazyMount>
        <LazyMount minHeight={320}><ListYourPropertySection /></LazyMount>
        <LazyMount minHeight={520}><ServicesSection /></LazyMount>
        {googleReviews && <LazyMount minHeight={600}><TestimonialsSection data={googleReviews} /></LazyMount>}
        <LazyMount minHeight={600}><StatsSection /></LazyMount>
        <LazyMount minHeight={680}><InquirySection /></LazyMount>
        <LazyMount minHeight={520}><NewsSection articles={latestArticles} /></LazyMount>
        <LazyMount minHeight={520}><MortgageCalculator /></LazyMount>
        {/* Server-rendered FAQ (crawlable HTML, matches FAQPage schema, zero JS) */}
        {faqSlot}
        {/* Server-rendered intro copy near the page foot: keeps a plain-prose
            business-context paragraph in the initial HTML for non-JS crawlers
            (LLM answer engines) without occupying prime above-the-fold space. */}
        {introSlot}
        <LazyMount minHeight={120}><NewsletterStrip /></LazyMount>
      </main>
      <LazyMount minHeight={0}><Footer /></LazyMount>

      {/* Primary support widgets — always mounted so Live Chat / WhatsApp
          buttons elsewhere on the page have their handlers attached. JS
          payload is already lazy-loaded via dynamic() so this doesn't
          impact LCP. */}
      <WhatsAppButton />
      <AIChatWidget />

      {/* Non-essential overlays — defer until after page settles */}
      <DeferUntilIdle><ScrollToTop /></DeferUntilIdle>
      <DeferUntilIdle><CookieConsent /></DeferUntilIdle>
      <DeferUntilIdle><PropertyComparison /></DeferUntilIdle>
    </div>
  );
}