// ─────────────────────────────────────────────────────────────────────────────
// Promotional offer landing pages (/offers/<slug>).
//
// Adding a new offer means adding one entry here — no page code. The template at
// app/[locale]/offers/[slug]/page.tsx renders every field below, and the index
// hub at app/[locale]/offers/page.tsx lists them.
//
// `deadline` drives the live countdown AND the expiry state: once it passes, the
// page swaps urgency messaging for a "register for the next drop" CTA rather
// than showing a dead timer. Keep it an ISO string with the +04:00 Gulf offset
// so the cutoff is unambiguous for a Dubai audience.
// ─────────────────────────────────────────────────────────────────────────────

export interface OfferHighlight {
  /** Big number/short value, e.g. "20%" or "AED 200K+". */
  value: string;
  /** What the number means, e.g. "Payable now". */
  label: string;
  /** Optional one-line elaboration shown under the label. */
  detail?: string;
}

export interface OfferTimelineStep {
  stage: string;
  share: string;
  description: string;
}

export interface OfferFaq {
  question: string;
  answer: string;
}

/** A project the offer applies to, with links through to whatever pages exist. */
export interface OfferProject {
  /** Project name as the developer's own campaign material writes it. */
  name: string;
  /** What this specific project gets under the offer. */
  terms: string;
  /** Card image — the project's own featured shot. */
  image?: string;
  /** Live project pages. Several when a masterplan has no single hub page and
   *  is only represented by its individual towers or clusters; empty when we
   *  have no page at all, which renders the card without a link rather than
   *  pointing somewhere misleading. */
  links?: { label: string; href: string }[];
}

export interface OfferEligibility {
  label: string;
  value: string;
}

export interface Offer {
  slug: string;
  /** Short label for cards and the breadcrumb, e.g. "Sobha 20:80". */
  shortName: string;
  developer: string;
  /** Badge above the H1 — the promo type, e.g. "48-hour flash offer". */
  eyebrow: string;
  h1: string;
  /** One-sentence promise, shown under the H1. */
  subtitle: string;
  heroImage: string;
  /** ISO 8601 with explicit +04:00 offset. Drives the countdown and the expiry
   *  state. Leave EMPTY when the developer hasn't published an end date: the
   *  offer then shows `windowLabel` (defaulting to "Limited time offer") with no
   *  countdown, and never expires — better than inventing a date that would
   *  silently retire a live promotion. */
  deadline: string;
  /** Human-readable window, e.g. "8–9 August 2026". Falls back to
   *  DEFAULT_WINDOW_LABEL when empty. */
  windowLabel: string;
  /** Suppress every deadline mention the template emits: the countdown, the
   *  window label and the "limited-time" chrome. For offers whose end date is
   *  provisional, where advertising a window would overstate how firm it is.
   *  `deadline` still drives expiry — the offer just doesn't advertise it. */
  hideDeadline?: boolean;
  /** When true, the hero badge ignores the literal `eyebrow` string and
   *  instead renders a live "Ends <weekday>, N days only" computed from
   *  `deadline` on every request — so a badge advertising a day count never
   *  drifts stale as the window ticks down. Requires a real `deadline`. */
  dayCountEyebrow?: boolean;
  /** Short "what is this and why it's good" block rendered right under the
   *  hero highlight band — the first thing a reader sees after the numbers,
   *  before the lifestyle/community sections further down the page. */
  explainer?: {
    heading: string;
    /** One-line standout stat, rendered as a bordered callout above the body
     *  copy — e.g. a sales record or a relaxed eligibility rule. Omit for a
     *  plain heading + paragraphs explainer. */
    highlight?: string;
    body: string[];
    /** Optional checklist rendered after the body paragraphs — for a list of
     *  incentives/terms that reads better as bullets than as one dense
     *  sentence. `waiversIntro` and `waiversNote` bracket it (lead-in line,
     *  then a caveat), both optional. */
    waiversIntro?: string;
    waivers?: string[];
    waiversNote?: string;
  };
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  /** Lowest qualifying price in AED, if the campaign publishes one. Drives the
   *  priceSpecification in the Offer JSON-LD; omitted when there is no single
   *  entry figure. Note this completes the markup rather than unlocking a rich
   *  result: Google's price-bearing rich results are retail-oriented and a
   *  property offer is not eligible for them. */
  priceFrom?: number;
  /** 3–4 headline numbers rendered as the stat band under the hero. */
  highlights: OfferHighlight[];
  /** Payment-plan breakdown rendered as a horizontal timeline. EVERY offer
   *  should define one — the staged rail is a standing section, not an optional
   *  flourish. Still typed optional because the data comes from MongoDB and the
   *  shape can't be guaranteed at compile time; if it's absent the section
   *  simply doesn't render, which is a content gap to fix, not a design choice. */
  timeline?: OfferTimelineStep[];
  /** Lead-in under the timeline heading. The default describes a front-loaded
   *  plan, which is wrong for an even split, so any non-20:80 structure should
   *  set its own. */
  timelineIntro?: string;
  /** "The offer in detail" bullet rows. */
  eligibility: OfferEligibility[];
  /** Participating projects, linked through to their own pages. Drives the
   *  reader from the terms into real inventory instead of dead-ending. */
  projects?: OfferProject[];
  /** Community and lifestyle features, rendered as a checklist band.
   *  `icons` is a parallel array of lucide icon names — positional, so it lives
   *  on the English base and merges through to every locale unchanged. Any name
   *  the map doesn't know falls back to a check mark. */
  amenities?: {
    heading: string;
    /** Lede stats shown as a highlighted band above the icon-grid cards —
     *  e.g. "50%" / "Green & open space". Separate from `items` because a
     *  stat needs its number and its label as distinct strings, not one
     *  sentence to parse apart at render time. Omit for a flat checklist. */
    stats?: { value: string; label: string; icon?: string }[];
    items: string[];
    icons?: string[];
    /** Divider heading between the stat band and the icon-grid cards. Falls
     *  back to DEFAULT_MASTERPLAN_HEADING when a locale hasn't translated it. */
    masterplanHeading?: string;
  };
  /** Gallery images. `src` lives only on the English base; `alt` is translated
   *  per locale so image search and screen readers get the local language. */
  gallery?: { src: string; alt: string }[];
  /** Investment case — a short "why this one" stripe under the value props.
   *  `icons` is positional, same convention as amenities. */
  investment?: { heading: string; items: { title: string; text: string }[]; icons?: string[] };
  /** Call-to-action labels. Translatable, because the template's own strings
   *  would otherwise stay English on every localised page. */
  ctaLabel?: string;
  whatsappLabel?: string;
  /** Pre-typed WhatsApp message. Falls back to a line built from shortName. */
  whatsappMessage?: string;
  /** Why-it-matters cards: [heading, body]. */
  valueProps: [string, string][];
  /** Long-form context paragraphs (SEO body copy). */
  bodyParagraphs: string[];
  /** Optional worked example — the maths that makes the offer concrete. */
  worked?: { heading: string; rows: [string, string][]; footnote?: string };
  faqs: OfferFaq[];
  /** Small print rendered below the final CTA. */
  disclaimer: string;
  /** Optional deep link to the matching project page. */
  projectHref?: string;
}

export const OFFERS: Offer[] = [
  {
    "slug": "sobha-20-80-payment-plan",
    "shortName": "Sobha 20:80 Payment Plan",
    "developer": "Sobha Realty",
    "eyebrow": "Ends Sunday, 4 days only",
    "h1": "Sobha 20:80 Offer: Only 20% Before Handover",
    "subtitle": "Ultra luxury from a Tier 1 developer, for a fifth of your own money.",
    "heroImage": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/sobha-20-80-hero-villa.webp",
    "deadline": "2026-08-23T23:59:59+04:00",
    "windowLabel": "Ends Sunday 23 August 2026",
    "hideDeadline": false,
    "metaTitle": "Sobha 20:80 Offer from AED 1.8M | Pay 20% Now",
    "metaDescription": "Own a Sobha home from AED 1.8M: 20% during construction, 80% on handover, across five communities. Up to 4% DLD waived. Speak to Binayah.",
    "keywords": "Sobha 20:80 payment plan, Sobha payment plan Dubai, Sobha Central 1 bedroom price, 20 80 payment plan Dubai, Sobha offer 2026, Sobha Elwood price, Sobha Sanctuary villas, Sobha Siniya Island, Downtown Umm Al Quwain, DLD waiver Dubai, off plan Dubai payment plan",
    "highlights": [
      {
        "value": "20%",
        "label": "During construction",
        "detail": "Spread across the build period"
      },
      {
        "value": "80%",
        "label": "On completion",
        "detail": "Deferred until the unit is ready"
      },
      {
        "value": "100%",
        "label": "DLD fee waived",
        "detail": "The full 4% registration fee, covered"
      },
      {
        "value": "AED 1.8M",
        "label": "Entry price",
        "detail": "Lowest 20:80 entry, a one bed at Sobha Central"
      }
    ],
    "eligibility": [
      {
        "label": "Offer window",
        "value": "Four days only, 20 to 23 August 2026."
      },
      {
        "label": "Communities",
        "value": "All five: Elwood, Sanctuary, Central, Siniya Island and Downtown Umm Al Quwain."
      },
      {
        "label": "Entry price",
        "value": "From AED 1.8M for a one bedroom at Sobha Central, though apartments, townhouses and villas across all five projects qualify too."
      },
      {
        "label": "Payment structure",
        "value": "20% across three instalments (2% booking, 8% within 7 days, 10% within 15 days), 80% on completion."
      },
      {
        "label": "Incentives",
        "value": "DLD registration fee waivers of up to 4%, two year service charge waivers, and furniture vouchers on selected communities."
      },
      {
        "label": "To secure the terms",
        "value": "Unit booked or PR-approved with the 2% booking amount paid inside the offer window."
      },
      {
        "label": "To release the benefits",
        "value": "Payment of 10%, the applicable registration fee and execution of the Booking Form."
      },
      {
        "label": "Resale and mortgage",
        "value": "Permitted at completion, often against a value that has already moved on from what you paid."
      },
      {
        "label": "Golden Visa",
        "value": "Units priced above AED 2 million qualify for the property investor visa route."
      }
    ],
    "valueProps": [
      [
        "Entry starts at AED 1.8 million",
        "A one bedroom at Sobha Central opens the 20:80 structure at AED 1.8 million, the lowest way into this campaign. The same deferred split then scales all the way up through apartments, townhouses and the Estate villas at Sanctuary."
      ],
      [
        "AED 360,000 secures an AED 1.8M home",
        "Twenty per cent is all that leaves your pocket before handover: AED 360,000 on an AED 1.8 million property, staged as 2% today, 8% within 7 days and 10% within 15 days. The remaining AED 1.44 million is deferred until the unit is ready."
      ],
      [
        "Resell or mortgage at completion",
        "The unit can be resold or mortgaged once it completes, by which point it has had the full construction period to appreciate. Sobha properties have historically gained 20 to 50% in value by handover, depending on unit type."
      ],
      [
        "Waivers worth thousands, on top of the split",
        "Beyond the deferred payment, each project layers its own incentives: DLD registration fee waivers of up to 4%, a two year service charge waiver, and a furniture voucher on Elwood. On the AED 1.8 million entry unit at Sobha Central, the 2% DLD waiver alone is AED 36,000 back in your pocket."
      ]
    ],
    "bodyParagraphs": [
      "Sobha's 20:80 payment plan is open again for four days, from 20 to 23 August 2026. The structure is the same across every participating community (20% across the construction period and 80% on handover), but the incentives layered on top differ by project and, in two cases, by unit type within the same project. We place the booking, handle the paperwork and secure the developer approval on your behalf.",
      "The number that matters most is the entry price: AED 1.8 million for a one bedroom at Sobha Central. That is the cheapest way into the 20:80 structure in this campaign, and it puts a deferred payment Sobha home within reach of buyers who would have assumed this kind of plan was reserved for the villa end of the market. The same 20:80 split then runs right across all five participating projects.",
      "The waivers are worth reading closely. Elwood, the Courtyard and Garden villas at Sanctuary, and one bedroom apartments at Central carry a 2% DLD waiver; the Estate villas at Sanctuary and the two and three bedroom apartments and retail units at Central carry the full 4%. Siniya Island and Downtown Umm Al Quwain go further and waive the registration fee outright. Elwood adds a 2% furniture voucher, and both Sanctuary's Courtyard and Garden villas and Central's one beds add a two year service charge waiver.",
      "The terms are held by action inside the window, not by intent. A unit must be booked or PR approved with the 2% booking amount paid during the offer period, and the benefits are extended on payment of 10% along with the applicable registration fee and execution of the Booking Form. The offer does not apply to cancellations, swaps, upgrades, downgrades or re bookings, so it is worth confirming the exact position on any unit already under discussion."
    ],
    "worked": {
      "heading": "What it takes to secure a AED 1.8M one bed at Sobha Central",
      "rows": [
        [
          "Purchase price",
          "AED 1,800,000"
        ],
        [
          "Booking amount, inside the offer window (2%)",
          "AED 36,000"
        ],
        [
          "Payable to extend the benefits (10%)",
          "AED 180,000"
        ],
        [
          "Total across construction (20%)",
          "AED 360,000"
        ],
        [
          "Balance on handover (80%)",
          "AED 1,440,000"
        ]
      ],
      "footnote": "Figures shown on the AED 1.8M entry price for a one bedroom at Sobha Central."
    },
    "faqs": [
      {
        "question": "When does the Sobha 20:80 payment plan close?",
        "answer": "Sunday 23 August 2026. To hold the terms, the unit has to be booked or PR approved with the 2% booking amount paid before then. Talk to us early: we place the booking, handle the Booking Form and the developer approval, and represent you through to handover."
      },
      {
        "question": "What is the cheapest unit on the 20:80 plan?",
        "answer": "AED 1.8 million, for a one bedroom apartment at Sobha Central. That is the entry point for the campaign; the same 20:80 structure then runs up through apartments, townhouses and villas across the other four projects."
      },
      {
        "question": "Which unit types qualify?",
        "answer": "Apartments, townhouses, retail units and villas. Sobha Central covers one, two and three bedroom apartments plus retail; Sanctuary covers Courtyard, Garden and Estate villas; Elwood, Siniya Island and Downtown Umm Al Quwain each carry their own inventory. Message us on WhatsApp and we will send you the current list."
      },
      {
        "question": "Can I resell or mortgage before I pay the 80%?",
        "answer": "The unit can be resold or mortgaged at completion, once the construction period has run. Sobha properties have historically appreciated 20 to 50% by handover depending on unit type, so the deferred balance is often settled against a higher valuation than the purchase price."
      },
      {
        "question": "How much of the DLD fee is waived?",
        "answer": "It depends on the project and the unit type. Sobha Elwood, the Courtyard and Garden villas at Sanctuary, and one bedroom apartments at Central carry a 2% DLD waiver. The Estate villas at Sanctuary and the two and three bedroom apartments and retail at Central carry 4%. Sobha Siniya Island and Downtown Umm Al Quwain waive the registration fee in full."
      },
      {
        "question": "What do I have to pay to lock the offer in?",
        "answer": "A 2% booking amount during the offer period, with the unit booked or PR approved. The benefits are then extended on payment of 10% plus the applicable registration fee and execution of the Booking Form."
      },
      {
        "question": "Which projects are included?",
        "answer": "Five: Sobha Elwood, Sobha Sanctuary (Courtyard and Garden villas, and Estate villas), Sobha Central (one bedroom apartments, and two and three bedroom apartments plus retail), Sobha Siniya Island, and Downtown Umm Al Quwain."
      },
      {
        "question": "Can I apply this to a unit I have already booked?",
        "answer": "No. The offer does not apply to cancellations, swaps, upgrades, downgrades or re bookings. If you already have a unit under discussion, message us on WhatsApp and we will confirm exactly where it stands."
      }
    ],
    "disclaimer": "Terms are set by Sobha Realty and apply to selected units and projects only, subject to availability and developer approval. Waivers and vouchers vary by project and unit type as set out above. Figures shown are illustrative and do not constitute financial advice or an offer to sell. The offer does not apply to cancellations, swaps, upgrades, downgrades or re bookings. Confirm all terms in writing before committing. Binayah Properties is a licensed Dubai brokerage.",
    "timeline": [
      {
        "stage": "Today",
        "share": "2%",
        "description": "Booking amount, paid to reserve the unit."
      },
      {
        "stage": "Within 7 days",
        "share": "8%",
        "description": "Second instalment."
      },
      {
        "stage": "Within 15 days",
        "share": "10%",
        "description": "Completes the 20%."
      },
      {
        "stage": "On completion",
        "share": "80%",
        "description": "The balance, payable when the unit is ready."
      }
    ],
    "timelineIntro": "Pay 20% of the purchase price across three instalments. The remaining 80% is due only on handover.",
    "projects": [
      {
        "name": "Sobha Elwood",
        "terms": "20:80 plan, 2% DLD waiver and a 2% furniture voucher.",
        "links": [
          {
            "label": "Sobha Elwood at Dubailand",
            "href": "/project/sobha-elwood-at-dubailand"
          }
        ],
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/proj-sobha-elwood.webp"
      },
      {
        "name": "Sobha Sanctuary",
        "terms": "Courtyard & Garden villas: 20:80, 2% DLD waiver, 2 year service charge waiver. Estate villas: 20:80 and a 4% DLD waiver.",
        "links": [
          {
            "label": "The Woods",
            "href": "/project/the-woods-sobha-sanctuary"
          },
          {
            "label": "The Grove",
            "href": "/project/the-grove-at-sobha-sanctuary"
          },
          {
            "label": "The Greens",
            "href": "/project/the-greens-at-sobha-sanctuary"
          }
        ],
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/the-woods-serenity-at-sobha-sanctuary/gallery/the-woods-serenity-at-sobha-sanctuary-gallery_1-hd.webp"
      },
      {
        "name": "Sobha Central",
        "terms": "1 beds from AED 1.8M: 20:80, 2% DLD waiver, 2 year service charge waiver. 2 & 3 beds and retail: 20:80 and a 4% DLD waiver.",
        "links": [
          {
            "label": "The Pinnacle",
            "href": "/project/the-pinnacle-at-sobha-central"
          },
          {
            "label": "The Mirage",
            "href": "/project/the-mirage-at-sobha-central"
          },
          {
            "label": "The Serene",
            "href": "/project/the-serene-at-sobha-central-by-sobha-group"
          },
          {
            "label": "The Eden",
            "href": "/project/the-eden-at-sobha-central"
          }
        ],
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/proj-sobha-central.webp"
      },
      {
        "name": "Sobha Siniya Island",
        "terms": "20:80 plan and a 100% registration fee waiver.",
        "links": [
          {
            "label": "Siniyah Island by Sobha",
            "href": "/project/siniyah-island-by-sobha-realty"
          },
          {
            "label": "Aquamarine Beach Residences",
            "href": "/project/beach-residences-at-sobha-siniya-island"
          }
        ],
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/proj-sobha-siniya-island.webp"
      },
      {
        "name": "Downtown Umm Al Quwain",
        "terms": "20:80 plan and a 100% registration fee waiver.",
        "links": [
          {
            "label": "The Coastal City",
            "href": "/project/sobha-downtown-umm-al-quwain-the-coastal-city"
          },
          {
            "label": "Sobha Aquamont",
            "href": "/project/sobha-aquamont-downtown-umm-al-quwain"
          }
        ],
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/proj-downtown-umm-al-quwain.webp"
      }
    ],
    "amenities": {
      "heading": "Half of it is green.",
      "stats": [
        {
          "value": "50%",
          "label": "Green & open space",
          "icon": "Leaf"
        },
        {
          "value": "800,000",
          "label": "Sq ft green parks",
          "icon": "Trees"
        },
        {
          "value": "9+ km",
          "label": "Wellness & cycling loops",
          "icon": "Bike"
        }
      ],
      "masterplanHeading": "Inside the masterplan",
      "items": [
        "Beach style lagoons",
        "Lazy rivers",
        "Zen gardens",
        "Meditation lawns",
        "Co working spaces",
        "Community hubs",
        "Pet therapy gardens",
        "Farmers' market style spaces",
        "Community malls"
      ],
      "icons": [
        "Waves",
        "Droplets",
        "Flower2",
        "Sun",
        "Laptop",
        "Users",
        "PawPrint",
        "ShoppingBasket",
        "Store"
      ]
    },
    "ctaLabel": "See qualifying units",
    "whatsappLabel": "WhatsApp us now",
    "whatsappMessage": "Hi Binayah! 👋 I want the Sobha 20:80 plan: 20% now, 80% on handover, from AED 1.8M. Please send me the qualifying units.",
    "investment": {
      "heading": "A Tier 1 build, held for the long run.",
      "items": [
        {
          "title": "Tier 1 developer",
          "text": "Sobha designs, builds and delivers in house."
        },
        {
          "title": "Growth corridor",
          "text": "Positioned in an appreciating district."
        },
        {
          "title": "Rental demand",
          "text": "Stable yields and a quality tenant profile."
        },
        {
          "title": "Long term value",
          "text": "Built to hold, not to flip."
        }
      ],
      "icons": [
        "Building2",
        "TrendingUp",
        "Coins",
        "ShieldCheck"
      ]
    },
    "gallery": [
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/sobha-20-80-hero-villa.webp",
        "alt": "Sobha villa exterior with private pool"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/sobha-hd/01-sobha-sanctuary-at-dubailand-gallery_13--2x.webp",
        "alt": "Aerial view of the Sobha Sanctuary masterplan in Dubailand"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/sobha-hd/02-sobha-sanctuary-at-dubailand-gallery_11--2x.webp",
        "alt": "Beach style swimming lagoon at Sobha Sanctuary"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/sobha-hd/03-sobha-sanctuary-at-dubailand-featured-hd-2x.webp",
        "alt": "Kayaking on the lagoon beneath the waterfall at Sobha Sanctuary"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/sobha-hd/04-sobha-sanctuary-at-dubailand-gallery_2-h-2x.webp",
        "alt": "Zen garden and water feature at Sobha Sanctuary"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/sobha-hd/05-sobha-sanctuary-at-dubailand-gallery_3-h-2x.webp",
        "alt": "Central park and lake at Sobha Sanctuary"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/sobha-hd/06-sobha-sanctuary-at-dubailand-gallery_8-h-2x.webp",
        "alt": "Meditation and yoga lawn at Sobha Sanctuary"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/sobha-hd/07-sobha-sanctuary-at-dubailand-gallery_10--2x.webp",
        "alt": "Pet therapy garden and dog run at Sobha Sanctuary"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/sobha-hd/08-sobha-sanctuary-at-dubailand-gallery_14--2x.webp",
        "alt": "Dining and retail promenade at Sobha Sanctuary"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/sobha-hd/09-sobha-sanctuary-at-dubailand-gallery_12--2x.webp",
        "alt": "Sobha Sanctuary Mall at dusk"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/sobha-hd/10-sobha-sanctuary-at-dubailand-gallery_9-h-2x.webp",
        "alt": "Town centre and sports courts at Sobha Sanctuary"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/the-woods-abode-at-sobha-sanctuary/featured.webp",
        "alt": "The Woods Abode apartments at Sobha Sanctuary"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/the-grove-at-sobha-sanctuary/featured.webp",
        "alt": "Waterfront homes at The Grove, Sobha Sanctuary"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/the-brooks-at-sobha-sanctuary/gallery/1.webp",
        "alt": "Contemporary villa at The Brooks, Sobha Sanctuary"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/the-woods-sobha-sanctuary/gallery/the-woods-sobha-sanctuary-gallery_1-hd.webp",
        "alt": "The Woods at Sobha Sanctuary overlooking the lagoon"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/the-woods-serenity-at-sobha-sanctuary/gallery/the-woods-serenity-at-sobha-sanctuary-gallery_1-hd.webp",
        "alt": "Parkland and walking trails at The Woods Serenity, Sobha Sanctuary"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/proj-sobha-central.webp",
        "alt": "Sobha Central towers on Sheikh Zayed Road"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/sobha-hd/17-the-serene-at-sobha-central-by-sobha-gro-2x.webp",
        "alt": "Sports pitch and parkland between the towers at Sobha Central"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/sobha-hd/18-the-serene-at-sobha-central-by-sobha-gro-2x.webp",
        "alt": "Elevated parkland and pool terraces at Sobha Central"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/sobha-hd/19-5-2x.webp",
        "alt": "The Pinnacle at Sobha Central above the Dubai skyline at sunset"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/proj-sobha-elwood.webp",
        "alt": "Sobha Elwood villa with private pool"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/proj-sobha-siniya-island.webp",
        "alt": "Bedroom with sea views at Sobha Siniya Island"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/sobha-hd/22-gallery-siniya-2-2x.webp",
        "alt": "Beachfront residences at Sobha Siniya Island"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/proj-downtown-umm-al-quwain.webp",
        "alt": "Beachfront and pool deck at Downtown Umm Al Quwain"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/gallery-uaq-2.webp",
        "alt": "Towers and shoreline at Downtown Umm Al Quwain"
      }
    ],
    "dayCountEyebrow": true,
    "explainer": {
      "heading": "The 20:80 plan is back, across all five Sobha communities",
      "highlight": "The last time this plan ran, Sobha sold over AED 1 billion of property in two days. This round is open wider still: there is no minimum requirement to buy a 5 million dirham unit.",
      "body": [
        "Sobha's 20:80 payment plan is open again across all five Dubai and Siniya Island communities. Pay just 20% of the price while it's being built and defer the remaining 80% to handover."
      ]
    },
    "priceFrom": 1800000
  },
  {
    "slug": "damac-lagoons-riverside-1950-offer",
    "shortName": "DAMAC from AED 1,950/mo",
    "developer": "DAMAC Properties",
    "eyebrow": "DAMAC waterfront offer",
    "h1": "DAMAC Waterfront Homes from AED 1,950 a Month: 4% DLD Waiver, 4% Discount and a 50/50 Plan",
    "subtitle": "Own a branded waterfront home in DAMAC Lagoons or DAMAC Riverside from AED 1,950 a month, with the 4% DLD fee covered, 4% off the price and half the balance deferred to handover.",
    "heroImage": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/damac-hd/00-featured-hd-hd-2x.webp",
    "deadline": "",
    "windowLabel": "Limited time offer",
    "hideDeadline": false,
    "metaTitle": "DAMAC Waterfront Homes from AED 1,950 a Month",
    "metaDescription": "Branded DAMAC waterfront homes at Lagoons and Riverside from AED 1,950 a month, with a 4% DLD waiver, 4% off the price and a 50/50 plan.",
    "keywords": "DAMAC Lagoons offer, DAMAC Riverside offer, DAMAC 50/50 payment plan, 4% DLD waiver Dubai, DAMAC waterfront homes, DAMAC Lagoons price, DAMAC Riverside price, Dubai waterfront property offer",
    "highlights": [
      {
        "value": "AED 1,950",
        "label": "Per month",
        "detail": "Studio entry point across the campaign"
      },
      {
        "value": "4%",
        "label": "DLD fee waived",
        "detail": "DAMAC covers the registration fee"
      },
      {
        "value": "4%",
        "label": "Price discount",
        "detail": "Straight off the purchase price"
      },
      {
        "value": "50/50",
        "label": "Payment plan",
        "detail": "Half while building, half on handover"
      }
    ],
    "timeline": [
      {
        "stage": "During construction",
        "share": "50%",
        "description": "Spread across the construction and holding period, which is what keeps the monthly figure as low as AED 1,950."
      },
      {
        "stage": "On handover",
        "share": "50%",
        "description": "The balance falls due when the home is complete and ready for possession."
      }
    ],
    "eligibility": [
      {
        "label": "Communities",
        "value": "DAMAC Lagoons and DAMAC Riverside"
      },
      {
        "label": "Entry price",
        "value": "Apartments in DAMAC Riverside from AED 718,000"
      },
      {
        "label": "Property types",
        "value": "Studios, apartments, townhouses and villas"
      },
      {
        "label": "Monthly from",
        "value": "AED 1,950 for a studio, AED 3,150 for apartments and larger homes"
      },
      {
        "label": "Included incentives",
        "value": "4% DLD waiver + 4% price discount"
      },
      {
        "label": "Golden Visa",
        "value": "Units above AED 2 million qualify"
      }
    ],
    "valueProps": [
      [
        "A genuinely low monthly entry",
        "At AED 1,950 a month for a studio, the barrier to a branded waterfront address is closer to a rental payment than to a conventional off-plan commitment. Apartments and larger homes start from AED 3,150."
      ],
      [
        "Three incentives stacked, not one",
        "The 4% DLD waiver is a real cash saving that normally lands on the buyer at purchase. The 4% discount comes off the price on top of it, and the 50/50 structure defers half the balance to handover."
      ],
      [
        "Communities you can walk today",
        "Both masterplans have ready and near-ready homes, so this is not a plan bought off a render. You can see the lagoon, the promenade and the finish before you commit."
      ]
    ],
    "bodyParagraphs": [
      "DAMAC's current campaign puts a branded waterfront home within reach from AED 1,950 per month, the entry point for a studio, with apartments and larger homes starting from AED 3,150. It runs across two masterplans: DAMAC Lagoons and DAMAC Riverside. What makes the monthly figure achievable is not one discount but three incentives stacked together, applied to ready or near-ready stock rather than early-stage launches.",
      "DAMAC Lagoons is a 45-million-square-foot Mediterranean-themed masterplan in Dubailand, built around crystal lagoons, white-sand beaches and a waterside clubhouse. Its themed clusters, including Portofino, Nice, Santorini and Costa Brava, are at various stages of delivery, with several now ready or near-ready and offering genuine lagoon access. That delivered status is the real draw: you are buying into an environment you can inspect, and in many cases move into.",
      "DAMAC Riverside sits in Dubai Investments Park, organised around a river-inspired water feature with floating amenities and a retail promenade. It offers studios and one- and two-bedroom apartments alongside four- and five-bedroom townhouses, with Emirates Road connecting it to Expo City and Al Maktoum International Airport. Apartments start from AED 718,000, among the most affordably priced branded-waterfront units in the city.",
      "The package suits three groups in particular: end-users who want a delivered, amenity-rich community rather than a construction site; investors targeting Dubai's waterfront rental demand, with Golden Visa eligibility on units above the AED 2 million threshold; and first-time buyers drawn by the low monthly entry into a branded address. As with any campaign, the individual home should stand on its own merits, location, view and handover timeline, as much as on the incentives attached to it."
    ],
    "worked": {
      "heading": "What the incentives are worth on an AED 718,000 apartment",
      "rows": [
        [
          "Purchase price",
          "AED 718,000"
        ],
        [
          "4% price discount",
          "− AED 28,720"
        ],
        [
          "Price after discount",
          "AED 689,280"
        ],
        [
          "4% DLD fee, covered by DAMAC",
          "− AED 27,571"
        ],
        [
          "Combined saving",
          "≈ AED 56,291"
        ]
      ],
      "footnote": "Illustrative, based on the published entry price for DAMAC Riverside apartments. The exact figures depend on the unit and the terms recorded on the signed SPA."
    },
    "faqs": [
      {
        "question": "How is AED 1,950 a month possible on a Dubai property?",
        "answer": "It is the entry monthly figure for a studio under this campaign, and it works because of the 50/50 structure: only half the price is paid across the construction and holding period, with the remaining half deferred to handover. Apartments and larger homes start from AED 3,150 a month."
      },
      {
        "question": "Which communities does the offer cover?",
        "answer": "DAMAC Lagoons in Dubailand and DAMAC Riverside in Dubai Investments Park. Both are waterfront masterplans with ready and near-ready homes, spanning studios and apartments through to townhouses and villas."
      },
      {
        "question": "What does the 4% DLD waiver actually save me?",
        "answer": "The Dubai Land Department charges a 4% registration fee on the purchase, which normally falls on the buyer at the point of sale. Under this offer DAMAC covers it, so on an AED 718,000 apartment that is roughly AED 27,600 you do not pay."
      },
      {
        "question": "Is the 4% discount on top of the DLD waiver?",
        "answer": "Yes. They are separate incentives and they stack: 4% comes off the price, and the 4% DLD registration fee is covered on top. The 50/50 payment plan then applies to the discounted price."
      },
      {
        "question": "Do these homes qualify for the Golden Visa?",
        "answer": "Units priced above the AED 2 million threshold qualify under the current property-investor route. Plenty of the stock in this campaign sits below that figure, so confirm the price of your specific unit if the visa is part of your reason for buying."
      },
      {
        "question": "What should I check before reserving?",
        "answer": "Confirm the exact 50/50 split, the milestone dates and any post-handover tail in writing, since advertised plans and the plan on the SPA can differ by unit and cluster. Check that your specific unit qualifies for both the waiver and the discount, factor in service charges of roughly AED 14 to 18 per square foot annually, and scan the DLD or Madmoun QR to verify the listing permit before paying anything."
      }
    ],
    "disclaimer": "Terms are set by the developer and apply to selected units only, subject to availability and developer approval. Monthly figures and savings shown are illustrative and do not constitute financial advice or an offer to sell. Confirm all terms in writing before committing. Binayah Properties is a licensed Dubai brokerage.",
    "projectHref": "/developers/damac-properties",
    "timelineIntro": "An even split rather than a front-loaded one: half the price is spread across the construction and holding period, and the other half is deferred until handover. That structure is what brings the monthly figure down to AED 1,950.",
    "amenities": {
      "heading": "Built around the water.",
      "stats": [
        {
          "value": "45M",
          "label": "Sq ft masterplan",
          "icon": "Trees"
        },
        {
          "value": "718K",
          "label": "AED entry price",
          "icon": "Wallet"
        },
        {
          "value": "50/50",
          "label": "Payment split",
          "icon": "CalendarClock"
        }
      ],
      "masterplanHeading": "Inside the masterplans",
      "items": [
        "Crystal swimmable lagoons",
        "White sand beaches",
        "Waterside clubhouse",
        "Floating leisure decks",
        "Retail promenade",
        "Outdoor cinema",
        "Sports courts",
        "Community lawns",
        "Waterfall features"
      ],
      "icons": [
        "Waves",
        "Sun",
        "Building2",
        "Droplets",
        "Store",
        "Sparkles",
        "Bike",
        "TreePalm",
        "Flower2"
      ]
    },
    "ctaLabel": "Check eligible homes",
    "explainer": {
      "heading": "Two waterfront masterplans, one offer",
      "highlight": "A DAMAC waterfront home from AED 1,950 a month. The 4% DLD registration fee is covered, 4% comes off the price, and half the balance waits until handover.",
      "body": [
        "The offer runs across DAMAC Lagoons in Dubailand and DAMAC Riverside in Dubai Investments Park, on ready and near-ready homes rather than early-stage plots. Studios, apartments, townhouses and villas all qualify, from AED 718,000."
      ]
    },
    "gallery": [
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/valencia-at-damac-lagoons/featured.webp",
        "alt": "Aerial view of Valencia at DAMAC Lagoons"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/damac-hd/02-featured-hd-2x.webp",
        "alt": "Canal and waterfront residences at DAMAC Riverside"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/damac-lagoons-phase-ll-townhouses-for-sale/gallery/4.webp",
        "alt": "Waterfall lagoon at DAMAC Lagoons"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/damac-hd/04-damac-riverside-views-azure-1-featured-h-2x.webp",
        "alt": "Azure at DAMAC Riverside at dusk"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/damac-hd/05-5-2x.webp",
        "alt": "Beach-style swimmable lagoon at DAMAC Lagoons"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/damac-hd/06-013_13-hd-2x.webp",
        "alt": "Lagoon and outdoor cinema at DAMAC Riverside"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/damac-hd/07-costa-brava-damac-lagoons-phase-2-galler-2x.webp",
        "alt": "Rope bridge over the swimmable lagoon at DAMAC Lagoons"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/damac-hd/08-002_2-hd-2x.webp",
        "alt": "Canal-side promenade and pool at DAMAC Riverside"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/damac-hd/09-costa-brava-damac-lagoons-phase-2-featur-2x.webp",
        "alt": "The Costa Brava cluster at DAMAC Lagoons"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/damac-hd/10-004_4-hd-2x.webp",
        "alt": "Community lawn at DAMAC Riverside"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/damac-hd/11-damac-lagoons-nice-villas-townhouse-gall-2x.webp",
        "alt": "Kayaking on the lagoon at DAMAC Lagoons"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/damac-hd/12-008_8-hd-2x.webp",
        "alt": "Water play area at DAMAC Riverside"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/santorini-at-damac-lagoons-by-damac-properties/gallery/6.webp",
        "alt": "The Santorini cluster at DAMAC Lagoons"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/damac-hd/14-012_12-hd-2x.webp",
        "alt": "Floating gardens at DAMAC Riverside"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/ibiza-at-damac-lagoons/gallery/5.webp",
        "alt": "Ibiza waterfront promenade at DAMAC Lagoons"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/damac-hd/16-003_3-hd-2x.webp",
        "alt": "Sports courts at DAMAC Riverside"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/damac-hd/17-lagoons-venice-featured-hd-2x.webp",
        "alt": "Venice villas at DAMAC Lagoons"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/damac-hd/18-damac-riverside-views-azure-1-gallery_1--2x.webp",
        "alt": "Canal-side residences at DAMAC Riverside"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/damac-hd/19-lagoons-venice-gallery_8-hd-2x.webp",
        "alt": "Venice villa with a private pool at DAMAC Lagoons"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/damac-hd/20-6-2x.webp",
        "alt": "Waterside pavilions at DAMAC Lagoons"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/damac-hd/21-lagoons-venice-gallery_10-hd-2x.webp",
        "alt": "Waterfall pool at Venice, DAMAC Lagoons"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/damac-hd/22-3-2x.webp",
        "alt": "Pool deck and residences at Valencia, DAMAC Lagoons"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/damac-hd/23-lagoons-venice-gallery_11-hd-2x.webp",
        "alt": "Beach and waterfall at DAMAC Lagoons"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/damac-hd/24-damac-lagoons-nice-villas-townhouse-gall-2x.webp",
        "alt": "Nice villas at DAMAC Lagoons"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/damac-hd/25-lagoons-venice-gallery_13-hd-2x.webp",
        "alt": "Waterfront dining at DAMAC Lagoons"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/damac-hd/26-costa-brava-damac-lagoons-phase-2-galler-2x.webp",
        "alt": "Villa with a private pool at Costa Brava, DAMAC Lagoons"
      }
    ],
    "investment": {
      "heading": "Ready homes, not a construction site.",
      "items": [
        {
          "title": "Ready and near-ready",
          "text": "Buy an environment you can inspect and often move into."
        },
        {
          "title": "Waterfront demand",
          "text": "Lagoon and canal frontage rents at a premium."
        },
        {
          "title": "Low monthly entry",
          "text": "From AED 1,950 a month on a studio."
        },
        {
          "title": "Golden Visa route",
          "text": "Units above AED 2 million qualify for the investor visa."
        }
      ],
      "icons": [
        "Building2",
        "TrendingUp",
        "Coins",
        "ShieldCheck"
      ]
    },
    "projects": [
      {
        "name": "DAMAC Lagoons",
        "terms": "A 45 million sq ft Mediterranean masterplan in Dubailand, built around crystal lagoons, white sand beaches and a waterside clubhouse. Themed clusters at varying stages of handover, several ready or near-ready with direct lagoon access.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/valencia-at-damac-lagoons/featured.webp",
        "links": [
          {
            "label": "DAMAC Lagoons community",
            "href": "/communities/damac-lagoons"
          },
          {
            "label": "Venice at DAMAC Lagoons",
            "href": "/project/lagoons-venice"
          },
          {
            "label": "Costa Brava",
            "href": "/project/costa-brava-damac-lagoons-phase-2"
          },
          {
            "label": "Valencia",
            "href": "/project/valencia-at-damac-lagoons"
          }
        ]
      },
      {
        "name": "DAMAC Riverside",
        "terms": "Set in Dubai Investments Park around a water canal with floating leisure decks and a retail promenade. Studios, one and two bedroom apartments and four and five bedroom townhouses, with Emirates Road linking it to Expo City and Al Maktoum airport.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/damac-hd/02-featured-hd-2x.webp",
        "links": [
          {
            "label": "DAMAC Riverside community",
            "href": "/communities/damac-riverside"
          },
          {
            "label": "DAMAC Riverside",
            "href": "/project/damac-riverside-in-dubai"
          },
          {
            "label": "Capri at Riverside Views",
            "href": "/project/capri-1-by-damac-at-riverside-views-dubai"
          },
          {
            "label": "Azure at Riverside Views",
            "href": "/project/damac-riverside-views-azure-1"
          }
        ]
      }
    ],
    "whatsappLabel": "Chat on WhatsApp",
    "whatsappMessage": "Hi Binayah! 👋 I'm interested in the DAMAC Lagoons and Riverside offer: from AED 1,950 a month, 4% DLD waiver and a 50/50 plan. Please send me the eligible homes.",
    "priceFrom": 718000
  },
  {
    "slug": "danube-deal-of-the-decade-20-10-back",
    "amenities": {
      "heading": "Furnished, and stacked with amenities.",
      "stats": [
        {
          "value": "37",
          "label": "Danube projects in Dubai",
          "icon": "Building2"
        },
        {
          "value": "1%",
          "label": "Monthly while building",
          "icon": "CalendarClock"
        },
        {
          "value": "40%",
          "label": "Deferred past handover",
          "icon": "KeyRound"
        }
      ],
      "masterplanHeading": "Inside a Danube tower",
      "items": [
        "Fully furnished units",
        "Infinity pools",
        "Sky gyms",
        "Private cinemas",
        "Co-working floors",
        "Aquarium lounges",
        "Rooftop jacuzzis",
        "Sports courts",
        "Children's play areas"
      ],
      "icons": [
        "Sparkles",
        "Waves",
        "Bike",
        "Sun",
        "Laptop",
        "Droplets",
        "Flower2",
        "TreePalm",
        "Users"
      ]
    },
    "bodyParagraphs": [
      "Danube Properties has reopened its Deal of the Decade for a single weekend, 29 and 30 August 2026. The mechanism is straightforward: pay 20% of the price plus the 4% DLD registration fee, and 10% of the property value comes back as a credit note applied to your remaining balance. It is a rebate against what you owe rather than money in hand, and on a AED 1.5 million apartment it is worth AED 150,000.",
      "What you choose after that is the pace. The 1% track releases the rebate immediately once the 20% and the fee are paid, then charges 1% of the property value each month until the building completes. The 0.5% track halves the monthly figure but holds the rebate back until you have paid 40%. Either way, 40% of the price is deferred until after handover, so most of the purchase falls due once the keys are in your hand.",
      "Eleven projects sit outside those two tracks. Danube's 11:11 lineup, made up of Fashionz 1, Sparklz, Viewz 1 and 2, Oceanz 1, 2 and 3, Oasiz 1 and 2, and Elitz 2 and 3, runs a simpler 20:70 split: the rebate follows the 20%, and the remaining 70% is due on completion rather than spread monthly.",
      "The rebates stack, which is where the offer gets interesting. A refundable AED 100,000 token adds another 1% on every project except Greenz. Immediate family buying together earn 2% on a combined AED 10 to 20 million, 3% from AED 20 to 30 million, and 4% above that. Paying the full price upfront swaps the whole structure for a flat 14% discount. We place the booking, handle the paperwork and secure developer approval on your behalf."
    ],
    "ctaLabel": "Check eligible units",
    "dayCountEyebrow": false,
    "deadline": "2026-08-30T23:59:59+04:00",
    "developer": "Danube Properties",
    "disclaimer": "Terms are set by Danube Properties and apply to selected units and projects only, subject to availability and developer approval. Rebate percentages, release timing and payment tracks vary by project and unit type, and the 11:11 lineup and Greenz carry their own structures as set out above. Figures shown are illustrative and do not constitute financial advice or an offer to sell. Confirm all terms in writing, including the schedule recorded in the SPA, before committing. Binayah Properties is a licensed Dubai brokerage.",
    "eligibility": [
      {
        "label": "Offer window",
        "value": "Two days only, 29 and 30 August 2026."
      },
      {
        "label": "What comes back",
        "value": "A credit note worth 10% of the property value, set against your balance. It is a rebate, not a cash payment."
      },
      {
        "label": "Down payment",
        "value": "20% of the price, paid as 10% within 21 days and 10% within 60 days, plus the 4% DLD registration fee."
      },
      {
        "label": "The 1% track",
        "value": "The rebate is released once the 20% and the DLD fee are paid, then 1% a month until completion, with 40% after handover."
      },
      {
        "label": "The 0.5% track",
        "value": "0.5% a month until completion, with the rebate released only once you reach 40% plus the DLD fee, and 40% after handover."
      },
      {
        "label": "The 11:11 lineup",
        "value": "Fashionz 1, Sparklz, Viewz 1 and 2, Oceanz 1, 2 and 3, Oasiz 1 and 2, and Elitz 2 and 3 run a 20:70 structure instead: the rebate follows the 20%, and the remaining 70% falls due on completion."
      },
      {
        "label": "Token rebate",
        "value": "A refundable AED 100,000 token adds 1% on every Danube project except Greenz, where it becomes a two year service charge waiver instead."
      },
      {
        "label": "Family purchases",
        "value": "Spouses, parents and children buying together earn 2% on AED 10 to 20 million combined, 3% on AED 20 to 30 million, and 4% above AED 30 million."
      },
      {
        "label": "Paying in full",
        "value": "A flat 14% discount in place of the credit note structure."
      },
      {
        "label": "Greenz",
        "value": "Taking the post-handover structure at Greenz adds 5% to the unit value. Other Danube projects apply a 3% discount at handover instead."
      }
    ],
    "explainer": {
      "heading": "Pay 20%, and 10% comes back as a credit note",
      "highlight": "A refundable AED 100,000 token adds another 1%. Families buying together add up to 4% more. Pay the whole price upfront instead and the discount is a flat 14%.",
      "body": [
        "Danube's Deal of the Decade returns for one weekend, 29 and 30 August 2026. Pay 20% of the price plus the 4% DLD registration fee, and 10% of the property value comes back to you as a credit note set against your remaining balance. From there you pick the pace: 1% a month with the rebate released straight away, or 0.5% a month with it released once you reach 40%."
      ]
    },
    "eyebrow": "Weekend only, 29 to 30 August",
    "faqs": [
      {
        "question": "When does the Danube Deal of the Decade close?",
        "answer": "The weekend edition runs on 29 and 30 August 2026 only. To hold the terms the unit has to be booked inside those two days. Message us before the weekend and we will have the paperwork ready."
      },
      {
        "question": "Is the 10% paid to me in cash?",
        "answer": "No. It is a credit note, which means it is set against what you still owe on the property rather than paid out. It reduces your balance by 10% of the property value."
      },
      {
        "question": "What is the difference between the 1% and 0.5% tracks?",
        "answer": "Both start with the same 20%. On the 1% track the rebate is released as soon as that 20% and the DLD fee are paid, and you then pay 1% a month. On the 0.5% track the monthly figure halves, but the rebate is held until you have paid 40%."
      },
      {
        "question": "Which projects are in the 11:11 lineup?",
        "answer": "Fashionz 1, Sparklz, Viewz 1, Viewz 2, Oceanz 1, Oceanz 2, Oceanz 3, Oasiz 1, Oasiz 2, Elitz 2 and Elitz 3. These run a 20:70 structure rather than the 1% and 0.5% monthly tracks, with 70% due on completion."
      },
      {
        "question": "Can the rebates be combined?",
        "answer": "Yes. The 10% credit note is the base. A refundable AED 100,000 token adds 1% on every project except Greenz, and buying together with a spouse, parent or child adds 2% to 4% depending on the combined purchase value."
      },
      {
        "question": "What happens if I pay the full price upfront?",
        "answer": "The credit note structure is replaced by a flat 14% discount on the purchase price."
      },
      {
        "question": "Is Greenz treated differently?",
        "answer": "Yes. At Greenz the post-handover structure adds 5% to the unit value, and the AED 100,000 token buys a two year service charge waiver rather than the extra 1%. Other Danube projects apply a 3% discount at handover instead."
      },
      {
        "question": "Do I still pay the DLD registration fee?",
        "answer": "Yes. The 4% Dubai Land Department fee is payable alongside the 20% and is not waived under this offer. It is the trigger for releasing the rebate on the 1% track."
      }
    ],
    "gallery": [
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/danube-hd/01-bayz-101-at-business-bay-dubai-gallery_6-2x.webp",
        "alt": "Bayz 101 by Danube rising beside the Burj Khalifa at night"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/danube-hd/02-oceanz-by-danube-at-dubai-maritime-city--2x.webp",
        "alt": "Oceanz by Danube on the Dubai Maritime City waterfront at dusk"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/danube-hd/03-diamondz-by-danube-at-jlt-dubai-gallery_-2x.webp",
        "alt": "Diamondz by Danube at Jumeirah Lake Towers"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/danube-hd/04-8-2x.webp",
        "alt": "The sky bridge at Viewz Residences, JLT"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/fashionz-by-danube-at-jvt/featured.webp",
        "alt": "Fashionz by Danube at Jumeirah Village Triangle at sunset"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/danube-hd/06-danube-sparklz-at-al-furjan-gallery_3-hd-2x.webp",
        "alt": "Sparklz by Danube at Al Furjan"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/danube-elitz-phase-2-at-jvc/featured.webp",
        "alt": "Elitz by Danube at Jumeirah Village Circle"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/danube-hd/08-A566F205D4A77BF5E5CFC1F84E92BA41-2x.webp",
        "alt": "The cantilevered pool deck at Shahrukhz by Danube"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/danube-hd/09-A5310BE7DE3EB3D4DA777C550167DBB6-2x.webp",
        "alt": "Pool deck at Fashionz by Danube"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/danube-hd/10-danube-sparklz-at-al-furjan-featured-hd-2x.webp",
        "alt": "Lagoon-style pool at Sparklz by Danube"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/danube-hd/11-005_005_5-hd-hd-2x.webp",
        "alt": "Pool deck at Sportz by Danube"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/danube-hd/12-timez-by-danube-at-dubai-silicon-oasis-g-2x.webp",
        "alt": "Infinity pool over the Dubai skyline at Timez by Danube"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/viewz-2-at-jlt-dubai-by-danube-properties/gallery/1.webp",
        "alt": "Pool terrace at Viewz 2, JLT"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/danube-hd/14-breez-by-danube-at-dubai-maritime-city-g-2x.webp",
        "alt": "Sea-view balcony at Breez by Danube"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/danube-hd/15-oceanz-by-danube-at-dubai-maritime-city--2x.webp",
        "alt": "Sea-view living room at Oceanz by Danube"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/danube-hd/16-4-2x.webp",
        "alt": "Open-plan living and kitchen at Viewz Residences"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/danube-hd/17-A5DC70A0B9ED0BDCF30D3084B400BB73-2x.webp",
        "alt": "Furnished bedroom at Fashionz by Danube"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/danube-hd/18-danube-sparklz-at-al-furjan-gallery_6-hd-2x.webp",
        "alt": "Furnished living room at Sparklz by Danube"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/danube-hd/19-bayz-101-at-business-bay-dubai-gallery_7-2x.webp",
        "alt": "Arrival lobby at Bayz 101"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/danube-hd/20-bayz-101-at-business-bay-dubai-gallery_3-2x.webp",
        "alt": "Residents' gym at Bayz 101"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/danube-hd/03-breez-by-danube-at-dubai-maritime-city-g-2x.webp",
        "alt": "Aquarium corridor at Breez by Danube"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/danube-hd/22-breez-by-danube-at-dubai-maritime-city-g-2x.webp",
        "alt": "Aquarium lounge at Breez by Danube"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/shahrukhz-by-danube/featured.webp",
        "alt": "Private cinema at Shahrukhz by Danube"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/danube-hd/24-A5B77F4ABEFB26D1CCC5E377785A5AB3-2x.webp",
        "alt": "Co-working floor at Shahrukhz by Danube"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/danube-hd/25-1-2x.webp",
        "alt": "Rooftop jacuzzi terrace at Opalz by Danube"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/danube-hd/26-breez-by-danube-at-dubai-maritime-city-g-2x.webp",
        "alt": "Dubai Maritime City, home to Oceanz and Breez"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/danube-hd/27-oceanz-by-danube-at-dubai-maritime-city--2x.webp",
        "alt": "Oceanz by Danube on the waterfront"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/serenz-by-danube/featured.webp",
        "alt": "Serenz by Danube at night"
      }
    ],
    "h1": "Pay 20%, Get 10% Back: Danube's Deal of the Decade",
    "heroImage": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/danube-hd/00-bayz-101-at-business-bay-dubai-gallery_1-2x.webp",
    "hideDeadline": false,
    "highlights": [
      {
        "value": "20%",
        "label": "Paid upfront",
        "detail": "10% within 21 days, 10% within 60 days"
      },
      {
        "value": "10%",
        "label": "Back as credit",
        "detail": "A credit note against what you still owe"
      },
      {
        "value": "1%",
        "label": "Per month",
        "detail": "Monthly instalments while the tower builds"
      },
      {
        "value": "40%",
        "label": "After handover",
        "detail": "The balance falls due once you have the keys"
      }
    ],
    "investment": {
      "heading": "Built for the deferred-payment buyer.",
      "items": [
        {
          "title": "A low way in",
          "text": "Danube studios start around AED 790,000."
        },
        {
          "title": "Central locations",
          "text": "Business Bay, JLT, Al Furjan and Maritime City."
        },
        {
          "title": "A long runway",
          "text": "1% a month, then 40% once you have the keys."
        },
        {
          "title": "Golden Visa route",
          "text": "Units above AED 2 million qualify for the investor visa."
        }
      ],
      "icons": [
        "Coins",
        "Building2",
        "TrendingUp",
        "ShieldCheck"
      ]
    },
    "keywords": "danube deal of the decade, danube pay 20 get 10 back, danube properties offer dubai, danube 1 percent monthly payment plan, danube credit note offer, danube 11:11 projects, dubai off plan payment plan, danube properties dubai",
    "metaDescription": "Danube's Deal of the Decade, 29 to 30 August 2026: pay 20% and 10% returns as a credit note, then 1% a month and 40% after handover.",
    "metaTitle": "Danube Deal of the Decade | Pay 20%, Get 10% Back",
    "projectHref": "/developers/danube-properties",
    "projects": [
      {
        "name": "Fashionz by Danube",
        "terms": "Jumeirah Village Triangle. Part of the 11:11 lineup, so the 20:70 structure applies with the rebate released after the 20%.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/fashionz-by-danube-at-jvt/featured.webp",
        "links": [
          {
            "label": "Fashionz by Danube",
            "href": "/project/fashionz-by-danube-at-jvt"
          }
        ]
      },
      {
        "name": "Sparklz by Danube",
        "terms": "Al Furjan. Also in the 11:11 lineup, on the 20:70 structure with 70% due on completion.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/danube-hd/06-danube-sparklz-at-al-furjan-gallery_3-hd-2x.webp",
        "links": [
          {
            "label": "Sparklz by Danube",
            "href": "/project/danube-sparklz-at-al-furjan"
          }
        ]
      },
      {
        "name": "Oceanz by Danube",
        "terms": "Dubai Maritime City, on the water. In the 11:11 lineup across all three towers.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/danube-hd/02-oceanz-by-danube-at-dubai-maritime-city--2x.webp",
        "links": [
          {
            "label": "Oceanz by Danube",
            "href": "/project/oceanz-by-danube-at-dubai-maritime-city"
          }
        ]
      },
      {
        "name": "Viewz by Danube",
        "terms": "Jumeirah Lake Towers, twin towers joined by a sky bridge. Both Viewz 1 and Viewz 2 sit in the 11:11 lineup.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/danube-hd/04-8-2x.webp",
        "links": [
          {
            "label": "Viewz Residences",
            "href": "/project/viewz-residences-at-jlt-dubai"
          }
        ]
      },
      {
        "name": "Bayz 101",
        "terms": "Business Bay, beside the Burj Khalifa. On the main tracks, so you choose between 1% and 0.5% a month.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/danube-hd/29-bayz-101-at-business-bay-dubai-featured--2x.webp",
        "links": [
          {
            "label": "Bayz 101",
            "href": "/project/bayz-101-at-business-bay-dubai"
          }
        ]
      }
    ],
    "shortName": "Danube Deal of the Decade",
    "subtitle": "A 10% credit note against your balance, 1% a month while it builds, and 40% deferred until after handover.",
    "timeline": [
      {
        "share": "10%",
        "stage": "Within 21 days",
        "description": "The first half of the 20% down payment."
      },
      {
        "share": "10%",
        "stage": "Within 60 days",
        "description": "Completes the 20%, alongside the 4% DLD fee."
      },
      {
        "share": "1%",
        "stage": "Every month",
        "description": "Monthly instalments until construction completes."
      },
      {
        "share": "40%",
        "stage": "After handover",
        "description": "The balance, deferred past completion."
      }
    ],
    "timelineIntro": "Both tracks start at the same 20%. The 1% track releases your rebate as soon as that 20% and the DLD fee are paid; the 0.5% track holds it until you reach 40%.",
    "valueProps": [
      [
        "10% back on a 20% commitment",
        "Commit 20% and a tenth of the full property value returns to you as a credit note against the balance. On a AED 1.5 million apartment that is AED 150,000 off what you still owe, for a AED 300,000 down payment."
      ],
      [
        "1% a month while it builds",
        "After the 20%, the schedule drops to 1% of the property value each month until the tower completes. On that same AED 1.5 million unit it is AED 15,000 a month, closer to a rent cheque than a construction-linked instalment."
      ],
      [
        "Rebates that stack",
        "The 10% credit note is the floor, not the ceiling. A refundable AED 100,000 token adds 1%, and buying alongside a spouse, parent or child adds 2% to 4% depending on the combined value."
      ],
      [
        "40% waits until after handover",
        "Only 60% of the price is due before you hold the keys. The remaining 40% is spread past completion, so the unit can be occupied or let while the balance is still running."
      ]
    ],
    "whatsappLabel": "Chat on WhatsApp",
    "whatsappMessage": "Hi Binayah! 👋 I'm interested in Danube's Deal of the Decade: pay 20% and get 10% back as a credit note. Please send me the eligible projects and the numbers.",
    "windowLabel": "Weekend edition, 29 to 30 August 2026",
    "worked": {
      "heading": "What the rebate is worth on an AED 1,500,000 apartment",
      "rows": [
        [
          "Purchase price",
          "AED 1,500,000"
        ],
        [
          "20% down payment",
          "AED 300,000"
        ],
        [
          "4% DLD registration fee",
          "AED 60,000"
        ],
        [
          "10% credit note",
          "- AED 150,000"
        ],
        [
          "Token rebate at 1%",
          "- AED 15,000"
        ],
        [
          "Total credited against your balance",
          "= AED 165,000"
        ]
      ],
      "footnote": "Illustrative, on a AED 1.5 million unit outside the 11:11 lineup and excluding Greenz. The exact figures depend on the project, the track you choose and the terms recorded in the signed SPA."
    },
    "priceFrom": 790000
  },
  {
    "slug": "emaar-payment-plans-offer",
    "amenities": {
      "heading": "Master-planned, and finished.",
      "stats": [
        {
          "value": "8",
          "label": "Communities on a plan",
          "icon": "Building2"
        },
        {
          "value": "3 yrs",
          "label": "Post-handover at Emaar South",
          "icon": "CalendarClock"
        },
        {
          "value": "2",
          "label": "Off-plan mortgage partners",
          "icon": "ShieldCheck"
        }
      ],
      "masterplanHeading": "Inside an Emaar community",
      "items": [
        "Swimmable lagoons",
        "Championship golf",
        "Marina berths",
        "Creek and beachfront",
        "Community parks",
        "Retail promenades",
        "Schools and clinics",
        "Pools and gyms",
        "Cycling and running tracks"
      ],
      "icons": [
        "Waves",
        "TreePalm",
        "Sun",
        "Droplets",
        "Flower2",
        "Store",
        "Users",
        "Bike",
        "Sparkles"
      ]
    },
    "bodyParagraphs": [
      "Emaar is not running one campaign. It is running four structures at once, and which one applies depends entirely on the community you buy in. The most common is 80/20: eighty per cent across the construction period and the remaining twenty on 100% construction completion. That covers The Cove at Dubai Creek Harbour, Park Horizon at Dubai Hills Estate, Seascape at Rashid Yachts & Marina and Fairway Villas at Emaar South.",
      "Three communities go further and defer only a tenth. Seapoint at Emaar Beachfront, Emaar Beachfront itself and Alana at The Valley run 90/10, so ninety per cent is paid while the building goes up and the last ten per cent falls due at completion. That is a heavier construction-period commitment in exchange for a clean position at handover.",
      "The outlier is Emaar South. It is the only one of the set on ready-to-move stock, and it inverts the structure completely: twenty-five per cent up front, then seventy-five per cent spread across three years after you have taken the keys. A three-year post-handover tail is unusual for Emaar, and it means the property can be occupied or let while most of the price is still outstanding.",
      "Two things sit underneath all of it. Off-plan financing is arranged within the purchase through Emirates NBD and ADCB rather than left to the buyer afterwards, and UAE Nationals buying at Dubai Hills Estate have their own plan of equal 2.5% monthly instalments for a limited period. We place the booking, confirm which plan is attached to your unit and handle the paperwork."
    ],
    "ctaLabel": "Check eligible units",
    "dayCountEyebrow": false,
    "deadline": "",
    "developer": "Emaar Properties",
    "disclaimer": "Payment plans are set by Emaar Properties and are attached to specific releases and unit types, subject to availability and developer approval. Plans change between phases and the structure quoted here may not apply to the unit you are shown. Figures are illustrative and do not constitute financial advice or an offer to sell. The 4% Dubai Land Department registration fee is not waived under these plans. Confirm the plan, the schedule and all terms in writing, including the schedule recorded in the SPA, before committing. Binayah Properties is a licensed Dubai brokerage.",
    "eligibility": [
      {
        "label": "90/10",
        "value": "Seapoint at Emaar Beachfront, Emaar Beachfront and Alana at The Valley: 90% during construction, 10% on 100% construction completion."
      },
      {
        "label": "80/20",
        "value": "The Cove, Park Horizon, Seascape and Fairway Villas: 80% during construction, 20% on 100% construction completion."
      },
      {
        "label": "25/75",
        "value": "Emaar South, ready to move in: 25% up front and 75% spread over a three year post-handover plan."
      },
      {
        "label": "UAE Nationals",
        "value": "A separate plan at Dubai Hills Estate paid in equal 2.5% monthly instalments, for a limited period."
      },
      {
        "label": "Mortgages",
        "value": "Off-plan financing is arranged within the purchase through Emirates NBD and ADCB."
      },
      {
        "label": "Entry price",
        "value": "From AED 1.3M at The Cove, Dubai Creek Harbour."
      },
      {
        "label": "Golden Visa",
        "value": "Units above AED 2 million qualify for the property investor visa route."
      },
      {
        "label": "Availability",
        "value": "Plans are tied to specific releases and change between phases. Confirm the plan attached to your unit before committing."
      }
    ],
    "explainer": {
      "heading": "Four plans, depending on what you are buying",
      "highlight": "The Emaar South plan is the outlier: it is a ready-to-move home where 75% of the price is spread across three years after you have the keys. Emaar rarely defers that much, that long.",
      "body": [
        "Emaar is running several structures at once rather than a single campaign. Which one you get depends on the community. Off-plan financing is built into the process through Emirates NBD and ADCB, and UAE Nationals buying at Dubai Hills Estate have a separate plan of equal 2.5% monthly instalments."
      ]
    },
    "eyebrow": "Live Emaar payment plans",
    "faqs": [
      {
        "question": "Which Emaar communities are on the 90/10 plan?",
        "answer": "Seapoint at Emaar Beachfront, Emaar Beachfront and Alana at The Valley. You pay 90% across the construction period and the remaining 10% on 100% construction completion."
      },
      {
        "question": "Which are on 80/20?",
        "answer": "The Cove, Park Horizon, Seascape and Fairway Villas. 80% during construction, 20% on 100% construction completion."
      },
      {
        "question": "What is different about Emaar South?",
        "answer": "It is a ready-to-move-in plan rather than an off-plan one: 25% up front and 75% spread across a three year post-handover schedule. Emaar rarely defers that much for that long."
      },
      {
        "question": "Is there a plan for UAE Nationals?",
        "answer": "Yes. Emaar is running a separate plan at Dubai Hills Estate for Emirati buyers, paid in equal 2.5% monthly instalments, for a limited period."
      },
      {
        "question": "Can I get a mortgage on an off-plan Emaar unit?",
        "answer": "Emaar has off-plan financing built into the buying process through Emirates NBD and ADCB, so the mortgage is arranged alongside the reservation rather than separately afterwards."
      },
      {
        "question": "Is the DLD fee waived?",
        "answer": "No. These are payment structures rather than fee waivers, so the 4% Dubai Land Department registration fee is payable in the normal way."
      },
      {
        "question": "Do these plans have an end date?",
        "answer": "Emaar has not published one. The plans are attached to specific releases and change between phases, so the plan on your unit should be confirmed in writing before you commit."
      },
      {
        "question": "What is the lowest entry price?",
        "answer": "AED 1.3 million at The Cove, Dubai Creek Harbour, at the time of writing. Pricing moves between releases."
      }
    ],
    "gallery": [
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/seascape-at-rashid-yachts-marina-by-emaar/gallery/12.webp",
        "alt": "Seascape at Rashid Yachts & Marina from the air"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/the-cove-2-at-dubai-creek-harbour/featured.webp",
        "alt": "The Cove at Dubai Creek Harbour on the waterfront"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/emaar/02-3-2x.webp",
        "alt": "The swimmable lagoon at Alana, The Valley"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/emaar/03-6-2x.webp",
        "alt": "Park Horizon at Dubai Hills Estate"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/seascape-at-rashid-yachts-marina-by-emaar/featured.webp",
        "alt": "The marina at Rashid Yachts & Marina"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/alana-by-emaar-at-the-valley/gallery/1.webp",
        "alt": "Waterside townhouses at Alana, The Valley"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/emaar/06-6-2x.webp",
        "alt": "Golf Views at Emaar South overlooking the course"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/emaar/07-1-2x.webp",
        "alt": "Waterfront residences at The Cove, Dubai Creek Harbour"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/emaar/08-7-2x.webp",
        "alt": "Landscaped waterway at Alana, The Valley"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/park-horizon-by-emaar-at-dubai-hills-estate/featured.webp",
        "alt": "Park Horizon towers at Dubai Hills Estate"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/emaar/10-2-2x.webp",
        "alt": "Rashid Yachts & Marina and the Dubai skyline"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/emaar/11-10-2x.webp",
        "alt": "Lagoon deck at Alana, The Valley"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/emaar/12-7-2x.webp",
        "alt": "The championship golf course at Dubai Hills Estate"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/emaar/13-1-2x.webp",
        "alt": "A Fairway Villa at Emaar South"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/emaar/14-8-2x.webp",
        "alt": "Streetscape at Alana, The Valley"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/emaar/15-2-2x.webp",
        "alt": "Golf Views residences at Emaar South"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/emaar/16-9-2x.webp",
        "alt": "Villas at Alana, The Valley"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/emaar/17-10-2x.webp",
        "alt": "Sea-view bedroom at Seascape"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/emaar/18-3-2x.webp",
        "alt": "Living room at Golf Views, Emaar South"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/emaar/19-11-2x.webp",
        "alt": "Sea-view interior at Seascape"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/emaar/20-4-2x.webp",
        "alt": "Interior at Alana, The Valley"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/emaar/21-4-2x.webp",
        "alt": "Bedroom at Golf Views, Emaar South"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/emaar/22-6-2x.webp",
        "alt": "Living space at Alana, The Valley"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/emaar/23-5-2x.webp",
        "alt": "Kitchen and dining at Golf Views, Emaar South"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/emaar/24-featured-2x.webp",
        "alt": "The entrance to The Valley by Emaar"
      }
    ],
    "h1": "Emaar Payment Plans: 90/10, 80/20 and 25/75",
    "heroImage": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/emaar/00-2-2x.webp",
    "hideDeadline": true,
    "highlights": [
      {
        "value": "90/10",
        "label": "Seapoint and Alana",
        "detail": "90% during construction, 10% on completion"
      },
      {
        "value": "80/20",
        "label": "Cove, Park Horizon, Seascape",
        "detail": "80% during construction, 20% on completion"
      },
      {
        "value": "25/75",
        "label": "Emaar South, ready to move",
        "detail": "75% spread across three years after handover"
      },
      {
        "value": "2.5%",
        "label": "Monthly, UAE Nationals",
        "detail": "Equal instalments at Dubai Hills Estate"
      }
    ],
    "investment": {
      "heading": "The developer the market prices off.",
      "items": [
        {
          "title": "Deep resale market",
          "text": "Emaar stock is the most liquid in Dubai."
        },
        {
          "title": "Delivered at scale",
          "text": "Downtown, Dubai Hills, Creek Harbour, Beachfront."
        },
        {
          "title": "Financing built in",
          "text": "Emirates NBD and ADCB inside the purchase."
        },
        {
          "title": "Golden Visa route",
          "text": "Units above AED 2 million qualify for the investor visa."
        }
      ],
      "icons": [
        "TrendingUp",
        "Building2",
        "Coins",
        "ShieldCheck"
      ]
    },
    "keywords": "emaar payment plan, emaar 90/10 payment plan, emaar 80/20, emaar south 25/75 post handover, emaar offers dubai, seapoint payment plan, alana the valley payment plan, dubai off plan payment plan",
    "metaDescription": "Emaar's current plans: 90/10 at Seapoint and Alana, 80/20 at The Cove, Park Horizon and Seascape, and 25/75 with a 3-year post-handover tail at Emaar South.",
    "metaTitle": "Emaar Payment Plans | 90/10, 80/20 and 25/75",
    "priceFrom": 1300000,
    "projectHref": "/developers/emaar-properties",
    "projects": [
      {
        "name": "The Cove",
        "terms": "Dubai Creek Harbour, on the water. 80% during construction and 20% on 100% completion, from AED 1.3M.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/the-cove-2-at-dubai-creek-harbour/featured.webp",
        "links": [
          {
            "label": "The Cove at Dubai Creek Harbour",
            "href": "/project/the-cove-2-at-dubai-creek-harbour"
          }
        ]
      },
      {
        "name": "Seascape",
        "terms": "Rashid Yachts & Marina. 80% during construction, 20% on 100% completion, beside the superyacht berths.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/seascape-at-rashid-yachts-marina-by-emaar/gallery/12.webp",
        "links": [
          {
            "label": "Seascape at Rashid Yachts & Marina",
            "href": "/project/seascape-at-rashid-yachts-marina-by-emaar"
          }
        ]
      },
      {
        "name": "Park Horizon",
        "terms": "Dubai Hills Estate, over the championship golf course. 80% during construction and 20% on 100% completion.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/emaar/03-6-2x.webp",
        "links": [
          {
            "label": "Park Horizon at Dubai Hills Estate",
            "href": "/project/park-horizon-by-emaar-at-dubai-hills-estate"
          }
        ]
      },
      {
        "name": "Alana",
        "terms": "The Valley, built around a swimmable lagoon. On the 90/10 plan, so only a tenth is left at completion.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/emaar/02-3-2x.webp",
        "links": [
          {
            "label": "Alana at The Valley",
            "href": "/project/alana-by-emaar-at-the-valley"
          }
        ]
      },
      {
        "name": "Emaar South",
        "terms": "Ready to move in, on the 25/75 plan with the balance spread across three years after handover.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/emaar/06-6-2x.webp",
        "links": [
          {
            "label": "Golf Views at Emaar South",
            "href": "/project/golf-views-in-emaar-south"
          }
        ]
      }
    ],
    "shortName": "Emaar Payment Plans",
    "subtitle": "Pay up to 90% while it builds and the rest on completion, or move in now at Emaar South and spread 75% across three years after handover.",
    "timeline": [
      {
        "share": "80%",
        "stage": "During construction",
        "description": "Paid across the build period on the milestone schedule."
      },
      {
        "share": "20%",
        "stage": "On 100% completion",
        "description": "The balance falls due when construction is complete."
      }
    ],
    "timelineIntro": "The 80/20 shown here is the most common structure. Seapoint, Emaar Beachfront and Alana defer only 10% instead of 20%, and Emaar South inverts the whole thing: 25% now, 75% after you move in.",
    "valueProps": [
      [
        "Only 10% left at completion",
        "On Seapoint, Emaar Beachfront and Alana the plan defers just a tenth of the price to handover. That suits a buyer who wants the payment behind them and the asset clean by the time keys are issued."
      ],
      [
        "Or 75% after you move in",
        "Emaar South runs the opposite structure on ready homes: pay a quarter, take the keys, and spread the remaining three quarters across three years. You can occupy or let the property while the balance is still running."
      ],
      [
        "Financing inside the purchase",
        "Emirates NBD and ADCB off-plan mortgages are arranged as part of the buying process rather than as a separate hunt afterwards, which shortens the gap between reservation and funding."
      ],
      [
        "A flat plan for UAE Nationals",
        "At Dubai Hills Estate, Emirati buyers pay in equal 2.5% monthly instalments for a limited period, so the schedule is a fixed monthly figure rather than milestone-linked lumps."
      ]
    ],
    "whatsappLabel": "Chat on WhatsApp",
    "whatsappMessage": "Hi Binayah! 👋 I'd like the Emaar payment plans: 90/10, 80/20 and the 25/75 at Emaar South. Please send me what is available and the plan on each.",
    "windowLabel": "Current Emaar release",
    "worked": {
      "heading": "What 80/20 looks like on an AED 1,300,000 apartment",
      "rows": [
        [
          "Purchase price",
          "AED 1,300,000"
        ],
        [
          "80% during construction",
          "AED 1,040,000"
        ],
        [
          "20% on completion",
          "AED 260,000"
        ],
        [
          "4% DLD registration fee",
          "AED 52,000"
        ],
        [
          "Due before completion",
          "= AED 1,092,000"
        ]
      ],
      "footnote": "Illustrative, on the entry price at The Cove. The DLD fee is not waived under these plans. Exact figures depend on the unit, the release and the schedule recorded in the signed SPA."
    }
  },
  {
    "slug": "damac-summer-rewards-4-dld-waiver",
    "amenities": {
      "heading": "Houses, not apartments.",
      "stats": [
        {
          "value": "4%",
          "label": "DLD fee covered",
          "icon": "BadgePercent"
        },
        {
          "value": "3",
          "label": "Villa masterplans",
          "icon": "Building2"
        },
        {
          "value": "0",
          "label": "Apartments included",
          "icon": "Ban"
        }
      ],
      "masterplanHeading": "Inside the villa communities",
      "items": [
        "Crystal lagoons",
        "Private pools",
        "Championship golf",
        "Parkland and trails",
        "Community clubhouses",
        "Sports courts",
        "Children's play areas",
        "Retail and dining",
        "Gated streets"
      ],
      "icons": [
        "Waves",
        "Droplets",
        "TreePalm",
        "Flower2",
        "Building2",
        "Bike",
        "Users",
        "Store",
        "ShieldCheck"
      ]
    },
    "bodyParagraphs": [
      "DAMAC Summer Rewards covers the full 4% Dubai Land Department registration fee on eligible off-plan residential villas and townhouses. It is worth being precise about what that means: the DLD fee is a cash cost paid at registration, separate from the purchase price and normally borne by the buyer. A waiver changes what leaves your account on the day, which is a different thing from a discount that adjusts the headline figure.",
      "The offer is narrower than DAMAC's portfolio. Apartments are not included, so this is a house offer: the villa and townhouse stock at DAMAC Hills, DAMAC Hills 2 and DAMAC Islands, alongside the other eligible residential communities in the UAE. It also excludes future new launches, which means it applies to what is open now rather than to whatever is announced next.",
      "On the arithmetic, four per cent moves real money. A AED 3 million villa carries a AED 120,000 registration fee; at AED 5 million it is AED 200,000. Because it is a fee waiver rather than a payment structure, it sits on top of whatever plan DAMAC has attached to the unit, so the two are not alternatives.",
      "DAMAC has not printed an end date on this half of the campaign, which is worth treating as a reason to move rather than a reason to wait: an offer with no published deadline can be withdrawn without notice. We confirm which specific units carry the waiver, place the booking and handle the developer approval on your behalf."
    ],
    "ctaLabel": "Check eligible villas",
    "dayCountEyebrow": false,
    "deadline": "",
    "developer": "DAMAC Properties",
    "disclaimer": "Terms are set by DAMAC Properties and apply to selected eligible off-plan residential villas and townhouses only, subject to availability and developer approval. The offer excludes apartments and future new launches. DAMAC has not published an end date and the offer may be withdrawn or amended without notice. The waiver covers the 4% Dubai Land Department registration fee only; trustee, administration and agency costs are separate and remain payable. Figures shown are illustrative and do not constitute financial advice or an offer to sell. Confirm eligibility and all terms in writing, including the schedule recorded in the SPA, before committing. Binayah Properties is a licensed Dubai brokerage.",
    "eligibility": [
      {
        "label": "What is covered",
        "value": "The full 4% Dubai Land Department registration fee on the eligible unit."
      },
      {
        "label": "Property types",
        "value": "Off-plan residential villas and townhouses. Apartments are not part of this offer."
      },
      {
        "label": "Where",
        "value": "Eligible DAMAC off-plan residential stock in the UAE, including DAMAC Hills, DAMAC Hills 2 and DAMAC Islands."
      },
      {
        "label": "Excluded",
        "value": "Future new launches. The waiver applies to the current eligible release, not to projects announced later."
      },
      {
        "label": "Offer window",
        "value": "DAMAC has not printed an end date on this offer. It is a limited-time summer promotion and can be withdrawn without notice."
      },
      {
        "label": "Golden Visa",
        "value": "Units priced above AED 2 million qualify for the property investor visa route."
      },
      {
        "label": "Availability",
        "value": "Eligibility is set per unit. Confirm in writing that the specific villa you are shown carries the waiver before you commit."
      }
    ],
    "explainer": {
      "heading": "The registration fee, taken off the table",
      "highlight": "On a AED 3 million villa the 4% DLD fee is AED 120,000. Under Summer Rewards DAMAC covers it, so that cash stays with you instead of going to the Land Department at registration.",
      "body": [
        "Summer Rewards is a fee waiver rather than a payment plan. It applies to eligible off-plan residential villas and townhouses in the UAE and excludes future new launches, so it is the current release rather than whatever comes next. Apartments are not included."
      ]
    },
    "eyebrow": "DAMAC Summer Rewards",
    "faqs": [
      {
        "question": "What exactly does DAMAC cover?",
        "answer": "The full 4% Dubai Land Department registration fee on the eligible unit. It is a waiver of a cash cost you would otherwise pay at registration, not a discount applied to the purchase price."
      },
      {
        "question": "Does it apply to apartments?",
        "answer": "No. Summer Rewards is limited to off-plan residential villas and townhouses. Apartments across the DAMAC portfolio are outside it."
      },
      {
        "question": "Which communities qualify?",
        "answer": "Eligible off-plan villa and townhouse stock in the UAE, which in practice means the house communities: DAMAC Hills, DAMAC Hills 2 and DAMAC Islands among them. Eligibility is set per unit."
      },
      {
        "question": "Are new launches included?",
        "answer": "No. The offer explicitly excludes future new launches, so it applies to the current eligible release rather than to projects announced afterwards."
      },
      {
        "question": "When does it end?",
        "answer": "DAMAC has not printed an end date on this offer. It is a limited-time summer promotion and can be withdrawn without notice, so the terms on a specific unit should be confirmed in writing before committing."
      },
      {
        "question": "Does the waiver cover all my transaction costs?",
        "answer": "No. It covers the DLD registration fee. Trustee office charges, admin fees and agency costs are separate and remain payable."
      },
      {
        "question": "Can I combine it with a payment plan?",
        "answer": "Yes. It is a fee waiver rather than a payment structure, so whatever plan DAMAC has attached to your villa continues to apply underneath it."
      },
      {
        "question": "How much is it actually worth?",
        "answer": "Four per cent of the purchase price. On a AED 3 million villa that is AED 120,000; on a AED 5 million villa, AED 200,000."
      }
    ],
    "gallery": [
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/bahamas-2-at-damac-islands-2/gallery/009_009_39106-hd.webp",
        "alt": "The lagoon at DAMAC Islands at dusk"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/bahamas-2-at-damac-islands-2/gallery/007_007_39101-hd.webp",
        "alt": "A villa with a private pool at Bahamas, DAMAC Islands"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/damac-summer-hd/03-12-2x.webp",
        "alt": "A Cavalli Estates villa at DAMAC Hills"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/damac-summer-hd/04-9-2x.webp",
        "alt": "The crystal lagoon at Eterno, DAMAC Hills 2"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/damac-summer-hd/05-8-2x.webp",
        "alt": "A Utopia villa with a private pool at DAMAC Hills"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/bahamas-2-at-damac-islands-2/gallery/001_001_39090-hd.webp",
        "alt": "Aerial view of the lagoons at DAMAC Islands"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/damac-summer-hd/07-1-2x.webp",
        "alt": "Silver Springs villas at DAMAC Hills"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/damac-summer-hd/08-2-2x.webp",
        "alt": "A Utopia villa at dusk, DAMAC Hills"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/bahamas-2-at-damac-islands-2/gallery/005_005_39097-hd.webp",
        "alt": "Boats on the lagoon at DAMAC Islands"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/damac-summer-hd/10-2-2x.webp",
        "alt": "Townhouses at Eterno, DAMAC Hills 2"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/violet-phase-3-at-damac-hills-2/featured.webp",
        "alt": "Violet townhouses at DAMAC Hills 2 at night"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/bahamas-2-at-damac-islands-2/gallery/002_002_39092-hd.webp",
        "alt": "The pool and lagoon at DAMAC Islands from the air"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/damac-summer-hd/13-6-2x.webp",
        "alt": "The pool at Silver Springs, DAMAC Hills"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/damac-summer-hd/14-6-2x.webp",
        "alt": "A Utopia villa and pool terrace at DAMAC Hills"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/damac-summer-hd/15-1-2x.webp",
        "alt": "Poolside at Eterno, DAMAC Hills 2"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/bahamas-2-at-damac-islands-2/featured-hd.webp",
        "alt": "Aerial view of the waterway at DAMAC Islands"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/damac-summer-hd/17-8-2x.webp",
        "alt": "Silver Springs villas and gardens at DAMAC Hills"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/damac-summer-hd/18-11-2x.webp",
        "alt": "Eterno and the wider DAMAC Hills 2 masterplan"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/bahamas-2-at-damac-islands-2/gallery/004_004_39096-hd.webp",
        "alt": "The clubhouse at DAMAC Islands"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/damac-summer-hd/20-5-2x.webp",
        "alt": "A townhouse street at Eterno, DAMAC Hills 2"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/damac-summer-hd/21-12-2x.webp",
        "alt": "Parkland and bridges at DAMAC Hills 2"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/bahamas-2-at-damac-islands-2/gallery/003_003_39094-hd.webp",
        "alt": "The play area at DAMAC Islands"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/damac-summer-hd/23-6-2x.webp",
        "alt": "Living room at Eterno, DAMAC Hills 2"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/damac-summer-hd/24-10-2x.webp",
        "alt": "Bedroom at Silver Springs, DAMAC Hills"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/bahamas-2-at-damac-islands-2/gallery/006_006_39099-hd.webp",
        "alt": "Kitchen at Bahamas, DAMAC Islands"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/bahamas-2-at-damac-islands-2/gallery/012_012_39104-hd.webp",
        "alt": "Bedroom at Bahamas, DAMAC Islands"
      }
    ],
    "h1": "DAMAC Summer Rewards: 4% DLD Waiver on Villas and Townhouses",
    "heroImage": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/bahamas-2-at-damac-islands-2/gallery/008_008_39103-hd.webp",
    "hideDeadline": true,
    "highlights": [
      {
        "value": "4%",
        "label": "DLD fee waived",
        "detail": "The full registration fee, covered by DAMAC"
      },
      {
        "value": "Villas",
        "label": "And townhouses",
        "detail": "Apartments are not part of this offer"
      },
      {
        "value": "Off-plan",
        "label": "Only",
        "detail": "Excludes future new launches"
      },
      {
        "value": "UAE",
        "label": "Wide",
        "detail": "Eligible residential stock across the UAE"
      }
    ],
    "investment": {
      "heading": "A house, with the fee taken off.",
      "items": [
        {
          "title": "Land, not just floor area",
          "text": "Villas and townhouses carry a plot."
        },
        {
          "title": "A cash saving at registration",
          "text": "4% off the day-one cost of the purchase."
        },
        {
          "title": "Established masterplans",
          "text": "DAMAC Hills and Hills 2 are delivered and lived in."
        },
        {
          "title": "Golden Visa route",
          "text": "Units above AED 2 million qualify for the investor visa."
        }
      ],
      "icons": [
        "Coins",
        "BadgePercent",
        "Building2",
        "ShieldCheck"
      ]
    },
    "keywords": "damac summer rewards, damac 4% dld waiver, damac villas offer dubai, damac townhouses offer, damac hills villas, damac islands villas, dld fee waiver dubai, off plan villas dubai offer",
    "metaDescription": "DAMAC Summer Rewards: the full 4% DLD registration fee covered on eligible off-plan villas and townhouses across DAMAC Hills, Hills 2 and DAMAC Islands.",
    "metaTitle": "DAMAC Summer Rewards | 4% DLD Waiver on Villas",
    "priceFrom": 1800000,
    "projectHref": "/developers/damac-properties",
    "projects": [
      {
        "name": "DAMAC Islands",
        "terms": "Bahamas and the wider island clusters, built around crystal lagoons. Villas and townhouses on the eligible list.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/bahamas-2-at-damac-islands-2/gallery/007_007_39101-hd.webp",
        "links": [
          {
            "label": "Bahamas at DAMAC Islands",
            "href": "/project/bahamas-2-at-damac-islands-2"
          }
        ]
      },
      {
        "name": "Cavalli Estates",
        "terms": "DAMAC Hills. The top of the villa range, branded interiors and private pools.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/damac-summer-hd/03-12-2x.webp",
        "links": [
          {
            "label": "Cavalli Estates at DAMAC Hills",
            "href": "/project/cavalli-estate-villas-at-damac-hills"
          }
        ]
      },
      {
        "name": "Utopia",
        "terms": "DAMAC Hills. Urban resort villas with pool terraces, on the eligible villa list.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/damac-summer-hd/05-8-2x.webp",
        "links": [
          {
            "label": "Utopia at DAMAC Hills",
            "href": "/project/utopia-urban-resort-villas-at-damac-hills"
          }
        ]
      },
      {
        "name": "Silver Springs",
        "terms": "DAMAC Hills. Family villas backing onto the golf and parkland.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/damac-summer-hd/07-1-2x.webp",
        "links": [
          {
            "label": "Silver Springs at DAMAC Hills",
            "href": "/project/silver-springs-at-damac-hills"
          }
        ]
      },
      {
        "name": "Eterno",
        "terms": "DAMAC Hills 2, around the crystal lagoon. Townhouses and villas, both eligible.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/damac-summer-hd/10-2-2x.webp",
        "links": [
          {
            "label": "Eterno at DAMAC Hills 2",
            "href": "/project/eterno-townhouses-and-villas-for-sale-at-damac-hills-2"
          }
        ]
      }
    ],
    "shortName": "DAMAC Summer Rewards",
    "subtitle": "DAMAC covers the full 4% Dubai Land Department registration fee on eligible off-plan villas and townhouses.",
    "timeline": [
      {
        "share": "4%",
        "stage": "At registration",
        "description": "The DLD fee that would normally be yours to pay, covered by DAMAC."
      },
      {
        "share": "0%",
        "stage": "Added to the price",
        "description": "It is a waiver, not a discount rolled into the purchase price."
      }
    ],
    "timelineIntro": "The waiver changes what you hand over at registration rather than how the price is staged, so the payment plan on your villa is whatever DAMAC has attached to that release.",
    "valueProps": [
      [
        "The fee is real money, not a discount",
        "The 4% DLD registration fee is a cash cost paid at registration, separate from the purchase price. Waiving it changes what leaves your account rather than what the property is worth on paper."
      ],
      [
        "Villas and townhouses only",
        "This is a house offer. Apartments across the DAMAC portfolio are excluded, which narrows it to DAMAC Hills, Hills 2, DAMAC Islands and the other villa and townhouse communities."
      ],
      [
        "Current stock, not the next launch",
        "The waiver excludes future new launches. That makes it worth acting on the release that is open now rather than waiting for the next announcement and expecting the same terms."
      ],
      [
        "It stacks with the plan on the unit",
        "Summer Rewards is a fee waiver, so whatever payment structure DAMAC has attached to your villa still applies underneath it."
      ]
    ],
    "whatsappLabel": "Chat on WhatsApp",
    "whatsappMessage": "Hi Binayah! 👋 I'm interested in DAMAC Summer Rewards: the 4% DLD waiver on villas and townhouses. Please send me the eligible units.",
    "windowLabel": "Limited-time summer offer",
    "worked": {
      "heading": "What the waiver is worth on a AED 3,000,000 villa",
      "rows": [
        [
          "Purchase price",
          "AED 3,000,000"
        ],
        [
          "4% DLD registration fee",
          "AED 120,000"
        ],
        [
          "Covered by DAMAC",
          "- AED 120,000"
        ],
        [
          "DLD fee you actually pay",
          "= AED 0"
        ]
      ],
      "footnote": "Illustrative. The waiver covers the DLD registration fee only; trustee, admin and agency costs are separate and remain payable. Confirm the exact position on your unit in writing."
    }
  }
];

export function getOffer(slug: string): Offer | undefined {
  return OFFERS.find((o) => o.slug === slug);
}

/** Shown when an offer has no published end date. */
export const DEFAULT_WINDOW_LABEL = "Limited time offer";

/** Divider heading between an amenity band's stats and its icon-grid cards,
 *  when the offer hasn't set its own. */
export const DEFAULT_MASTERPLAN_HEADING = "Inside the masterplan";

/** True when this offer has a real, parseable end date. */
export function hasDeadline(offer: { deadline?: string }): boolean {
  return Number.isFinite(new Date(offer.deadline ?? "").getTime());
}

/** Live day count for a `dayCountEyebrow` offer, recomputed on every request
 *  rather than baked into the stored `eyebrow` string — so a "4 days only"
 *  badge doesn't keep saying that after the window has shrunk.
 *
 *  Returns the parts rather than a finished sentence: the wording and the
 *  weekday name are locale-dependent, so the caller renders them through the
 *  `offerPage` messages (which carry each language's own plural rules) instead
 *  of receiving a hardcoded English string. `null` means "use offer.eyebrow".
 */
export function eyebrowDayCount(
  offer: Offer,
  locale: string,
  now: Date = new Date(),
): { days: number; weekday: string } | null {
  if (!offer.dayCountEyebrow || !hasDeadline(offer)) return null;
  const end = new Date(offer.deadline);
  const days = Math.ceil((end.getTime() - now.getTime()) / 86_400_000);
  const weekday = end.toLocaleDateString(locale, { weekday: "long", timeZone: "Asia/Dubai" });
  return { days, weekday };
}

/** True when the promotion window has closed. An offer with no deadline never
 *  expires — `new Date("")` is NaN, so the finite check below is false. */
export function isExpired(offer: { deadline: string }, now: Date = new Date()): boolean {
  const end = new Date(offer.deadline).getTime();
  return Number.isFinite(end) && now.getTime() > end;
}
