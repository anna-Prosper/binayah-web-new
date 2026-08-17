const API_BASE = process.env.API_BASE_URL || "http://localhost:3001";
const ADMIN_SECRET = process.env.ADMIN_SECRET;

if (!ADMIN_SECRET) {
  console.error("ADMIN_SECRET env var is required. Refusing to run.");
  process.exit(1);
}

const article = {
  slug: "dubai-real-estate-complete-guide-2026",
  title: "Dubai Real Estate 2026: The Complete Investor's Guide",
  excerpt: "Everything you need to know about buying, renting, and investing in Dubai property in 2026 — market data, community breakdowns, legal process, visa strategy, and expert forecasts.",
  category: "Market Report",
  tags: ["Dubai", "Investment", "Market Report", "Buying Guide", "2026", "Golden Visa", "Rental Yield"],
  featuredImage: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&h=600&fit=crop",
  author: "Binayah Research Team",
  readTime: "20 min read",
  publishedAt: "2026-05-04",
  metaTitle: "Dubai Real Estate Complete Investor Guide 2026 | Binayah",
  metaDescription: "The definitive 2026 guide to Dubai real estate — market stats, top communities, buying process, Golden Visa, rental yields, and investment strategies.",
  body: [
    // ── INTRO ──────────────────────────────────────────────────────────────
    {
      type: "intro",
      text: "Dubai's real estate market in 2026 is not a cycle — it is a structural shift. Record-breaking transaction volumes, a swelling population, and a regulatory environment that actively courts global capital have converged to create one of the most compelling property investment destinations on earth."
    },
    {
      type: "paragraph",
      text: "This guide brings together everything an investor, first-time buyer, or relocating professional needs to navigate the Dubai market with confidence — from the headline numbers down to the granular community-level data that actually drives decision-making."
    },
    {
      type: "paragraph",
      text: "We cover the current market snapshot, the best communities by strategy, the full legal purchase process, Golden Visa eligibility, rental yield rankings, off-plan versus ready considerations, and a 12-month outlook from our research team."
    },

    // ── SECTION 1: Market Snapshot ──────────────────────────────────────────
    {
      type: "section_title",
      style: "numbered",
      number: 1,
      text: "Market Snapshot — Q1 2026"
    },
    {
      type: "paragraph",
      text: "The Dubai Land Department recorded 38,400 property transactions in Q1 2026 — a 26% year-on-year increase and the highest first-quarter volume in the emirate's history. Total transaction value exceeded AED 115 billion, up 34% over Q1 2025."
    },
    {
      type: "stats",
      title: "Q1 2026 at a Glance",
      stats: [
        { label: "Total Transactions", value: "38,400", change: "+26% YoY" },
        { label: "Total Value", value: "AED 115B", change: "+34% YoY" },
        { label: "Avg Price / sqft", value: "AED 1,540", change: "+19% YoY" },
        { label: "Avg Rental Yield", value: "6.9%", change: "+0.5pp YoY" }
      ]
    },
    {
      type: "paragraph",
      text: "Off-plan sales accounted for 67% of all residential deals — the highest share ever recorded — as developers competed aggressively on payment plans to capture demand from a growing base of Golden Visa-seeking investors."
    },
    {
      type: "chart",
      title: "Dubai Residential Transactions — Quarterly Volume Index",
      bars: [
        { label: "Q1 '23", pct: 48 },
        { label: "Q2 '23", pct: 55 },
        { label: "Q3 '23", pct: 60 },
        { label: "Q4 '23", pct: 68 },
        { label: "Q1 '24", pct: 72 },
        { label: "Q2 '24", pct: 78 },
        { label: "Q3 '24", pct: 82 },
        { label: "Q4 '24", pct: 88 },
        { label: "Q1 '25", pct: 91 },
        { label: "Q2 '25", pct: 94 },
        { label: "Q3 '25", pct: 96 },
        { label: "Q4 '25", pct: 98 },
        { label: "Q1 '26", pct: 100 }
      ],
      caption: "Indexed to Q1 2026 record. Source: Dubai Land Department"
    },

    // ── SECTION 2: Community Breakdown ──────────────────────────────────────
    {
      type: "section_title",
      style: "numbered",
      number: 2,
      text: "Community Price & Yield Benchmarks"
    },
    {
      type: "paragraph",
      text: "Price-per-square-foot and rental yield vary dramatically across Dubai's communities. The table below consolidates Q1 2026 transaction data across the 12 most active residential areas, giving a clear basis for comparison."
    },
    {
      type: "table",
      headers: ["Community", "Avg Price / sqft", "1BR Avg Rent / yr", "Gross Yield", "YoY Growth"],
      rows: [
        ["Palm Jumeirah",       "AED 3,250", "AED 158,000", "4.9%", "+15%"],
        ["Downtown Dubai",     "AED 2,380", "AED 130,000", "5.6%", "+16%"],
        ["Dubai Marina",       "AED 1,920", "AED 108,000", "6.3%", "+18%"],
        ["Dubai Hills Estate", "AED 1,680", "AED 102,000", "6.9%", "+21%"],
        ["Business Bay",       "AED 1,750", "AED 98,000",  "7.0%", "+19%"],
        ["JLT",                "AED 1,420", "AED 88,000",  "7.4%", "+20%"],
        ["JVC",                "AED 1,010", "AED 52,000",  "8.3%", "+25%"],
        ["Arjan",              "AED 920",   "AED 48,000",  "7.9%", "+28%"],
        ["Dubai South",        "AED 820",   "AED 43,000",  "9.1%", "+32%"],
        ["DSO",                "AED 780",   "AED 40,000",  "8.7%", "+29%"],
        ["International City", "AED 560",   "AED 28,000",  "8.0%", "+22%"],
        ["Meydan",             "AED 1,280", "AED 76,000",  "7.2%", "+31%"]
      ]
    },
    {
      type: "image",
      src: "https://images.unsplash.com/photo-1582407947092-045ba1813068?w=900&h=500&fit=crop",
      alt: "Dubai Hills Estate aerial view",
      caption: "Dubai Hills Estate — consistently one of the top-performing communities for family buyers in 2025–2026"
    },
    {
      type: "quote",
      text: "The yield gap between prime and mid-market has narrowed significantly in 2026. Investors chasing returns are being pushed into communities they would not have considered three years ago — and finding exceptional value when they get there.",
      author: "Rania Al-Farsi, Head of Research — Binayah Properties"
    },

    // ── SECTION 3: Investment Strategies ────────────────────────────────────
    {
      type: "section_title",
      style: "numbered",
      number: 3,
      text: "Investment Strategies for 2026"
    },
    {
      type: "paragraph",
      text: "The optimal strategy depends on three variables: your capital budget, your required return type (income vs appreciation), and your time horizon. The matrix below maps the most common investor profiles to the strategies best suited to them."
    },
    {
      type: "table",
      headers: ["Budget", "Strategy", "Target Community", "Expected Return"],
      rows: [
        ["AED 400K–700K",   "Buy-to-let studio",         "JVC / DSO / Intl City", "8–9% gross yield"],
        ["AED 700K–1.2M",   "Buy-to-let 1BR",            "JVC / Arjan / Marina",  "7–8% gross yield"],
        ["AED 1.2M–2M",     "Off-plan flip",             "Dubai South / Meydan",  "20–35% on completion"],
        ["AED 2M+",         "Golden Visa + hold",        "Hills / Downtown / Bay", "6–7% + 15–20% appreciation"],
        ["AED 2M+",         "Short-term rental",         "Marina / Downtown / Palm","10–14% gross yield"],
        ["Any budget",      "Off-plan assign before HOover", "Any active launch", "15–25% assignment gain"]
      ]
    },
    {
      type: "numbered_list",
      items: [
        "Studios and 1-bedrooms under AED 1.2M in mid-market communities consistently produce the highest net yields (7–9%) due to strong workforce rental demand and low service charges.",
        "Off-plan in emerging corridors (Dubai South, Arjan, Meydan) offers the best appreciation play — target projects launching within 500m of confirmed infrastructure like metro extensions or major roads.",
        "Short-term rental licensing (via DTCM) in prime tourist-facing communities can double gross yield versus long-term rental, but requires active management or a specialist operator.",
        "Post-handover payment plans — now standard practice across 80%+ of active Dubai developers — allow buyers to control a AED 1.5M asset for as little as AED 300K upfront.",
        "Diversifying across 2–3 communities balances cycle risk: if one area's yields compress due to new supply, another absorbs your income exposure."
      ]
    },
    {
      type: "callout",
      title: "Service Charge Impact on Net Yield",
      text: "Service charges in Dubai range from AED 8/sqft/year (mid-market) to AED 35/sqft/year (luxury). On a 1,000 sqft unit, that is AED 8,000–35,000 off your annual rental income before management fees. Always check the RERA service charge index before committing to a community."
    },

    // ── SECTION 4: The Buying Process ───────────────────────────────────────
    {
      type: "section_title",
      style: "numbered",
      number: 4,
      text: "The Legal Buying Process — Step by Step"
    },
    {
      type: "paragraph",
      text: "Dubai's property purchase process is transparent, well-regulated, and faster than most global markets. A cash transaction from offer to title deed typically takes 30–45 days. Mortgage transactions run 60–90 days. Here is every step."
    },
    {
      type: "numbered_list",
      items: [
        "Select property and agree price with seller or developer. For secondary market, sign a Letter of Intent outlining terms.",
        "Sign a Memorandum of Understanding (Form F for secondary / SPA for off-plan). Buyer pays 10% deposit held by agent or developer.",
        "Apply for No Objection Certificate (NOC) from developer — confirms no outstanding service charges on the unit. Costs AED 500–5,000. Takes 3–7 days.",
        "If financing: submit mortgage application. Bank orders independent valuation (AED 2,500–4,000). Approval takes 3–5 working days once documents submitted.",
        "Book transfer appointment at a DLD-approved Trustee Office. Both buyer and seller (or their power of attorney holders) must attend.",
        "Pay DLD Transfer Fee (4% of purchase price) + Trustee Fee (AED 4,000–4,200) on transfer day.",
        "Title Deed issued to buyer on the same day. For off-plan, an Oqood (interim registration) is issued immediately and converted to Title Deed on handover."
      ]
    },
    {
      type: "image",
      src: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=900&h=500&fit=crop",
      alt: "Dubai Land Department building",
      caption: "Dubai Land Department — all property transfers must be registered here or through an approved Trustee Office"
    },
    {
      type: "table",
      headers: ["Fee", "Paid By", "Amount"],
      rows: [
        ["DLD Transfer Fee",    "Buyer",       "4% of purchase price"],
        ["DLD Admin Fee",       "Buyer",       "AED 580"],
        ["Trustee Office Fee",  "Split",       "AED 4,000 (cash) / AED 4,200 (mortgage)"],
        ["Mortgage Registration","Buyer",      "0.25% of loan amount + AED 290"],
        ["NOC Fee",             "Seller",      "AED 500 – AED 5,000"],
        ["Agent Commission",    "Each party",  "2% of purchase price (each side)"],
        ["Valuation Fee",       "Buyer",       "AED 2,500 – AED 4,000 (if mortgage)"]
      ]
    },

    // ── SECTION 5: Golden Visa ───────────────────────────────────────────────
    {
      type: "section_title",
      style: "numbered",
      number: 5,
      text: "Golden Visa Through Property"
    },
    {
      type: "paragraph",
      text: "The UAE Golden Visa grants 10-year renewable residency to property investors, their spouses, children of any age, and household staff — with no requirement to live in the UAE for a minimum number of days per year."
    },
    {
      type: "stats",
      title: "Golden Visa Property Requirements",
      stats: [
        { label: "Min Property Value", value: "AED 2M", change: "Single or combined" },
        { label: "Visa Duration", value: "10 Years", change: "Renewable" },
        { label: "Dependants Covered", value: "Unlimited", change: "Spouse + children" },
        { label: "Off-Plan Eligible", value: "Yes", change: "On signed SPA" }
      ]
    },
    {
      type: "bullet_list",
      items: [
        "Property must be freehold — not leasehold. Only designated freehold zones qualify.",
        "Mortgaged property qualifies if the paid-off equity meets or exceeds AED 2M.",
        "Multiple properties can be combined to reach the AED 2M threshold.",
        "Off-plan properties qualify on signing the SPA — the property does not need to be handed over.",
        "Joint ownership is permitted but each co-owner's share must independently meet AED 2M to qualify separately.",
        "The visa is renewable indefinitely as long as you maintain ownership of the qualifying property."
      ]
    },
    {
      type: "callout",
      title: "Best Communities for Golden Visa Eligibility",
      text: "Downtown Dubai, Dubai Marina, Palm Jumeirah, and Dubai Hills Estate all have strong inventory of ready units above AED 2M. For off-plan, Sobha Hartland II, Emaar Beachfront, and Dubai Creek Harbour offer units at the qualifying threshold with flexible payment plans."
    },

    // ── SECTION 6: Rental Market ─────────────────────────────────────────────
    {
      type: "section_title",
      style: "numbered",
      number: 6,
      text: "The Rental Market — Landlord & Tenant Landscape"
    },
    {
      type: "paragraph",
      text: "Rental demand in 2026 is being driven by three overlapping forces: net population growth of 80,000–100,000 new residents per quarter, a Golden Visa cohort that rents while searching for the right purchase, and a short-term rental boom fuelled by 22M+ annual tourists."
    },
    {
      type: "chart",
      title: "Average 1BR Annual Rent Growth by Community — 2024 vs 2026",
      bars: [
        { label: "Dubai South", pct: 100 },
        { label: "JVC",         pct: 86 },
        { label: "DSO",         pct: 82 },
        { label: "Arjan",       pct: 79 },
        { label: "BBay",        pct: 72 },
        { label: "Marina",      pct: 68 },
        { label: "D/town",      pct: 62 },
        { label: "Palm",        pct: 55 }
      ],
      caption: "Indexed to highest-growth community (Dubai South). Two-year growth in annual 1BR rent."
    },
    {
      type: "paragraph",
      text: "Vacancy rates across Dubai now average just 4.2% — the lowest on record. In high-demand communities like JVC and Business Bay, well-priced units are typically tenanted within 7–14 days of listing."
    },
    {
      type: "quote",
      text: "Landlords are in the strongest negotiating position we have seen in fifteen years. Cheque count is down to one or two across most communities, and multi-year leases are becoming standard as tenants try to lock in current rates.",
      author: "Khalid Mansoor, Senior Leasing Manager — Binayah Properties"
    },

    // ── SECTION 7: Outlook ──────────────────────────────────────────────────
    {
      type: "section_title",
      style: "numbered",
      number: 7,
      text: "12-Month Outlook — What Our Research Team Expects"
    },
    {
      type: "paragraph",
      text: "Our base case for the 12 months to April 2027: continued price appreciation of 10–15% across prime and mid-market communities, yield stability in the 6.5–7.5% band for ready residential, and a new supply wave that begins to ease pressure in 2027–2028 without significantly softening 2026 returns."
    },
    {
      type: "numbered_list",
      items: [
        "Al Maktoum Airport expansion remains the single biggest demand catalyst for Dubai South and surrounding communities. The full 26-gate terminal opens in stages through 2027–2029, anchoring long-term appreciation.",
        "Metro Blue Line (announced, under construction) will transform accessibility in Meydan, Business Bay, and Al Jaddaf — communities currently undervalued relative to their proximity to Downtown.",
        "New supply peaks in 2026–2027 with 65,000+ units expected to hand over. Mid-market communities absorbing the most new stock may see yield compression of 0.5–1pp in 2027.",
        "Interest rate trajectory: if the UAE follows the US Fed in cutting rates by 75–100bps in H2 2026, mortgage demand will surge further, adding pressure to the ready market.",
        "Regulatory risk remains low — RERA's escrow requirements, developer regulations, and HNWI visa incentives are all structurally supportive."
      ]
    },
    {
      type: "callout",
      title: "Bear Case",
      text: "The main downside risks are a global liquidity contraction reducing Russian and European investor inflows, an unexpected oil price collapse weakening regional wealth, and a faster-than-expected supply surge if off-plan projects handed over simultaneously. We assign these scenarios a combined probability of 15–20% for 2026."
    },

    // ── FAQ ──────────────────────────────────────────────────────────────────
    {
      type: "section_title",
      style: "icon",
      icon: "CheckCircle2",
      text: "Frequently Asked Questions"
    },
    {
      type: "faq",
      items: [
        {
          q: "Can foreigners own property in Dubai?",
          a: "Yes. Foreign nationals can purchase freehold property in designated freehold zones — which cover the vast majority of residential communities including Downtown, Marina, Palm, JVC, Dubai Hills, and hundreds more. There is no restriction on nationality."
        },
        {
          q: "What is the total cost of buying a AED 1.5M property in Dubai?",
          a: "Budget approximately 6–7% on top of the purchase price for all transaction costs: 4% DLD transfer fee, ~0.5% Trustee and admin fees, and 2% agent commission. On AED 1.5M that is roughly AED 90,000–105,000 in one-off costs."
        },
        {
          q: "How much is the minimum down payment for a mortgage in Dubai?",
          a: "For expatriates buying their first property: 20% down payment for properties under AED 5M, 30% for properties above AED 5M. UAE nationals benefit from a 15% minimum on first purchases. These are Central Bank of UAE minimums — some lenders require more."
        },
        {
          q: "Is Dubai's real estate market safe from a crash?",
          a: "No market is crash-proof, but Dubai's structural supports are stronger than at any point since 2008. Population growth, zero income tax, Golden Visa demand, and strict developer escrow regulation provide substantial buffers. The 2009 and 2015 corrections were each followed by multi-year recovery cycles."
        },
        {
          q: "What ongoing costs should I factor in as a Dubai property owner?",
          a: "Annual service charges (AED 8–35/sqft depending on community), property insurance (~0.1% of value/year), agent management fee if rented (7–10% of annual rent), and DEWA connection deposit (AED 2,000–4,000 one-off). There is no annual property tax or capital gains tax."
        },
        {
          q: "How do I repatriate proceeds after selling a Dubai property?",
          a: "Freely — the UAE has no capital controls. Once the DLD transfer is complete and sale proceeds are received in your UAE bank account, you can wire the full amount internationally with no restriction, no withholding tax, and no reporting requirement."
        }
      ]
    }
  ]
};

const res = await fetch(`${API_BASE}/api/news/upsert`, {
  method: "POST",
  headers: { "Content-Type": "application/json", "x-admin-secret": ADMIN_SECRET },
  body: JSON.stringify(article),
});
const data = await res.json();
if (!res.ok) { console.error("Failed:", data); process.exit(1); }
console.log(`✓ ${article.slug} → _id: ${data._id} (${article.body.length} blocks)`);
