/**
 * Seeds a few extra example articles to demonstrate varied structures.
 * Run: node scripts/seed-example-articles.mjs
 */

const API_BASE = process.env.API_BASE_URL || "https://binayah-api.onrender.com";
const ADMIN_SECRET = "secret";

const articles = [
  // ── EXAMPLE A: Short, punchy — chart + quote + bullet list ───────────────
  {
    slug: "dubai-rental-prices-surge-2026",
    title: "Dubai Rental Prices Surge 18% as Demand Outpaces Supply",
    excerpt: "Tenants across Dubai are facing the steepest rent increases since 2014, with studios and 1-bedrooms leading the surge in mid-market communities.",
    category: "Market Report",
    tags: ["Rental Market", "Prices", "Tenants", "Dubai 2026"],
    featuredImage: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=600&fit=crop",
    author: "Binayah Research Team",
    readTime: "5 min read",
    publishedAt: "2026-05-01",
    body: [
      {
        type: "intro",
        text: "Dubai's rental market has entered a supply crunch. With over 350,000 new residents expected in 2026 and new handovers lagging demand, rents are climbing at their fastest pace in more than a decade."
      },
      {
        type: "paragraph",
        text: "RERA's Rental Index data shows average rents across Dubai rising 18% year-on-year in Q1 2026, with certain sub-markets — particularly JVC, Dubai Marina, and Business Bay — recording increases of 22–28%."
      },
      {
        type: "chart",
        title: "Average Annual Rent Growth — Dubai (2020–2026)",
        bars: [
          { label: "2020", pct: 20 },
          { label: "2021", pct: 35 },
          { label: "2022", pct: 68 },
          { label: "2023", pct: 72 },
          { label: "2024", pct: 80 },
          { label: "2025", pct: 88 },
          { label: "2026F", pct: 100 }
        ],
        caption: "Indexed to 2026 forecast. Source: RERA Rental Index / Binayah Research"
      },
      {
        type: "quote",
        text: "We are seeing tenants willing to pay 2–3 years of rent upfront just to secure a unit in high-demand areas. That level of competition hasn't been seen since the 2013–2014 cycle.",
        author: "Omar Al-Shehhi, Head of Leasing — Binayah Properties"
      },
      {
        type: "section_title",
        style: "icon",
        icon: "Home",
        text: "Which Communities Are Hit Hardest?"
      },
      {
        type: "paragraph",
        text: "Mid-market communities are absorbing the most pressure. The flight of cost-conscious tenants from prime areas — priced out by luxury demand — has pushed JVC, DSO, and Jumeirah Village Triangle into rent-growth overdrive."
      },
      {
        type: "bullet_list",
        items: [
          "JVC: studios up 26% YoY — now averaging AED 52,000/year",
          "Dubai Marina: 1BR up 22% — averaging AED 105,000/year",
          "Business Bay: 1BR up 24% — averaging AED 98,000/year",
          "Dubai Silicon Oasis: up 19% — still one of the most affordable mid-market options",
          "Palm Jumeirah: up 15% — demand driven by HNWI relocations"
        ]
      },
      {
        type: "callout",
        title: "RERA Rental Increase Calculator",
        text: "Landlords cannot increase rent beyond the RERA Rental Index cap. Use the official RERA calculator (dubai.ae/rents) to check the maximum permitted increase before accepting or disputing a renewal notice."
      }
    ]
  },

  // ── EXAMPLE B: Step-by-step guide — numbered sections + table + callouts ─
  {
    slug: "how-to-sell-property-dubai-2026",
    title: "How to Sell Your Property in Dubai: 2026 Step-by-Step Guide",
    excerpt: "From setting the right price to collecting your sales proceeds — a practical guide to navigating the Dubai property selling process in 2026.",
    category: "Guides",
    tags: ["Selling", "DLD", "NOC", "Legal", "Process"],
    featuredImage: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&h=600&fit=crop",
    author: "Binayah Legal Team",
    readTime: "8 min read",
    publishedAt: "2026-05-02",
    body: [
      {
        type: "intro",
        text: "Selling property in Dubai is a structured, well-regulated process — but missing a single step can delay your transaction by weeks. Here is the complete 2026 seller's roadmap."
      },
      {
        type: "paragraph",
        text: "Whether you are an investor exiting a position, an expat returning home, or upgrading to a larger unit, this guide walks you through every stage from listing to cash in hand."
      },
      {
        type: "section_title",
        style: "numbered",
        number: 1,
        text: "Price Your Property Correctly"
      },
      {
        type: "paragraph",
        text: "Overpricing is the single most common seller mistake. Use the DLD's transaction history (accessible via the Dubai REST app) to see what comparable units have actually sold for in the past 90 days — not asking prices on portals."
      },
      {
        type: "stats",
        title: "Average Days on Market by Pricing Strategy",
        stats: [
          { label: "Priced at Market", value: "18 days", change: "Fastest exit" },
          { label: "Priced 5% Above", value: "45 days", change: "Slower" },
          { label: "Priced 10% Above", value: "90+ days", change: "Stale listing" },
          { label: "Priced Below Market", value: "4 days", change: "Bidding war" }
        ]
      },
      {
        type: "section_title",
        style: "numbered",
        number: 2,
        text: "List and Market the Property"
      },
      {
        type: "paragraph",
        text: "Instruct a RERA-registered broker and sign a Form A (Listing Agreement). The broker must list on Bayut and Property Finder within 3 days of signing. Professional photography and a floor plan significantly reduce time on market."
      },
      {
        type: "numbered_list",
        items: [
          "Sign Form A with a RERA-licensed brokerage — this is the official listing contract",
          "Provide your Title Deed and passport copy to the broker",
          "Commission is typically 2% of the sale price, paid at transfer",
          "You may list with multiple brokers (open listing) or grant exclusivity for higher marketing effort"
        ]
      },
      {
        type: "section_title",
        style: "numbered",
        number: 3,
        text: "Agree Terms and Sign MOU"
      },
      {
        type: "paragraph",
        text: "Once a buyer is found, both parties sign a Memorandum of Understanding (Form F). The buyer pays a 10% deposit held in trust. The MOU sets the agreed price, payment method (cash/mortgage), and transfer deadline — typically 30–60 days."
      },
      {
        type: "callout",
        title: "Mortgage Sellers: Extra Lead Time Required",
        text: "If your property has an outstanding mortgage, factor in 2–3 weeks to obtain a Liability Letter from your bank and a further 1–2 weeks for the buyer's bank to release funds. Start this process immediately after signing the MOU."
      },
      {
        type: "section_title",
        style: "numbered",
        number: 4,
        text: "Obtain NOC and Transfer at DLD"
      },
      {
        type: "paragraph",
        text: "The seller must obtain a No Objection Certificate (NOC) from the developer confirming no outstanding service charges. This is done at the developer's offices and typically takes 3–5 business days. Cost: AED 500–5,000 depending on the developer."
      },
      {
        type: "table",
        headers: ["Cost", "Who Pays", "Approx Amount"],
        rows: [
          ["DLD Transfer Fee (4%)", "Buyer", "4% of sale price"],
          ["DLD Admin Fee", "Buyer", "AED 580"],
          ["Trustee Office Fee", "Split", "AED 4,000 (cash) / AED 4,200 (mortgage)"],
          ["NOC Fee", "Seller", "AED 500 – AED 5,000"],
          ["Agent Commission", "Seller", "2% of sale price"],
          ["Mortgage Liability Letter", "Seller", "AED 500 – AED 1,500"]
        ]
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
            q: "How long does a Dubai property sale take from listing to transfer?",
            a: "Cash transactions typically complete in 30–45 days. Mortgage transactions (buyer financing) take 60–90 days due to bank valuation and approval timelines."
          },
          {
            q: "Can I sell a property that still has a mortgage on it?",
            a: "Yes. The outstanding mortgage is settled from sale proceeds at the DLD transfer. Your bank issues a Liability Letter confirming the payoff amount, and this is cleared before or at the transfer appointment."
          },
          {
            q: "Do I pay capital gains tax on property profit in Dubai?",
            a: "No. The UAE has no capital gains tax on real estate. Your entire net profit (sale price minus purchase costs and fees) is yours to keep or repatriate."
          }
        ]
      }
    ]
  },

  // ── EXAMPLE C: Data-heavy — two tables, stats, image ─────────────────────
  {
    slug: "off-plan-vs-ready-property-dubai-2026",
    title: "Off-Plan vs Ready Property in Dubai: Which Is Right for You in 2026?",
    excerpt: "A data-driven comparison of off-plan and ready property — covering price, yield, risk, payment structure, and who each is best suited for.",
    category: "Investment",
    tags: ["Off-Plan", "Ready Property", "Comparison", "Investment Strategy"],
    featuredImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&h=600&fit=crop",
    author: "Binayah Research Team",
    readTime: "10 min read",
    publishedAt: "2026-05-03",
    body: [
      {
        type: "intro",
        text: "Off-plan or ready? It is the most common question buyers ask — and the right answer depends entirely on your goals, timeline, and risk appetite. Here is the honest, data-backed comparison for 2026."
      },
      {
        type: "paragraph",
        text: "Both strategies have delivered strong returns in Dubai's current cycle. Off-plan buyers who entered in 2022–2023 are sitting on paper gains of 30–60% in some communities. Ready-property landlords enjoyed rental yield growth of 4pp over the same period. Neither path is categorically superior."
      },
      {
        type: "table",
        headers: ["Factor", "Off-Plan", "Ready Property"],
        rows: [
          ["Entry Price", "10–25% below market on launch", "Full market price at purchase"],
          ["Payment Structure", "Staged (5–20% deposit + instalments)", "Full payment or mortgage at transfer"],
          ["Rental Income", "None until handover (1–4 years)", "Immediate from day one"],
          ["Capital Appreciation", "Higher potential (30–60% seen in 2022–24)", "Moderate (10–20% typical)"],
          ["Liquidity", "Limited — resale possible but complex", "High — can list immediately"],
          ["Risk", "Developer default, delays, market shift", "Condition, occupancy, yield compression"],
          ["Golden Visa Eligibility", "Yes — on signed SPA value", "Yes — on title deed value"]
        ]
      },
      {
        type: "section_title",
        style: "icon",
        icon: "TrendingUp",
        text: "The Case for Off-Plan"
      },
      {
        type: "paragraph",
        text: "Off-plan's core advantage is price: developers launch at a discount to absorb construction risk and generate presale cashflow. Buyers who enter at launch in a high-growth community often see 20–40% appreciation before the project is even complete — allowing a profitable flip via assignment before handover."
      },
      {
        type: "paragraph",
        text: "Payment plans also reduce capital deployment. A typical structure requires 20% on signing, then 10% every 6 months during construction, with 40–50% due on handover. This lets buyers control a high-value asset with far less upfront capital than a ready purchase."
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&h=500&fit=crop",
        alt: "Dubai off-plan development under construction",
        caption: "Active construction across Dubai South and MBR City — two of the highest-growth off-plan corridors in 2026"
      },
      {
        type: "section_title",
        style: "icon",
        icon: "Home",
        text: "The Case for Ready Property"
      },
      {
        type: "paragraph",
        text: "Ready property wins on certainty and cashflow. You see exactly what you are buying, rental income starts immediately, and you are not exposed to construction delays or developer risk. For buy-to-let investors with a 5–10 year horizon, ready property in a high-yield community often outperforms on a net-present-value basis."
      },
      {
        type: "stats",
        title: "Ready vs Off-Plan — 5-Year Return Comparison (AED 1.5M Investment)",
        stats: [
          { label: "Off-Plan Capital Gain", value: "AED 420K", change: "+28% est." },
          { label: "Ready Rental Income", value: "AED 485K", change: "6.5% × 5yr" },
          { label: "Off-Plan Total Return", value: "AED 420K", change: "No rent during build" },
          { label: "Ready Total Return", value: "AED 485K+", change: "Income + appreciation" }
        ]
      },
      {
        type: "section_title",
        style: "icon",
        icon: "FileText",
        text: "Which Should You Choose?"
      },
      {
        type: "table",
        headers: ["Your Profile", "Recommended Strategy"],
        rows: [
          ["Capital-limited, long horizon (3+ years)", "Off-plan — maximise appreciation with lower upfront"],
          ["Need rental income now", "Ready — cashflow from day one"],
          ["Risk-averse, first Dubai purchase", "Ready — no construction or developer risk"],
          ["Experienced investor, high-growth focus", "Off-plan in emerging communities"],
          ["Seeking Golden Visa quickly", "Ready — immediate eligibility on title deed"],
          ["Short-term flip investor (1–3 years)", "Off-plan assignment — buy, hold, sell before handover"]
        ]
      },
      {
        type: "callout",
        title: "Hybrid Strategy",
        text: "Many experienced Dubai investors split their portfolio 60/40 — off-plan for appreciation and ready for yield. This balances cashflow today against capital growth tomorrow, smoothing out market cycle exposure."
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

console.log(`Seeding ${articles.length} example articles to ${API_BASE}...`);
for (const article of articles) {
  try {
    const result = await upsert(article);
    console.log(`  ✓ ${article.slug} → _id: ${result._id}`);
  } catch (err) {
    console.error(`  ✗ ${article.slug}: ${err.message}`);
  }
}
console.log("Done.");
