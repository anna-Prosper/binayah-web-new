// ── Pulse Guides ───────────────────────────────────────────────────────────
// Authored guide content for /pulse/guides and /pulse/guides/[slug].
// Body text is English-only. Titles and descriptions are translated via i18n keys.
// Stats are pulled from Binayah market data as of Q1 2026.

export interface PulseGuide {
  slug: string;
  category: string; // Used as i18n key prefix: pulseGuides.category_{category}
  readTime: string;
  views: number; // Placeholder static
  titleKey: string; // i18n key in pulseGuides namespace
  descriptionKey: string; // i18n key in pulseGuides namespace
  // Body is English-only long-form content (600–1200 words)
  body: string;
  // Related community names (shown at bottom of guide page)
  relatedCommunities: string[];
}

export const PULSE_GUIDES: PulseGuide[] = [
  {
    slug: "best-areas-dubai-2026",
    category: "Investment",
    readTime: "8 min",
    views: 4812,
    titleKey: "guide_bestAreas_title",
    descriptionKey: "guide_bestAreas_desc",
    relatedCommunities: ["Dubai Marina", "Business Bay", "Jumeirah Village Circle"],
    body: `Dubai's property market in 2026 is defined by a clear divide: communities that have crossed the liquidity threshold — where enough off-plan stock has completed to create a self-sustaining secondary market — and those still building toward it. Knowing which side a community sits on shapes your investment strategy entirely.

**Business Bay: The Consistent Performer**

Business Bay has been the most dependable performer in Binayah's data for three consecutive quarters. Average price per sqft sits around AED 1,450–1,600, with rental yields of 6.2–7.1% depending on unit size and floor. The community benefits from its proximity to Downtown Dubai while offering meaningfully lower entry points — a 1-bedroom in a mid-tier tower can be acquired for AED 900K–1.2M, versus AED 1.5M+ for a comparable Downtown unit.

What makes Business Bay compelling in 2026 is its depth of liquidity. Over 200 transactions recorded in Q1 alone, with an average deal size of AED 1.38M. The holding period for resellers averages 18 months, which suggests the market is active rather than speculative. For yield-seekers, 1-bedroom and 2-bedroom units in completed towers leasing for AED 75K–110K per year represent the sweet spot.

**Dubai Marina: Premium Price, Premium Demand**

At AED 1,700–2,200 per sqft, Dubai Marina sits in premium territory. Rental demand is among the strongest in the city — occupancy rates in well-managed buildings exceed 94%. The investor calculus here is not yield (gross yield is typically 5.5–6.5%) but capital growth. Marina prices have appreciated 18–24% over 24 months, driven by undersupply of quality stock and persistent demand from European and Russian buyers.

For the right buyer — long horizon, cash-heavy, prioritising capital preservation — a Marina unit remains a defensible hold. The risk is entry price: overpaying in a trophy building absorbs years of appreciation before you break even on resale.

**Jumeirah Village Circle: Highest Yield in the City**

JVC remains the yield leader in Binayah's market data at 7.2–8.5% gross. Entry prices of AED 700–900 per sqft make it one of the most accessible investment communities. The trade-off is capital growth: JVC has historically appreciated more slowly than premium waterfront communities, though the 2025 spike in off-plan sales suggests developer confidence is high.

For investors who prioritise cash flow over appreciation — pension substitutes, income portfolios — JVC is the most direct answer Dubai offers.

**Emerging Picks: Dubai Creek Harbour and Sobha Hartland**

These communities are in the middle innings of their development arc. Dubai Creek Harbour has the infrastructure of a major urban district but transaction volumes that are still building. Sobha Hartland benefits from its developer's finish quality and a price point that has held firmer than broader mid-market. Both carry more illiquidity risk than mature communities but offer higher upside for 5–7 year holds.

**The Comparison Framework**

When evaluating any community in 2026, apply three filters in order:

1. **Liquidity**: Can you exit within 6 months if needed? Communities with fewer than 20 transactions per quarter carry real exit risk.
2. **Yield vs. growth**: Pick one primary objective. Communities optimised for yield (JVC, Dubai South) underperform on appreciation. Premium waterfront optimises for growth.
3. **Developer risk**: Off-plan in emerging communities adds delivery risk. Factor in the developer's completion track record before committing.

The data is clear: the best area depends entirely on your objective. There is no universally "best" community — only the best match for your return requirement, time horizon, and risk tolerance.`,
  },
  {
    slug: "dubai-vs-abu-dhabi",
    category: "Comparison",
    readTime: "6 min",
    views: 3241,
    titleKey: "guide_dubaiAbuDhabi_title",
    descriptionKey: "guide_dubaiAbuDhabi_desc",
    relatedCommunities: ["Downtown Dubai", "Dubai Marina", "Business Bay"],
    body: `Both emirates offer freehold ownership for foreign nationals and tax-free rental income. But they are fundamentally different investment propositions — different buyer bases, different liquidity profiles, and different risk characteristics.

**Transaction Volume and Liquidity**

Dubai dominates on transaction volume. The official market registry recorded over 170,000 residential transactions in 2025, versus approximately 18,000 in Abu Dhabi. This 9:1 ratio matters: it means Dubai offers dramatically more exit liquidity. If your circumstances change, you can move a Dubai asset. Selling in Abu Dhabi outside of peak demand windows can take 9–18 months.

**Yield Comparison**

Abu Dhabi's rental yields are strong in specific communities — Yas Island and Al Reem Island both post gross yields of 6.5–8.2%. These numbers are competitive with JVC and Dubai South. The difference is tenant profile: Abu Dhabi's rental demand is dominated by government and corporate employees, which means longer leases and lower vacancy — but also lower churn, so the market moves more slowly in both directions.

Dubai's yield range is wider: from 4.5% in Palm Jumeirah to 8.5% in JVC. The breadth gives investors more options to optimise, but also more ways to pick wrongly.

**Price Trajectory**

Dubai prices rose 22% in 2024–2025 on average, with some waterfront communities up 35–40%. Abu Dhabi appreciation was more moderate — 12–16% across prime areas. The UAE government's investment in Abu Dhabi tourism, entertainment, and financial infrastructure (ADGM expansion, Saadiyat cultural district) suggests the gap will narrow, but Dubai's first-mover advantage in foreign investment brand recognition is substantial.

**Visa Linkage**

The Golden Visa programme is available in both emirates. The AED 2M threshold for Dubai and Abu Dhabi is identical. For buyers primarily motivated by residency, there is no material difference.

**Who Should Invest Where**

Dubai suits: yield-optimisers, short-to-medium holds (3–5 years), investors who prioritise exit flexibility, and buyers wanting the broadest price range (AED 400K studios to AED 100M+ penthouses).

Abu Dhabi suits: long-horizon holders (7+ years), investors seeking a less volatile market, buyers attracted to the cultural district premium (Saadiyat Island), and anyone specifically wanting proximity to Abu Dhabi's commercial ecosystem.

For first-time UAE investors, Dubai is the lower-risk choice — not because the assets are better, but because liquidity risk is significantly lower.`,
  },
  {
    slug: "creek-harbour-guide",
    category: "Deep Dive",
    readTime: "7 min",
    views: 2189,
    titleKey: "guide_creekHarbour_title",
    descriptionKey: "guide_creekHarbour_desc",
    relatedCommunities: ["Dubai Creek Harbour", "Downtown Dubai", "Business Bay"],
    body: `Dubai Creek Harbour is one of the largest urban development projects currently underway globally — a planned district designed to house 200,000 residents across 6 square kilometres of waterfront, with a tower that will eventually surpass the Burj Khalifa. For investors, the question is: at what stage of development does buying make sense?

**The Development Arc**

Emaar Properties is the master developer. The first residential clusters — Creek Island and Creek Gate — are completed and occupied. Creek Rise, the mid-rise residential backbone, is in active handover. The planned urban spine — including the retail core, the Dubai Creek Tower (the record-breaker, timeline delayed), and Creek Marina — remains a medium-term build-out story.

This phased delivery creates a clear two-tier market: completed stock where you can inspect and take possession immediately, and off-plan in later phases where you are buying future delivery.

**Pricing vs. Comparable Communities**

In Q1 2026, completed units in Creek Harbour trade at AED 1,400–1,700 per sqft — below Downtown Dubai (AED 2,200–2,800) and slightly below Emaar's Harbour Views in the Marina (AED 1,800–2,000). The discount reflects the incomplete infrastructure rather than quality: Emaar's build quality is consistently above-market.

**Rental Yield**

Current gross yields on completed Creek Harbour stock sit at 5.5–6.5%, below JVC but above most waterfront premium communities. As the retail spine fills and the district achieves critical mass, yield compression should follow — meaning capital appreciation rather than income is the primary driver.

**The Tower Factor**

The Creek Tower, when complete, will anchor the district's global brand the way the Burj Khalifa anchored Downtown. The delay has created a negative sentiment overhang that shows up in discounted pricing relative to the infrastructure quality already on the ground. Buyers willing to hold 5–7 years are arguably getting paid for the patience the tower requires.

**Key Risks**

1. **Completion risk**: The Creek Tower's timeline remains uncertain. If it continues to slip, the district's premium addressability is delayed.
2. **Oversupply in off-plan**: Emaar has released significant off-plan volume in later phases. If absorption slows, secondary prices in completed stock face pressure.
3. **Transport**: The metro Red Line extension to Creek Harbour is under construction but not yet operational. The commute to DIFC via bus/taxi is 20–30 minutes — workable, but it limits tenant demand from financial sector employees.

**Investment Case**

Creek Harbour is a conviction play on Dubai's urban expansion rather than a near-term yield story. The case: Emaar delivers, the tower completes (even 3 years late), the metro opens, and a fully-functional waterfront district activates. In that scenario, the current price discount to Downtown closes substantially. The question is whether your capital can afford the wait.`,
  },
  {
    slug: "buying-as-foreigner",
    category: "How To",
    readTime: "5 min",
    views: 5603,
    titleKey: "guide_buyingForeigner_title",
    descriptionKey: "guide_buyingForeigner_desc",
    relatedCommunities: ["Dubai Marina", "Downtown Dubai", "Palm Jumeirah"],
    body: `Foreign nationals can buy freehold property in Dubai with no restrictions on ownership percentage and no requirement for local sponsorship. Here is the practical process from search to title deed.

**Step 1: Define Your Objective**

Before viewing a single unit, determine: investment (yield, capital growth, or both), end-use (primary residence, holiday home, company HQ), or visa-linked purchase (qualifying for Golden Visa at AED 2M+). Each objective changes the optimal community, unit type, and price point.

**Step 2: Financing**

Most UAE banks offer mortgage products to foreign nationals. Typical terms: 25-year maximum, 75% LTV for sub-AED 5M properties (meaning 25% down payment plus ~5% acquisition costs), 3.5–4.5% fixed for 1–3 years, then variable. Some developers offer payment plans that effectively act as developer financing — worth comparing to bank terms on a total cost of ownership basis.

For off-plan, most developers require 10–20% on booking, then a milestone-linked schedule through construction. The balance is due on handover or can be financed via a post-handover plan.

**Step 3: Legal Checks**

Engage a UAE-registered real estate attorney (not a broker). The key checks:
- **Title search**: Confirm the seller holds a valid title deed with no encumbrances via the official property registry portal.
- **Service charge arrears**: Arrears travel with the title, not the seller. Get a NOC from the developer confirming zero outstanding service charges.
- **Strata documents**: Review the building's service charge history. Chronic underfunding of reserves is a red flag.

**Step 4: The Transaction Process**

1. Sign MOU (Memorandum of Understanding) with a 10% deposit cheque held in escrow or by the broker.
2. Obtain NOC from developer (2–7 business days, fee AED 500–5,000 depending on developer).
3. Meet at the property registry (or use a certified trustee office for same-day transfer). Bring: passport, NOC, bank manager's cheque or bank transfer.
4. Pay the property transfer fee: 4% of purchase price (buyer pays).
5. Collect new title deed in your name.

**Step 5: Running Costs**

Factor these into your returns:
- Service charges: AED 10–25 per sqft per year depending on building and community
- Agency fee: 2% of purchase price (paid by buyer in most transactions)
- Property transfer fee: 4%
- Mortgage registration (if applicable): 0.25% of loan value

**Step 6: Golden Visa**

A property purchase of AED 2M or above qualifies the buyer for a 10-year UAE Golden Visa. The property can be mortgaged, but the equity value (not purchase price) must exceed AED 2M. Apply through the ICP (Federal Authority for Identity, Citizenship, Customs & Port Security) portal after obtaining the title deed.

The process is straightforward when you work with an agent and attorney who have done it hundreds of times. The most common mistakes — skipping the title search, not checking service charge arrears, confusing listed price with total acquisition cost — are entirely avoidable with proper due diligence.`,
  },
  {
    slug: "rental-yield-explained",
    category: "Investment",
    readTime: "5 min",
    views: 3876,
    titleKey: "guide_rentalYield_title",
    descriptionKey: "guide_rentalYield_desc",
    relatedCommunities: ["Jumeirah Village Circle", "Business Bay", "Dubai South"],
    body: `"Rental yield" appears in almost every Dubai property conversation, but the number being quoted is almost never the same thing twice. Understanding the difference between gross, net, and leveraged yield — and knowing which number to demand when evaluating a property — prevents the most common investment mistake: buying a "7% yield" that actually earns 4%.

**Gross Yield: The Starting Number**

Gross yield = (Annual Rent / Purchase Price) × 100.

If you pay AED 800,000 for a unit that rents for AED 60,000 per year, gross yield is 7.5%. This is the number most widely cited in property marketing and portals. It ignores all costs.

**Net Yield: What You Actually Earn**

Net yield accounts for the expenses that reduce your income:
- Service charges (Binayah's data: AED 10–25/sqft/year, averaging ~AED 15,000 for a 1,000 sqft unit)
- Agent commission for leasing: 5% of annual rent on a one-year lease
- Void periods: even a strong market has 2–4 weeks of vacancy per year on average
- Maintenance and minor repairs: budget AED 5,000–10,000 per year for a mid-tier unit

For the same AED 800,000 unit at AED 60,000 gross rent: subtract AED 15,000 service charge, AED 3,000 agency fee, AED 3,000 void (4 weeks), AED 5,000 maintenance = net income of AED 34,000. Net yield: 4.25% — nearly half the headline number.

The Binayah rule of thumb: **assume net yield is 75–85% of gross yield**. If gross is 7%, expect net of 5.25–5.95%.

**Cash-on-Cash Return: The Mortgage Lens**

If you're financing, the relevant number is cash-on-cash return — your net income divided by the cash you actually put in (down payment + acquisition costs).

Example: AED 800,000 purchase, 25% down (AED 200,000), 4% acquisition costs (AED 32,000). Total cash invested: AED 232,000. Annual mortgage cost: AED 28,000 (75% LTV at 4% over 25 years). Net income: AED 34,000. Cash-on-cash: (34,000 - 28,000) / 232,000 = 2.6%.

Leverage amplifies both gains and losses. If rental rates drop 10%, your cash-on-cash becomes negative.

**What Drives Dubai Yields**

JVC leads at 7.2–8.5% gross because prices are low (AED 700–900/sqft) and rents are strong for the asset class. Business Bay yields 6.2–7.1% with higher absolute rents but also higher prices. Premium waterfront (Palm, Marina) yields 4.5–6% because prices are high relative to rents — these are primarily appreciation plays.

**The Yield Curve Question**

Should you buy at current yields or wait for yield compression? Dubai yields have been relatively stable because both prices and rents have risen in tandem. There is no evidence of structural yield compression coming from oversupply — the pipeline is absorbed quickly. But if mortgage rates in source markets (Europe, Russia) rise substantially, demand for investment purchases could soften.

**The Bottom Line**

Ask for net yield, not gross. If a developer or agent can't tell you the service charge rate per sqft, they don't know the number. The difference between a 7% headline and a 4.5% net is the difference between a profitable hold and a cash-flow drain.`,
  },
  {
    slug: "off-plan-vs-secondary",
    category: "How To",
    readTime: "6 min",
    views: 4127,
    titleKey: "guide_offPlanSecondary_title",
    descriptionKey: "guide_offPlanSecondary_desc",
    relatedCommunities: ["Downtown Dubai", "Dubai Marina", "Dubai Creek Harbour"],
    body: `The choice between off-plan and secondary market is the most fundamental decision a Dubai property investor makes. Both have genuine advantages. Neither is universally better. The right choice depends on your capital situation, risk tolerance, and investment timeline.

**Off-Plan: What You're Actually Buying**

When you buy off-plan, you are purchasing a contractual right to a future unit. You are not buying a property — you're buying an option on one. This distinction matters: the developer bears construction risk until handover, but you bear the risk that the developer underdelivers or fails entirely.

The advantages of off-plan are real: prices are typically 15–25% below projected post-completion market value (developers price to move inventory, not to market value). Payment plans spread capital deployment over the construction timeline. If you buy correctly, you can achieve appreciation before you've even made all your payments.

Binayah's data shows off-plan currently represents approximately 45–55% of total transactions in Dubai, which means it is not a niche market — it is the mainstream.

**Secondary Market: What You're Actually Getting**

Secondary transactions involve completed, titled property. You can inspect it, measure it, understand the building's management quality, and take possession immediately. The title deed exists. The risk profile is fundamentally different from off-plan.

The trade-off: you pay current market price, which already incorporates the appreciation off-plan buyers were counting on. There is no payment plan — you pay in full (or fund the mortgage) at completion. And you start generating rent from day one of ownership rather than waiting 2–4 years.

**The Developer Risk Filter**

The single most important variable in off-plan is the developer's track record. Emaar, DAMAC, Sobha, and Meraas have completed large-scale projects on-time-ish and maintained post-handover quality. Smaller developers have a more variable record. Before committing to off-plan:

1. Check the developer's previous project handover timeline (RERA database or official public records)
2. Confirm the project has an RERA escrow account (legally required; funds are ring-fenced)
3. Visit a completed project by the same developer — walk the lobbies, check finish quality, talk to residents

**The Payment Plan Math**

A typical 40/60 plan: 40% during construction (spread over 2–3 years), 60% on handover. If you can't comfortably fund the 60% on handover, you are exposed to a forced sale at handover — exactly when the market has the most leverage over you.

Model the worst case: you need to pay the balance in 24 months and the market has fallen 20%. Can you service the debt? If not, add a buffer or reduce commitment.

**Secondary Market: The Price Discovery Problem**

The secondary market has genuine pricing opacity. Asking prices on portals are not transaction prices. The official registry publishes transaction data, but with a lag. Binayah's transaction data tools close some of this gap — you can see what units in a given building actually traded for in the last quarter. Use it.

**Decision Matrix**

| Criterion | Off-Plan Wins | Secondary Wins |
|---|---|---|
| Capital efficiency | ✓ Lower upfront | |
| Immediate income | | ✓ Day-one rent |
| Risk profile | Higher (delivery) | Lower |
| Exit flexibility | Lower (illiquid until complete) | ✓ Higher |
| Price | ✓ Pre-market | |
| Inspectability | No | ✓ Yes |

If you are a first-time UAE investor: secondary is the lower-risk introduction. If you have UAE market experience and are buying from a major developer with a clean track record: off-plan in a well-located project is an intelligent capital allocation.`,
  },
];

export function findGuide(slug: string): PulseGuide | undefined {
  return PULSE_GUIDES.find((g) => g.slug === slug);
}
