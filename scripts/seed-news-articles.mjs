/**
 * Seeds 3 sample structured news articles into the DB via the API upsert endpoint.
 * Run: node scripts/seed-news-articles.mjs
 * Requires: API_BASE_URL env var or defaults to https://binayah-api.onrender.com
 */

const API_BASE = process.env.API_BASE_URL || "https://binayah-api.onrender.com";
const ADMIN_SECRET = "secret";

const articles = [
  // ── ARTICLE 1: Full-featured (many block types) ──────────────────────────
  {
    slug: "dubai-property-market-report-q1-2026",
    title: "Dubai Property Market Report — Q1 2026 Full Analysis",
    excerpt: "A comprehensive look at Dubai's real estate transactions, pricing trends, and investment outlook for Q1 2026.",
    category: "Market Report",
    tags: ["Dubai", "Market Report", "Investment", "2026", "Real Estate"],
    featuredImage: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&h=600&fit=crop",
    author: "Binayah Research Team",
    readTime: "12 min read",
    publishedAt: "2026-04-01",
    metaTitle: "Dubai Property Market Report Q1 2026 | Binayah Properties",
    metaDescription: "Comprehensive analysis of Dubai real estate transactions, price movements, and investment strategies for Q1 2026.",
    body: [
      {
        type: "intro",
        text: "Dubai's property market opened 2026 on record-breaking form, with the Dubai Land Department registering over 38,000 transactions in Q1 alone — a 26% year-on-year surge that underscores sustained global demand for UAE real estate."
      },
      {
        type: "paragraph",
        text: "This report consolidates transaction data, price-per-square-foot benchmarks, community-level performance, and forward-looking projections to give buyers, investors, and developers a complete picture of the market's current state."
      },
      {
        type: "stats",
        title: "Q1 2026 Key Metrics",
        stats: [
          { label: "Total Transactions", value: "38,400", change: "+26% YoY" },
          { label: "Avg Price / sqft", value: "AED 1,540", change: "+19% YoY" },
          { label: "Off-Plan Share", value: "67%", change: "+6pp YoY" },
          { label: "Avg Rental Yield", value: "6.9%", change: "+0.5pp" }
        ]
      },
      {
        type: "section_title",
        style: "icon",
        icon: "BarChart3",
        text: "Transaction Volume & Price Trends"
      },
      {
        type: "paragraph",
        text: "Off-plan sales dominated Q1, driven by developer payment-plan flexibility and continued Golden Visa demand. Ready-market transactions also climbed, particularly in mid-market communities where yields outperform prime areas."
      },
      {
        type: "paragraph",
        text: "The average price per square foot across Dubai reached AED 1,540 — up 19% year-on-year and 7% quarter-on-quarter — with waterfront and golf-course-facing units leading appreciation."
      },
      {
        type: "table",
        headers: ["Community", "Avg Price / sqft", "QoQ Change", "Rental Yield"],
        rows: [
          ["Palm Jumeirah", "AED 3,250", "+8%", "4.9%"],
          ["Downtown Dubai", "AED 2,380", "+11%", "5.6%"],
          ["Dubai Marina", "AED 1,920", "+9%", "6.3%"],
          ["Dubai Hills Estate", "AED 1,680", "+14%", "6.9%"],
          ["JVC", "AED 1,010", "+22%", "8.3%"],
          ["Dubai South", "AED 820", "+28%", "9.1%"]
        ]
      },
      {
        type: "chart",
        title: "Quarterly Transaction Volume — 2024 to Q1 2026",
        bars: [
          { label: "Q1 '24", pct: 55 },
          { label: "Q2 '24", pct: 62 },
          { label: "Q3 '24", pct: 68 },
          { label: "Q4 '24", pct: 75 },
          { label: "Q1 '25", pct: 80 },
          { label: "Q2 '25", pct: 85 },
          { label: "Q3 '25", pct: 88 },
          { label: "Q4 '25", pct: 93 },
          { label: "Q1 '26", pct: 100 }
        ],
        caption: "Indexed to Q1 2026 peak. Source: Dubai Land Department"
      },
      {
        type: "section_title",
        style: "icon",
        icon: "TrendingUp",
        text: "Investment Outlook & Strategies"
      },
      {
        type: "paragraph",
        text: "With yields averaging 6.9% and capital appreciation projected at 12–18% for 2026, Dubai continues to offer one of the strongest risk-adjusted real estate returns globally. Post-handover payment plans — now offered by over 80% of active developers — further lower the barrier to entry."
      },
      {
        type: "quote",
        text: "Emerging communities like Dubai South and Arjan are delivering yields of 8–10%, creating compelling opportunities for investors priced out of established prime areas.",
        author: "Rania Al-Farsi, Head of Research — Binayah Properties"
      },
      {
        type: "numbered_list",
        items: [
          "Prioritise off-plan in high-growth corridors: Dubai South, Arjan, and Meydan are outperforming on both yield and appreciation.",
          "Studio and 1-bedroom units under AED 1.2M offer the highest net yields (7.5–9%) due to strong rental demand from young professionals.",
          "Leverage post-handover payment plans to deploy capital in phases and reduce upfront risk.",
          "Consider short-term rental licensing in tourist-heavy communities (Marina, Downtown) for gross yields of 10–14%."
        ]
      },
      {
        type: "callout",
        title: "Regulatory Update",
        text: "RERA's updated short-term rental regulations effective March 2026 require a tourism dirham fee of AED 15/night. Factor this into yield projections for holiday-home operators."
      },
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
            q: "Is it still a good time to buy property in Dubai?",
            a: "Yes — Q1 2026 data confirms continued price growth and strong rental demand. The combination of no income tax, Golden Visa eligibility, and high yields makes Dubai compelling versus comparable global cities."
          },
          {
            q: "What is the minimum investment for a Golden Visa through property?",
            a: "AED 2,000,000 in a single freehold property qualifies you for a 10-year UAE Golden Visa. The property must be fully paid (not mortgaged beyond the qualifying amount)."
          },
          {
            q: "Which communities offer the best ROI in 2026?",
            a: "For rental yield: Dubai South (9.1%), JVC (8.3%), and Arjan (8.0%). For capital appreciation: Dubai Hills Estate and Downtown Dubai lead on price growth."
          }
        ]
      }
    ]
  },

  // ── ARTICLE 2: Simple (2 sections, paragraphs + one table) ───────────────
  {
    slug: "golden-visa-property-guide-2026",
    title: "Golden Visa Through Property: The Complete 2026 Guide",
    excerpt: "Everything you need to know about securing a UAE Golden Visa through real estate investment — eligibility, process, and the best communities to qualify.",
    category: "Guides",
    tags: ["Golden Visa", "UAE Residency", "Investment", "Legal"],
    featuredImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=600&fit=crop",
    author: "Binayah Legal Team",
    readTime: "7 min read",
    publishedAt: "2026-04-15",
    metaTitle: "UAE Golden Visa Through Property 2026 | Binayah Properties",
    metaDescription: "Complete guide to obtaining a UAE Golden Visa through property investment — requirements, process, timeline, and top qualifying communities.",
    body: [
      {
        type: "intro",
        text: "The UAE Golden Visa has transformed how foreign nationals view Dubai property. Since its expansion in 2022, over 90,000 investors have secured 10-year residency through real estate — and 2026 changes make the path even more accessible."
      },
      {
        type: "paragraph",
        text: "This guide covers everything: who qualifies, how the application works, which property types count, and which communities give you the best combination of yield and Golden Visa eligibility."
      },
      {
        type: "section_title",
        style: "numbered",
        number: 1,
        text: "Eligibility Requirements"
      },
      {
        type: "paragraph",
        text: "To qualify for the 10-year Golden Visa through property, you must own one or more freehold properties with a combined value of AED 2,000,000 or more. The properties must be fully paid — a mortgage is permitted only if the paid-off equity meets the threshold."
      },
      {
        type: "paragraph",
        text: "Off-plan properties qualify as long as the developer is registered with RERA and the buyer holds a valid Sale and Purchase Agreement (SPA). The property does not need to be handed over at the time of application."
      },
      {
        type: "bullet_list",
        items: [
          "Minimum property value: AED 2,000,000 (single or combined freehold assets)",
          "Mortgage allowed — only fully paid-off equity counts toward the threshold",
          "Off-plan qualifies with a valid RERA-registered SPA",
          "Property must be in a designated freehold zone",
          "Joint ownership permitted — each co-owner's share must meet AED 2M independently"
        ]
      },
      {
        type: "section_title",
        style: "numbered",
        number: 2,
        text: "Application Process & Timeline"
      },
      {
        type: "paragraph",
        text: "The process is straightforward but requires careful document preparation. Most applicants complete it within 30–45 days from initial submission to visa issuance, assuming documents are in order."
      },
      {
        type: "table",
        headers: ["Step", "Action", "Estimated Time"],
        rows: [
          ["1", "Obtain title deed / SPA from DLD", "1–3 days"],
          ["2", "Notarised property valuation (DLD-approved valuator)", "3–5 days"],
          ["3", "Submit application via ICP (Federal Authority for Identity)", "1 day"],
          ["4", "Medical fitness test & Emirates ID biometrics", "3–7 days"],
          ["5", "Visa stamping & Emirates ID issuance", "7–14 days"]
        ]
      },
      {
        type: "callout",
        title: "Family Sponsorship Included",
        text: "A Golden Visa holder can sponsor their spouse, children (of any age), and household staff under the same 10-year residency framework — at no additional property investment required."
      }
    ]
  },

  // ── ARTICLE 3: Medium (3 sections, image + list + quote) ─────────────────
  {
    slug: "top-5-communities-rental-yield-2026",
    title: "Top 5 Dubai Communities for Rental Yield in 2026",
    excerpt: "Which communities are delivering the highest net rental returns in 2026? Data from 45,000+ active listings ranked by yield, demand, and appreciation potential.",
    category: "Investment",
    tags: ["Rental Yield", "ROI", "Investment", "Communities", "Dubai"],
    featuredImage: "https://images.unsplash.com/photo-1582407947092-045ba1813068?w=1200&h=600&fit=crop",
    author: "Binayah Research Team",
    readTime: "9 min read",
    publishedAt: "2026-04-22",
    metaTitle: "Top 5 Dubai Communities for Rental Yield 2026 | Binayah",
    metaDescription: "Data-driven ranking of Dubai's highest-yield communities for 2026. Includes gross yield, demand score, and appreciation outlook per area.",
    body: [
      {
        type: "intro",
        text: "Rental yield is the lifeblood of buy-to-let investing — and in Dubai's 2026 market, the gap between high- and low-yield communities has widened significantly. Here are the five communities delivering the strongest returns right now."
      },
      {
        type: "paragraph",
        text: "Our analysis is based on 45,000+ active rental listings on Bayut and Property Finder, cross-referenced with DLD transaction data from January–March 2026. Net yield figures account for service charges, management fees, and a 90% occupancy assumption."
      },
      {
        type: "section_title",
        style: "numbered",
        number: 1,
        text: "Dubai South — Avg Gross Yield: 9.1%"
      },
      {
        type: "paragraph",
        text: "Dubai South has emerged as the standout performer of 2026. Driven by Al Maktoum International Airport expansion and Expo City momentum, the community's affordable entry prices (studios from AED 430,000) combined with soaring rental demand produce yields that dwarf established areas."
      },
      {
        type: "paragraph",
        text: "Studios and 1-bedroom apartments are the sweet spot — tenants include airport staff, logistics workers, and young professionals priced out of central Dubai. Vacancy rates are below 4%."
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=900&h=500&fit=crop",
        alt: "Dubai South residential development",
        caption: "Residential towers in Dubai South near Expo City — one of 2026's highest-yield zones"
      },
      {
        type: "section_title",
        style: "numbered",
        number: 2,
        text: "Jumeirah Village Circle (JVC) — Avg Gross Yield: 8.3%"
      },
      {
        type: "paragraph",
        text: "JVC's formula is simple: central location, diverse unit mix, and below-average service charges. It has consistently ranked in the top 3 for gross yield since 2023 and shows no signs of slipping. New completions keep adding supply, but demand from families and young couples absorbs it quickly."
      },
      {
        type: "quote",
        text: "JVC is the most liquid mid-market community in Dubai. You can enter at AED 550,000 for a studio and expect the unit to be tenanted within two weeks of listing.",
        author: "Khalid Mansoor, Senior Leasing Manager — Binayah Properties"
      },
      {
        type: "section_title",
        style: "numbered",
        number: 3,
        text: "Business Bay, Arjan & International City — The Rest of the Top 5"
      },
      {
        type: "paragraph",
        text: "Rounding out the five highest-yield communities are Business Bay (7.0% — premium short-term rental demand), Arjan (7.9% — low service charges, proximity to Miracle Garden), and International City (8.0% — ultra-affordable entry, workforce housing demand)."
      },
      {
        type: "stats",
        title: "Top 5 Communities — Yield Comparison",
        stats: [
          { label: "Dubai South", value: "9.1%", change: "Gross Yield" },
          { label: "JVC", value: "8.3%", change: "Gross Yield" },
          { label: "Intl City", value: "8.0%", change: "Gross Yield" },
          { label: "Arjan", value: "7.9%", change: "Gross Yield" }
        ]
      },
      {
        type: "numbered_list",
        items: [
          "Dubai South: Best for pure yield and long-term appreciation play on airport expansion.",
          "JVC: Best for liquidity — fast tenanting, strong resale market, diverse unit mix.",
          "International City: Best entry price (studios from AED 280,000) for maximum yield.",
          "Arjan: Best combination of yield and lifestyle — close to major attractions.",
          "Business Bay: Best for short-term rental operators targeting business travellers."
        ]
      },
      {
        type: "callout",
        title: "Net vs Gross Yield",
        text: "All figures above are gross yield. To estimate net yield, subtract service charges (typically AED 8–18/sqft/year), management fees (7–10% of annual rent), and allow for 5–10% vacancy. Net yields typically run 1.5–2.5pp below gross."
      }
    ]
  }
];

async function upsert(article) {
  const res = await fetch(`${API_BASE}/api/news/upsert`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-admin-secret": ADMIN_SECRET,
    },
    body: JSON.stringify(article),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Failed to upsert ${article.slug}: ${JSON.stringify(data)}`);
  return data;
}

console.log(`Seeding ${articles.length} articles to ${API_BASE}...`);
for (const article of articles) {
  try {
    const result = await upsert(article);
    console.log(`  ✓ ${article.slug} → _id: ${result._id}`);
  } catch (err) {
    console.error(`  ✗ ${article.slug}: ${err.message}`);
  }
}
console.log("Done.");
