// ── Foreign-buyer SEO landing data ────────────────────────────────────────
// Powers /buying-property-in-dubai-as-[country]-citizen programmatic pages.
// Each market gets bespoke content covering local financing, tax, repatriation,
// and visa nuances — generic copy would not rank against actual local advisors.

export interface ForeignBuyerProfile {
  slug: string;
  country: string;        // "UK" / "Russian" / "Chinese" — appears in copy
  citizen: string;        // "British" / "Russian" / "Chinese" — for natural sentences
  flag: string;
  intro: string;
  whyDubai: string;
  legalStatus: string;
  financing: string;
  taxImplications: string;
  repatriation: string;
  preferredAreas: string[];
}

export const FOREIGN_BUYERS: ForeignBuyerProfile[] = [
  {
    slug: "uk-citizen",
    country: "UK",
    citizen: "British",
    flag: "🇬🇧",
    intro: "Dubai has been the single most active destination for British property capital outside the UK for the past five years. The combination of zero personal income tax, no capital gains tax, and a stable currency pegged to the US dollar has attracted both relocating professionals and remote investors.",
    whyDubai: "British buyers are typically drawn by three factors: tax efficiency relative to UK stamp duty and capital gains, the freehold ownership structure available in designated zones, and the practical convenience of a 7-hour direct flight from London. Many also use Dubai as a base for the Middle East, Africa, and South Asia. Rental yields of 5–8% gross materially exceed the typical 3–4% achievable in central London buy-to-let.",
    legalStatus: "UK citizens can buy freehold property in Dubai's designated freehold zones with no restrictions, no minimum investment requirement (beyond Golden Visa thresholds if pursuing residency), and full title-deed ownership. There is no requirement to be a UAE resident or to spend any time in the UAE. Properties can be held personally, through a UK limited company, or through a UAE free-zone entity (DIFC, ADGM).",
    financing: "UK income and credit history are acceptable to most UAE banks for non-resident lending. HSBC and Standard Chartered are particularly active in the UK expat segment with dedicated international mortgage products. Typical terms: 50% LTV, 4.5–6.5% interest, 25-year term. Pre-approval typically takes 14–21 working days. Some UK buyers leverage their UK property to release equity at lower UK rates and purchase cash in Dubai — often more efficient than a Dubai mortgage.",
    taxImplications: "UK residents remain liable for UK tax on worldwide rental income at marginal rates (up to 45%) plus 20% capital gains tax on disposal. UK non-residents (i.e., those who have left the UK and broken UK tax residency) pay UK tax only on UK-source income — Dubai rental and gains become tax-free. Many UK buyers structure their move to claim non-resident status before triggering significant gains. Inheritance tax is complex: UK-domiciled individuals are taxed on worldwide assets, including Dubai property, at 40% above the nil-rate band. Domicile-of-choice claims to break this require careful planning.",
    repatriation: "No UAE foreign-exchange controls. Funds can be wired to UK accounts in any amount at any time. UK banks may flag large inbound transfers under anti-money-laundering rules — keep records of property sale documents, mortgage statements, and original source-of-funds documentation. Most British buyers find HSBC Premier or Lloyds International accounts useful for AED ↔ GBP transfers.",
    preferredAreas: ["Dubai Marina", "Downtown Dubai", "Dubai Hills Estate", "Palm Jumeirah"],
  },
  {
    slug: "russian-citizen",
    country: "Russian",
    citizen: "Russian",
    flag: "🇷🇺",
    intro: "Russian capital has been one of the largest single contributors to Dubai property transaction volume since 2022. The combination of UAE neutrality, easy residency through property, and minimal documentation friction has made Dubai the destination of choice for Russian capital relocation.",
    whyDubai: "Russian buyers prioritise three things: capital preservation outside the Russian Federation, residency that doesn't require renouncing Russian citizenship, and assets that can be held in a stable currency. Dubai delivers all three. The AED is pegged to USD, providing a hedge against rouble volatility. The Golden Visa at AED 2M provides 10-year residency without giving up Russian citizenship. And Dubai's transaction infrastructure handles Russian capital efficiently — major brokers, lawyers, and developers have dedicated Russian-speaking teams.",
    legalStatus: "Russian citizens enjoy full freehold ownership rights in Dubai's designated zones. No restrictions on amount, type, or number of properties. Sanctions screening applies — major banks and developers conduct standard due diligence — but ordinary Russian buyers without sanctions exposure transact without issue. Properties can be held personally or through corporate structures (DIFC, RAK ICC, or offshore vehicles). Many Russian buyers use a UAE corporate vehicle for liability and inheritance reasons.",
    financing: "Mortgages for Russian non-residents are available but restricted. Sanctions complications mean fewer banks actively lend; Mashreq, Emirates NBD, and some private banks remain accessible. Cash purchase is overwhelmingly the route used — the majority of Russian buyers transact cash. For those seeking mortgage finance, expect 30–40% LTV, 5.5–7% rates, and documentation requirements significantly stricter than for European nationalities. Source-of-funds documentation is essential.",
    taxImplications: "Russia taxes residents on worldwide income at 13–15%. Russian tax residents (183+ days in Russia per year) remain liable to declare Dubai rental income and gains. Russians who relocate to UAE and become UAE tax residents (residence visa + UAE primary home + physical presence) generally escape Russian taxation on Dubai-source income, though this requires care given Russian tax law's residence tests. There is no UAE income tax, no capital gains tax, no inheritance tax on Dubai property.",
    repatriation: "Dubai imposes no exchange controls. Wires to Russian accounts have become operationally complex due to SWIFT restrictions affecting Russian banks; many Russian buyers route through correspondent banks in friendly jurisdictions (UAE, Türkiye, UAE branches of Russian banks like VTB or RSHB). Crypto-settled property transactions have become more common — Dubai's regulated crypto exchanges (Binance, Kraken, OKX, BitOasis) facilitate AED purchases against USDT and BTC, providing a route Russian buyers commonly use.",
    preferredAreas: ["Palm Jumeirah", "Dubai Marina", "JBR", "Business Bay"],
  },
  {
    slug: "chinese-citizen",
    country: "Chinese",
    citizen: "Chinese",
    flag: "🇨🇳",
    intro: "Chinese investment in Dubai property has scaled rapidly post-pandemic, with Chinese buyers now consistently among the top 3 transaction-volume nationalities. The appeal combines lifestyle diversification, Belt-and-Road business positioning, and the increasing complexity of capital deployment in mainland China.",
    whyDubai: "Chinese buyers cite three primary motivations: portfolio diversification outside CNY assets, easy international travel from a UAE base, and educational opportunities (top international schools in Dubai serving Chinese families). The Golden Visa provides 10-year residency that does not require giving up Chinese citizenship (China does not recognise dual citizenship but permits Chinese citizens to hold foreign residency). The 7-hour direct flight to most major Chinese cities and the AED-USD peg complete the picture.",
    legalStatus: "Chinese citizens can buy freehold property in Dubai's designated zones with no restrictions on volume or value. No minimum investment beyond Golden Visa thresholds. Properties can be held personally, through Hong Kong companies, or through UAE corporate vehicles. Many Chinese buyers use BVI or Hong Kong holding structures to optimise inheritance planning under both Chinese succession law and UAE inheritance rules.",
    financing: "Chinese-source income is accepted by most UAE banks, but the documentation requirements are stringent — Chinese tax returns, business bank statements, and source-of-funds verification with attestation. ICBC Dubai and Bank of China Dubai branches actively serve Chinese buyers with dedicated Mandarin-speaking teams. Typical terms: 40–50% LTV, 5–6.5% rates. Cash purchase remains the dominant route given the friction of cross-border financing.",
    taxImplications: "China taxes residents on worldwide income at progressive rates up to 45%. Chinese tax residents are technically required to declare Dubai rental income and any disposal gains. Enforcement varies. Many Chinese investors structure ownership through Hong Kong or BVI entities to manage this exposure. There is no UAE tax on rental income, capital gains, or inheritance for the property itself. Chinese state tax on disposal proceeds repatriated to mainland accounts can be triggered depending on the source of those proceeds.",
    repatriation: "China's $50,000 annual personal foreign-exchange limit creates the practical bottleneck for Chinese buyers. Methods used: aggregating across multiple family members' annual quotas, using corporate vehicles in Hong Kong (no FX cap), or settling property purchases through pre-existing offshore funds. Cash from sale proceeds in Dubai can be wired anywhere without UAE restriction — the constraint is on the receiving side in China. Many Chinese buyers prefer to leave rental income reinvested in Dubai (additional property purchases) rather than repatriate.",
    preferredAreas: ["Downtown Dubai", "Business Bay", "Dubai Marina", "Dubai Hills Estate"],
  },
];

export function findForeignBuyer(slug: string): ForeignBuyerProfile | undefined {
  return FOREIGN_BUYERS.find((b) => b.slug === slug);
}
