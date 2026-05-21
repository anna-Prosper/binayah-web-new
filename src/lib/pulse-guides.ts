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
  {
    slug: "how-to-buy-property-in-dubai",
    category: "How To",
    readTime: "8 min",
    views: 6240,
    titleKey: "guide_howToBuy_title",
    descriptionKey: "guide_howToBuy_desc",
    relatedCommunities: ["Downtown Dubai", "Dubai Marina", "Business Bay"],
    body: `Buying property in Dubai is straightforward once you understand the sequence. Get the order wrong and you waste weeks; get it right and you can close in 30 days from offer to title deed.

**Step 1: Define the Objective Before You Browse**

Investment for yield, owner-occupation, capital appreciation, or Golden Visa are four different buying briefs. They map to different communities, unit sizes, and price brackets. Yield-seekers should look at JVC, Dubai South, or smaller units in Business Bay. Owner-occupiers care about school catchments and commute (Dubai Hills, Arabian Ranches, Mirdif). Capital-growth buyers concentrate on supply-constrained waterfront (Marina, Palm Jumeirah, Bluewaters). Golden Visa qualifiers need the AED 2M threshold met on a single title.

**Step 2: Engage a RERA-Registered Agent**

Only agents licensed by RERA (Real Estate Regulatory Agency) can legally represent you. Ask for the agent's RERA number — it's verifiable on the DLD app. A good agent saves you weeks of unrepresented viewings and protects you in negotiation. Standard agent commission is 2% of purchase price, paid by the buyer at transfer.

**Step 3: Secure Financing or Confirm Cash**

If you're paying cash, get a Letter of No Objection from your bank confirming funds. If you're financing, get a mortgage pre-approval *before* making offers — UAE banks lend up to 80% for residents and 50% for non-residents on a first property. Approval typically takes 5–10 days. Note: financing on off-plan is restricted to specific developer-partner banks.

**Step 4: Submit Form F (Memorandum of Understanding)**

Once a price is agreed, both parties sign Form F (the standard DLD MOU). Buyer pays a 10% security deposit, usually held by the broker or in escrow. This locks the property and triggers the 30-day clock to close.

**Step 5: Apply for NOC (Resale Only)**

For secondary-market transactions, the developer issues a No Objection Certificate confirming service charges are paid and there's no lien. Fee is AED 500–5,000 depending on developer. Process takes 7–14 days. For off-plan you skip this step.

**Step 6: Final Settlement at the DLD Trustee Office**

Buyer, seller, and both agents meet at a Dubai Land Department-approved trustee office (or via the Dubai REST app for digital transactions). Buyer pays:
- 4% DLD transfer fee
- AED 2,000–4,000 trustee office fee
- AED 540 title-deed issuance fee
- Mortgage registration: 0.25% of loan + AED 290 (if financed)
- Agent commission (typically 2% + 5% VAT)

The title deed is issued same-day on cash transactions, 24–48 hours on financed deals. You are now the legal owner.

**Step 7: Move Costs and Annual Obligations**

Plan for: DEWA connection deposit (AED 2,000 for apartments), service charges (AED 10–25/sqft/year depending on building), and Ejari registration if you ever rent it out. Annual property tax does not exist in the UAE.

**Common Mistakes**

- **Skipping the NOC check** — buying a property with unpaid service charges means inheriting the debt
- **Trusting brochure floor plans** — measure on viewing; reported sqft is often gross including walls and shared corridors
- **Underestimating service charges** — a luxury tower can run AED 25–35/sqft/year, materially eroding net yield
- **Buying through unregistered intermediaries** — no legal recourse if it goes wrong

**Timeline Summary**

A clean cash purchase: 14–21 days from offer to title deed. Financed purchase: 30–45 days. Off-plan: contract signed immediately, but title issuance happens at handover (often years later — you hold an Oqood instead, see our title-deed-vs-oqood guide).

Done in this order, with a competent RERA agent and a clear objective, the process is well-defined and protected by mature regulation.`,
  },
  {
    slug: "dld-fees-explained",
    category: "How To",
    readTime: "5 min",
    views: 4870,
    titleKey: "guide_dldFees_title",
    descriptionKey: "guide_dldFees_desc",
    relatedCommunities: ["Business Bay", "Downtown Dubai", "Dubai Marina"],
    body: `The headline DLD transfer fee is 4%, but the true cost of registering a property is closer to 5–7% all-in. Buyers who only budget the 4% headline get a nasty surprise at the trustee office. Here's the complete breakdown.

**The 4% DLD Transfer Fee**

The largest single charge. 4% of the agreed purchase price, paid to Dubai Land Department on the day of transfer. Splittable in theory between buyer and seller, but in 99% of transactions the buyer pays the full 4%. There is no exemption for first-time buyers, residents, or any other category.

**Trustee Office Fees**

Transactions complete at a DLD-approved trustee office (or digitally via Dubai REST). The trustee charges:
- AED 4,000 + 5% VAT — for properties priced above AED 500K
- AED 2,000 + 5% VAT — for properties below AED 500K

This fee is non-negotiable and covers the trustee's role in verifying ID, witnessing transfer, and submitting paperwork to DLD.

**Title Deed Issuance**

AED 540 to issue the new title deed in the buyer's name. Tiny, but compulsory.

**Mortgage Registration Fee (If Financed)**

If you're using a mortgage, DLD charges 0.25% of the loan amount plus AED 290 to register the bank's lien against the property. For an AED 2M loan that's AED 5,290. The bank typically deducts this from the loan disbursement.

**Agent Commission**

Standard practice in Dubai is 2% of the purchase price plus 5% VAT, paid by the buyer to the buyer's agent. On the seller's side, the seller pays their agent the same. For an AED 2M property: 2% = AED 40,000 + AED 2,000 VAT = AED 42,000.

**NOC Fee (Secondary Market Only)**

The seller's developer issues a No Objection Certificate confirming no outstanding service charges. Fee varies by developer:
- Emaar: AED 5,250
- Damac: AED 5,000
- Sobha: AED 3,150
- Mid-tier developers: AED 500–2,000

The seller typically pays this, but practice varies — negotiate explicitly in Form F.

**Off-Plan Specific Fees**

If you're buying off-plan, you pay DLD's Oqood registration fee (4% of price, same as a finished property — the structure is the same, you're just registering a contract rather than a title). The developer often markets the project as "DLD fees waived" — read the contract; usually it means the *developer* absorbs the 4%, not that it's not charged.

**The Total — Real Example**

Buying a finished AED 2M apartment with a 50% mortgage:
- DLD transfer fee (4%): AED 80,000
- Trustee fee: AED 4,200
- Title deed: AED 540
- Mortgage registration (0.25% of AED 1M + 290): AED 2,790
- Agent commission (2% + VAT): AED 42,000
- NOC (mid-tier): AED 1,500

**Total transaction cost: AED 131,030 — or 6.55% on top of the purchase price.**

Many buyers budget only the 4% DLD fee and underestimate by ~AED 50,000 on a 2M deal. Treat 6.5% as the all-in cost on financed deals and 5.5% on cash deals.

**What There Isn't**

There is no annual property tax in the UAE. There is no stamp duty beyond the 4%. There is no capital-gains tax. The transaction cost is front-loaded, then your annual carrying cost is service charges and utilities only.`,
  },
  {
    slug: "title-deed-vs-oqood",
    category: "Deep Dive",
    readTime: "6 min",
    views: 3120,
    titleKey: "guide_titleDeedOqood_title",
    descriptionKey: "guide_titleDeedOqood_desc",
    relatedCommunities: ["Dubai Creek Harbour", "Business Bay", "MBR City"],
    body: `Both documents prove you have a legal interest in a Dubai property. They are not the same. Understanding the difference protects you from buying or selling under the wrong assumptions about your rights.

**Title Deed: Ownership of a Completed Property**

A title deed is issued by Dubai Land Department once a property has been physically completed, registered, and handed over to the owner. It is the freehold (or leasehold) ownership document. With a title deed in your name you:

- Own the property outright (subject to mortgage if financed)
- Can sell, gift, or bequeath it
- Can rent it out and collect income
- Can use it to apply for the Golden Visa (if AED 2M threshold met)
- Can mortgage it independently of any developer

The title deed is the gold standard. If you can choose between a title-deeded unit and an Oqood-registered unit at the same effective price, pick the title.

**Oqood: Registration of an Off-Plan Purchase Contract**

Oqood (Arabic for "contracts") is what you receive when you buy off-plan. It is not an ownership document — it's official registration with DLD that you hold a contractual right to the property once it is completed and handed over. With an Oqood you:

- Have a legal claim against the developer for delivery
- Can sell the contract to another buyer (subject to developer NOC and SPA terms)
- Cannot rent the property — it doesn't exist yet
- Generally cannot use it for Golden Visa until completion (some exceptions for 50%-paid units)
- Need to convert it to a title deed at handover

**The Conversion**

When the property is delivered, you visit the developer's handover desk, pay any outstanding balance, and the developer files a request with DLD to issue the title deed in your name. The Oqood is retired. Conversion typically takes 1–4 weeks after final payment and possession.

**Why This Matters in Negotiation**

If you're buying an Oqood (assignment of an off-plan contract from the original buyer), you're not buying a property — you're buying a contract. Three implications:

1. **Developer NOC required** — the developer must approve the transfer. Fee typically AED 1,500–5,000. Not all developers permit assignment freely.
2. **Limited resale market** — fewer buyers are comfortable with Oqood resales than with title deeds. Discount your asking price expectations 5–15% vs equivalent finished stock.
3. **Construction risk transfers to you** — if the project is delayed or specifications change, you inherit those issues.

If you're selling an Oqood, time it carefully. The closer to handover, the smaller the discount. Selling at 90%-complete is typically much more efficient than selling at 30%.

**The 50% Rule for Golden Visa**

UAE law allows Golden Visa applications on off-plan units (Oqood) only when at least 50% of the purchase price has been paid. Most off-plan payment plans are structured 10% on signing, 20% during construction, 70% on handover — meaning you typically need to be deep into the payment schedule before Golden Visa is achievable on an off-plan unit. Title-deeded units have no such restriction.

**Document Checklist When You Receive Either**

Title deed should show: your name, property location, plot/unit number, area in sqft and sqm, freehold/leasehold status, and a DLD verification QR code. Verify on the Dubai REST app within 24 hours of issuance.

Oqood should show: your name, developer name, project name, unit number, total contract price, and DLD registration number. Cross-check the registration number on the Dubai REST app.

If either document doesn't verify, do not pay anything further until DLD confirms registration.`,
  },
  {
    slug: "ejari-process",
    category: "How To",
    readTime: "4 min",
    views: 5840,
    titleKey: "guide_ejari_title",
    descriptionKey: "guide_ejari_desc",
    relatedCommunities: ["Jumeirah Village Circle", "Business Bay", "Dubai Marina"],
    body: `Ejari is the mandatory rental-contract registration system run by RERA. Without it your tenancy is technically unenforceable, you can't get DEWA connected as a tenant, and you can't sponsor a family visa or get a UAE driving licence. The process is fast — 10 minutes online if you have the documents ready.

**Who Needs to Register**

Every residential and commercial tenancy in Dubai must be registered, regardless of contract length. The landlord is legally responsible for registering, but in practice it's usually the tenant who initiates it because the tenant needs the certificate for DEWA, visa, and other services.

**Required Documents**

Have these ready before you start:

- Signed tenancy contract (original or scanned copy, all pages)
- Title deed of the property (provided by landlord)
- Landlord's Emirates ID
- Tenant's Emirates ID (or passport with valid visa for non-residents)
- Landlord's contact details
- DEWA premise number (from any previous DEWA bill or available from DEWA)

If you don't have the title deed, the landlord must provide it — it's their obligation. Push back firmly; no title deed, no registration.

**How to Register**

Three routes:

**Option 1: Dubai REST app (recommended)** — Download Dubai REST, log in with UAE Pass, select "Ejari Registration." Upload documents, pay, done in 10 minutes. Fee: AED 220 (AED 100 to RERA + AED 100 service + AED 20 innovation fee + tax).

**Option 2: Approved typing centres** — Walk in to any RERA-approved typing centre with documents. Fee usually AED 300–400 (typing centre adds a service fee). Slower than self-service.

**Option 3: Real estate brokerages** — Many agencies will handle Ejari for you, often free if they brokered the rental. Convenient but you wait for them.

**Common Rejections**

- Tenancy contract not on the unified Dubai tenancy form
- Title deed page count doesn't match RERA records (the title was updated after a sub-division and the landlord hasn't refreshed their copy)
- Tenant's visa expired (use a passport with a valid visa, or wait for renewal)
- DEWA premise number mismatch — happens when units were renumbered after handover

**Renewing Ejari**

Ejari must be renewed every year when the tenancy is renewed. Same documents, same fee. If you let it lapse, your DEWA can be cut off and your visa renewal can be blocked. Mark it in your calendar.

**Tenant Rights Under Ejari**

Registration triggers RERA's tenant protections:

- Rent increases capped per the RERA Rent Index (often 0–20% depending on how far below market your rent is)
- 12-month notice required for non-renewal
- 90-day notice required for permitted rent increases
- Tenancy disputes go to the Rental Dispute Settlement Centre (RDSC), which is far cheaper and faster than the courts

Without Ejari, none of these protections apply. The registration is genuinely valuable, not just paperwork.

**For Landlords**

You can also register the contract yourself — and many landlords prefer to, because you control the title-deed disclosure. If you're renting out multiple units, the Dubai REST app's bulk mode handles this efficiently.

Don't register a contract with terms that violate RERA rules (e.g., excessive deposits, prohibited eviction clauses) — the registration creates a legal record of the breach.`,
  },
  {
    slug: "noc-certificate",
    category: "How To",
    readTime: "4 min",
    views: 2980,
    titleKey: "guide_noc_title",
    descriptionKey: "guide_noc_desc",
    relatedCommunities: ["Downtown Dubai", "Dubai Marina", "Palm Jumeirah"],
    body: `The No Objection Certificate (NOC) is the developer's confirmation that a property can be transferred to a new owner. Without it, DLD will not process the sale. It is the single most common cause of delay in secondary-market transactions.

**What the NOC Confirms**

The NOC certifies three things to DLD and to the buyer:

1. All service charges on the unit are paid in full up to the transfer date
2. There are no outstanding fines, violations, or developer-side disputes
3. The developer has no objection to the sale (relevant for buildings with right-of-first-refusal clauses)

If any of these conditions aren't met, the developer either refuses to issue the NOC or issues a conditional one specifying what must be cleared first.

**When You Need One**

Only for secondary-market transactions — i.e., resale of a finished, title-deeded property. You do NOT need an NOC for:

- Off-plan purchases directly from a developer
- Inheritance transfers (different process via DLD)
- Court-ordered transfers

You DO need one for every other resale, including transfers between family members at zero consideration.

**The Process**

The seller initiates. Typical steps:

1. Seller logs in to developer's portal (or visits in person)
2. Selects "Apply for NOC" or "Transfer Application"
3. Uploads buyer's passport and Emirates ID, signed Form F (MOU)
4. Pays the NOC fee — typically AED 500–5,000 depending on developer
5. Developer audits service charge account, checks for violations
6. Developer issues NOC valid for 30–60 days (varies)

**Timeline**

- Major developers with digital portals (Emaar, Damac, Nakheel, Sobha, Meraas): 3–7 working days
- Mid-tier developers: 7–14 working days
- Smaller / less-digitised developers: 14–21+ working days

The buyer cannot speed this up — it's entirely on the seller and the developer.

**NOC Fees by Developer (Indicative 2026)**

| Developer | NOC Fee | Typical Timeline |
|---|---|---|
| Emaar | AED 5,250 | 5 working days |
| Damac | AED 5,000 | 5–7 working days |
| Nakheel | AED 3,150 | 5–10 working days |
| Sobha | AED 3,150 | 7 working days |
| Meraas | AED 5,000 | 5 working days |
| Dubai Properties | AED 1,500 | 7–10 working days |
| Mid-tier (Azizi, Binghatti, etc.) | AED 500–2,000 | 10–21 working days |

Verify before signing Form F — the negotiation point of "who pays NOC" can save AED 5,000.

**What Goes Wrong**

The most common reasons NOC issuance stalls:

- **Outstanding service charges** — the seller had a dispute with the developer, withheld payment, and now needs to settle (sometimes including interest) before NOC is issued. This can derail a sale entirely.
- **Unit modifications** — the seller put up walls, changed flooring, or did renovations without developer approval. The developer demands restoration or fines before issuing.
- **Building-wide audits** — some developers freeze NOCs for an entire building during a master-community audit. Nothing to do but wait.
- **Cheque returned** — if any service charge cheque bounced historically, the developer flags it and requires resolution.

**What Buyers Should Do**

Before signing Form F, ask the seller to obtain a preliminary statement-of-account from the developer showing service charges paid up to date. This is free and confirms there's nothing surprising. If the seller refuses or stalls, treat it as a red flag.

Once Form F is signed, build a 30–45 day window into the closing timeline. NOC delays are the single largest cause of broken deals in Dubai secondary market.`,
  },
  {
    slug: "golden-visa-process",
    category: "How To",
    readTime: "9 min",
    views: 8420,
    titleKey: "guide_goldenVisa_title",
    descriptionKey: "guide_goldenVisa_desc",
    relatedCommunities: ["Palm Jumeirah", "Downtown Dubai", "Dubai Hills Estate"],
    body: `The UAE Golden Visa is a 10-year, self-sponsored residency that property owners can qualify for at the AED 2 million threshold. Process is straightforward, family is included, and renewal at 10 years requires only that you still own qualifying property. Here's how it works in practice.

**Eligibility: The AED 2 Million Rule**

The headline rule: you need property worth at least AED 2 million. Specifics:

- **Single property or combined** — one property at AED 2M qualifies, or two properties at AED 1M each (combined value on a single application). Most applicants use a single qualifying unit.
- **Title deed required** — the property must be title-deeded in your name, fully completed and registered with DLD. Off-plan units do *not* qualify unless 50% of the price has been paid AND the developer is on the approved list (currently Emaar, Damac, Nakheel, Sobha, Meraas, Dubai Holding).
- **Mortgage permitted** — financed purchases qualify, but you must have paid at least 50% of the property price (i.e., your equity must be at least AED 1M). The bank must issue a Letter of No Objection for the visa application.
- **Joint ownership** — only the primary owner gets the visa. Joint owners need separately-qualifying interests.

**What's Included**

- 10-year residency for the property owner
- Family sponsorship: spouse, all children (no age limit for unmarried children), parents (with health-insurance proof)
- Unlimited entries / exits — no 6-month rule like standard residency
- Eligibility to sponsor domestic workers
- Eligibility to open bank accounts, register a business, and own multiple properties
- No physical-presence requirement to maintain the visa

**The Application Process**

The Golden Visa is processed by the General Directorate of Residency and Foreigners Affairs (GDRFA) in Dubai, in partnership with DLD for property-based applications.

**Step 1: Title deed in hand** — complete the property purchase first. You cannot apply during escrow.

**Step 2: Health insurance** — secure a valid UAE health insurance policy for yourself and dependents. AED 2,000–8,000 per person depending on coverage.

**Step 3: Medical fitness test** — at any approved medical centre. AED 300–500. Required for all applicants 18+.

**Step 4: Submit application** — via the GDRFA Dubai website, ICA app, or an approved typing centre. Required documents:

- Title deed
- Passport (validity 6+ months)
- Existing UAE visa (if applicable)
- Health insurance certificate
- Medical fitness certificate
- Passport-style photos (white background)
- Marriage certificate (attested) — if including spouse
- Birth certificates (attested) — if including children

**Step 5: Pay fees** — main applicant: approximately AED 2,800–4,000 including visa, ID, and processing. Each dependent: approximately AED 2,500.

**Step 6: Biometrics** — visit a GDRFA Smart Channel for fingerprinting and photo.

**Step 7: Issuance** — Golden Visa stamped in passport, Emirates ID issued. Total timeline: typically 7–14 working days for the main applicant, slightly longer for family additions.

**For Foreign Applicants (Not Yet UAE Resident)**

Apply for an entry permit first (the Golden Visa entry permit is separate from a tourist visa — it's specifically for entering UAE to complete a Golden Visa). On arrival, complete the medical and submit to GDRFA. The full process is doable within one 30-day visit.

**Maintaining the Visa**

You must own the qualifying property continuously. If you sell and don't replace it, your visa is revoked (though family residencies sponsored under it continue until expiry). At year 10, renewal is automatic provided you still own qualifying property.

**Common Pitfalls**

- **Off-plan disqualification** — buyers assume off-plan Oqood qualifies; usually it doesn't unless 50%+ paid AND approved-developer.
- **Joint ownership confusion** — buyers assume both names on title deed = both eligible. Only one gets the visa per qualifying property.
- **Mortgage threshold** — if your equity drops below AED 1M during the term (e.g., property value falls), you may face renewal issues.
- **Health insurance gaps** — letting health insurance lapse can complicate dependent renewals.

**Bottom Line**

For property buyers at the AED 2M+ level, the Golden Visa converts a property purchase into a pathway to decade-long, family-inclusive UAE residency. The marginal cost (AED 5,000–10,000 in fees beyond the property itself) is trivial relative to the benefit. Plan it from day one of the property search — the threshold is a useful filter for what you buy.`,
  },
  {
    slug: "buying-as-non-resident",
    category: "How To",
    readTime: "7 min",
    views: 5640,
    titleKey: "guide_nonResident_title",
    descriptionKey: "guide_nonResident_desc",
    relatedCommunities: ["Dubai Marina", "Downtown Dubai", "Palm Jumeirah"],
    body: `You don't need to live in the UAE — or even visit — to buy property in Dubai. Foreign non-residents can purchase freehold property in designated areas, complete transactions remotely, and own property indefinitely. Here's the practical process.

**Freehold Areas: Where Foreigners Can Buy**

Non-residents can buy in designated freehold zones, which cover the vast majority of investor-relevant Dubai. These include:

- Downtown Dubai
- Dubai Marina
- Palm Jumeirah
- Business Bay
- JBR
- Jumeirah Village Circle (JVC) and Triangle (JVT)
- Dubai Hills Estate
- Bluewaters Island
- Dubai Creek Harbour
- MBR City
- Damac Hills
- Arabian Ranches
- DIFC
- And many more

Practical answer: if it's a community marketed to international buyers, it's almost certainly freehold. Older areas like Bur Dubai and Deira are mostly leasehold and not open to non-resident freehold purchase.

**Remote Purchase: The Three Routes**

**Route 1: Power of Attorney (POA)**

The most common remote-purchase mechanism. You issue a POA to a UAE-based representative (a lawyer, a trusted person, or a real-estate agent's nominated officer). The POA must be:

1. Drafted in Arabic (or with certified Arabic translation)
2. Notarised in your home country
3. Attested by the UAE embassy/consulate in your country
4. Attested by the UAE Ministry of Foreign Affairs upon arrival
5. Stamped by the Dubai Notary Public

Total cost AED 1,500–3,000 plus your home-country notary/embassy fees. Plan 2–4 weeks for the full attestation chain. Once issued, your representative can sign Form F, attend the trustee office, and complete transfer on your behalf.

**Route 2: Digital Transfer via Dubai REST**

DLD now permits fully digital transfers between parties who hold UAE Pass. As a non-resident, you can obtain UAE Pass with a valid passport. Both buyer and seller authenticate digitally, sign Form F and the title transfer in-app, and pay via card or wire. No physical attendance, no POA. This works smoothly for cash transactions and developer-direct sales. It does not yet work for mortgaged purchases — banks still require physical presence or POA for loan closing.

**Route 3: Visit and Close in Person**

The simplest path. Tourist visa, 7-day visit, complete everything in person. Most buyers do at least one viewing trip before committing — the AED 1.5–3K airfare is rounding error on a property purchase. Even if you intend a remote close, an in-person trip lets you verify the agent, see the unit, and meet the developer.

**Mortgages for Non-Residents**

UAE banks lend to non-residents on more restrictive terms than to residents:

- Maximum LTV typically 50% (vs 80% for residents)
- Higher interest rates: 4.5–6.5% currently vs 3.5–5% for residents
- Required documents: 6 months of bank statements, 6 months of payslips (or equivalent self-employment proof), tax returns from your home country
- Approval timeline: 14–21 working days
- Repayment in AED — you take FX risk between your earning currency and AED
- Most banks require salary > AED 30,000/month equivalent

Banks active in non-resident lending: HSBC, Standard Chartered, Mashreq, Emirates NBD (selective), ADCB (selective). Smaller banks rarely lend to non-residents.

For most non-resident buyers, cash purchase is the path of least friction. Mortgage is viable but adds 30+ days and significant paperwork.

**Tax Considerations**

UAE imposes no personal income tax, no capital gains tax, no inheritance tax on property, and no property tax. Your home country may tax differently — particularly the US (which taxes citizens on worldwide income and may treat rental income as taxable), UK (which taxes rental income for non-domiciled landlords), and India (which treats rental income from foreign property as taxable for residents). Get tax advice in your home jurisdiction before treating Dubai property as a tax-efficient strategy.

**Repatriating Rental Income and Sale Proceeds**

The UAE has no foreign-exchange controls. You can wire rental income or sale proceeds to your home country at any time, in any amount, without permits. Banks may apply standard anti-money-laundering documentation requirements above certain thresholds.

**Setting Up Property Management**

Non-resident owners typically engage a property-management company (Binayah offers this service) for AED 5,000–15,000/year plus 5–8% of collected rent. The manager handles:

- Tenant sourcing and Ejari registration
- Rent collection and remittance to your overseas account
- Maintenance coordination
- Service charge payment from collected rent
- Annual statements for your tax reporting

Without local management, you'll spend significant time coordinating tenants, contractors, and authorities remotely.

**Realistic Timeline for a Fully-Remote Purchase**

- POA preparation and attestation: 3–4 weeks
- Property search and offer: 1–4 weeks
- Form F to title transfer (cash): 14–21 days
- Mortgage closing if financed: add 30–45 days

A motivated buyer with a clear brief can be a Dubai property owner within 6–10 weeks without setting foot in the UAE. With one viewing trip, the same process compresses to 4–6 weeks.

**The Bottom Line**

Dubai is one of the most foreigner-friendly property markets in the world. The legal infrastructure is mature, the digital tools are functional, and the freehold structure provides genuine ownership equivalent to citizens. The friction is logistical (attestation chains, document collection) — not legal. With a competent local agent or property manager, non-resident ownership is operationally smooth.`,
  },
];

export function findGuide(slug: string): PulseGuide | undefined {
  return PULSE_GUIDES.find((g) => g.slug === slug);
}
