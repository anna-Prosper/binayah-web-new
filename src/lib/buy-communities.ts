// ── Buy-by-community SEO data ─────────────────────────────────────────────
// Powers /buy-property-in-[community] programmatic pages. Slugs match the
// canonical community slugs used by /api/listings community filter and the
// /communities/[slug] detail pages.
//
// Each entry has a short unique SEO paragraph so Google doesn't see duplicate
// content across the 20 pages. Stats are indicative (Q1 2026 Binayah data).

export interface BuyCommunity {
  slug: string;
  name: string;
  shortIntro: string;
  why: string;
  priceRange: string;
  yield: string;
  vibe: string;
}

export const BUY_COMMUNITIES: BuyCommunity[] = [
  {
    slug: "dubai-marina",
    name: "Dubai Marina",
    shortIntro: "Premium high-rise waterfront with the deepest rental demand in Dubai. The default choice for capital-growth buyers.",
    why: "Dubai Marina remains Dubai's most internationally recognised address. Supply is structurally constrained — no new towers in the core — and occupancy in well-managed buildings exceeds 94%. Buyers pay a premium per sqft (AED 1,700–2,200) but get exceptional liquidity for resale and strong tenant demand from European and Russian renters.",
    priceRange: "AED 1.2M – 8M",
    yield: "5.5–6.5%",
    vibe: "Waterfront luxury",
  },
  {
    slug: "downtown-dubai",
    name: "Downtown Dubai",
    shortIntro: "The trophy district. Burj Khalifa views, Dubai Mall walkable, prestige addresses commanding the highest prices.",
    why: "Downtown is Dubai's premium core. Buyers here optimise for prestige and capital preservation rather than yield. Average price per sqft (AED 2,200–3,500) reflects the brand premium of Burj Khalifa-adjacent addresses. Resale liquidity is excellent and Dubai Mall's 80M+ annual visitors anchor commercial demand. Best fit: cash buyers with a long horizon.",
    priceRange: "AED 1.8M – 50M+",
    yield: "5.0–6.0%",
    vibe: "Trophy urban",
  },
  {
    slug: "palm-jumeirah",
    name: "Palm Jumeirah",
    shortIntro: "Iconic man-made island. Beachfront villas and signature apartments commanding global trophy prices.",
    why: "Palm Jumeirah is one of the world's best-known addresses. Beachfront villas trade above AED 30M; signature apartments in The Royal Atlantis, One at Palm Jumeirah, and Five Palm command AED 4M+ for one-bedrooms. Demand is anchored by foreign capital seeking trophy assets. Yields are modest (4–5.5%) but appreciation has tracked global ultra-luxury benchmarks. Golden Visa is automatic given price points.",
    priceRange: "AED 3M – 100M+",
    yield: "4.0–5.5%",
    vibe: "Iconic beachfront",
  },
  {
    slug: "business-bay",
    name: "Business Bay",
    shortIntro: "Downtown-adjacent at a Marina price. The most consistent performer in Binayah's transaction data three quarters running.",
    why: "Business Bay benefits from Downtown proximity at materially lower entry points. A 1-bed in a mid-tier tower starts around AED 900K. Over 200 transactions per quarter create excellent secondary-market depth. Holding periods average 18 months — active liquidity, not speculative. Rental yields of 6.2–7.1% are among the best in central Dubai.",
    priceRange: "AED 900K – 5M",
    yield: "6.2–7.1%",
    vibe: "Central business district",
  },
  {
    slug: "jumeirah-village-circle",
    name: "Jumeirah Village Circle",
    shortIntro: "Highest rental yields in Dubai. The yield-investor's first choice.",
    why: "JVC offers the highest gross yields in Dubai (7.2–8.5%) at the lowest entry prices (AED 700–900/sqft). 25,000+ residential units provide tenant depth and easy resale. The trade-off is slower capital appreciation than waterfront communities. Ideal for cash-flow-focused investors building a Dubai income portfolio.",
    priceRange: "AED 550K – 1.8M",
    yield: "7.2–8.5%",
    vibe: "Family-friendly mid-market",
  },
  {
    slug: "dubai-hills-estate",
    name: "Dubai Hills Estate",
    shortIntro: "Emaar's flagship family community. Golf course, top schools, and the most balanced lifestyle in central Dubai.",
    why: "Dubai Hills Estate combines Emaar build quality, Dubai Hills Mall, championship golf, and schools rated GEMS Excellent. Townhouses (AED 3–6M) and villas (AED 6–25M) sell to end-users rather than investors, which protects values. Apartment yields run 5.5–6.5%. Best fit: family buyers prioritising long-term lifestyle.",
    priceRange: "AED 1.5M – 25M",
    yield: "5.5–6.5%",
    vibe: "Family lifestyle",
  },
  {
    slug: "arabian-ranches",
    name: "Arabian Ranches",
    shortIntro: "Established villa-only community. Stable values, mature landscaping, strong school catchment.",
    why: "Arabian Ranches is the gold-standard villa community for Dubai families. Phase 1 villas have appreciated quietly but consistently for 15+ years. Phase 3 launched at AED 3.5M+ for 4-bedroom layouts. Owner-occupier ratio is high, which creates pricing stability. Yields are modest (4.5–5.5%) but holding periods are typically 5+ years.",
    priceRange: "AED 3M – 18M",
    yield: "4.5–5.5%",
    vibe: "Established villa suburb",
  },
  {
    slug: "jumeirah-beach-residence",
    name: "Jumeirah Beach Residence",
    shortIntro: "Beachfront apartments on The Walk. Tourist-grade short-term rental demand all year.",
    why: "JBR's 40 towers along The Walk command persistent tourist demand. Short-term rental yields can reach 9–11% gross for furnished units (subject to Dubai Tourism license). Long-term yields run 6–7%. Capital appreciation has been steady but moderate — the entry premium is high (AED 1,800–2,400/sqft). Best fit: investors comfortable with active management of holiday-let units.",
    priceRange: "AED 1.4M – 8M",
    yield: "6.0–7.0% (LT) / 9–11% (ST)",
    vibe: "Beachfront tourist hub",
  },
  {
    slug: "difc",
    name: "DIFC",
    shortIntro: "Dubai International Financial Centre. The premium business address with rentable apartments at the top floors.",
    why: "DIFC residential is small in volume but premium in positioning — buyers here are typically finance executives who work in the area or international owners who want a Dubai pied-à-terre. Yields are moderate (5–6%) but resale liquidity to the same buyer profile is strong. Limited supply protects values.",
    priceRange: "AED 1.8M – 15M",
    yield: "5.0–6.0%",
    vibe: "Financial district",
  },
  {
    slug: "dubai-creek-harbour",
    name: "Dubai Creek Harbour",
    shortIntro: "Emaar's next-decade waterfront masterplan. Discount to Downtown for patient capital.",
    why: "Dubai Creek Harbour is in the middle innings of its development arc. Infrastructure is in, but transaction volume is still building. Current pricing represents a meaningful discount to mature waterfront communities — Marina-quality units trade 25–35% below Marina prices. Ideal for 5–7 year horizons; less suitable for liquidity-sensitive buyers.",
    priceRange: "AED 1.1M – 10M",
    yield: "5.5–6.5%",
    vibe: "Emerging waterfront",
  },
  {
    slug: "mbr-city",
    name: "MBR City",
    shortIntro: "Mohammed Bin Rashid City. Diverse mega-district with everything from Meydan villas to District One mansions.",
    why: "MBR City is less a single community than a constellation: District One, Meydan, Sobha Hartland, Nad Al Sheba. Pricing varies dramatically (AED 1.2M apartments to AED 100M+ Lagoon mansions). The common factor is Sheikh Zayed Road proximity and a long development runway. Pick the sub-community carefully — homework matters more here than in mature districts.",
    priceRange: "AED 1.2M – 100M+",
    yield: "5.0–7.0%",
    vibe: "Diverse mega-district",
  },
  {
    slug: "damac-hills",
    name: "Damac Hills",
    shortIntro: "Trump-branded golf community. Villa-led with apartment towers at competitive entry points.",
    why: "Damac Hills clusters villas around a Trump International Golf Club course. Villa pricing (AED 3–10M) attracts upper-middle-market end-users; apartments in towers like Carson and Loreto trade more actively at AED 700–1,200K. The community is mature enough to have strong resale liquidity. Yields on apartments run 6.5–7.5%.",
    priceRange: "AED 700K – 12M",
    yield: "6.0–7.5%",
    vibe: "Golf villa community",
  },
  {
    slug: "emirates-hills",
    name: "Emirates Hills",
    shortIntro: "The 'Beverly Hills of Dubai'. Custom mansions on Montgomerie golf course views. The ultra-luxury benchmark.",
    why: "Emirates Hills is Dubai's most exclusive villa community. Custom-built mansions on plots of 10,000–35,000 sqft start around AED 25M and reach AED 200M+. No two villas are alike. Resale is private and slow — months to years on market — but values are exceptionally resilient. Investor relevance is limited; this is end-user territory for ultra-high-net-worth buyers.",
    priceRange: "AED 25M – 200M+",
    yield: "3.0–4.0%",
    vibe: "Ultra-luxury mansions",
  },
  {
    slug: "bluewaters-island",
    name: "Bluewaters Island",
    shortIntro: "Ain Dubai island with sea views to the Marina skyline. Limited supply, premium positioning.",
    why: "Bluewaters' apartment supply is fixed (residence buildings 1–6 plus the Caesars-anchored Bluewaters Residences). This structural scarcity has driven persistent price appreciation — units have appreciated 30%+ since handover. Beachfront, Marina-skyline views, and walking distance to JBR explain the premium pricing (AED 2,200–3,500/sqft).",
    priceRange: "AED 2M – 18M",
    yield: "5.0–6.0%",
    vibe: "Island lifestyle",
  },
  {
    slug: "mirdif",
    name: "Mirdif",
    shortIntro: "Established family suburb. Detached villas at prices unavailable in newer master communities.",
    why: "Mirdif offers genuine standalone villas — gardens, garages, no service charges on freehold plots — at AED 3–8M, prices that wouldn't buy you a townhouse in Dubai Hills. Trade-off is older infrastructure and longer commute to the city centre. Strong end-user demand from teachers, government workers, and long-term Dubai residents.",
    priceRange: "AED 1.5M – 10M",
    yield: "5.0–6.5%",
    vibe: "Established suburban",
  },
  {
    slug: "al-barari",
    name: "Al Barari",
    shortIntro: "Botanical-themed villa community. 60% green space, sustainable design, ultra-low density.",
    why: "Al Barari is a niche premium community known for landscape design (botanic gardens between every villa cluster). Volume is low — under 400 villas total — and resale is slow but commands premium pricing (AED 12M+ for 5-bedroom villas, AED 35M+ for The Reserve). Best fit: end-users seeking privacy, greenery, and a distinct identity.",
    priceRange: "AED 5M – 50M",
    yield: "3.5–4.5%",
    vibe: "Botanical luxury",
  },
  {
    slug: "jumeirah-lakes-towers",
    name: "Jumeirah Lakes Towers",
    shortIntro: "Mixed-use tower cluster with metro access. Solid yields, deep liquidity, easy commute.",
    why: "JLT is the workhorse of Dubai apartment investing. 80+ towers around four artificial lakes, free zone status (DMCC), direct metro access, and Marina-adjacent. Entry prices (AED 800K–1.5M for one-bedrooms) and consistent 6.5–7.5% yields make it a default holding for income-focused portfolios. Tenant turnover is high but absorption is fast.",
    priceRange: "AED 750K – 4M",
    yield: "6.5–7.5%",
    vibe: "Commuter / business",
  },
  {
    slug: "town-square",
    name: "Town Square",
    shortIntro: "Nshama's mid-market masterplan. Affordable townhouses with central park amenity.",
    why: "Town Square positioned itself as Dubai's first genuinely affordable family masterplan — townhouses starting around AED 1.4M, apartments from AED 500K. Build quality is mid-tier but the central park (4 km of jogging tracks, retail, schools) anchors the community. Best fit: first-time buyers and yield investors targeting middle-income tenants.",
    priceRange: "AED 500K – 2.5M",
    yield: "6.5–7.5%",
    vibe: "Affordable family",
  },
  {
    slug: "the-springs",
    name: "The Springs",
    shortIntro: "Emaar's villa community at Emirates Living. The 'starter villa' choice for Dubai families.",
    why: "The Springs is the entry point into Emirates Living villa ownership. 2- and 3-bed townhouses (AED 2.5–4.5M) attract families upgrading from apartments. Mature infrastructure, JESS school catchment, and strong community feel. Resale is steady; values appreciate quietly. Lower per-sqft pricing than newer Emaar communities makes it a value pick.",
    priceRange: "AED 2.5M – 6M",
    yield: "5.5–6.5%",
    vibe: "Entry-level family villas",
  },
  {
    slug: "international-city",
    name: "International City",
    shortIntro: "Highest-yield, lowest-entry apartments in Dubai. Yield-hunters' starting point.",
    why: "International City offers the lowest apartment entry prices in Dubai (AED 300–550K for studios and 1-bedrooms) and consequently the highest gross yields (8–10%). Trade-off is mid-tier finish quality, limited capital appreciation, and a tenant base that requires active management. Best fit: portfolio investors building yield-weighted holdings.",
    priceRange: "AED 280K – 900K",
    yield: "8.0–10.0%",
    vibe: "High-yield value",
  },
];

export function findBuyCommunity(slug: string): BuyCommunity | undefined {
  return BUY_COMMUNITIES.find((c) => c.slug === slug);
}
