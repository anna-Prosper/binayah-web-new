/* eslint-disable i18next/no-literal-string -- SEO landing page, English-only by design */
/* eslint-disable @next/next/no-img-element -- verified real-estate CDN images */
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { BreadcrumbJsonLd, FAQJsonLd } from "@/components/JsonLd";
import { canonical as makeCanonical, altLangs } from "@/lib/site";
import { Waves, Bike, Trophy, Trees, Anchor, Building2, MapPin, TrendingUp, Shield, Star, ArrowRight, Phone, ChevronRight, CheckCircle } from "lucide-react";

export const revalidate = 86400;

const HERO_IMG = "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/seo/hudayriyat-island-hero.jpg";
const AERIAL_IMG = "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/seo/hudayriyat-island-aerial.jpg";
const OG_IMG = HERO_IMG;

const TITLE = "Hudayriyat Island Property for Sale | Abu Dhabi Freehold | Binayah";
const DESC =
  "Buy freehold property on Hudayriyat Island, Abu Dhabi — villas from AED 6M, apartments from AED 2M. Government-backed developer Modon. 2% transfer fee. 10 min from Abu Dhabi CBD. Expert guidance from Binayah Properties.";

const KEYWORDS =
  "Hudayriyat Island property, buy property Hudayriyat Island, Hudayriyat Island Abu Dhabi, Modon Properties Hudayriyat, freehold Abu Dhabi, Al Naseem villas, Nawayef Hudayriyat, off-plan Abu Dhabi 2025, Hudayriyat Island apartments, Abu Dhabi waterfront property";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: TITLE,
    description: DESC,
    keywords: KEYWORDS,
    alternates: {
      canonical: makeCanonical(locale, "/hudayriyat-island"),
      languages: altLangs("/hudayriyat-island"),
    },
    openGraph: {
      title: TITLE,
      description: DESC,
      type: "website",
      url: makeCanonical(locale, "/hudayriyat-island"),
      siteName: "Binayah Properties",
      locale: "en_AE",
      images: [
        {
          url: OG_IMG,
          width: 1200,
          height: 800,
          alt: "Hudayriyat Island Abu Dhabi — Mediterranean villas with Abu Dhabi skyline",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: TITLE,
      description: DESC,
      images: [OG_IMG],
    },
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  };
}

// ─────────────────────────────────────────────────────────────
// Structured data
// ─────────────────────────────────────────────────────────────

const SCHEMA_ARTICLE = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Hudayriyat Island Property Guide 2025 — Buy Freehold in Abu Dhabi",
  description: DESC,
  image: OG_IMG,
  author: { "@type": "Organization", name: "Binayah Properties", url: "https://www.binayah.ae" },
  publisher: {
    "@type": "Organization",
    name: "Binayah Properties",
    logo: { "@type": "ImageObject", url: "https://www.binayah.ae/assets/binayah-logo.svg" },
  },
  datePublished: "2025-01-01",
  dateModified: "2026-06-01",
};

// ─────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────

const STATS = [
  { value: "AED 11.97B", label: "Q1 2026 Transactions", sub: "#1 in Abu Dhabi" },
  { value: "40–50%", label: "Capital Appreciation", sub: "Recorded by early buyers" },
  { value: "7–9%", label: "Gross Rental Yield", sub: "Coastal Abu Dhabi" },
  { value: "2%", label: "Transfer Fee", sub: "Half of Dubai's rate" },
];

const AMENITIES = [
  { icon: Waves, label: "Surf Abu Dhabi", desc: "World's largest artificial wave pool, all skill levels" },
  { icon: Bike, label: "220 km Cycling", desc: "Official Bike City — dedicated cycle network" },
  { icon: Trophy, label: "Abu Dhabi Velodrome", desc: "International-grade indoor cycling track" },
  { icon: Trees, label: "2.25M sqm Park", desc: "Landscaped urban park & jogging trails" },
  { icon: Anchor, label: "Hudayriyat Marina", desc: "Full-service waterfront marina & mooring" },
  { icon: Waves, label: "Free Public Beaches", desc: "Mar Vista & Al Bateen Beach — free entry" },
  { icon: Building2, label: "321 Sports Dome", desc: "Largest indoor sports dome in the region" },
  { icon: Star, label: "Bab Al Nojoum", desc: "5-star beachfront glamping & eco resort" },
];

const COMMUNITIES = [
  {
    name: "Nawayef Park Views",
    type: "Apartments",
    beds: "1–4 BR",
    priceFrom: "AED 2M",
    handover: "Q1 2028",
    desc: "Mediterranean-inspired residences overlooking the Arabian Gulf and Abu Dhabi skyline. Souq plaza, fine dining, and wellness spaces at your doorstep.",
    img: "https://cdn.prod.website-files.com/65b8ae9b3af43cf735dab067/69329ce567c111d16cb2bf52_6759761015ef38dc475c58d0_Nawayef%2520Park%2520Views.webp",
    tag: "Apartments",
    badge: "From AED 2M",
    tagColor: "#2563EB",
  },
  {
    name: "Bashayer",
    type: "Waterfront Villas & Apartments",
    beds: "1–5 BR",
    priceFrom: "AED 2.35M",
    handover: "Q4 2028–2029",
    desc: "Abu Dhabi's first waterfront island community. 157 villas + 330 apartments, rooftop infinity pool, 3.5 km promenade. Sold out at launch — raising AED 3B.",
    img: "https://cdn.prod.website-files.com/65b8ae9b3af43cf735dab067/69329cd6f5558c90f6eda9dd_6926cae021fc4137d048275b_Bashayer%250.webp",
    tag: "Waterfront",
    badge: "From AED 2.35M",
    tagColor: "#0891B2",
  },
  {
    name: "Al Naseem",
    type: "Standalone Villas",
    beds: "4–6 BR",
    priceFrom: "AED 7.8M",
    handover: "Q4 2027",
    desc: "Signature freestanding villas in South Californian and Modern Contemporary styles. Schools, community centre, pools, and cycling paths all within the community.",
    img: "https://www.modon.com/images/modoncorporatelibraries/real-estate/al-naseem_skyline_1920x1080.jpg",
    tag: "Villas",
    badge: "From AED 7.8M",
    tagColor: "#059669",
  },
  {
    name: "Nawayef Homes",
    type: "Hillside Villas",
    beds: "3–5 BR",
    priceFrom: "AED 6M",
    handover: "Q4 2026–2027",
    desc: "Perched on man-made hills up to 60m high — panoramic views of Abu Dhabi's skyline and the Arabian Gulf. 3,700–5,000 sqft. Unique in the UAE.",
    img: "https://cdn.prod.website-files.com/65b8ae9b3af43cf735dab067/69329cdd77e71177de17491b_66c86ee529c70d65ed7c63d7_65eeb0678d0f6e270a004de0_Nawayef_Mansions_Type5_1%252520(1).webp",
    tag: "Hillside Villas",
    badge: "From AED 6M",
    tagColor: "#D97706",
  },
  {
    name: "Hudayriyat Golf Estates",
    type: "Golf Villas & Townhouses",
    beds: "4–6 BR",
    priceFrom: "AED 4.25M",
    handover: "Q3 2030",
    desc: "Championship golf-course-front villas and townhouses. Resort lifestyle with direct green frontage in the heart of the island's leisure district.",
    img: "https://cdn.prod.website-files.com/65b8ae9b3af43cf735dab067/6a0ee7e2e846da995b0ace83_img33.webp",
    tag: "Golf Villas",
    badge: "From AED 4.25M",
    tagColor: "#065F46",
  },
  {
    name: "Nawayef Mansions",
    type: "Ultra-Luxury Mansions",
    beds: "6–8 BR",
    priceFrom: "AED 25M",
    handover: "2027",
    desc: "The most exclusive addresses in Abu Dhabi. 8,700–29,000 sqft hilltop mansions commanding the island's highest elevations and uninterrupted 360° views.",
    img: AERIAL_IMG,
    tag: "Ultra Luxury",
    badge: "From AED 25M",
    tagColor: "#92400E",
  },
];

const WHY_INVEST = [
  {
    icon: Shield,
    title: "Government-Backed Developer",
    body: "Modon Properties is 84.5% owned by ADQ — Abu Dhabi's sovereign investment arm. The strongest developer guarantee in the UAE.",
  },
  {
    icon: TrendingUp,
    title: "2% Transfer Fee",
    body: "Half of Dubai's 4%. Lower transaction costs improve net ROI for investors and reduce friction at every resale.",
  },
  {
    icon: Star,
    title: "Freehold, All Nationalities",
    body: "100% ownership rights, no restrictions. Properties above AED 2M automatically qualify you for UAE Golden Visa residency.",
  },
  {
    icon: MapPin,
    title: "10 Minutes to City Centre",
    body: "Via Hudayriyat Bridge. 25 minutes to Abu Dhabi International Airport. The closest waterfront freehold to the UAE capital.",
  },
];

const FAQS = [
  {
    question: "Can foreigners buy property on Hudayriyat Island?",
    answer:
      "Yes. Hudayriyat Island is a designated freehold zone open to all nationalities. You receive full ownership rights with a UAE title deed registered with Abu Dhabi's Department of Municipalities and Transport. Properties priced above AED 2 million qualify for the UAE Golden Visa (10-year renewable residency).",
  },
  {
    question: "What is the transfer fee on Hudayriyat Island?",
    answer:
      "Abu Dhabi's property transfer fee is 2% of the purchase price — exactly half of Dubai's 4%. This reduces your entry cost and improves net investment returns on any resale.",
  },
  {
    question: "What types of property are available?",
    answer:
      "Hudayriyat Island offers: apartments (1–4BR, from AED 2M); villas (3–8BR, from AED 6M); golf villas and townhouses (from AED 4.25M); luxury mansions (from AED 25M); ultra-luxury hilltop mansions (AED 41M+). All are developed by government-backed Modon Properties.",
  },
  {
    question: "What rental yields can I expect on Hudayriyat Island?",
    answer:
      "Coastal Abu Dhabi properties typically generate 7–9% gross rental yields. Early buyers on Hudayriyat Island have recorded 40–50% capital appreciation since the island's launch in 2020. Q1 2026 saw AED 11.97B in island transactions — the highest of any area in Abu Dhabi.",
  },
  {
    question: "How far is Hudayriyat Island from Abu Dhabi city centre?",
    answer:
      "10–20 minutes by car via Hudayriyat Bridge. The island sits on Abu Dhabi's western coast opposite Al Bateen. Abu Dhabi International Airport is approximately 25–30 minutes away. A dedicated Surf Abu Dhabi metro/bus link is planned as part of the Abu Dhabi Urban Mobility Master Plan.",
  },
  {
    question: "Is Hudayriyat Island a good investment vs Dubai?",
    answer:
      "Hudayriyat Island offers a lower entry cost to high-quality freehold than comparable Dubai waterfront communities, with a 2% transfer fee vs Dubai's 4%, higher gross yields (7–9% vs Dubai's 5.5–7%), and 40–50% documented capital appreciation for early buyers. The government-backed developer and sovereign-backed land title remove delivery risk entirely.",
  },
];

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

export default async function HudayriyatIslandPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const localePrefix = locale === "en" ? "" : `/${locale}`;

  const breadcrumbs = [
    { name: "Home", href: `${localePrefix}/` },
    { name: "Areas", href: `${localePrefix}/areas` },
    { name: "Hudayriyat Island", href: `${localePrefix}/hudayriyat-island` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA_ARTICLE) }}
      />
      <BreadcrumbJsonLd items={breadcrumbs} />
      <FAQJsonLd faqs={FAQS} />
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative min-h-[95vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={HERO_IMG}
            alt="Hudayriyat Island Abu Dhabi — aerial view of Mediterranean villas with Abu Dhabi skyline"
            className="w-full h-full object-cover"
            fetchPriority="high"
          />
          {/* Multi-stop gradient for depth */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(11,61,46,0.15) 0%, rgba(11,61,46,0.35) 35%, rgba(11,61,46,0.75) 65%, #0B3D2E 100%)",
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-16 sm:pb-28 w-full">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-3 mb-6">
              <span className="h-px w-8 bg-accent" />
              <span className="text-accent text-[11px] font-bold uppercase tracking-[0.35em]">
                Abu Dhabi · Freehold Island · By Modon Properties
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-[4.5rem] font-bold text-white leading-[1.02] mb-5 tracking-tight">
              The Beverly Hills<br />
              <span style={{ color: "#D4A847" }}>of Abu Dhabi</span>
            </h1>

            <p className="text-white/80 text-lg sm:text-xl leading-relaxed mb-3 max-w-2xl">
              Hudayriyat Island — 3,000+ hectares of master-planned coastal living, 10 minutes from Abu Dhabi CBD. Freehold for all nationalities, 2% transfer fee, government-backed developer.
            </p>

            {/* Trust signals row */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-9">
              {["Freehold · All nationalities", "2% transfer fee", "Golden Visa eligible", "Modon (ADQ-backed)"].map((t) => (
                <div key={t} className="flex items-center gap-1.5 text-white/65 text-sm">
                  <CheckCircle className="h-3.5 w-3.5 text-accent flex-shrink-0" />
                  <span>{t}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={`${localePrefix}/contact`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm font-bold text-white transition-all hover:shadow-2xl hover:-translate-y-0.5 whitespace-nowrap"
                style={{ background: "linear-gradient(to right, #D4A847, #B8922F)", boxShadow: "0 4px 20px rgba(212,168,71,0.45)" }}
              >
                Free Investment Consultation <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#communities"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm font-bold text-white border border-white/25 hover:bg-white/10 transition-all whitespace-nowrap"
              >
                View Communities <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-50">
          <div className="w-px h-8 bg-white animate-pulse" />
          <span className="text-white text-[9px] uppercase tracking-widest">Scroll</span>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section
        style={{ background: "linear-gradient(135deg, #0B3D2E 0%, #1A5C44 100%)" }}
        className="py-10 border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x lg:divide-white/15">
            {STATS.map((s) => (
              <div key={s.value} className="text-center lg:px-8">
                <p className="text-3xl sm:text-4xl font-bold text-white mb-1 tabular-nums">{s.value}</p>
                <p className="text-white/65 text-sm font-medium">{s.label}</p>
                <p className="text-accent text-xs mt-1 font-semibold">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-accent font-bold mb-4">About the Island</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6 leading-tight">
                Abu Dhabi&apos;s Most Ambitious<br className="hidden sm:block" />Coastal Development
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-5 text-[15px]">
                Al Hudayriyat Island spans over 3,000 hectares off Abu Dhabi&apos;s western coast. Connected to the mainland via Hudayriyat Bridge, it is just 10 minutes from the UAE capital&apos;s CBD — the closest freehold waterfront in Abu Dhabi. Developed by Modon Properties (84.5% government-owned via ADQ), the island is Abu Dhabi&apos;s flagship coastal city project.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8 text-[15px]">
                With 16 km of natural beaches, 2.25 million sqm of park, Surf Abu Dhabi (the world&apos;s largest artificial wave pool), and 220 km of cycling infrastructure, Hudayriyat is the only address in the UAE that combines elite sport, coastal lifestyle, and freehold residential in one master-planned island.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["3,000+", "Hectares total area"],
                  ["16 km", "Natural beaches"],
                  ["10–20 min", "Drive to Abu Dhabi CBD"],
                  ["99", "Nationalities investing"],
                ].map(([val, lbl]) => (
                  <div key={lbl} className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
                    <p className="text-xl font-bold text-foreground">{val}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{lbl}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Image with annotation */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={AERIAL_IMG}
                alt="Hudayriyat Island masterplan aerial — circular villa community Abu Dhabi"
                className="w-full aspect-[4/3] object-cover"
                loading="lazy"
              />
              {/* Developer badge */}
              <div
                className="absolute bottom-0 inset-x-0 p-5"
                style={{ background: "linear-gradient(to top, rgba(11,61,46,0.92), transparent)" }}
              >
                <p className="text-white font-semibold text-sm">Modon Properties · Government-Backed</p>
                <p className="text-white/65 text-xs mt-0.5">
                  84.5% owned by ADQ — Abu Dhabi&apos;s sovereign investment arm
                </p>
              </div>
              {/* Verified badge */}
              <div className="absolute top-4 right-4 bg-accent/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
                Freehold · All Nationalities
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AMENITIES ── */}
      <section className="py-20 bg-muted/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.3em] text-accent font-bold mb-3">World-Class Infrastructure</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Built for an Active, Coastal Life</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-[15px]">
              The only UAE address where Surf, Velodrome, 220 km cycling, and beachfront living exist in one master plan.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5">
            {AMENITIES.map((a) => (
              <div
                key={a.label}
                className="group bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-default"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-colors group-hover:bg-primary/10"
                  style={{ background: "linear-gradient(135deg, rgba(11,61,46,0.08), rgba(26,122,90,0.12))" }}
                >
                  <a.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="font-semibold text-foreground text-sm mb-1">{a.label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMUNITIES ── */}
      <section id="communities" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-accent font-bold mb-3">Residential Communities</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Find Your Community</h2>
              <p className="text-muted-foreground mt-2 max-w-xl text-[15px]">
                Six freehold communities by Modon — apartments from AED 2M, ultra-luxury mansions to AED 80M+.
              </p>
            </div>
            <Link
              href={`${localePrefix}/contact`}
              className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-0.5 whitespace-nowrap"
              style={{ background: "linear-gradient(135deg, #0B3D2E, #1A7A5A)" }}
            >
              Get Availability & Pricing <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {COMMUNITIES.map((c) => (
              <article
                key={c.name}
                className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={c.img}
                    alt={`${c.name} — ${c.type} on Hudayriyat Island Abu Dhabi`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.55) 100%)" }}
                  />
                  <span
                    className="absolute top-3 left-3 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: c.tagColor }}
                  >
                    {c.tag}
                  </span>
                  <span className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                    {c.badge}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-foreground mb-0.5">{c.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3 font-medium">{c.type} · {c.beds}</p>
                  <p className="text-sm text-foreground/75 leading-relaxed mb-4">{c.desc}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Starting from</p>
                      <p className="text-base font-bold text-primary">{c.priceFrom}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Handover</p>
                      <p className="text-sm font-semibold text-foreground">{c.handover}</p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY INVEST ── */}
      <section
        style={{ background: "linear-gradient(145deg, #0A3529 0%, #0B3D2E 40%, #0F4A36 100%)" }}
        className="py-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.3em] text-accent font-bold mb-3">Investment Case</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Why Investors Choose Hudayriyat
            </h2>
            <p className="text-white/60 mt-3 max-w-xl mx-auto text-[15px]">
              Abu Dhabi&apos;s #1 real estate market by transaction value in Q1 2026. Four structural advantages no other island offers.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
            {WHY_INVEST.map((w) => (
              <div
                key={w.title}
                className="border border-white/12 rounded-2xl p-6 hover:bg-white/5 transition-colors"
                style={{ background: "rgba(255,255,255,0.04)" }}
              >
                <div className="w-11 h-11 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center mb-4">
                  <w.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-bold text-white mb-2 text-sm leading-snug">{w.title}</h3>
                <p className="text-white/55 text-xs leading-relaxed">{w.body}</p>
              </div>
            ))}
          </div>

          {/* Comparison table */}
          <div className="rounded-2xl overflow-hidden border border-white/15">
            <div className="grid grid-cols-3 bg-white/10 text-white/50 text-[11px] uppercase tracking-wider font-semibold py-3 px-4 sm:px-6">
              <span>Metric</span>
              <span className="text-accent text-center">Hudayriyat Island</span>
              <span className="text-center">Dubai Average</span>
            </div>
            {[
              ["Transfer Fee", "2%", "4%"],
              ["Gross Rental Yield", "7–9%", "5.5–7%"],
              ["Capital Appreciation", "40–50%", "15–25%"],
              ["Developer Risk", "Sovereign (ADQ)", "Varies"],
              ["Golden Visa Threshold", "AED 2M", "AED 2M"],
            ].map(([label, hub, dubai], i) => (
              <div
                key={label}
                className={`grid grid-cols-3 py-4 px-4 sm:px-6 items-center ${i % 2 === 0 ? "bg-white/3" : ""}`}
              >
                <span className="text-white/70 text-sm">{label}</span>
                <span className="text-accent font-bold text-sm text-center">{hub}</span>
                <span className="text-white/45 text-sm text-center">{dubai}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.3em] text-accent font-bold mb-3">Common Questions</p>
            <h2 className="text-3xl font-bold text-foreground">
              Hudayriyat Island — Property FAQ
            </h2>
            <p className="text-muted-foreground mt-3 text-[15px]">
              Everything buyers and investors ask before committing to Abu Dhabi&apos;s fastest-growing address.
            </p>
          </div>
          <div className="divide-y divide-border">
            {FAQS.map((f) => (
              <details key={f.question} className="group py-5 cursor-pointer">
                <summary className="flex items-start justify-between gap-4 list-none select-none">
                  <span className="font-semibold text-foreground text-sm sm:text-base leading-snug pr-2">{f.question}</span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5 group-open:rotate-90 transition-transform duration-200" />
                </summary>
                <p className="mt-3 text-muted-foreground text-sm leading-relaxed pr-8">{f.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-card border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-accent font-bold mb-4">Talk to a Specialist</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Ready to Invest on Hudayriyat Island?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto text-[15px]">
            Our Abu Dhabi team provides free, no-obligation advice on unit availability, payment plans, and expected ROI across all six Modon communities — including off-market options.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`${localePrefix}/contact`}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white transition-all hover:shadow-2xl hover:-translate-y-0.5 whitespace-nowrap"
              style={{ background: "linear-gradient(to right, #D4A847, #B8922F)", boxShadow: "0 4px 20px rgba(212,168,71,0.35)" }}
            >
              Free Consultation <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="tel:+971549988811"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold border border-border hover:bg-muted transition-colors text-foreground whitespace-nowrap"
            >
              <Phone className="h-4 w-4" />
              +971 54 998 8811
            </a>
          </div>

          {/* Trust footer */}
          <div className="mt-10 pt-8 border-t border-border flex flex-wrap justify-center gap-6 text-muted-foreground text-xs">
            {["17+ Years in UAE Real Estate", "2,500+ Properties", "No Commission for Buyers", "Regulated by RERA"].map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckCircle className="h-3 w-3 text-accent flex-shrink-0" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
