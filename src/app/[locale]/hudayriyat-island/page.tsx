/* eslint-disable i18next/no-literal-string -- SEO landing page, English-only by design */
/* eslint-disable @next/next/no-img-element -- verified external real-estate CDN images */
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { BreadcrumbJsonLd, FAQJsonLd } from "@/components/JsonLd";
import { canonical as makeCanonical, altLangs, AE_URL } from "@/lib/site";
import { Waves, Bike, Trophy, Trees, Anchor, Building2, MapPin, TrendingUp, Shield, Star, ArrowRight, Phone, ChevronRight } from "lucide-react";

export const revalidate = 86400;

const TITLE = "Buy Property on Hudayriyat Island, Abu Dhabi | Binayah Properties";
const DESC =
  "Explore freehold apartments, villas & luxury mansions on Hudayriyat Island — Abu Dhabi's fastest-growing coastal address. AED 2M+. Government-backed developer Modon. 7–9% gross yield.";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: TITLE,
    description: DESC,
    alternates: {
      canonical: makeCanonical(locale, "/hudayriyat-island"),
      languages: altLangs("/hudayriyat-island"),
    },
    openGraph: {
      title: TITLE,
      description: DESC,
      type: "website",
      url: makeCanonical(locale, "/hudayriyat-island"),
      images: [
        {
          url: "https://cdn.prod.website-files.com/65b8ae9b3af43cf735dab067/68dbe9d6559ef9927fb28181_66b5c99458dafd393c78a4fb_65b8ae9b3af43cf735dac75e_6501fcf541c098ad5bb92c17_64f0976a6c8b0affa25d832f__14-06-2023_151850.avif",
          width: 1200,
          height: 630,
          alt: "Hudayriyat Island Abu Dhabi aerial view",
        },
      ],
    },
  };
}

// ─────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────

const STATS = [
  { value: "AED 11.97B", label: "Q1 2026 Transactions", sub: "#1 in Abu Dhabi" },
  { value: "40–50%", label: "Capital Appreciation", sub: "Early buyers recorded" },
  { value: "7–9%", label: "Gross Rental Yield", sub: "Coastal Abu Dhabi average" },
  { value: "99", label: "Nationalities Investing", sub: "Fully open freehold" },
];

const AMENITIES = [
  { icon: Waves, label: "Surf Abu Dhabi", desc: "World's largest artificial wave pool" },
  { icon: Bike, label: "220 km Cycling", desc: "Branded Bike City network" },
  { icon: Trophy, label: "Abu Dhabi Velodrome", desc: "International-grade indoor track" },
  { icon: Trees, label: "2.25M sqm Park", desc: "Landscaped urban green space" },
  { icon: Anchor, label: "Hudayriyat Marina", desc: "Full-service waterfront marina" },
  { icon: Waves, label: "Free Public Beaches", desc: "Mar Vista & Al Bateen beach access" },
  { icon: Building2, label: "321 Sports Dome", desc: "Largest indoor dome in the region" },
  { icon: Star, label: "Bab Al Nojoum", desc: "Luxury beachfront glamping resort" },
];

const COMMUNITIES = [
  {
    name: "Nawayef Park Views",
    type: "Apartments",
    beds: "1–4 BR",
    priceFrom: "AED 2M",
    handover: "Q1 2028",
    desc: "Mediterranean-inspired residences with Arabian Gulf and Abu Dhabi skyline views. Adjacent souq plaza, fine dining, and wellness spaces.",
    img: "https://cdn.prod.website-files.com/65b8ae9b3af43cf735dab067/69329ce567c111d16cb2bf52_6759761015ef38dc475c58d0_Nawayef%2520Park%2520Views.webp",
    tag: "Apartments",
    tagColor: "bg-blue-500",
  },
  {
    name: "Bashayer",
    type: "Waterfront Villas & Apartments",
    beds: "1–5 BR",
    priceFrom: "AED 2.35M",
    handover: "Q4 2028–2029",
    desc: "First waterfront community on the island. 157 villas + 330 apartments, rooftop infinity pool, 3.5 km promenade. Sold out at launch raising AED 3B.",
    img: "https://cdn.prod.website-files.com/65b8ae9b3af43cf735dab067/69329cd6f5558c90f6eda9dd_6926cae021fc4137d048275b_Bashayer%250.webp",
    tag: "Waterfront",
    tagColor: "bg-cyan-600",
  },
  {
    name: "Al Naseem",
    type: "Standalone Villas",
    beds: "4–6 BR",
    priceFrom: "AED 7.8M",
    handover: "Q4 2027",
    desc: "Signature standalone villas in South Californian and Modern Contemporary styles. Community centre, schools, pools, and dedicated cycling paths.",
    img: "https://www.modon.com/images/modoncorporatelibraries/real-estate/al-naseem_skyline_1920x1080.jpg",
    tag: "Villas",
    tagColor: "bg-green-600",
  },
  {
    name: "Nawayef Homes",
    type: "Hillside Villas",
    beds: "3–5 BR",
    priceFrom: "AED 6M",
    handover: "Q4 2026–2027",
    desc: "Elevated hillside villas with panoramic island and sea views. 3,700–5,000 sqft. Unique man-made hills up to 60m give unmatched Abu Dhabi skyline vistas.",
    img: "https://cdn.prod.website-files.com/65b8ae9b3af43cf735dab067/69329cdd77e71177de17491b_66c86ee529c70d65ed7c63d7_65eeb0678d0f6e270a004de0_Nawayef_Mansions_Type5_1%252520(1).webp",
    tag: "Hillside Villas",
    tagColor: "bg-amber-600",
  },
  {
    name: "Hudayriyat Golf Estates",
    type: "Golf Villas & Townhouses",
    beds: "4–6 BR",
    priceFrom: "AED 4.25M",
    handover: "Q3 2030",
    desc: "Championship golf-course-front villas and townhouses. Resort-style living with direct green frontage in the heart of the island's leisure district.",
    img: "https://cdn.prod.website-files.com/65b8ae9b3af43cf735dab067/6a0ee7e2e846da995b0ace83_img33.webp",
    tag: "Golf Villas",
    tagColor: "bg-emerald-700",
  },
  {
    name: "Nawayef Mansions",
    type: "Luxury Mansions",
    beds: "6–8 BR",
    priceFrom: "AED 25M",
    handover: "2027",
    desc: "Ultra-luxury hillside mansions commanding the island's highest elevations. 8,700–29,000 sqft. The most exclusive addresses in Abu Dhabi real estate.",
    img: "https://cdn.prod.website-files.com/65b8ae9b3af43cf735dab067/68dbe9d6559ef9927fb28181_66b5c99458dafd393c78a4fb_65b8ae9b3af43cf735dac75e_6501fcf541c098ad5bb92c17_64f0976a6c8b0affa25d832f__14-06-2023_151850.avif",
    tag: "Ultra Luxury",
    tagColor: "bg-yellow-600",
  },
];

const WHY_INVEST = [
  {
    icon: Shield,
    title: "Government-Backed Developer",
    body: "Modon Properties is 84.5% owned by ADQ — Abu Dhabi's sovereign investment arm. Zero developer risk. Projects delivered on schedule.",
  },
  {
    icon: TrendingUp,
    title: "2% Transfer Fee",
    body: "Half of Dubai's 4%. Abu Dhabi's lower transaction costs improve net ROI for investors and reduce friction on resale.",
  },
  {
    icon: Star,
    title: "Freehold for All Nationalities",
    body: "100% ownership rights with no restrictions. Properties above AED 2M automatically qualify for UAE Golden Visa residency.",
  },
  {
    icon: MapPin,
    title: "10 Minutes to Abu Dhabi Centre",
    body: "Via Hudayriyat Bridge. 25 minutes to Abu Dhabi International Airport. The island is the closest waterfront freehold to the capital's CBD.",
  },
];

const FAQS = [
  {
    question: "Can foreigners buy property on Hudayriyat Island?",
    answer:
      "Yes. Hudayriyat Island is a freehold zone open to all 99+ nationalities. Foreign buyers receive full ownership rights with a title deed. Properties above AED 2 million qualify for the UAE Golden Visa.",
  },
  {
    question: "What is the transfer fee for Hudayriyat Island properties?",
    answer:
      "The Abu Dhabi transfer fee is 2% of the purchase price — half of Dubai's 4% rate. This meaningfully improves net investment returns and resale economics.",
  },
  {
    question: "What types of property are available on Hudayriyat Island?",
    answer:
      "Hudayriyat Island offers apartments (1–4BR from AED 2M), villas (3–8BR from AED 6M), luxury mansions (from AED 25M), and golf villas/townhouses (from AED 4.25M). All developed by government-backed Modon Properties.",
  },
  {
    question: "What rental yields can I expect?",
    answer:
      "Coastal Abu Dhabi properties typically generate 7–9% gross rental yields. Early buyers on Hudayriyat Island have recorded 40–50% capital appreciation since launch. Q1 2026 saw AED 11.97B in transactions — the highest of any area in Abu Dhabi.",
  },
  {
    question: "How far is Hudayriyat Island from Abu Dhabi city?",
    answer:
      "10–20 minutes by car via Hudayriyat Bridge. The island is located on the southwestern coast of Abu Dhabi, directly opposite the Al Bateen district. Abu Dhabi International Airport is approximately 25–30 minutes away.",
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
    { name: "Abu Dhabi", href: `${localePrefix}/areas` },
    { name: "Hudayriyat Island", href: `${localePrefix}/hudayriyat-island` },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <FAQJsonLd faqs={FAQS} />
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative min-h-[92vh] flex items-end overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src="https://cdn.prod.website-files.com/65b8ae9b3af43cf735dab067/68dbe9d6559ef9927fb28181_66b5c99458dafd393c78a4fb_65b8ae9b3af43cf735dac75e_6501fcf541c098ad5bb92c17_64f0976a6c8b0affa25d832f__14-06-2023_151850.avif"
            alt="Hudayriyat Island Abu Dhabi aerial view"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(11,61,46,0.3) 0%, rgba(11,61,46,0.55) 40%, rgba(11,61,46,0.85) 75%, #0B3D2E 100%)" }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pb-16 sm:pb-24 w-full">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-5">
              <span className="h-px w-8 bg-accent" />
              <span className="text-accent text-xs font-bold uppercase tracking-[0.3em]">Abu Dhabi · Freehold Island</span>
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-6">
              The Beverly Hills<br />
              <span style={{ color: "#D4A847" }}>of Abu Dhabi</span>
            </h1>
            <p className="text-white/85 text-lg sm:text-xl leading-relaxed mb-8 max-w-2xl">
              3,000+ hectares of coastal masterplan. World-class surf, cycling, and lifestyle infrastructure — paired with government-backed freehold villas, apartments, and mansions from AED 2M.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={`${localePrefix}/contact`}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:shadow-xl hover:-translate-y-0.5"
                style={{ background: "linear-gradient(to right, #D4A847, #B8922F)", boxShadow: "0 4px 20px rgba(212,168,71,0.4)" }}
              >
                Free Consultation <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#communities"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold text-white border border-white/30 hover:bg-white/10 transition-all"
              >
                View Communities <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ background: "linear-gradient(135deg, #0B3D2E, #1A5C44)" }} className="py-10 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x lg:divide-white/15">
            {STATS.map((s) => (
              <div key={s.value} className="text-center lg:px-8">
                <p className="text-3xl sm:text-4xl font-bold text-white mb-1">{s.value}</p>
                <p className="text-white/70 text-sm font-medium">{s.label}</p>
                <p className="text-accent text-xs mt-1">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-accent font-bold mb-4">About the Island</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6 leading-tight">
                Abu Dhabi&apos;s Most Ambitious<br />Coastal Development
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-5">
                Al Hudayriyat Island spans over 3,000 hectares off Abu Dhabi&apos;s western coast, connected to the mainland via Hudayriyat Bridge — just 10 minutes from the capital&apos;s CBD. Developed by Modon Properties (84.5% government-owned through ADQ), the island is Abu Dhabi&apos;s answer to a fully master-planned coastal city.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Home to 16 km of natural beaches, 2.25 million sqm of landscaped park, the world&apos;s largest artificial wave facility (Surf Abu Dhabi), and 220 km of cycling tracks, Hudayriyat is designed around wellness, sport, and coastal living at a scale unmatched in the UAE.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  ["3,000+ hectares", "Total island area"],
                  ["16 km", "Natural coastline"],
                  ["10–20 min", "Drive to Abu Dhabi CBD"],
                  ["2020", "Island opened to public"],
                ].map(([val, lbl]) => (
                  <div key={lbl} className="bg-card border border-border rounded-xl p-4">
                    <p className="text-xl font-bold text-foreground">{val}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{lbl}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-2xl">
              <img
                src="https://sherwoodsproperty.com/wp-content/uploads/2026/05/Why-Hudayriyat-Island-thumbnail-1200x628.jpg.jpeg"
                alt="Hudayriyat Island masterplan overview"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 inset-x-0 p-5" style={{ background: "linear-gradient(to top, rgba(11,61,46,0.9), transparent)" }}>
                <p className="text-white font-semibold text-sm">Modon Properties · Government-Backed Developer</p>
                <p className="text-white/70 text-xs">84.5% owned by ADQ, Abu Dhabi&apos;s sovereign investment arm</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AMENITIES ── */}
      <section className="py-20" style={{ background: "linear-gradient(180deg, #f8f9f8 0%, #ffffff 100%)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.3em] text-accent font-bold mb-3">World-Class Infrastructure</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Built for an Active, Coastal Life</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">Hudayriyat Island is the only address in the UAE where surf, velodrome, cycling, and beachfront living converge.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {AMENITIES.map((a) => (
              <div
                key={a.label}
                className="group bg-card border border-border rounded-2xl p-5 hover:border-accent/40 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-colors"
                  style={{ background: "linear-gradient(135deg, #0B3D2E15, #1A7A5A20)" }}
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
              <p className="text-muted-foreground mt-2 max-w-xl">From AED 2M apartments to AED 80M ultra-luxury mansions — all by Modon, all freehold.</p>
            </div>
            <Link
              href={`${localePrefix}/contact`}
              className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
              style={{ background: "linear-gradient(to right, #0B3D2E, #1A7A5A)" }}
            >
              Get Pricing <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {COMMUNITIES.map((c) => (
              <div
                key={c.name}
                className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={c.img}
                    alt={`${c.name} Hudayriyat Island`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.5) 100%)" }} />
                  <span className={`absolute top-3 left-3 ${c.tagColor} text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full`}>
                    {c.tag}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-foreground mb-1">{c.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{c.type} · {c.beds}</p>
                  <p className="text-sm text-foreground/80 leading-relaxed mb-4">{c.desc}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">From</p>
                      <p className="text-base font-bold text-primary">{c.priceFrom}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Handover</p>
                      <p className="text-sm font-semibold text-foreground">{c.handover}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY INVEST ── */}
      <section className="py-20" style={{ background: "linear-gradient(135deg, #0B3D2E, #1A5C44)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.3em] text-accent font-bold mb-3">Investment Case</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Why Investors Choose Hudayriyat</h2>
            <p className="text-white/70 mt-3 max-w-xl mx-auto">Abu Dhabi&apos;s #1 real estate market by transaction value in Q1 2026. Four structural advantages no other island address offers.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_INVEST.map((w) => (
              <div key={w.title} className="bg-white/8 border border-white/15 rounded-2xl p-6 hover:bg-white/12 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center mb-4">
                  <w.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-bold text-white mb-2 text-sm">{w.title}</h3>
                <p className="text-white/65 text-xs leading-relaxed">{w.body}</p>
              </div>
            ))}
          </div>

          {/* Comparison bar */}
          <div className="mt-14 grid sm:grid-cols-3 gap-4 text-center">
            {[
              { label: "Transfer Fee", hub: "2%", dubai: "4%", winner: "Abu Dhabi" },
              { label: "Capital Appreciation", hub: "40–50%", dubai: "15–25%", winner: "Hudayriyat" },
              { label: "Gross Yield", hub: "7–9%", dubai: "5.5–7%", winner: "Hudayriyat" },
            ].map((r) => (
              <div key={r.label} className="bg-white/10 border border-white/15 rounded-xl p-5">
                <p className="text-white/50 text-xs uppercase tracking-wider mb-3">{r.label}</p>
                <div className="flex justify-around items-center">
                  <div>
                    <p className="text-accent font-bold text-xl">{r.hub}</p>
                    <p className="text-white/50 text-[10px]">Hudayriyat</p>
                  </div>
                  <div className="text-white/30 text-xs">vs</div>
                  <div>
                    <p className="text-white/60 font-bold text-xl">{r.dubai}</p>
                    <p className="text-white/40 text-[10px]">Dubai avg.</p>
                  </div>
                </div>
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
            <h2 className="text-3xl font-bold text-foreground">Frequently Asked Questions</h2>
          </div>
          <div className="divide-y divide-border">
            {FAQS.map((f) => (
              <details key={f.question} className="group py-5 cursor-pointer">
                <summary className="flex items-start justify-between gap-4 list-none">
                  <span className="font-semibold text-foreground text-sm sm:text-base leading-snug">{f.question}</span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-3 text-muted-foreground text-sm leading-relaxed">{f.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-card border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-accent font-bold mb-4">Start Your Investment</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Interested in Hudayriyat Island?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto text-base">
            Our Abu Dhabi specialists provide free, no-obligation guidance on availability, payment plans, and expected returns across all Hudayriyat communities.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`${localePrefix}/contact`}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-bold text-white transition-all hover:shadow-xl hover:-translate-y-0.5"
              style={{ background: "linear-gradient(to right, #D4A847, #B8922F)", boxShadow: "0 4px 20px rgba(212,168,71,0.35)" }}
            >
              Get Free Consultation <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="tel:+971549988811"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold border border-border hover:bg-muted transition-colors text-foreground"
            >
              <Phone className="h-4 w-4" />
              Call Our Team
            </a>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
