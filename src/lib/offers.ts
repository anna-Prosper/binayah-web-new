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
  /** Overrides the timeline section's H2. The default ("Your money, staged")
   *  describes a payment plan; an offer whose rail is a process rather than a
   *  schedule needs its own. Translated per locale, falls back to the catalogue. */
  timelineHeading?: string;
  /** "The offer in detail" bullet rows. */
  eligibility: OfferEligibility[];
  /** Participating projects, linked through to their own pages. Drives the
   *  reader from the terms into real inventory instead of dead-ending. */
  projects?: OfferProject[];
  /** Overrides the projects section's H2. The default ("Choose your community")
   *  is right for a multi-community developer promotion and wrong for an offer
   *  whose grid holds something else — partner developers, say. Translated per
   *  locale like any other scalar field; falls back to the message catalogue. */
  projectsHeading?: string;
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
    "dayCountEyebrow": true,
    "explainer": {
      "heading": "The 20:80 plan is back, across all five Sobha communities",
      "highlight": "The last time this plan ran, Sobha sold over AED 1 billion of property in two days. This round is open wider still: there is no minimum requirement to buy a 5 million dirham unit.",
      "body": [
        "Sobha's 20:80 payment plan is open again across all five Dubai and Siniya Island communities. Pay just 20% of the price while it's being built and defer the remaining 80% to handover."
      ]
    },
    "metaTitle": "Sobha 20:80 Offer from AED 1.8M | Pay 20% Now",
    "metaDescription": "Own a Sobha home from AED 1.8M: 20% during construction, 80% on handover, across five communities. Up to 4% DLD waived. Speak to Binayah.",
    "keywords": "Sobha 20:80 payment plan, Sobha payment plan Dubai, Sobha Central 1 bedroom price, 20 80 payment plan Dubai, Sobha offer 2026, Sobha Elwood price, Sobha Sanctuary villas, Sobha Siniya Island, Downtown Umm Al Quwain, DLD waiver Dubai, off plan Dubai payment plan",
    "priceFrom": 1800000,
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
    "projects": [
      {
        "name": "Sobha Elwood",
        "terms": "20:80 plan, 2% DLD waiver and a 2% furniture voucher.",
        "links": [],
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
    "ctaLabel": "See qualifying units",
    "whatsappLabel": "WhatsApp us now",
    "whatsappMessage": "Hi Binayah! 👋 I want the Sobha 20:80 plan: 20% now, 80% on handover, from AED 1.8M. Please send me the qualifying units.",
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
    "disclaimer": "Terms are set by Sobha Realty and apply to selected units and projects only, subject to availability and developer approval. Waivers and vouchers vary by project and unit type as set out above. Figures shown are illustrative and do not constitute financial advice or an offer to sell. The offer does not apply to cancellations, swaps, upgrades, downgrades or re bookings. Confirm all terms in writing before committing. Binayah Properties is a licensed Dubai brokerage."
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
    "explainer": {
      "heading": "Two waterfront masterplans, one offer",
      "highlight": "A DAMAC waterfront home from AED 1,950 a month. The 4% DLD registration fee is covered, 4% comes off the price, and half the balance waits until handover.",
      "body": [
        "The offer runs across DAMAC Lagoons in Dubailand and DAMAC Riverside in Dubai Investments Park, on ready and near-ready homes rather than early-stage plots. Studios, apartments, townhouses and villas all qualify, from AED 718,000."
      ]
    },
    "metaTitle": "DAMAC Waterfront Homes from AED 1,950 a Month",
    "metaDescription": "Branded DAMAC waterfront homes at Lagoons and Riverside from AED 1,950 a month, with a 4% DLD waiver, 4% off the price and a 50/50 plan.",
    "keywords": "DAMAC Lagoons offer, DAMAC Riverside offer, DAMAC 50/50 payment plan, 4% DLD waiver Dubai, DAMAC waterfront homes, DAMAC Lagoons price, DAMAC Riverside price, Dubai waterfront property offer",
    "priceFrom": 718000,
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
    "timelineIntro": "An even split rather than a front-loaded one: half the price is spread across the construction and holding period, and the other half is deferred until handover. That structure is what brings the monthly figure down to AED 1,950.",
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
    "ctaLabel": "Check eligible homes",
    "whatsappLabel": "Chat on WhatsApp",
    "whatsappMessage": "Hi Binayah! 👋 I'm interested in the DAMAC Lagoons and Riverside offer: from AED 1,950 a month, 4% DLD waiver and a 50/50 plan. Please send me the eligible homes.",
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
    "projectHref": "/developers/damac-properties"
  },
  {
    "slug": "danube-deal-of-the-decade-20-10-back",
    "shortName": "Danube Deal of the Decade",
    "developer": "Danube Properties",
    "eyebrow": "Weekend only, 29 to 30 August",
    "h1": "Pay 20%, Get 10% Back: Danube's Deal of the Decade",
    "subtitle": "A 10% credit note against your balance, 1% a month while it builds, and 40% deferred until after handover.",
    "heroImage": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/danube-hd/00-bayz-101-at-business-bay-dubai-gallery_1-2x.webp",
    "deadline": "2026-08-30T23:59:59+04:00",
    "windowLabel": "Weekend edition, 29 to 30 August 2026",
    "hideDeadline": false,
    "dayCountEyebrow": false,
    "explainer": {
      "heading": "Pay 20%, and 10% comes back as a credit note",
      "highlight": "A refundable AED 100,000 token adds another 1%. Families buying together add up to 4% more. Pay the whole price upfront instead and the discount is a flat 14%.",
      "body": [
        "Danube's Deal of the Decade returns for one weekend, 29 and 30 August 2026. Pay 20% of the price plus the 4% DLD registration fee, and 10% of the property value comes back to you as a credit note set against your remaining balance. From there you pick the pace: 1% a month with the rebate released straight away, or 0.5% a month with it released once you reach 40%."
      ]
    },
    "metaTitle": "Danube Deal of the Decade | Pay 20%, Get 10% Back",
    "metaDescription": "Danube's Deal of the Decade, 29 to 30 August 2026: pay 20% and 10% returns as a credit note, then 1% a month and 40% after handover.",
    "keywords": "danube deal of the decade, danube pay 20 get 10 back, danube properties offer dubai, danube 1 percent monthly payment plan, danube credit note offer, danube 11:11 projects, dubai off plan payment plan, danube properties dubai",
    "priceFrom": 790000,
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
    "ctaLabel": "Check eligible units",
    "whatsappLabel": "Chat on WhatsApp",
    "whatsappMessage": "Hi Binayah! 👋 I'm interested in Danube's Deal of the Decade: pay 20% and get 10% back as a credit note. Please send me the eligible projects and the numbers.",
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
    "bodyParagraphs": [
      "Danube Properties has reopened its Deal of the Decade for a single weekend, 29 and 30 August 2026. The mechanism is straightforward: pay 20% of the price plus the 4% DLD registration fee, and 10% of the property value comes back as a credit note applied to your remaining balance. It is a rebate against what you owe rather than money in hand, and on a AED 1.5 million apartment it is worth AED 150,000.",
      "What you choose after that is the pace. The 1% track releases the rebate immediately once the 20% and the fee are paid, then charges 1% of the property value each month until the building completes. The 0.5% track halves the monthly figure but holds the rebate back until you have paid 40%. Either way, 40% of the price is deferred until after handover, so most of the purchase falls due once the keys are in your hand.",
      "Eleven projects sit outside those two tracks. Danube's 11:11 lineup, made up of Fashionz 1, Sparklz, Viewz 1 and 2, Oceanz 1, 2 and 3, Oasiz 1 and 2, and Elitz 2 and 3, runs a simpler 20:70 split: the rebate follows the 20%, and the remaining 70% is due on completion rather than spread monthly.",
      "The rebates stack, which is where the offer gets interesting. A refundable AED 100,000 token adds another 1% on every project except Greenz. Immediate family buying together earn 2% on a combined AED 10 to 20 million, 3% from AED 20 to 30 million, and 4% above that. Paying the full price upfront swaps the whole structure for a flat 14% discount. We place the booking, handle the paperwork and secure developer approval on your behalf."
    ],
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
    "disclaimer": "Terms are set by Danube Properties and apply to selected units and projects only, subject to availability and developer approval. Rebate percentages, release timing and payment tracks vary by project and unit type, and the 11:11 lineup and Greenz carry their own structures as set out above. Figures shown are illustrative and do not constitute financial advice or an offer to sell. Confirm all terms in writing, including the schedule recorded in the SPA, before committing. Binayah Properties is a licensed Dubai brokerage.",
    "projectHref": "/developers/danube-properties"
  },
  {
    "slug": "limited-emaar-90-10-offer-beachfront-launch",
    "shortName": "Emaar Beachfront 90/10",
    "developer": "Emaar Properties",
    "eyebrow": "Launch plan at Emaar Beachfront",
    "h1": "Emaar Beachfront: 90/10 on the Dubai Harbour Peninsula",
    "subtitle": "Emaar's launch plan here defers only the last tenth, which is the opposite of how most Dubai off-plan is sold. What you are buying is the address: a gated peninsula with its own beach, between Dubai Marina and Palm Jumeirah.",
    "heroImage": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/beachfront-hd/00-3-2x.webp",
    "deadline": "",
    "windowLabel": "Limited-time launch offer",
    "hideDeadline": false,
    "dayCountEyebrow": false,
    "explainer": {
      "heading": "A plan that front-loads, and why that is the trade",
      "highlight": "90% during construction and 10% upon 100% construction completion. Most launch plans in this market defer 40% to 60% to handover; this one defers a tenth.",
      "body": [
        "It is worth naming the trade plainly rather than dressing it up. A 90/10 asks for more of your money during the build than an 80/20 or a 60/40 does, and in exchange the balance at handover is small enough to be a formality rather than a financing event. Buyers who intend to hold, and who are not planning to arrange a mortgage at completion, tend to prefer that shape. Buyers who want their capital working elsewhere until the keys arrive do not.",
        "What the plan is attached to is the part that carries the price. Emaar Beachfront is a gated peninsula at Dubai Harbour, sitting between Dubai Marina and Palm Jumeirah with its own beach and marina. The release covers one, two, three and four-bedroom apartments, four-bedroom penthouses and a six-bedroom penthouse."
      ]
    },
    "metaTitle": "Emaar Beachfront 90/10 Offer | 10% at Completion",
    "metaDescription": "Emaar Beachfront's launch plan: 90% during construction and 10% on 100% construction completion. One to four-bedroom apartments and penthouses on the Dubai Harbour peninsula.",
    "keywords": "emaar beachfront, emaar beachfront 90/10 payment plan, emaar beachfront apartments for sale, dubai harbour apartments, emaar beachfront launch offer, emaar beachfront penthouse, beach vista grand bleu beach isle, apartments between dubai marina and palm jumeirah",
    "highlights": [
      {
        "value": "90%",
        "label": "During construction",
        "detail": "Paid across the build period"
      },
      {
        "value": "10%",
        "label": "At completion",
        "detail": "Due at 100% construction completion"
      },
      {
        "value": "1 to 6",
        "label": "Bedrooms",
        "detail": "Apartments through to a six-bedroom penthouse"
      },
      {
        "value": "9th",
        "label": "Floor amenities",
        "detail": "A whole level given over to residents"
      }
    ],
    "timeline": [
      {
        "stage": "During construction",
        "share": "90%",
        "description": "Paid across the build period on Emaar's construction-linked schedule."
      },
      {
        "stage": "At 100% construction completion",
        "share": "10%",
        "description": "The balance, due once construction is complete."
      }
    ],
    "timelineIntro": "Two blocks, and the second one is small. Ninety percent is paid across the construction period and the last ten falls due once construction reaches 100%.",
    "eligibility": [
      {
        "label": "The plan",
        "value": "90% during construction and 10% upon 100% construction completion."
      },
      {
        "label": "Where it applies",
        "value": "Emaar Beachfront, the gated peninsula at Dubai Harbour between Dubai Marina and Palm Jumeirah."
      },
      {
        "label": "What is in the release",
        "value": "One, two, three and four-bedroom apartments, four-bedroom penthouses and a six-bedroom penthouse."
      },
      {
        "label": "How long it runs",
        "value": "Emaar publishes it as a limited-time launch offer without a stated end date, so availability is the real constraint."
      },
      {
        "label": "Amenities",
        "value": "An amenities platform, ground-level dining and retail, a shaded kids' pool and play area, and a dedicated ninth-floor amenities level."
      },
      {
        "label": "Views",
        "value": "Uninterrupted 360-degree views, with the marina and yacht club a short walk away."
      },
      {
        "label": "What is not covered",
        "value": "The 4% DLD registration fee, trustee office and administration charges are payable separately."
      },
      {
        "label": "Golden Visa",
        "value": "The investor visa route needs property above AED 2 million. Most of what sells at Emaar Beachfront clears that comfortably, but it depends on the unit rather than the community."
      }
    ],
    "projects": [
      {
        "name": "Beach Vista",
        "terms": "Two towers on the beach edge, among the first delivered at Emaar Beachfront.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/beachfront-hd/17-12-2x.webp",
        "links": [
          {
            "label": "View project",
            "href": "/project/beach-vista-apartments-sale-rent"
          }
        ]
      },
      {
        "name": "Grand Bleu Tower",
        "terms": "Interiors by Elie Saab, on the western edge facing Palm Jumeirah.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/beachfront-hd/06-19-2x.webp",
        "links": [
          {
            "label": "View project",
            "href": "/project/grand-bleu-apartments-for-sale-at-emaar-beachfront-dubai"
          }
        ]
      },
      {
        "name": "Beach Isle",
        "terms": "Direct beach access with the Marina skyline on the other side of the glass.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/beachfront-hd/18-16-2x.webp",
        "links": [
          {
            "label": "View project",
            "href": "/project/beach-isle-apartments-for-sale-at-emaar-beachfront-dubai"
          }
        ]
      },
      {
        "name": "Bayview by Address Resorts",
        "terms": "Address-branded, with the rooftop pool that looks straight across to the Palm.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/beachfront-hd/09-1-2x.webp",
        "links": [
          {
            "label": "View project",
            "href": "/project/bayview-by-address-resorts-at-emaar-beachfront"
          }
        ]
      },
      {
        "name": "Beachgate by Address",
        "terms": "Address-branded apartments on the beach side of the peninsula.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/beachfront-hd/05-4-2x.webp",
        "links": [
          {
            "label": "View project",
            "href": "/project/beachgate-by-address-at-emaar-beachfront"
          }
        ]
      },
      {
        "name": "Palace Beach Residence",
        "terms": "Palace-branded, with the hotel service model attached to the building.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/beachfront-hd/21-10-2x.webp",
        "links": [
          {
            "label": "View project",
            "href": "/project/palace-beach-residence-tower-2-by-emaar"
          }
        ]
      },
      {
        "name": "The Bristol",
        "terms": "One of the newer releases on the peninsula, facing Palm Jumeirah.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/beachfront-hd2/00-5-2x.webp",
        "links": [
          {
            "label": "View project",
            "href": "/project/the-bristol-at-emaar-beachfront"
          }
        ]
      },
      {
        "name": "Seapoint",
        "terms": "Also covered by Emaar's wider payment-plan offer alongside The Cove and Park Horizon.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/beachfront-hd/02-10-2x.webp",
        "links": [
          {
            "label": "View project",
            "href": "/project/seapoint-at-emaar-beachfront"
          },
          {
            "label": "See the Emaar plans offer",
            "href": "/offers/emaar-payment-plans-offer"
          }
        ]
      }
    ],
    "projectsHeading": "Towers on the peninsula",
    "amenities": {
      "heading": "A private beach, a marina and a ninth floor that is all amenity.",
      "stats": [
        {
          "value": "360°",
          "label": "Uninterrupted views",
          "icon": "Building2"
        },
        {
          "value": "9th",
          "label": "Floor amenities level",
          "icon": "Sparkles"
        },
        {
          "value": "1 to 6",
          "label": "Bedrooms in the release",
          "icon": "KeyRound"
        }
      ],
      "masterplanHeading": "On the peninsula",
      "items": [
        "Private beach on the peninsula",
        "Footsteps from the marina and yacht club",
        "Dedicated ninth floor amenities level",
        "Amenities platform",
        "Ground level dining and retail",
        "Shaded kids pool and play area",
        "Infinity pools facing the Palm",
        "Residents gym and wellness suites",
        "Direct access to Dubai Marina"
      ],
      "icons": [
        "Waves",
        "Bike",
        "Sparkles",
        "Sun",
        "Store",
        "Droplets",
        "TreePalm",
        "Users",
        "Building2"
      ]
    },
    "gallery": [
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/beachfront-hd/00-3-2x.webp",
        "alt": "The rooftop infinity pool at Bayview by Address Resorts, looking across to Palm Jumeirah"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/beachfront-hd2/00-5-2x.webp",
        "alt": "A balcony at The Bristol, Emaar Beachfront, over the Palm at dusk"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/beachfront-hd/02-10-2x.webp",
        "alt": "Bayview by Address Resorts seen from the water at Emaar Beachfront"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/beachfront-hd/03-2-2x.webp",
        "alt": "The private beach at Emaar Beachfront, with the towers behind it"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/beachfront-hd/04-20-2x.webp",
        "alt": "The view over Palm Jumeirah from a balcony at Grand Bleu Tower"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/beachfront-hd/05-4-2x.webp",
        "alt": "The infinity pool at Beachgate by Address, facing the sea"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/beachfront-hd/06-19-2x.webp",
        "alt": "Grand Bleu Tower seen from the base of the two towers"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/beachfront-hd/07-15-2x.webp",
        "alt": "A dining space at Beach Isle with Palm Jumeirah through the glass"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/beachfront-hd/08-7-2x.webp",
        "alt": "Panoramic dining at Shorefront Residences, Emaar Beachfront"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/beachfront-hd/09-1-2x.webp",
        "alt": "Poolside cabanas at Bayview by Address Resorts, facing the Palm"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/beachfront-hd/10-11-2x.webp",
        "alt": "A balcony at South Beach with the Dubai Marina skyline beyond"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/beachfront-hd/11-3-2x.webp",
        "alt": "Living and dining at Beachgate by Address, open to the sea"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/beachfront-hd/12-2-2x.webp",
        "alt": "Bayview Tower 2 at dusk with Dubai Marina behind it"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/beachfront-hd2/01-13-2x.webp",
        "alt": "A rooftop cabana at South Beach above the Marina skyline"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/beachfront-hd/14-14-2x.webp",
        "alt": "A bedroom at Beach Isle, Emaar Beachfront"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/beachfront-hd/15-2-2x.webp",
        "alt": "A bedroom at Shorefront Residences, Emaar Beachfront"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/beachfront-hd/16-3-2x.webp",
        "alt": "The living and kitchen space at Palace Beach Residence"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/beachfront-hd/17-12-2x.webp",
        "alt": "The kitchen in a Beach Vista apartment at Emaar Beachfront"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/beachfront-hd/18-16-2x.webp",
        "alt": "Living and kitchen at Beach Isle, open to the sea"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/beachfront-hd/19-11-2x.webp",
        "alt": "A bedroom at Palace Beach Residence with the Marina beyond"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/beachfront-hd/20-19-2x.webp",
        "alt": "A kitchen at Marina Vista with the Dubai skyline behind it"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/beachfront-hd/21-10-2x.webp",
        "alt": "The lobby at Palace Beach Residence, Emaar Beachfront"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/beachfront-hd/22-2-2x.webp",
        "alt": "The residents gym at Palace Beach Residence"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/beachfront-hd/23-10-2x.webp",
        "alt": "A bedroom at South Beach, Emaar Beachfront"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/beachfront-hd/24-20-2x.webp",
        "alt": "Poolside cabanas at Marina Vista, facing the Dubai Marina skyline"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/beachfront-hd/25-11-2x.webp",
        "alt": "The infinity pool at Bayview Tower 2, Emaar Beachfront"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/beachfront-hd/26-3-2x.webp",
        "alt": "On the water off Emaar Beachfront, with the Dubai skyline behind"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/beachfront-hd/27-12-2x.webp",
        "alt": "A yacht moored off Emaar Beachfront"
      }
    ],
    "investment": {
      "heading": "Why this address rather than this plan.",
      "items": [
        {
          "title": "Finite land",
          "text": "A peninsula with no inland phase to release later."
        },
        {
          "title": "Between Marina and the Palm",
          "text": "Two of the deepest rental markets in the city, either side."
        },
        {
          "title": "A small balance at the end",
          "text": "Ten percent at completion, not forty."
        },
        {
          "title": "Beach and marina on site",
          "text": "Not a shuttle ride away from either."
        }
      ],
      "icons": [
        "Coins",
        "TrendingUp",
        "Wallet",
        "Waves"
      ]
    },
    "ctaLabel": "See available units",
    "whatsappLabel": "Message on WhatsApp",
    "whatsappMessage": "Hi Binayah! 👋 I'm interested in the Emaar Beachfront 90/10 launch plan: 90% during construction, 10% at completion. Please send me what's available.",
    "valueProps": [
      [
        "Ten percent left at the end",
        "A 90/10 leaves a balance small enough that completion is a formality rather than a financing event. If you are not planning to raise a mortgage at handover, that removes the single most common point of failure in an off-plan purchase."
      ],
      [
        "An address that is genuinely constrained",
        "Emaar Beachfront is a finite peninsula, not a masterplan that can be extended inland. Between Dubai Marina and Palm Jumeirah, with its own beach and marina, there is no second phase of land to release."
      ],
      [
        "Penthouses in the same release",
        "The release runs from one-bedroom apartments up to four-bedroom penthouses and a single six-bedroom penthouse, so the plan is not restricted to the entry stock."
      ],
      [
        "The trade runs the other way for cash buyers",
        "Front-loading is a cost if your capital has somewhere better to be, and an advantage if it does not. For a buyer holding cash and planning to keep the home, the 90/10 removes handover risk rather than adding to it."
      ]
    ],
    "bodyParagraphs": [
      "Emaar's launch offer at Emaar Beachfront is a 90/10: ninety percent of the price across the construction period, and the final ten percent once construction reaches 100%. That is an unusual shape for this market, where the headline plans mostly defer 40% or more to handover, and it is worth understanding as a trade rather than a discount.",
      "The advantage is at the end. A 90/10 leaves a balance small enough that completion becomes an administrative step rather than a financing event, which matters if you have no intention of arranging a mortgage at handover. The cost is at the beginning: your capital is committed earlier and does less elsewhere while the building goes up. Neither shape is better in the abstract. What decides it is whether you are buying to hold with cash in hand, or buying with a plan for that money in the meantime.",
      "The address is what carries the price. Emaar Beachfront is a gated peninsula at Dubai Harbour, sitting between Dubai Marina and Palm Jumeirah with its own beach and its own marina. It is finite in a way most Dubai masterplans are not: there is no inland phase to release in three years' time. The release under this plan runs from one-bedroom apartments up to four-bedroom penthouses, with a single six-bedroom penthouse at the top of it.",
      "Inside, Emaar publishes an amenities platform, ground-level dining and retail, a shaded kids' pool and play area and a dedicated ninth-floor amenities level, with the marina and yacht club a walk away. The 4% DLD registration fee, trustee office and administration charges sit outside the plan and remain payable. Emaar has not published an end date for the offer, so availability rather than a calendar is what will close it; confirm the price, the schedule and the terms for a specific unit in writing before committing."
    ],
    "worked": {
      "heading": "The shape of a 90/10 on a AED 4M apartment",
      "rows": [
        [
          "Purchase price",
          "AED 4,000,000"
        ],
        [
          "Paid during construction",
          "AED 3,600,000"
        ],
        [
          "Due at 100% completion",
          "AED 400,000"
        ],
        [
          "4% DLD registration fee",
          "AED 160,000"
        ],
        [
          "Compare: 60/40 balance at handover",
          "AED 1,600,000"
        ]
      ],
      "footnote": "Illustrative, using a round AED 4M price rather than a quoted unit; figures are rounded. The DLD registration fee, trustee office and administration charges are payable separately and are not covered by the plan. The final row is a comparison against a typical 60/40 plan, not an alternative Emaar offers here. Prices, availability and terms change, so confirm the schedule for your own unit in writing."
    },
    "faqs": [
      {
        "question": "What is the payment plan?",
        "answer": "90% is payable during construction and 10% upon 100% construction completion. Emaar publishes it as a limited-time launch offer."
      },
      {
        "question": "Where does this offer apply?",
        "answer": "Emaar Beachfront, the gated peninsula at Dubai Harbour between Dubai Marina and Palm Jumeirah."
      },
      {
        "question": "What can I buy under it?",
        "answer": "One, two, three and four-bedroom apartments, four-bedroom penthouses and a six-bedroom penthouse."
      },
      {
        "question": "Is a 90/10 better or worse than a 60/40?",
        "answer": "Neither, and it depends entirely on what your capital is doing in the meantime. A 90/10 asks for more during the build and leaves almost nothing at handover; a 60/40 does the reverse. If you expect to arrange a mortgage at completion, the deferred plans suit you better. If you are paying cash and holding, the 90/10 removes the handover financing risk."
      },
      {
        "question": "When does the offer end?",
        "answer": "Emaar states it as a limited-time launch offer without publishing an end date, so availability is what actually closes it."
      },
      {
        "question": "Are the DLD fees included?",
        "answer": "No. The 4% Dubai Land Department registration fee, trustee office charges and administration fees are payable separately."
      },
      {
        "question": "Does buying here qualify me for a Golden Visa?",
        "answer": "The investor route requires property above AED 2 million. Most Emaar Beachfront stock is well above that line, but eligibility is decided on the unit and the UAE authorities decide the visa, not the developer."
      },
      {
        "question": "Which towers are at Emaar Beachfront?",
        "answer": "Beach Vista, Grand Bleu, Beach Isle, Marina Vista, Sunrise Bay, Beach Mansion, Address Residences The Bay, Beachgate by Address, Bayview by Address Resorts, Palace Beach Residence, Seapoint, Shorefront Residences and The Bristol, among others."
      }
    ],
    "disclaimer": "Terms are set by Emaar Properties and apply to eligible units at Emaar Beachfront, subject to availability and to Emaar's terms and conditions. The 90/10 plan is published as a limited-time launch offer; prices, availability and payment terms change without notice. The 4% DLD registration fee, trustee office and administration charges are payable separately and are not covered by the plan. Golden Visa eligibility is determined by the UAE authorities on the basis of the property purchased, not by the developer or by us. Worked figures are illustrative, use a round example price rather than a quoted unit, and are not financial advice or an offer to sell. Confirm price, the full payment schedule and all terms in writing, including the schedule recorded in the sale and purchase agreement, before committing. Binayah Properties is a licensed Dubai real estate brokerage."
  },
  {
    "slug": "emaar-payment-plans-offer",
    "shortName": "Emaar Payment Plans",
    "developer": "Emaar Properties",
    "eyebrow": "Live Emaar payment plans",
    "h1": "Emaar Payment Plans: 90/10, 80/20 and 25/75",
    "subtitle": "Pay up to 90% while it builds and the rest on completion, or move in now at Emaar South and spread 75% across three years after handover.",
    "heroImage": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/emaar/00-2-2x.webp",
    "deadline": "",
    "windowLabel": "Current Emaar release",
    "hideDeadline": true,
    "dayCountEyebrow": false,
    "explainer": {
      "heading": "Four plans, depending on what you are buying",
      "highlight": "The Emaar South plan is the outlier: it is a ready-to-move home where 75% of the price is spread across three years after you have the keys. Emaar rarely defers that much, that long.",
      "body": [
        "Emaar is running several structures at once rather than a single campaign. Which one you get depends on the community. Off-plan financing is built into the process through Emirates NBD and ADCB, and UAE Nationals buying at Dubai Hills Estate have a separate plan of equal 2.5% monthly instalments."
      ]
    },
    "metaTitle": "Emaar Payment Plans | 90/10, 80/20 and 25/75",
    "metaDescription": "Emaar's current plans: 90/10 at Seapoint and Alana, 80/20 at The Cove, Park Horizon and Seascape, and 25/75 with a 3-year post-handover tail at Emaar South.",
    "keywords": "emaar payment plan, emaar 90/10 payment plan, emaar 80/20, emaar south 25/75 post handover, emaar offers dubai, seapoint payment plan, dubai off plan payment plan",
    "priceFrom": 1300000,
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
        "terms": "The Valley, built around a swimmable lagoon. Three and four-bedroom townhouses on the 90/10.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/emaar/02-3-2x.webp",
        "links": [
          {
            "label": "Alana at The Valley",
            "href": "/project/alana-by-emaar-at-the-valley"
          },
          {
            "label": "See the Alana offer",
            "href": "/offers/emaar-90-10-offer-limited-time-alana-the-valley-launch"
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
    "ctaLabel": "Check eligible units",
    "whatsappLabel": "Chat on WhatsApp",
    "whatsappMessage": "Hi Binayah! 👋 I'd like the Emaar payment plans: 90/10, 80/20 and the 25/75 at Emaar South. Please send me what is available and the plan on each.",
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
    "bodyParagraphs": [
      "Emaar is not running one campaign. It is running four structures at once, and which one applies depends entirely on the community you buy in. The most common is 80/20: eighty per cent across the construction period and the remaining twenty on 100% construction completion. That covers The Cove at Dubai Creek Harbour, Park Horizon at Dubai Hills Estate, Seascape at Rashid Yachts & Marina and Fairway Villas at Emaar South.",
      "Three communities go further and defer only a tenth. Seapoint at Emaar Beachfront, Emaar Beachfront itself and Alana at The Valley run 90/10, so ninety per cent is paid while the building goes up and the last ten per cent falls due at completion. That is a heavier construction-period commitment in exchange for a clean position at handover.",
      "The outlier is Emaar South. It is the only one of the set on ready-to-move stock, and it inverts the structure completely: twenty-five per cent up front, then seventy-five per cent spread across three years after you have taken the keys. A three-year post-handover tail is unusual for Emaar, and it means the property can be occupied or let while most of the price is still outstanding.",
      "Two things sit underneath all of it. Off-plan financing is arranged within the purchase through Emirates NBD and ADCB rather than left to the buyer afterwards, and UAE Nationals buying at Dubai Hills Estate have their own plan of equal 2.5% monthly instalments for a limited period. We place the booking, confirm which plan is attached to your unit and handle the paperwork."
    ],
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
    },
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
    "disclaimer": "Payment plans are set by Emaar Properties and are attached to specific releases and unit types, subject to availability and developer approval. Plans change between phases and the structure quoted here may not apply to the unit you are shown. Figures are illustrative and do not constitute financial advice or an offer to sell. The 4% Dubai Land Department registration fee is not waived under these plans. Confirm the plan, the schedule and all terms in writing, including the schedule recorded in the SPA, before committing. Binayah Properties is a licensed Dubai brokerage.",
    "projectHref": "/developers/emaar-properties"
  },
  {
    "slug": "emaar-creek-beach-offer-luxury-waterfront-apartments",
    "shortName": "Creek Beach",
    "developer": "Emaar Properties",
    "eyebrow": "Limited release at Creek Beach",
    "h1": "Creek Beach: Emaar's Swimmable Waterfront Inside Dubai Creek Harbour",
    "subtitle": "A limited number of one, two and three-bedroom apartments in the district of Dubai Creek Harbour built around a beach, a central park and a promenade rather than a tower podium.",
    "heroImage": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/creekbeach-hd/00-1-2x.webp",
    "deadline": "",
    "windowLabel": "Register your interest",
    "hideDeadline": false,
    "dayCountEyebrow": false,
    "explainer": {
      "heading": "The district, not the tower",
      "highlight": "Creek Beach is the part of Dubai Creek Harbour organised around water rather than around a road: a swimmable beach, Central Park and the Creek Promenade, with the buildings arranged behind them.",
      "body": [
        "Dubai Creek Harbour is large enough that naming it tells you very little. Creek Beach is the specific district within it that fronts the water, and the difference from the rest of the masterplan is structural rather than cosmetic: the beach, the park and the promenade came first and the buildings sit behind them, which is why the mid-rise blocks here are eight to eleven storeys rather than towers.",
        "Emaar is releasing a limited number of one, two and three-bedroom apartments across the district. Because the buildings went up in waves, what is available at any moment is a question about specific blocks rather than about Creek Beach as a whole, and the answer changes."
      ]
    },
    "metaTitle": "Creek Beach Dubai Creek Harbour | 1, 2 & 3 Bed Apartments",
    "metaDescription": "Emaar's Creek Beach at Dubai Creek Harbour: a limited release of one, two and three-bedroom waterfront apartments beside the beach, Central Park and Creek Promenade.",
    "keywords": "creek beach dubai creek harbour, creek beach apartments for sale, emaar creek beach offer, dubai creek harbour 1 bedroom, bayshore creek beach, rosewater creek beach, grove creek beach, summer at creek beach, orchid at creek beach, dubai creek harbour waterfront apartments",
    "highlights": [
      {
        "value": "1 to 3",
        "label": "Bedrooms",
        "detail": "The full range in this release"
      },
      {
        "value": "14",
        "label": "Buildings",
        "detail": "Across the Creek Beach district"
      },
      {
        "value": "West",
        "label": "Facing",
        "detail": "Sunset and the Downtown skyline in one view"
      },
      {
        "value": "8 to 11",
        "label": "Storeys",
        "detail": "Mid-rise blocks rather than towers"
      }
    ],
    "timeline": [],
    "timelineIntro": "",
    "eligibility": [
      {
        "label": "Where it applies",
        "value": "Creek Beach, the waterfront district within Dubai Creek Harbour."
      },
      {
        "label": "What is available",
        "value": "A limited number of one, two and three-bedroom apartments."
      },
      {
        "label": "Developer",
        "value": "Emaar Properties."
      },
      {
        "label": "What the district is built around",
        "value": "Creek Beach itself, Central Park and the Creek Promenade, with sunset views west across the water."
      },
      {
        "label": "Building scale",
        "value": "Mid-rise blocks rather than towers, which is what keeps the beach and park at the centre of the plan rather than at the edge of it."
      },
      {
        "label": "The buildings",
        "value": "Surf, Sunset, Summer, Breeze, Grove, Rosewater, Lotus, Orchid, Bayshore, Savanna, Moor, Cedar, Mangrove and Vida Residences."
      },
      {
        "label": "How the release works",
        "value": "Emaar states a limited number of units rather than a deadline, so availability is what closes it. Register interest to see the current list."
      },
      {
        "label": "What is not covered",
        "value": "The 4% DLD registration fee, trustee office and administration charges are payable separately."
      }
    ],
    "projects": [
      {
        "name": "Bayshore",
        "terms": "Mid-rise blocks on the water, with the beach and the promenade at the door.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/creekbeach-hd/04-6-2x.webp",
        "links": [
          {
            "label": "View project",
            "href": "/project/bayshore-at-creek-beach-dubai"
          }
        ]
      },
      {
        "name": "Grove",
        "terms": "West-facing, which puts the sunset and the Downtown skyline in the same window.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/creekbeach-hd/02-3-2x.webp",
        "links": [
          {
            "label": "View project",
            "href": "/project/grove-apartments-for-sale-at-dubai-creek-beach-by-emaar"
          }
        ]
      },
      {
        "name": "Moor",
        "terms": "Set back behind the beach with its own pool deck.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/creekbeach-hd/01-005_34518-2x.webp",
        "links": [
          {
            "label": "View project",
            "href": "/project/moor-at-creek-beach"
          }
        ]
      },
      {
        "name": "Summer",
        "terms": "One of the completed blocks, which makes it a different proposition from an off-plan release.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/creekbeach-hd/11-3-2x.webp",
        "links": [
          {
            "label": "View project",
            "href": "/project/summer-at-creek-beach-by-emaar-properties"
          }
        ]
      },
      {
        "name": "Surf",
        "terms": "Closest to the water's edge, and the block the district's name is really about.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/creekbeach-hd/12-15-2x.webp",
        "links": [
          {
            "label": "View project",
            "href": "/project/surf-at-creek-beach"
          }
        ]
      },
      {
        "name": "Lotus",
        "terms": "One, two and three-bedroom apartments on the park side.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/creekbeach-hd/07-3-2x.webp",
        "links": [
          {
            "label": "View project",
            "href": "/project/creek-beach-lotus-apartments-at-dubai-creek-harbour"
          }
        ]
      }
    ],
    "projectsHeading": "Buildings at Creek Beach",
    "amenities": {
      "heading": "A beach, a park and a promenade, then the buildings.",
      "stats": [
        {
          "value": "1 to 3",
          "label": "Bedrooms in the release",
          "icon": "KeyRound"
        },
        {
          "value": "14",
          "label": "Buildings across the district",
          "icon": "Building2"
        },
        {
          "value": "West",
          "label": "Facing, for the sunset",
          "icon": "Sun"
        }
      ],
      "masterplanHeading": "Inside Creek Beach",
      "items": [
        "Creek Beach, swimmable waterfront",
        "Central Park",
        "Creek Promenade",
        "Sunset views west across the creek",
        "Beachfront cafes and retail",
        "Swimming pools and sun decks",
        "Residents gyms",
        "Kids play areas",
        "Ras Al Khor Wildlife Sanctuary nearby"
      ],
      "icons": [
        "Waves",
        "Trees",
        "Bike",
        "Sun",
        "Store",
        "Droplets",
        "Users",
        "Flower2",
        "PawPrint"
      ]
    },
    "gallery": [
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/creekbeach-hd/00-1-2x.webp",
        "alt": "Creek Beach seen from above, the swimmable waterfront at Dubai Creek Harbour"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/creekbeach-hd/01-005_34518-2x.webp",
        "alt": "The pool at Moor, Creek Beach, with the mid-rise blocks behind it"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/creekbeach-hd/02-3-2x.webp",
        "alt": "A living room at Grove, Creek Beach, with the Downtown skyline through the glass"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/creekbeach-hd/03-4-2x.webp",
        "alt": "The kitchen and dining space in a Bayshore apartment at Creek Beach"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/creekbeach-hd/04-6-2x.webp",
        "alt": "Living and dining at Bayshore, Creek Beach"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/creekbeach-hd/05-008_34515-2x.webp",
        "alt": "Living and dining at Moor, Creek Beach, opening to the balcony"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/creekbeach-hd/06-7-2x.webp",
        "alt": "A bedroom at Bayshore with the Dubai Creek Harbour skyline beyond"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/creekbeach-hd/07-3-2x.webp",
        "alt": "The kitchen and dining space at Lotus, Creek Beach"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/creekbeach-hd/08-6-2x.webp",
        "alt": "A living room at Summer, Creek Beach"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/creekbeach-hd/09-007_34516-2x.webp",
        "alt": "A bedroom at Moor, Creek Beach"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/creekbeach-hd/10-3-2x.webp",
        "alt": "A bathroom at Bayshore, Creek Beach"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/creekbeach-hd/11-3-2x.webp",
        "alt": "The lobby at Summer, Creek Beach"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/creekbeach-hd/12-15-2x.webp",
        "alt": "The spa treatment room at Surf, Creek Beach"
      }
    ],
    "investment": {
      "heading": "What makes this district different from the rest of the masterplan.",
      "items": [
        {
          "title": "Water first, buildings second",
          "text": "The beach and park set the plan, not a podium."
        },
        {
          "title": "Mid-rise density",
          "text": "Eight to eleven storeys keeps the ground usable."
        },
        {
          "title": "West-facing",
          "text": "Sunset and the Downtown skyline in one view."
        },
        {
          "title": "Delivered in waves",
          "text": "Several blocks are complete, which is rare inside a live masterplan."
        }
      ],
      "icons": [
        "Waves",
        "Building2",
        "Sun",
        "KeyRound"
      ]
    },
    "ctaLabel": "See what is available",
    "whatsappLabel": "Message on WhatsApp",
    "whatsappMessage": "Hi Binayah! 👋 I'm interested in the Creek Beach release at Dubai Creek Harbour: one, two and three-bedroom apartments. Please send me what's currently available.",
    "valueProps": [
      [
        "A beach you can actually swim from",
        "Creek Beach is a swimmable waterfront rather than a decorative one, and it is the organising idea of the district. Everything behind it, the park, the promenade and the blocks, is arranged around that fact."
      ],
      [
        "Mid-rise, not another tower cluster",
        "The buildings here are eight to eleven storeys. That decision is what keeps the ground plane usable: the park and the beach stay at the centre of the plan instead of being squeezed to its edges."
      ],
      [
        "Sunset on the right side of the water",
        "Creek Beach faces west across the creek, which puts the Downtown skyline and the sunset in the same view. In a city where orientation decides the value of a floor plan, that is not a small detail."
      ],
      [
        "Inventory is a question about blocks",
        "Creek Beach was built in waves, so what is available is never a statement about the district. It is a list of specific buildings and floors, and it changes week to week."
      ]
    ],
    "bodyParagraphs": [
      "Emaar is releasing a limited number of one, two and three-bedroom apartments at Creek Beach, the waterfront district inside Dubai Creek Harbour. Naming the masterplan alone tells you very little, because Dubai Creek Harbour is large and is being built in parts that do not resemble each other. Creek Beach is the specific part built around water.",
      "The structural decision is the interesting one. The beach, Central Park and the Creek Promenade were laid out first and the residential blocks sit behind them at eight to eleven storeys rather than as towers on a podium. That keeps the ground plane usable and the water at the centre of the plan, which is the opposite of how most waterfront density in Dubai has been delivered.",
      "Orientation matters here more than it usually does. Creek Beach faces west across the creek, so the sunset and the Downtown skyline land in the same view, and a floor plan facing the right way is worth materially more than the same plan turned around. It is also worth knowing that several blocks are already complete, which is unusual inside a masterplan still under construction.",
      "The buildings are Surf, Sunset, Summer, Breeze, Grove, Rosewater, Lotus, Orchid, Bayshore, Savanna, Moor, Cedar, Mangrove and Vida Residences. Because they were delivered in waves, what is available at any point is a question about specific blocks and floors rather than about the district, and the answer changes. Emaar states a limited number of units rather than a closing date, so the release ends when the stock does. The 4% DLD registration fee, trustee office and administration charges are separate; confirm price and terms for a specific apartment in writing before committing."
    ],
    "worked": {
      "heading": "",
      "rows": [],
      "footnote": ""
    },
    "faqs": [
      {
        "question": "Who is the developer?",
        "answer": "Emaar Properties."
      },
      {
        "question": "Which community does the offer apply to?",
        "answer": "Creek Beach, the waterfront district within Dubai Creek Harbour."
      },
      {
        "question": "What property types are available?",
        "answer": "A limited number of one, two and three-bedroom apartments."
      },
      {
        "question": "What is Creek Beach, exactly?",
        "answer": "It is the district of Dubai Creek Harbour built around the water: a swimmable beach, Central Park and the Creek Promenade, with mid-rise residential blocks arranged behind them rather than towers on a podium."
      },
      {
        "question": "Which buildings are in it?",
        "answer": "Surf, Sunset, Summer, Breeze, Grove, Rosewater, Lotus, Orchid, Bayshore, Savanna, Moor, Cedar, Mangrove and Vida Residences at Creek Beach."
      },
      {
        "question": "Is availability limited?",
        "answer": "Yes. Emaar states a limited number of units rather than an end date, so what closes the release is stock rather than a calendar. The current list is worth asking for rather than assuming."
      },
      {
        "question": "Are the DLD fees included?",
        "answer": "No. The 4% Dubai Land Department registration fee, trustee office charges and administration fees are payable separately."
      },
      {
        "question": "How does this compare with the rest of Dubai Creek Harbour?",
        "answer": "The rest of the masterplan is largely tower-led and organised around Creek Island and the marina. Creek Beach is the low-rise, water-facing part of it, which is a different product at a different price per square foot rather than a cheaper version of the same thing."
      }
    ],
    "disclaimer": "Terms are set by Emaar Properties and apply to eligible units at Creek Beach, Dubai Creek Harbour, subject to availability and to Emaar's terms and conditions. Emaar publishes this as a limited release of units rather than a dated offer; availability, prices and terms change without notice. The 4% DLD registration fee, trustee office and administration charges are payable separately. Building lists and district descriptions reflect the masterplan as published at the time of writing. Nothing here is financial advice or an offer to sell. Confirm price, availability and all terms in writing, including the payment schedule recorded in the sale and purchase agreement, before committing. Binayah Properties is a licensed Dubai real estate brokerage."
  },
  {
    "slug": "damac-summer-rewards-4-dld-waiver",
    "shortName": "DAMAC Summer Rewards",
    "developer": "DAMAC Properties",
    "eyebrow": "DAMAC Summer Rewards",
    "h1": "DAMAC Summer Rewards: 4% DLD Waiver on Villas and Townhouses",
    "subtitle": "DAMAC covers the full 4% Dubai Land Department registration fee on eligible off-plan villas and townhouses.",
    "heroImage": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/bahamas-2-at-damac-islands-2/gallery/008_008_39103-hd.webp",
    "deadline": "",
    "windowLabel": "Limited-time summer offer",
    "hideDeadline": true,
    "dayCountEyebrow": false,
    "explainer": {
      "heading": "The registration fee, taken off the table",
      "highlight": "On a AED 3 million villa the 4% DLD fee is AED 120,000. Under Summer Rewards DAMAC covers it, so that cash stays with you instead of going to the Land Department at registration.",
      "body": [
        "Summer Rewards is a fee waiver rather than a payment plan. It applies to eligible off-plan residential villas and townhouses in the UAE and excludes future new launches, so it is the current release rather than whatever comes next. Apartments are not included."
      ]
    },
    "metaTitle": "DAMAC Summer Rewards | 4% DLD Waiver on Villas",
    "metaDescription": "DAMAC Summer Rewards: the full 4% DLD registration fee covered on eligible off-plan villas and townhouses across DAMAC Hills, Hills 2 and DAMAC Islands.",
    "keywords": "damac summer rewards, damac 4% dld waiver, damac villas offer dubai, damac townhouses offer, damac hills villas, damac islands villas, dld fee waiver dubai, off plan villas dubai offer",
    "priceFrom": 1800000,
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
    "ctaLabel": "Check eligible villas",
    "whatsappLabel": "Chat on WhatsApp",
    "whatsappMessage": "Hi Binayah! 👋 I'm interested in DAMAC Summer Rewards: the 4% DLD waiver on villas and townhouses. Please send me the eligible units.",
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
    "bodyParagraphs": [
      "DAMAC Summer Rewards covers the full 4% Dubai Land Department registration fee on eligible off-plan residential villas and townhouses. It is worth being precise about what that means: the DLD fee is a cash cost paid at registration, separate from the purchase price and normally borne by the buyer. A waiver changes what leaves your account on the day, which is a different thing from a discount that adjusts the headline figure.",
      "The offer is narrower than DAMAC's portfolio. Apartments are not included, so this is a house offer: the villa and townhouse stock at DAMAC Hills, DAMAC Hills 2 and DAMAC Islands, alongside the other eligible residential communities in the UAE. It also excludes future new launches, which means it applies to what is open now rather than to whatever is announced next.",
      "On the arithmetic, four per cent moves real money. A AED 3 million villa carries a AED 120,000 registration fee; at AED 5 million it is AED 200,000. Because it is a fee waiver rather than a payment structure, it sits on top of whatever plan DAMAC has attached to the unit, so the two are not alternatives.",
      "DAMAC has not printed an end date on this half of the campaign, which is worth treating as a reason to move rather than a reason to wait: an offer with no published deadline can be withdrawn without notice. We confirm which specific units carry the waiver, place the booking and handle the developer approval on your behalf."
    ],
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
    },
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
    "disclaimer": "Terms are set by DAMAC Properties and apply to selected eligible off-plan residential villas and townhouses only, subject to availability and developer approval. The offer excludes apartments and future new launches. DAMAC has not published an end date and the offer may be withdrawn or amended without notice. The waiver covers the 4% Dubai Land Department registration fee only; trustee, administration and agency costs are separate and remain payable. Figures shown are illustrative and do not constitute financial advice or an offer to sell. Confirm eligibility and all terms in writing, including the schedule recorded in the SPA, before committing. Binayah Properties is a licensed Dubai brokerage.",
    "projectHref": "/developers/damac-properties"
  },
  {
    "slug": "binghatti-wraith-4-dld-waiver",
    "shortName": "Binghatti Wraith",
    "developer": "Binghatti Developers",
    "eyebrow": "First release only",
    "h1": "Binghatti Wraith: 4% DLD Waiver from AED 799,999",
    "subtitle": "Binghatti covers the 4% registration fee on the first release at Al Jaddaf, on a 50/50 plan with handover in Q4 2027.",
    "heroImage": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/binghatti-hd/00-binghatti-wraith-gallery_5-hd-2x.webp",
    "deadline": "",
    "windowLabel": "First release, while it lasts",
    "hideDeadline": true,
    "dayCountEyebrow": false,
    "explainer": {
      "heading": "Launch pricing, and the registration fee covered",
      "highlight": "At AED 799,999 the 4% DLD fee would be AED 32,000. Binghatti covers it on the first release, so the entry cost is the price and the plan, not the price plus a five-figure government fee.",
      "body": [
        "Wraith is a new Binghatti tower at Al Jaddaf, two minutes from the metro and six from Downtown. The waiver applies to the first release only and is subject to availability, so it is tied to this pricing tier rather than to the building as a whole."
      ]
    },
    "metaTitle": "Binghatti Wraith | 4% DLD Waiver from AED 799,999",
    "metaDescription": "Binghatti Wraith at Al Jaddaf: a 4% DLD waiver on the first release, from AED 799,999, on a 50/50 payment plan with handover in Q4 2027.",
    "keywords": "binghatti wraith, binghatti wraith price, binghatti 4% dld waiver, al jaddaf apartments for sale, binghatti wraith payment plan, studio apartment dubai 800k, binghatti offer dubai, off plan al jaddaf",
    "priceFrom": 799999,
    "highlights": [
      {
        "value": "4%",
        "label": "DLD fee waived",
        "detail": "Covered by Binghatti on the first release"
      },
      {
        "value": "799,999",
        "label": "AED, starting price",
        "detail": "Launch pricing on a studio"
      },
      {
        "value": "50/50",
        "label": "Payment plan",
        "detail": "Half during construction, half on handover"
      },
      {
        "value": "Q4 2027",
        "label": "Handover",
        "detail": "Scheduled completion"
      }
    ],
    "timeline": [
      {
        "share": "50%",
        "stage": "During construction",
        "description": "Paid across the build period to Q4 2027."
      },
      {
        "share": "50%",
        "stage": "On handover",
        "description": "The balance falls due when the unit is handed over."
      }
    ],
    "timelineIntro": "A straight half-and-half split: 50% across the construction period and 50% when the building is handed over in Q4 2027.",
    "eligibility": [
      {
        "label": "What is covered",
        "value": "The 4% Dubai Land Department registration fee, covered by Binghatti."
      },
      {
        "label": "Which units",
        "value": "The first release only. Launch pricing and the waiver are both subject to availability."
      },
      {
        "label": "Entry price",
        "value": "From AED 799,999 for a studio."
      },
      {
        "label": "Unit mix",
        "value": "204 studios, 563 one-bedroom, 86 two-bedroom apartments and 2 three-bedroom royal suites."
      },
      {
        "label": "Payment plan",
        "value": "50% during construction and 50% on handover."
      },
      {
        "label": "Location",
        "value": "Al Jaddaf. Two minutes from the metro, six minutes from Downtown Dubai."
      },
      {
        "label": "Handover",
        "value": "Q4 2027."
      },
      {
        "label": "Golden Visa",
        "value": "Units priced above AED 2 million qualify for the property investor visa route. The entry tier here sits below that threshold."
      }
    ],
    "amenities": {
      "heading": "A resort deck on a metro line.",
      "stats": [
        {
          "value": "2 min",
          "label": "To the metro",
          "icon": "Bike"
        },
        {
          "value": "6 min",
          "label": "To Downtown",
          "icon": "Building2"
        },
        {
          "value": "855",
          "label": "Homes in the tower",
          "icon": "Users"
        }
      ],
      "masterplanHeading": "Inside the building",
      "items": [
        "Resort-style pool deck",
        "Poolside cabanas",
        "Residents' gym",
        "Children's water slide",
        "Barbecue terraces",
        "Residents' lounge",
        "Retail frontage",
        "Skyline terraces",
        "Covered parking"
      ],
      "icons": [
        "Waves",
        "Sun",
        "Bike",
        "Droplets",
        "Flower2",
        "Sparkles",
        "Store",
        "Building2",
        "ShieldCheck"
      ]
    },
    "gallery": [
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/binghatti-hd/01-binghatti-wraith-gallery_16-hd-2x.webp",
        "alt": "Binghatti Wraith at night with the Downtown skyline beyond"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/binghatti-hd/02-binghatti-wraith-gallery_2-hd-2x.webp",
        "alt": "The pool deck at Binghatti Wraith at dusk"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/binghatti-wraith/gallery/binghatti-wraith-gallery_1-hd.webp",
        "alt": "Binghatti Wraith from the street, Al Jaddaf"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/binghatti-hd/04-binghatti-wraith-gallery_29-hd-2x.webp",
        "alt": "The pool at night at Binghatti Wraith"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/binghatti-hd/05-binghatti-wraith-gallery_17-hd-2x.webp",
        "alt": "Binghatti Wraith lit at night"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/binghatti-hd/06-binghatti-wraith-gallery_4-hd-2x.webp",
        "alt": "Pool and towers at Binghatti Wraith"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/binghatti-hd/07-binghatti-wraith-gallery_3-hd-2x.webp",
        "alt": "Loungers beside the pool at Binghatti Wraith"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/binghatti-hd/08-binghatti-wraith-gallery_18-hd-2x.webp",
        "alt": "A terrace with Burj Khalifa views at Binghatti Wraith"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/binghatti-hd/09-binghatti-wraith-gallery_12-hd-2x.webp",
        "alt": "The poolside lounge at Binghatti Wraith"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/binghatti-wraith/binghatti-wraith-featured-hd.webp",
        "alt": "Binghatti Wraith and Al Jaddaf from the air"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/binghatti-hd/11-binghatti-wraith-gallery_28-hd-2x.webp",
        "alt": "Cabanas beside the pool at Binghatti Wraith"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/binghatti-hd/12-binghatti-wraith-gallery_19-hd-2x.webp",
        "alt": "The retail frontage at Binghatti Wraith at night"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/binghatti-hd/13-binghatti-wraith-gallery_9-hd-2x.webp",
        "alt": "A living room with city views at Binghatti Wraith"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/binghatti-hd/14-binghatti-wraith-gallery_23-hd-2x.webp",
        "alt": "A poolside cabana at Binghatti Wraith"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/binghatti-hd/15-binghatti-wraith-gallery_11-hd-2x.webp",
        "alt": "An open-plan living space at Binghatti Wraith"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/binghatti-hd/16-binghatti-wraith-gallery_8-hd-2x.webp",
        "alt": "The residents' lounge at Binghatti Wraith"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/binghatti-hd/17-binghatti-wraith-gallery_15-hd-2x.webp",
        "alt": "A bedroom with a view at Binghatti Wraith"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/binghatti-hd/18-binghatti-wraith-gallery_10-hd-2x.webp",
        "alt": "The residents' gym at Binghatti Wraith"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/binghatti-hd/19-binghatti-wraith-gallery_7-hd-2x.webp",
        "alt": "The kitchen in a Binghatti Wraith apartment"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/binghatti-hd/20-binghatti-wraith-gallery_14-hd-2x.webp",
        "alt": "The arrival lobby at Binghatti Wraith"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/binghatti-hd/21-binghatti-wraith-gallery_31-hd-2x.webp",
        "alt": "A furnished living room at Binghatti Wraith"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/binghatti-hd/22-binghatti-wraith-gallery_22-hd-2x.webp",
        "alt": "The children's water slide at Binghatti Wraith"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/binghatti-hd/23-binghatti-wraith-gallery_24-hd-2x.webp",
        "alt": "The barbecue terrace at Binghatti Wraith"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/binghatti-hd/24-1-2x.webp",
        "alt": "Al Jaddaf and the Dubai skyline"
      }
    ],
    "investment": {
      "heading": "The cheapest way onto this map.",
      "items": [
        {
          "title": "Sub-AED 800k entry",
          "text": "A studio at launch pricing."
        },
        {
          "title": "Six minutes to Downtown",
          "text": "Central without a central price."
        },
        {
          "title": "Metro on the doorstep",
          "text": "Two minutes, which drives tenant demand."
        },
        {
          "title": "Handover Q4 2027",
          "text": "A defined completion date, not open-ended."
        }
      ],
      "icons": [
        "Coins",
        "Building2",
        "TrendingUp",
        "CalendarClock"
      ]
    },
    "ctaLabel": "Check available units",
    "whatsappLabel": "Chat on WhatsApp",
    "whatsappMessage": "Hi Binayah! 👋 I'm interested in Binghatti Wraith: the 4% DLD waiver on the first release, from AED 799,999. Please send me what is available.",
    "valueProps": [
      [
        "A five-figure fee, removed",
        "On the AED 799,999 entry unit the 4% registration fee is AED 32,000. Waiving it changes the cash you need on day one, which at this price point is a meaningful share of the deposit."
      ],
      [
        "First release means first pricing",
        "The waiver is attached to the launch tier. Binghatti prices new releases in waves, so the combination of entry pricing and a covered fee is the narrower of the two windows."
      ],
      [
        "Half deferred to handover",
        "The 50/50 split leaves half the price outstanding until the building completes in Q4 2027, so the construction-period commitment is the lower half of the total."
      ],
      [
        "A short commute, not a suburb",
        "Al Jaddaf is two minutes from the metro and six from Downtown. At this entry price that combination is unusual, and it is what underpins the rental case."
      ]
    ],
    "bodyParagraphs": [
      "Binghatti Wraith is a new tower at Al Jaddaf, and the launch carries a 4% DLD waiver on the first release. At the AED 799,999 entry price that fee would be AED 32,000, which at this end of the market is a real share of what a buyer needs to find on day one rather than a rounding item.",
      "The plan is a straight 50/50: half across the construction period and half when the building hands over in Q4 2027. There is no post-handover tail here, so the structure is simpler than the deferred plans running elsewhere in the market, and the second half arrives as a single milestone rather than a drip.",
      "The building itself is 855 homes: 204 studios, 563 one-bedroom apartments, 86 two-bedroom apartments and two three-bedroom royal suites. The amenity deck is the resort-style pool, cabanas, a gym and barbecue terraces, with retail at street level.",
      "Location is the part that does the work. Al Jaddaf is two minutes from the metro and roughly six from Downtown, which is an unusual pairing at a sub-AED 800,000 entry price and is what underpins the rental argument. Both the launch pricing and the waiver are tied to the first release and subject to availability, so the terms on a specific unit should be confirmed before committing."
    ],
    "worked": {
      "heading": "What the waiver is worth on the AED 799,999 studio",
      "rows": [
        [
          "Purchase price",
          "AED 799,999"
        ],
        [
          "4% DLD registration fee",
          "AED 32,000"
        ],
        [
          "Covered by Binghatti",
          "- AED 32,000"
        ],
        [
          "50% during construction",
          "AED 400,000"
        ],
        [
          "50% on handover",
          "AED 400,000"
        ]
      ],
      "footnote": "Illustrative, on the published entry price. Figures are rounded. The waiver covers the DLD registration fee only; trustee, admin and agency costs are separate. Launch pricing and the waiver are subject to availability."
    },
    "faqs": [
      {
        "question": "What does Binghatti actually cover?",
        "answer": "The 4% Dubai Land Department registration fee on eligible first-release units. On the AED 799,999 entry unit that is AED 32,000 you do not pay at registration."
      },
      {
        "question": "Does the waiver apply to the whole building?",
        "answer": "No. It applies to the first release only, and both the launch pricing and the waiver are subject to availability. Later releases are priced separately."
      },
      {
        "question": "What is the payment plan?",
        "answer": "50/50: half across the construction period and half on handover."
      },
      {
        "question": "When is handover?",
        "answer": "Q4 2027."
      },
      {
        "question": "What is available?",
        "answer": "204 studios, 563 one-bedroom apartments, 86 two-bedroom apartments and 2 three-bedroom royal suites."
      },
      {
        "question": "Where is it?",
        "answer": "Al Jaddaf, two minutes from the metro and about six minutes from Downtown Dubai."
      },
      {
        "question": "Does it qualify for a Golden Visa?",
        "answer": "The investor visa route needs a property above AED 2 million. The entry units here sit well below that, so a studio at launch pricing would not qualify on its own."
      },
      {
        "question": "Are my other costs covered?",
        "answer": "No. The waiver covers the DLD registration fee. Trustee office charges, admin fees and agency costs are separate and remain payable."
      }
    ],
    "disclaimer": "Terms are set by Binghatti Developers. The 4% DLD waiver and launch pricing apply to the first release only and are subject to availability; terms apply. The waiver covers the Dubai Land Department registration fee only, and trustee, administration and agency costs are separate and remain payable. Handover dates are the developer's projection and may move. Figures shown are illustrative and do not constitute financial advice or an offer to sell. Confirm eligibility, pricing and all terms in writing, including the schedule recorded in the SPA, before committing. Binayah Properties is a licensed Dubai brokerage.",
    "projectHref": "/project/binghatti-wraith"
  },
  {
    "slug": "samana-2-down-payment-oqood-offer",
    "shortName": "Samana 2% Booking Plan",
    "developer": "Samana Developers",
    "eyebrow": "Across the full Samana portfolio",
    "h1": "Samana 2% Down Payment: Oqood Registered From Your First Payment",
    "subtitle": "Book from 2%, pay 1% or 2% a month, and your name goes on the Dubai Land Department register at the start of the plan rather than a quarter of the way through it.",
    "heroImage": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/samana-hd/00-8-2x.webp",
    "deadline": "",
    "windowLabel": "Open while inventory lasts",
    "hideDeadline": false,
    "dayCountEyebrow": false,
    "explainer": {
      "heading": "Two plans, and both put you on the register on day one",
      "highlight": "In a standard off-plan purchase you pay 20% to 30% of the price before the unit is registered with the Dubai Land Department. Under both Samana plans, Oqood registration completes once your first payment is made.",
      "body": [
        "Samana publishes two structures across its inventory. One books at 5% and runs 1% a month for eighty months, with three 5% milestone payments at months 6, 12 and 18. The other books at 2% and runs 2% a month for fifty months. Neither is a zero down payment plan, and Samana says so plainly: both take a payment at booking. On the fifty-month plan that 2% is simply the first of the fifty instalments rather than a deposit sitting on top of the schedule.",
        "The registration timing is the part worth reading twice. Ownership recorded at the start of the term, rather than a fifth of the way through it, is what makes an early resale practical and what gives an overseas buyer a documented position from the first transfer."
      ]
    },
    "metaTitle": "Samana 2% Down Payment | 1% Monthly, Oqood From Day One",
    "metaDescription": "Samana Developers: book from 2%, then 2% monthly over 50 months or 1% over 80, with Oqood registration from your first payment. Entry from AED 943,333.",
    "keywords": "samana payment plan, samana 2 percent down payment, samana 1 percent monthly, samana developers offer, oqood registration off plan dubai, samana barari heights price, samana 40 60 payment plan, samana 30 70 payment plan, low down payment off plan dubai, samana imperial garden price",
    "priceFrom": 943333,
    "highlights": [
      {
        "value": "2%",
        "label": "On booking",
        "detail": "And it counts as instalment one, not a deposit on top"
      },
      {
        "value": "1%",
        "label": "Per month",
        "detail": "Eighty months on the 5% booking plan"
      },
      {
        "value": "Oqood",
        "label": "From payment one",
        "detail": "DLD registration at the start of the term"
      },
      {
        "value": "AED 943K",
        "label": "Entry price",
        "detail": "A studio at Samana Barari Heights in Majan"
      }
    ],
    "timeline": [
      {
        "stage": "On booking",
        "share": "5%",
        "description": "The sale and purchase agreement is issued and registered with the DLD, which generates your Oqood."
      },
      {
        "stage": "Month 6",
        "share": "5%",
        "description": "First milestone payment."
      },
      {
        "stage": "Month 12",
        "share": "5%",
        "description": "Second milestone payment."
      },
      {
        "stage": "Month 18",
        "share": "5%",
        "description": "Third and last milestone."
      },
      {
        "stage": "Every month",
        "share": "80%",
        "description": "One percent a month across eighty months, which closes the balance."
      }
    ],
    "timelineIntro": "The eighty-month plan in full. There is no balloon at the end: 5% at booking, three 5% milestones and eighty monthly instalments add up to the whole price.",
    "eligibility": [
      {
        "label": "The two plans",
        "value": "Book at 5% and pay 1% a month for 80 months, with 5% milestones at months 6, 12 and 18. Or book at 2% and pay 2% a month for 50 months."
      },
      {
        "label": "Is it zero down?",
        "value": "No. Both plans take a payment at booking. On the 50-month plan the 2% is the first instalment rather than a deposit on top of the schedule."
      },
      {
        "label": "When you are registered",
        "value": "Oqood registration completes once the first payment is made, instead of at the 20% to 30% mark a standard off-plan purchase waits for."
      },
      {
        "label": "What sits outside the plan",
        "value": "DLD registration, Oqood and administration charges are payable separately."
      },
      {
        "label": "Other structures",
        "value": "Samana also publishes a 30/70 plan, 15% down and 30% before handover, and a 40/60 plan, 40% during construction and 60% after handover."
      },
      {
        "label": "Where it applies",
        "value": "Across the Samana portfolio: Arjan, JVC, Majan, Dubailand, Al Furjan, Meydan, Dubai South, Al Warsan and Dubai Islands."
      },
      {
        "label": "Entry price",
        "value": "From AED 943,333 at Samana Barari Heights. Imperial Garden opens at AED 980,000 and Boulevard Heights at AED 1,303,333."
      },
      {
        "label": "International buyers",
        "value": "Eligible freehold off-plan property is open to overseas buyers, subject to project terms and compliance checks."
      }
    ],
    "projects": [
      {
        "name": "Samana Barari Heights",
        "terms": "Majan. From AED 943,333 for a studio with a private pool, running up to three-bedroom layouts.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/samana-hd/23-7-2x.webp",
        "links": [
          {
            "label": "View project",
            "href": "/project/samana-barari-heights-at-majan"
          }
        ]
      },
      {
        "name": "Samana Imperial Garden",
        "terms": "Arjan. From AED 980,000. Its own PDC schedule is 15% at booking, 10% at month 12, then 1% a month for 75 months.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/samana-hd/05-2-2x.webp",
        "links": [
          {
            "label": "View project",
            "href": "/project/imperial-garden-by-samana-at-arjan-dubai"
          }
        ]
      },
      {
        "name": "Samana Boulevard Heights",
        "terms": "Dubailand. From AED 1,303,333. 10% down, 5% after a month, 10% at month 12, then 1% a month for 75 months.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/samana-hd/06-featured-2x.webp",
        "links": [
          {
            "label": "View project",
            "href": "/project/samana-boulevard-heights"
          }
        ]
      },
      {
        "name": "Samana Barari Avenue",
        "terms": "Majan. From AED 2,583,887. 15% at booking, 1% a month for 36 months with milestones at months 12, 18 and 24, then 0.5% a month.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/samana-hd/13-3-2x.webp",
        "links": [
          {
            "label": "View project",
            "href": "/project/samana-barari-avenue-at-majan"
          }
        ]
      },
      {
        "name": "Samana Ocean Bay",
        "terms": "Dubai Islands. From AED 2,887,000 across the two towers.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/samana-hd/03-featured-2x.webp",
        "links": [
          {
            "label": "View project",
            "href": "/project/oceans-bay-by-samana-at-dubai-islands"
          }
        ]
      },
      {
        "name": "Samana Ocean Pearl",
        "terms": "Dubai Islands. From AED 3,940,444. 15% at booking, then a staged schedule running past the 20th month.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/samana-hd/29-4-2x.webp",
        "links": [
          {
            "label": "View project",
            "href": "/project/samana-ocean-pearl-at-dubai-island"
          }
        ]
      },
      {
        "name": "Samana Ocean Pearl 2",
        "terms": "Dubai Islands. From AED 4,278,811 on the 40/60 plan: 40% during construction, then 2% a month for 30 months after handover.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/samana-hd/26-1-2x.webp",
        "links": [
          {
            "label": "View project",
            "href": "/project/samana-ocean-pearl-2-at-dubai-island"
          }
        ]
      }
    ],
    "amenities": {
      "heading": "The developer behind the plan, and what comes with the apartment.",
      "stats": [
        {
          "value": "50+",
          "label": "Projects launched",
          "icon": "Building2"
        },
        {
          "value": "15,000+",
          "label": "Units delivered and launched",
          "icon": "KeyRound"
        },
        {
          "value": "6,000+",
          "label": "Units in the pipeline",
          "icon": "TrendingUp"
        }
      ],
      "masterplanHeading": "Inside a Samana building",
      "items": [
        "Private pool in the apartment",
        "Resort style leisure pool deck",
        "Fully equipped gym and wellness suite",
        "Sauna and steam rooms",
        "Rooftop jogging track",
        "Outdoor yoga and meditation zone",
        "Kids pool and play area",
        "Landscaped social decks",
        "Covered residents parking"
      ],
      "icons": [
        "Waves",
        "Sun",
        "Bike",
        "Droplets",
        "Leaf",
        "Flower2",
        "Users",
        "TreePalm",
        "KeyRound"
      ]
    },
    "gallery": [
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/samana-hd/00-8-2x.webp",
        "alt": "Samana Barari Heights from above, the curved tower wrapped around its pool deck"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/samana-hd/01-1-2x.webp",
        "alt": "Samana Ocean Pearl on Dubai Islands, balcony pools stepping down the facade"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/samana-hd/02-featured-2x.webp",
        "alt": "The leisure pool deck at Samana Barari Heights in Majan"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/samana-hd/03-featured-2x.webp",
        "alt": "Samana Ocean Bay at Dubai Islands, twin wings above the pool terrace"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/samana-hd/04-3-2x.webp",
        "alt": "Samana Barari Heights rising above the greenery of Majan"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/samana-hd/05-2-2x.webp",
        "alt": "Samana Imperial Garden in Arjan, balconies curving across the facade"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/samana-hd/06-featured-2x.webp",
        "alt": "Residents on the pool deck at Samana Boulevard Heights"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/samana-hd/07-2-2x.webp",
        "alt": "The lagoon pool and cabanas at Samana Barari Heights"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/samana-hd/08-8-2x.webp",
        "alt": "The twin wings of Samana Imperial Garden in Arjan"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/samana-hd/09-15-crop-2x.webp",
        "alt": "A bedroom at Samana Barari Heights, glazed to the floor"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/samana-hd/10-3-2x.webp",
        "alt": "Samana Imperial Garden above its pool deck in Arjan"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/samana-hd2/00-3-2x.webp",
        "alt": "Sun loungers on the pool terrace at Samana Boulevard Heights"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/samana-hd/12-14-crop-2x.webp",
        "alt": "The living and dining space in a Samana Barari Heights apartment"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/samana-hd/13-3-2x.webp",
        "alt": "Samana Barari Avenue seen from the street in Majan"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/samana-hd/14-6-2x.webp",
        "alt": "A shaded cabana beside the pool at Samana Imperial Garden"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/samana-hd/15-13-2x.webp",
        "alt": "A bedroom at Samana Barari Heights with the city beyond the glass"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/samana-hd/16-1-2x.webp",
        "alt": "The Samana Avenue tower at Dubai Land Residence Complex"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/samana-hd/17-2-2x.webp",
        "alt": "Pool level at Samana Ocean Pearl on Dubai Islands"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/samana-hd/18-4-2x.webp",
        "alt": "A bedroom at Samana Boulevard Heights"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/samana-hd/19-5-2x.webp",
        "alt": "The residents gym at Samana Barari Heights"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/samana-hd/20-9-2x.webp",
        "alt": "Gold fins across the facade at Samana Barari Heights"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/samana-hd/21-6-2x.webp",
        "alt": "A living room at Samana Boulevard Heights"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/samana-hd2/01-13-crop-2x.webp",
        "alt": "The lobby at Samana Barari Heights"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/samana-hd/23-7-2x.webp",
        "alt": "Samana Barari Heights against the Dubai skyline"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/samana-hd/24-5-2x.webp",
        "alt": "The kitchen in a Samana Boulevard Heights apartment"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/samana-hd/25-18-crop-2x.webp",
        "alt": "The wellness and yoga studio at Samana Barari Heights"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/samana-hd/26-1-2x.webp",
        "alt": "Samana Ocean Pearl 2 on Dubai Islands"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/samana-hd/27-5-2x.webp",
        "alt": "The residents lounge at Samana Imperial Garden"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/samana-hd/28-17-crop-2x.webp",
        "alt": "A bathroom at Samana Barari Heights"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/samana-hd/29-4-2x.webp",
        "alt": "Samana Ocean Pearl seen from the garden side"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/samana-hd/30-2-2x.webp",
        "alt": "The lobby at Samana Boulevard Heights"
      }
    ],
    "investment": {
      "heading": "Why the registration timing is the part that matters.",
      "items": [
        {
          "title": "Ownership recorded at the start",
          "text": "Oqood from the first payment, not at the 20% to 30% mark."
        },
        {
          "title": "An exit before handover",
          "text": "A recorded position is what makes selling on during construction practical."
        },
        {
          "title": "Monthly, not lump sum",
          "text": "1% or 2% a month is a figure you can plan a salary around."
        },
        {
          "title": "Entry under AED 1M",
          "text": "A studio at Barari Heights, private pool included."
        }
      ],
      "icons": [
        "FileSignature",
        "Repeat2",
        "Wallet",
        "Coins"
      ]
    },
    "ctaLabel": "See qualifying units",
    "whatsappLabel": "Message on WhatsApp",
    "whatsappMessage": "Hi Binayah! 👋 I'm interested in the Samana payment plans: 2% on booking with 2% monthly, or 5% with 1% monthly and Oqood from the first payment. Please send me what's available.",
    "valueProps": [
      [
        "Registered before you have paid a fifth",
        "The usual off-plan sequence asks for 20% to 30% of the price before the Dubai Land Department has you on record. Samana completes Oqood registration on the first payment, so the documented position arrives at the start of the plan rather than partway through the build."
      ],
      [
        "A booking payment that is also instalment one",
        "On the fifty-month plan the 2% at booking is the first of fifty equal payments, not a deposit charged on top of them. That is a different thing from a deposit, and it is the reason the entry number is as low as it is."
      ],
      [
        "Two shapes for the same hundred percent",
        "Eighty months at 1% with three milestones, or fifty months at 2% flat. Both total the full price and neither leaves a lump sum at the end, so the choice is about the size of the monthly figure, not about what the property costs."
      ],
      [
        "A private pool at the entry price",
        "The private pool in the apartment is Samana's signature, not an upgrade reserved for the large units. At Barari Heights it starts inside a sub-AED 1M studio, which is where the rental argument for these buildings begins."
      ]
    ],
    "bodyParagraphs": [
      "Samana Developers runs two payment structures across its Dubai inventory, and the interesting part is not the size of the monthly instalment. It is when the Dubai Land Department records you as the owner. In a conventional off-plan purchase that happens once you have paid 20% to 30% of the price. Under both Samana plans, Oqood registration completes on the first payment.",
      "The plans themselves are straightforward. Book at 5% and you pay 1% a month for eighty months, with three 5% milestones at months 6, 12 and 18; the four blocks add up to the whole price with nothing left at the end. Book at 2% and you pay 2% a month for fifty months, where the booking payment is the first of the fifty rather than an extra charge before them. Samana is explicit that neither is a zero down payment plan, which is a more honest framing than the market usually offers.",
      "Entry sits below AED 1M. Samana Barari Heights in Majan opens at AED 943,333, Imperial Garden in Arjan at AED 980,000 and Boulevard Heights at AED 1,303,333, with the Dubai Islands towers running from AED 2.89M at Ocean Bay to AED 4.28M at Ocean Pearl 2. The private pool in the apartment is the through line across all of them, and at Barari Heights it appears inside a studio rather than being held back for the larger layouts.",
      "Two other structures sit alongside these. The 30/70 plan takes 15% down and a total of 30% before handover, leaving 70% at completion. The 40/60 plan takes 40% during construction and defers 60% until after you have moved in, which is the one to read if the plan is to let the rent service part of the price. DLD, Oqood and administration charges are separate under all of them, and prices and availability change often enough that the schedule for a specific unit should be confirmed in writing before anything is committed."
    ],
    "worked": {
      "heading": "Both plans on a AED 943,333 studio",
      "rows": [
        [
          "Purchase price",
          "AED 943,333"
        ],
        [
          "Booking on the 2% plan",
          "AED 18,867"
        ],
        [
          "Then 2% a month",
          "AED 18,867 x 50 months"
        ],
        [
          "Booking on the 5% plan",
          "AED 47,167"
        ],
        [
          "Then 1% a month",
          "AED 9,433 x 80 months"
        ]
      ],
      "footnote": "Illustrative, based on the published starting price at Samana Barari Heights; figures are rounded. The 5% plan carries three further 5% milestones at months 6, 12 and 18. DLD registration at 4%, roughly AED 37,733, plus Oqood and administration charges, is payable separately. Prices and availability change, so confirm the schedule for your own unit in writing."
    },
    "faqs": [
      {
        "question": "Is this a zero down payment plan?",
        "answer": "No, and Samana does not present it as one. Both plans take a payment at booking: 2% on the fifty-month plan and 5% on the eighty-month plan. On the fifty-month plan the 2% is the first of the fifty instalments rather than a deposit paid on top of the schedule."
      },
      {
        "question": "Which plan costs less in total?",
        "answer": "Neither. Both add up to 100% of the purchase price. What changes is the timing and the size of the monthly payment, not the amount."
      },
      {
        "question": "What is Oqood and why does it matter here?",
        "answer": "Oqood is the pre-title deed that records your ownership of an off-plan unit while the building is still under construction. It is generated when the sale and purchase agreement is registered with the Dubai Land Department. Under both Samana plans that registration happens on your first payment, rather than after you have paid 20% to 30%."
      },
      {
        "question": "Can international buyers use these plans?",
        "answer": "Yes. Eligible freehold off-plan property is available to overseas buyers, subject to project terms and the usual compliance checks."
      },
      {
        "question": "Which projects do the plans apply to?",
        "answer": "Samana applies them across its Dubai portfolio, including Arjan, JVC, Majan, Dubailand, Al Furjan, Meydan, Dubai South, Al Warsan and Dubai Islands. Individual towers carry their own bespoke schedules as well, so the plan on a specific unit is worth confirming."
      },
      {
        "question": "What is the cheapest way in?",
        "answer": "Samana Barari Heights in Majan opens at AED 943,333. Imperial Garden in Arjan starts at AED 980,000 and Boulevard Heights at AED 1,303,333."
      },
      {
        "question": "Are the DLD fees included?",
        "answer": "No. DLD registration, Oqood and administration charges are payable separately and are not covered by either plan."
      },
      {
        "question": "What are the 30/70 and 40/60 plans?",
        "answer": "Two further structures Samana publishes. The 30/70 plan takes 15% down and 30% in total before handover, with the remaining 70% at handover. The 40/60 plan takes 40% during construction and leaves 60% until after you have moved in."
      }
    ],
    "disclaimer": "Terms are set by Samana Developers and apply to eligible units, subject to availability and to each project's own terms and conditions. Payment structures, starting prices and unit availability change; the figures here reflect what the developer published at the time of writing. DLD registration, Oqood and administration charges are payable separately and are not covered by either plan. Handover dates are developer estimates and can move. Worked figures are illustrative and are not financial advice or an offer to sell. Confirm eligibility, price and the full payment schedule in writing, including the schedule recorded in the sale and purchase agreement, before committing. Binayah Properties is a licensed Dubai real estate brokerage."
  },
  {
    "slug": "dld-first-time-home-buyer-programme",
    "shortName": "First-Time Home Buyer",
    "developer": "Dubai Land Department",
    "eyebrow": "Government programme, no closing date",
    "h1": "Dubai's First-Time Home Buyer Programme: What the QR Code Actually Gets You",
    "subtitle": "Free to join, open to residents of any nationality, and worth reading precisely: it changes the price you are quoted and how the registration fee is paid, not the fee itself.",
    "heroImage": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/fthb-hd/00-Riverton-House-by-Ellington-2x.webp",
    "deadline": "",
    "windowLabel": "Open programme, no closing date",
    "hideDeadline": false,
    "dayCountEyebrow": false,
    "explainer": {
      "heading": "What the QR code is, and what it is not",
      "highlight": "The programme does not waive the 4% DLD registration fee. What it changes is who calls you before a launch, the price you are quoted on an off-plan unit, and whether that fee can be spread over interest-free instalments on an eligible credit card.",
      "body": [
        "The First-Time Home Buyer Programme was launched in July 2025 by the Dubai Land Department with the Department of Economy and Tourism. You register on the DLD website or in the Dubai REST app, and if you qualify you are emailed a QR code. That code is the whole mechanism: you present it to a participating developer or bank, and it identifies you as a first-time buyer entitled to the programme's terms.",
        "Read the benefits carefully, because they are specific. Priority access to units in new launches. Preferential prices on off-plan units from select developers. Flexible payment plans on those units. Relaxed payment plans for the DLD registration fee through eligible credit cards, interest free. Better mortgage rates and preferential fees from participating banks. Nothing in that list removes a government fee, and DLD says so plainly: standard registration fees and any developer or bank charges still apply unless a specific programme offer says otherwise."
      ]
    },
    "metaTitle": "Dubai First-Time Home Buyer Programme | Eligibility, Benefits",
    "metaDescription": "Who qualifies for Dubai's First-Time Home Buyer Programme, what the DLD QR code unlocks across 22 partner developers and five banks, and what it does not cover.",
    "keywords": "dubai first time home buyer programme, first time home buyer dubai eligibility, dld first time buyer qr code, dubai rest app first time buyer, first time buyer developers dubai, dld registration fee instalments, buy first home dubai under 5 million, dubai home ownership scheme 2026",
    "highlights": [
      {
        "value": "AED 5M",
        "label": "Price ceiling",
        "detail": "The property has to be valued below this"
      },
      {
        "value": "22",
        "label": "Partner developers",
        "detail": "Alongside five participating banks"
      },
      {
        "value": "AED 0",
        "label": "To join",
        "detail": "No application and no participation fee"
      },
      {
        "value": "3,200+",
        "label": "First homes bought",
        "detail": "More than AED 5 billion since July 2025"
      }
    ],
    "timeline": [
      {
        "stage": "Register",
        "share": "AED 0",
        "description": "Apply on the Dubai Land Department website or in the Dubai REST app and submit your details."
      },
      {
        "stage": "Get the QR code",
        "share": "QR",
        "description": "If you qualify, DLD emails your First-Time Home Buyer QR code. If you do not, DLD tells you why, and you can reapply if your circumstances change."
      },
      {
        "stage": "Approach a partner",
        "share": "1",
        "description": "Take the code to any participating developer or bank. Offers differ between partners, and the benefits can be used with only one of them."
      },
      {
        "stage": "Buy and register",
        "share": "Done",
        "description": "The code stays valid until a property has been purchased and registered with DLD in your name."
      }
    ],
    "timelineIntro": "Four steps, none of which cost anything, and the code stays live until you actually buy.",
    "timelineHeading": "How to register",
    "eligibility": [
      {
        "label": "Residency",
        "value": "Open to residents of the UAE, of any nationality."
      },
      {
        "label": "Age",
        "value": "Eighteen or older."
      },
      {
        "label": "Existing ownership",
        "value": "You must not currently own any freehold residential property in Dubai."
      },
      {
        "label": "Price ceiling",
        "value": "The property you are buying has to be valued below AED 5 million."
      },
      {
        "label": "Property elsewhere",
        "value": "Owning in another emirate, or in a non-freehold area of Dubai, does not disqualify you."
      },
      {
        "label": "Joint purchases",
        "value": "Permitted only where both buyers are eligible under the programme."
      },
      {
        "label": "Cost",
        "value": "Nothing to apply and nothing to participate. Standard DLD registration fees and any developer or bank charges still apply."
      },
      {
        "label": "One time only",
        "value": "Buying under the programme ends your first-time buyer status permanently, even if you later sell the property."
      }
    ],
    "projects": [
      {
        "name": "Emaar",
        "terms": "Dubai Hills Estate, Dubai Creek Harbour, Emaar South and The Valley. The widest spread of sub-AED 5M apartments among the partners.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/fthb-hd/20-8-2x.webp",
        "links": [
          {
            "label": "View developer",
            "href": "/developers/emaar"
          }
        ]
      },
      {
        "name": "DAMAC Properties",
        "terms": "DAMAC Hills 2, DAMAC Lagoons and DAMAC Islands. Villas and townhouses that clear the price ceiling more often than the towers do.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/fthb-hd/16-3EB073311A77C881CEA950-2x.webp",
        "links": [
          {
            "label": "View developer",
            "href": "/developers/damac"
          }
        ]
      },
      {
        "name": "Nakheel Properties",
        "terms": "Palm Jumeirah, Dubai Islands and the townhouse communities at Warsan and Jebel Ali.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/fthb-hd/02-1-2x.webp",
        "links": [
          {
            "label": "View developer",
            "href": "/developers/nakheel"
          }
        ]
      },
      {
        "name": "Binghatti Properties",
        "terms": "JVC, Al Jaddaf and Business Bay. High-volume launches, and often the lowest entry price in the programme.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/fthb-hd/19-3-2x.webp",
        "links": [
          {
            "label": "View developer",
            "href": "/developers/binghatti"
          },
          {
            "label": "See the Binghatti offer",
            "href": "/offers/binghatti-wraith-4-dld-waiver"
          }
        ]
      },
      {
        "name": "Danube Properties",
        "terms": "JVT, JLT, Dubailand and Arjan, built around long monthly plans that sit naturally alongside the programme.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/fthb-hd/10-5-2x.webp",
        "links": [
          {
            "label": "View developer",
            "href": "/developers/danube"
          },
          {
            "label": "See the Danube offer",
            "href": "/offers/danube-deal-of-the-decade-20-10-back"
          }
        ]
      },
      {
        "name": "Samana Developers",
        "terms": "Arjan, JVC, Majan, Meydan and Dubai Islands. Private pools in the apartments, and Oqood from the first payment.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/samana-hd/00-8-2x.webp",
        "links": [
          {
            "label": "View developer",
            "href": "/developers/samana"
          },
          {
            "label": "See the Samana offer",
            "href": "/offers/samana-2-down-payment-oqood-offer"
          }
        ]
      },
      {
        "name": "Ellington Properties",
        "terms": "JVC, MBR City and Al Marjan. Design-led apartments, with the smaller layouts landing inside the ceiling.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/fthb-hd/03-1-2x.webp",
        "links": [
          {
            "label": "View developer",
            "href": "/developers/ellington"
          }
        ]
      },
      {
        "name": "Arada",
        "terms": "Dubai and Sharjah, from Armani Beach Residences on Palm Jumeirah down to considerably more accessible stock.",
        "image": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/fthb-hd/04-3-2x.webp",
        "links": [
          {
            "label": "View developer",
            "href": "/developers/arada"
          }
        ]
      }
    ],
    "projectsHeading": "Who is inside the programme",
    "amenities": {
      "heading": "Twenty-two developers and five banks sit inside the programme.",
      "stats": [
        {
          "value": "22",
          "label": "Partner developers",
          "icon": "Building2"
        },
        {
          "value": "5",
          "label": "Partner banks",
          "icon": "Wallet"
        },
        {
          "value": "AED 5B+",
          "label": "In sales since July 2025",
          "icon": "TrendingUp"
        }
      ],
      "masterplanHeading": "Participating developers",
      "items": [
        "4Direction Developments",
        "Arada",
        "Azizi Developments",
        "Beyond Developments",
        "Binghatti Properties",
        "DAMAC Properties",
        "Danube Properties",
        "Dubai Properties",
        "Dubai World Trade Centre",
        "Ellington Properties",
        "Emaar",
        "IRTH Group",
        "Majid Al Futtaim",
        "Manam",
        "Meraas",
        "Nakheel Properties",
        "Palma Holding",
        "Qube Development",
        "Reportage Properties",
        "Samana Developers",
        "Sky View Real Estate",
        "Wasl"
      ],
      "icons": [
        "Building2",
        "Building2",
        "Building2",
        "Building2",
        "Building2",
        "Building2",
        "Building2",
        "Building2",
        "Building2",
        "Building2",
        "Building2",
        "Building2",
        "Building2",
        "Building2",
        "Building2",
        "Building2",
        "Building2",
        "Building2",
        "Building2",
        "Building2",
        "Building2",
        "Building2"
      ]
    },
    "gallery": [
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/fthb-hd/00-Riverton-House-by-Ellington-2x.webp",
        "alt": "A resort-style pool deck with the Dubai skyline behind it"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/fthb-hd/01-1-2x.webp",
        "alt": "The Dubai skyline seen across the water from La Mer, Jumeirah"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/fthb-hd/02-1-2x.webp",
        "alt": "The Palm Crown by Nakheel above the water at Palm Jumeirah"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/fthb-hd/03-1-2x.webp",
        "alt": "Living space opening onto the water at Ellington's Lakeshore Villas in MBR City"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/fthb-hd/04-3-2x.webp",
        "alt": "Armani Beach Residences by Arada on Palm Jumeirah"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/fthb-hd/05-7-2x.webp",
        "alt": "A bedroom at Emaar's Park Point apartments in Dubai Hills Estate"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/fthb-hd/06-3-2x.webp",
        "alt": "Dragon Tower by Nakheel above Dragon City at sunset"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/fthb-hd/08-2-2x.webp",
        "alt": "The living and dining space at Aura Gardens, Tilal Al Ghaf"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/fthb-hd/09-1-2x.webp",
        "alt": "A terrace plunge pool at Opalz Tower by Danube"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/fthb-hd/10-5-2x.webp",
        "alt": "Fashionz by Danube lit up at night in Jumeirah Village Triangle"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/fthb-hd/11-2-2x.webp",
        "alt": "Ashwood Estates by Wasl at Jumeirah Golf Estates"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/fthb-hd/12-2-2x.webp",
        "alt": "The dining space inside Burj Azizi on Sheikh Zayed Road"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/azizi-717-tower-at-dubai-trade-centre-1/gallery/2.webp",
        "alt": "Azizi 717 Tower rising above Dubai Trade Centre 1"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/fthb-hd/14-7-2x.webp",
        "alt": "La Rosa II villas at Villanova, Dubailand"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/fthb-hd/15-4-2x.webp",
        "alt": "The kitchen in a Cherrywoods townhouse by Meraas"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/fthb-hd/16-3EB073311A77C881CEA950-2x.webp",
        "alt": "A masterplanned villa community in Dubailand seen from above"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/fthb-hd/17-3-2x.webp",
        "alt": "An apartment at Azizi Aura at night"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/fthb-hd/18-2-2x.webp",
        "alt": "A bedroom at Belgravia Heights 2 by Ellington in Jumeirah Village Circle"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/fthb-hd/19-3-2x.webp",
        "alt": "The facade of Binghatti Dawn in Jumeirah Village Circle"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/fthb-hd/20-8-2x.webp",
        "alt": "The kitchen and living space at Emaar's Park Point in Dubai Hills Estate"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/fthb-hd/21-8-2x.webp",
        "alt": "Townhouses at Warsan Village by Nakheel"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/fthb-hd/22-2-2x.webp",
        "alt": "A bedroom at Wasl Hillside Residences at Wasl Gate"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/fthb-hd/23-1-2x.webp",
        "alt": "Burj Binghatti Jacob and Co Residences above the clouds in Business Bay"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/fthb-hd/24-3-2x.webp",
        "alt": "A bedroom at Aura Gardens, Tilal Al Ghaf"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/fthb-hd/25-5-2x.webp",
        "alt": "Adeba Azizi on the water at Al Jaddaf"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/fthb-hd/26-3-2x.webp",
        "alt": "The living space in a Rukan Loft at Wadi Al Safa, Dubailand"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/fthb-hd/27-1-2x.webp",
        "alt": "Townhouses at Mudon Al Ranim phase 5, Dubailand"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/fthb-hd/28-4-2x.webp",
        "alt": "Viewz by Danube, the Aston Martin tower at Jumeirah Lakes Towers"
      }
    ],
    "investment": {
      "heading": "Where the programme actually moves the needle.",
      "items": [
        {
          "title": "Priority on new launches",
          "text": "Partner developers contact registered buyers ahead of each launch."
        },
        {
          "title": "Preferential off-plan pricing",
          "text": "Select developers quote participants a different price on the same unit."
        },
        {
          "title": "Better mortgage terms",
          "text": "Five banks offer preferential rates and faster approvals."
        },
        {
          "title": "Ready homes qualify",
          "text": "Through the banks, not only off-plan through developers."
        }
      ],
      "icons": [
        "CalendarClock",
        "BadgePercent",
        "Wallet",
        "KeyRound"
      ]
    },
    "ctaLabel": "See homes under AED 5M",
    "whatsappLabel": "Message on WhatsApp",
    "whatsappMessage": "Hi Binayah! 👋 I'm registered (or registering) for Dubai's First-Time Home Buyer Programme and looking for a first home under AED 5M. Please send me what qualifies.",
    "valueProps": [
      [
        "The call before the launch",
        "Dubai's better off-plan releases sell through developer databases before they reach a portal. Registered buyers are contacted by partner developers ahead of each launch, which is the difference between choosing a unit and being offered what is left."
      ],
      [
        "A different price on the same unit",
        "Select developers quote programme participants preferential prices on off-plan units. It is the same building and the same floor plan; the number in front of you is what changes."
      ],
      [
        "The fee spread, not removed",
        "The 4% registration fee still has to be paid. Under the programme it can go on an eligible credit card as interest-free instalments, which moves a five-figure sum out of the day you sign and across the following months."
      ],
      [
        "Ready homes count too",
        "The programme is often described as an off-plan scheme. It is not. Buyers of completed property qualify through the participating banks for preferential rates and faster approvals."
      ]
    ],
    "bodyParagraphs": [
      "Dubai's First-Time Home Buyer Programme launched in July 2025, run by the Dubai Land Department with the Department of Economy and Tourism. Within its first year it had put more than 3,200 residents into their first home and generated over AED 5 billion in residential transactions, with 22 developers and five banks signed up as partners. Registration is free, and the eligibility test is short: a UAE resident of any nationality, at least 18, not currently owning freehold residential property in Dubai, buying below AED 5 million.",
      "What you get is access rather than a discount on the government's side of the transaction. Partner developers contact registered buyers ahead of new launches, which matters more than it sounds in a market where the better releases are placed through developer databases before they ever reach a portal. Select developers then quote programme participants preferential prices on off-plan units, and offer flexible payment plans on them. Through the five partner banks, buyers of ready property get preferential mortgage rates and faster approvals, so the common description of this as an off-plan scheme is wrong.",
      "The registration fee is where expectations most often run ahead of the rules. The programme does not waive the 4% DLD fee. On a AED 1.5M home that is AED 60,000, and it remains payable. What the programme adds is a relaxed payment plan for it: interest-free instalments on an eligible credit card, which moves the sum off the day you sign. Developer-run DLD-waiver promotions do exist and can sit alongside this, but they are a separate offer from a separate party.",
      "Two rules are worth committing to memory before you register. A joint purchase is only permitted where both buyers are eligible, so a partner who already owns freehold property in Dubai takes the purchase outside the programme. And the status is spent once: buy under the programme and you cannot use it again, even after selling. The QR code itself stays valid until a property is purchased and registered in your name, so there is no rush to use it, only a reason to use it on the right home."
    ],
    "worked": {
      "heading": "The 4% fee on an AED 1.5M first home",
      "rows": [
        [
          "Example purchase price",
          "AED 1,500,000"
        ],
        [
          "4% DLD registration fee",
          "AED 60,000"
        ],
        [
          "Waived by the programme itself",
          "AED 0"
        ],
        [
          "What the programme changes",
          "The fee can be spread interest free"
        ],
        [
          "Cost of joining",
          "AED 0"
        ]
      ],
      "footnote": "Illustrative. The programme does not waive the DLD registration fee; it gives eligible buyers relaxed payment plans for it through eligible credit cards with interest-free instalments. Individual developers run their own DLD-waiver promotions, and those are a separate thing that can sit alongside this. Confirm what a specific partner is offering, in writing, before committing."
    },
    "faqs": [
      {
        "question": "Who is eligible?",
        "answer": "Residents of the UAE of any nationality, aged 18 or older, who do not currently own any freehold residential property in Dubai and are buying a property valued below AED 5 million."
      },
      {
        "question": "Does it cost anything to join?",
        "answer": "No. There are no application or participation fees. Standard DLD registration fees and any developer or bank charges still apply, unless a specific programme offer says otherwise."
      },
      {
        "question": "How do I register?",
        "answer": "Apply through the Dubai Land Department website or the Dubai REST app. If you are eligible, DLD emails you a confirmation containing your First-Time Home Buyer QR code, which you then present to participating developers and banks."
      },
      {
        "question": "Does the programme waive the 4% DLD fee?",
        "answer": "No. It offers relaxed payment plans for the registration fee through eligible credit cards with interest-free instalments. Some developers separately run their own DLD-waiver promotions, but that is a developer offer rather than part of this programme."
      },
      {
        "question": "Is it only for off-plan property?",
        "answer": "No. Buyers of ready property benefit through the participating banks, with preferential interest rates and faster approval processes."
      },
      {
        "question": "I own property in another emirate. Do I still qualify?",
        "answer": "Yes, as long as you do not currently own any freehold property in Dubai. The same applies if you own in a non-freehold area of Dubai."
      },
      {
        "question": "Can I buy jointly with someone?",
        "answer": "Only if that person is also eligible under the programme. Joint purchases with an ineligible buyer are not permitted."
      },
      {
        "question": "Can I use the programme again after selling?",
        "answer": "No. Once you purchase under the programme you lose first-time buyer status permanently, even if you sell the property later."
      }
    ],
    "disclaimer": "The First-Time Home Buyer Programme is run by the Dubai Land Department with the Dubai Department of Economy and Tourism. Eligibility rules, benefits and the list of participating developers and banks are set by DLD and can change; the details here reflect what DLD published at the time of writing, and DLD's own page is the authority. Benefits vary between partners and can be used with one partner only. The programme does not waive DLD registration fees. Figures shown are illustrative and are not financial advice or an offer to sell. Confirm eligibility and the exact terms of any partner offer in writing before committing. Binayah Properties is a licensed Dubai real estate brokerage and is not a government body."
  },
  {
    "slug": "damac-chelsea-residences-golden-visa-offer",
    "shortName": "Chelsea Residences Benefit",
    "developer": "DAMAC Properties",
    "eyebrow": "Final release, 30 days from the booking event",
    "h1": "DAMAC Chelsea Residences: A UAE Golden Visa With the Final Release",
    "subtitle": "Ownership in the last release of the world's first football-branded residences carries a Golden Visa for the primary buyer, and savings that scale with how much of the price you pay up front.",
    "heroImage": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/chelsea-hd/00-3-2x.webp",
    "deadline": "",
    "windowLabel": "Bookings within 30 days of the booking event",
    "hideDeadline": false,
    "dayCountEyebrow": false,
    "explainer": {
      "heading": "The benefit is a visa, and the discounts are a ladder",
      "highlight": "One UAE Golden Visa per unit, for the primary buyer, processed once the sale and purchase agreement is executed. On bulk purchases, additional dependent visas may be issued.",
      "body": [
        "Chelsea Residences is DAMAC's partnership with Chelsea Football Club: the world's first football-branded residences, more than 1,400 sea-facing homes in Dubai Maritime City. The benefit attached to the final release is the Golden Visa, and it is worth being exact about what that means. It is one visa per unit and it belongs to the primary buyer. It is issued after the SPA is executed, not at reservation. Bulk buyers can add dependent visas on top.",
        "Alongside it sit two savings tables that most write-ups collapse into a single number. One scales with how many units you take: 1% on two to four, 2% on five to seven, 3% on eight or more. The other scales with how much you pay at the start of the 60/40 plan: 1% for 30% upfront, 2% for 40%, 3% for 50%, and 5% for paying the whole price. The two ladders answer different questions, and only one of them is about the size of your portfolio."
      ]
    },
    "metaTitle": "DAMAC Chelsea Residences Offer | Golden Visa, From AED 2.56M",
    "metaDescription": "DAMAC's final release at Chelsea Residences carries a UAE Golden Visa for the primary buyer, portfolio savings to 3% and up to 5% off for paying upfront. From AED 2.56M.",
    "keywords": "damac chelsea residences, chelsea residences offer, chelsea residences price, chelsea residences payment plan, damac golden visa offer, dubai maritime city apartments for sale, football branded residences dubai, chelsea residences final release, chelsea fc dubai apartments",
    "priceFrom": 2560000,
    "highlights": [
      {
        "value": "5%",
        "label": "For paying upfront",
        "detail": "The top rung, on a 100% upfront purchase"
      },
      {
        "value": "3%",
        "label": "Portfolio savings",
        "detail": "On eight units or more"
      },
      {
        "value": "40%",
        "label": "On completion",
        "detail": "The construction-linked 60/40 plan"
      },
      {
        "value": "AED 2.56M",
        "label": "Entry price",
        "detail": "A one-bedroom, sea facing"
      }
    ],
    "timeline": [
      {
        "stage": "During construction",
        "share": "60%",
        "description": "Staged against construction milestones. How much of this you bring forward is what moves you up the upfront-payment discount ladder."
      },
      {
        "stage": "On completion",
        "share": "40%",
        "description": "Due when the residence is handed over."
      }
    ],
    "timelineIntro": "A construction-linked 60/40. DAMAC publishes the split and the completion share; the instalment dates are set per unit, so the schedule in your own sale and purchase agreement is the one that counts.",
    "eligibility": [
      {
        "label": "What the benefit is",
        "value": "A UAE Golden Visa for the primary buyer, one per unit, on ownership in the final release of Chelsea Residences."
      },
      {
        "label": "When it is processed",
        "value": "After the sale and purchase agreement is executed, rather than at reservation."
      },
      {
        "label": "Dependents",
        "value": "On bulk purchases, additional dependent visas may be issued."
      },
      {
        "label": "The booking window",
        "value": "Valid for all Chelsea Residences bookings made within 30 days after the booking event, excluding the booking event date itself."
      },
      {
        "label": "Portfolio savings",
        "value": "Two to four units, 1%. Five to seven, 2%. Eight or more, 3%."
      },
      {
        "label": "Upfront savings",
        "value": "On the 60/40 plan: 30% upfront takes 1% off, 40% takes 2%, 50% takes 3%. Paying 100% upfront takes 5%."
      },
      {
        "label": "Price and unit mix",
        "value": "From AED 2.56 million for a one-bedroom and AED 3.68 million for a two-bedroom, across one, two and three-bedroom sea-facing apartments."
      },
      {
        "label": "Handover",
        "value": "Confirm the completion date in writing. The date recorded in your sale and purchase agreement is the authority, and third-party listings do not agree with each other on it."
      }
    ],
    "amenities": {
      "heading": "A blue sand beach, a rooftop pitch and a performance centre.",
      "stats": [
        {
          "value": "1,400+",
          "label": "Residences in the development",
          "icon": "Building2"
        },
        {
          "value": "1st",
          "label": "Football branded residences in the world",
          "icon": "Sparkles"
        },
        {
          "value": "1 to 3",
          "label": "Bedroom layouts",
          "icon": "KeyRound"
        }
      ],
      "masterplanHeading": "Inside Chelsea Residences",
      "items": [
        "Chelsea Lion Beach, the blue sand beach",
        "Stamford Summit, the rooftop pitch",
        "Football simulation room",
        "Chelsea Athlete Performance Training Centre",
        "The Pride of the Ocean",
        "Underwater themed kids play area",
        "Serenity Spa",
        "Starlit Wellness Centre",
        "Rain Therapy"
      ],
      "icons": [
        "Waves",
        "Bike",
        "Laptop",
        "Sparkles",
        "TreePalm",
        "Users",
        "Flower2",
        "Sun",
        "Droplets"
      ]
    },
    "gallery": [
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/chelsea-hd/00-3-2x.webp",
        "alt": "Chelsea Residences by DAMAC seen from the water at Dubai Maritime City"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/chelsea-hd/01-4-2x.webp",
        "alt": "Stamford Summit, the rooftop football pitch at Chelsea Residences, seen from above"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/chelsea-hd/02-featured-2x.webp",
        "alt": "Chelsea Residences lit at dusk on the Dubai Maritime City waterfront"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/chelsea-hd/03-5-2x.webp",
        "alt": "The towers of Chelsea Residences above the Arabian Gulf"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/chelsea-hd/04-2-2x.webp",
        "alt": "Chelsea Residences at dusk, the sea frontage of Dubai Maritime City behind it"
      }
    ],
    "investment": {
      "heading": "Why the final release is the one with the terms.",
      "items": [
        {
          "title": "Residency attached to the purchase",
          "text": "A Golden Visa for the primary buyer, one per unit."
        },
        {
          "title": "Above the AED 2M threshold",
          "text": "The entry apartment qualifies on its own."
        },
        {
          "title": "Up to 5% back for cash",
          "text": "The upfront ladder tops out at paying in full."
        },
        {
          "title": "Sea facing in Maritime City",
          "text": "A peninsula address, minutes from Port Rashid."
        }
      ],
      "icons": [
        "FileSignature",
        "Coins",
        "Wallet",
        "Waves"
      ]
    },
    "ctaLabel": "See the final release",
    "whatsappLabel": "Message on WhatsApp",
    "whatsappMessage": "Hi Binayah! 👋 I'm interested in the Chelsea Residences final release by DAMAC: the UAE Golden Visa benefit and the upfront-payment savings. Please send me what's available.",
    "valueProps": [
      [
        "A visa that the entry price actually reaches",
        "The investor route to a UAE Golden Visa needs property above AED 2 million. Chelsea Residences opens at AED 2.56 million, so the smallest apartment in the release clears the threshold on its own rather than needing a second purchase stacked on top of it."
      ],
      [
        "Two ladders, not one discount",
        "The portfolio table and the upfront table are separate mechanisms. One rewards buying more units, the other rewards bringing money forward on a single unit. A buyer with cash and no interest in a portfolio still has 5% available to them."
      ],
      [
        "The window runs from an event, not a date",
        "The terms are written as 30 days after the booking event, excluding the event date. That is a rolling window rather than a fixed cutoff, which means the useful question is when the relevant booking event was, not what today's date is."
      ],
      [
        "A branded residence with a working thesis",
        "Football-branded is a first, and firsts are hard to price. What is underneath it is more ordinary and more useful: 1,400 sea-facing homes in Dubai Maritime City, on a peninsula minutes from Port Rashid and Downtown."
      ]
    ],
    "bodyParagraphs": [
      "Chelsea Residences is DAMAC's partnership with Chelsea Football Club, and the pitch is easy to summarise: the world's first football-branded residences, more than 1,400 sea-facing homes in Dubai Maritime City. The offer attached to the final release is less about the branding and more about residency. Ownership carries a UAE Golden Visa for the primary buyer, one per unit, issued once the sale and purchase agreement has been executed.",
      "The threshold is what makes this land differently from most developer visa promotions. The investor route to a Golden Visa requires property above AED 2 million, and plenty of campaigns that advertise one are pitched at price points that only reach it by stacking two purchases. Chelsea Residences opens at AED 2.56 million for a one-bedroom, so the cheapest apartment in the release clears the line on its own.",
      "Two savings tables run alongside. The portfolio table pays 1% on two to four units, 2% on five to seven and 3% on eight or more. The upfront table works on a single unit and rewards bringing money forward on the 60/40 plan: 1% for paying 30% at the start, 2% for 40%, 3% for 50% and 5% for paying the whole price. On the AED 2.56M entry apartment that top rung is AED 128,000, which is a materially different number from the 1% at the bottom.",
      "The rest of the building is what a branded residence is supposed to be. Chelsea Lion Beach is a blue sand beach; Stamford Summit is a rooftop pitch; there is a football simulation room and a Chelsea Athlete Performance Training Centre, alongside the Serenity Spa, the Starlit Wellness Centre and an underwater-themed kids play area. The offer window is written as 30 days after the booking event rather than a calendar date, so the terms, the applicable discount and the completion date recorded in the sale and purchase agreement are all worth confirming in writing before anything is reserved."
    ],
    "worked": {
      "heading": "What paying earlier is worth on a AED 2.56M residence",
      "rows": [
        [
          "Purchase price",
          "AED 2,560,000"
        ],
        [
          "30% upfront, 1% off",
          "AED 25,600"
        ],
        [
          "40% upfront, 2% off",
          "AED 51,200"
        ],
        [
          "50% upfront, 3% off",
          "AED 76,800"
        ],
        [
          "100% upfront, 5% off",
          "AED 128,000"
        ]
      ],
      "footnote": "Illustrative, based on the published starting price; figures are rounded. The portfolio discount is a separate table and runs from 1% on two units to 3% on eight or more. The 4% DLD registration fee, trustee office and administration charges are payable separately. The offer applies to bookings made within 30 days after the booking event, excluding the event date; prices and availability change."
    },
    "faqs": [
      {
        "question": "What exactly does the offer give me?",
        "answer": "A UAE Golden Visa for the primary buyer, one per unit, on ownership in the final release of Chelsea Residences. Alongside it are portfolio savings of 1% to 3% depending on how many units you buy, and upfront-payment savings of 1% to 5% depending on how much of the price you pay at the start of the 60/40 plan."
      },
      {
        "question": "When is the Golden Visa issued?",
        "answer": "After the sale and purchase agreement is executed. It is not issued at reservation."
      },
      {
        "question": "Can my family get visas too?",
        "answer": "The benefit is one Golden Visa per unit for the primary buyer. For bulk purchases, additional dependent visas may be issued."
      },
      {
        "question": "How long do I have to book?",
        "answer": "The terms read: valid for all Chelsea Residences bookings made within 30 days after the booking event, excluding the booking event date. It is a rolling window tied to an event rather than a fixed calendar cutoff, so confirm which event applies to your booking."
      },
      {
        "question": "What is the payment plan?",
        "answer": "A construction-linked 60/40: 60% across the construction period and 40% on completion. Bringing more of the 60% forward is what moves you up the upfront-savings ladder."
      },
      {
        "question": "What does it cost to get in?",
        "answer": "From AED 2.56 million for a one-bedroom and AED 3.68 million for a two-bedroom. One, two and three-bedroom sea-facing apartments are available, and prices vary by tower, floor, view and layout."
      },
      {
        "question": "Can I combine the portfolio and upfront savings?",
        "answer": "They are published as two separate tables. Whether they stack on a single transaction is a question for the sales agreement, so get the applicable discount confirmed in writing before you reserve."
      },
      {
        "question": "Are the DLD fees included?",
        "answer": "No. The 4% Dubai Land Department registration fee, trustee office charges and administration fees sit outside this offer and remain payable."
      }
    ],
    "disclaimer": "Terms are set by DAMAC Properties and apply to eligible units in the final release of Chelsea Residences, subject to availability and to DAMAC's terms and conditions. The offer is stated as valid for bookings made within 30 days after the booking event, excluding the booking event date. One Golden Visa per unit for the primary buyer, processed following execution of the sale and purchase agreement; dependent visas on bulk purchases are at DAMAC's discretion, and visa issuance is decided by the UAE authorities, not by the developer or by us. Prices, availability and payment terms change. The 4% DLD registration fee, trustee office and administration charges are payable separately. Worked figures are illustrative and are not financial advice or an offer to sell. Confirm eligibility, price, the applicable discount and the full payment and handover schedule in writing before committing. Binayah Properties is a licensed Dubai real estate brokerage.",
    "projectHref": "/project/chelsea-residences-by-damac"
  },
  {
    "slug": "emaar-90-10-offer-limited-time-alana-the-valley-launch",
    "shortName": "Alana at The Valley",
    "developer": "Emaar Properties",
    "eyebrow": "Launch offer at Alana, The Valley",
    "h1": "Alana at The Valley: 90/10 on a Three or Four-Bedroom Townhouse",
    "subtitle": "The same plan Emaar runs at Beachfront, attached to a very different product: a townhouse on a lagoon in a master community, not an apartment on a peninsula.",
    "heroImage": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/alana-hd/00-3-2x.webp",
    "deadline": "",
    "windowLabel": "Limited-time launch offer",
    "hideDeadline": false,
    "dayCountEyebrow": false,
    "explainer": {
      "heading": "Same plan, different thing being bought",
      "highlight": "90% during construction and 10% upon 100% construction completion, on a limited number of three and four-bedroom townhouses.",
      "body": [
        "Emaar runs the 90/10 across more than one community, so the plan is not what distinguishes this release. What distinguishes it is the asset. Alana is townhouses in The Valley, a master community out along the Al Ain road, arranged around a lagoon and a stretch Emaar calls the Golden Beach. That is a family purchase with a garden, not a rental unit in a tower.",
        "The plan itself suits that buyer. A 90/10 leaves a tenth at completion, which matters less to an investor timing a resale than it does to a family that wants the handover to be a formality rather than a second financing round. Emaar states a limited number of units, so what closes this is stock rather than a date."
      ]
    },
    "metaTitle": "Alana at The Valley 90/10 | 3 & 4-Bed Townhouses, Emaar",
    "metaDescription": "Emaar's launch offer at Alana, The Valley: three and four-bedroom townhouses on a 90/10 plan, 90% during construction and 10% at 100% completion. Limited units.",
    "keywords": "alana the valley, alana emaar townhouses, alana the valley payment plan, the valley by emaar townhouses, alana 3 bedroom townhouse price, emaar the valley launch offer, dubai al ain road townhouses, alana the valley lagoon",
    "priceFrom": 3500000,
    "highlights": [
      {
        "value": "90%",
        "label": "During construction",
        "detail": "Paid across the build period"
      },
      {
        "value": "10%",
        "label": "At completion",
        "detail": "Due at 100% construction completion"
      },
      {
        "value": "3 & 4",
        "label": "Bedroom townhouses",
        "detail": "The two layouts in this release"
      },
      {
        "value": "AED 3.5M",
        "label": "Published entry price",
        "detail": "For a three-bedroom townhouse"
      }
    ],
    "timeline": [
      {
        "stage": "During construction",
        "share": "90%",
        "description": "Paid across the build period on Emaar's construction-linked schedule."
      },
      {
        "stage": "At 100% construction completion",
        "share": "10%",
        "description": "The balance, due once construction is complete."
      }
    ],
    "timelineIntro": "Two blocks, and the second one is small. Ninety percent across the build, and the last ten when construction reaches 100%.",
    "eligibility": [
      {
        "label": "The plan",
        "value": "90% during construction and 10% upon 100% construction completion."
      },
      {
        "label": "What is in the release",
        "value": "A limited number of three and four-bedroom townhouses. The wider project has larger layouts, but the launch offer names these two."
      },
      {
        "label": "Where",
        "value": "Alana, inside The Valley by Emaar, on the Dubai to Al Ain road."
      },
      {
        "label": "Published entry price",
        "value": "From AED 3.5 million for a three-bedroom townhouse. Emaar does not publish a price on the offer page itself, so confirm the current figure before relying on it."
      },
      {
        "label": "The community",
        "value": "Built around a lagoon and the Golden Beach, with pocket parks, playgrounds and a Town Centre for retail and dining."
      },
      {
        "label": "How long it runs",
        "value": "Emaar states a limited number of units rather than an end date, so availability is what closes it."
      },
      {
        "label": "Handover",
        "value": "Emaar does not state a completion date on the offer page. Third-party listings say Q2 2027; treat the date in your own sale and purchase agreement as the authority."
      },
      {
        "label": "What is not covered",
        "value": "The 4% DLD registration fee, trustee office and administration charges are payable separately."
      }
    ],
    "amenities": {
      "heading": "A lagoon, a golden beach and a town centre.",
      "stats": [
        {
          "value": "3 & 4",
          "label": "Bedroom townhouses in the release",
          "icon": "KeyRound"
        },
        {
          "value": "90/10",
          "label": "Payment split",
          "icon": "Wallet"
        },
        {
          "value": "Lagoon",
          "label": "At the centre of the plan",
          "icon": "Waves"
        }
      ],
      "masterplanHeading": "Inside The Valley",
      "items": [
        "Golden Beach along the lagoon",
        "Swimmable lagoon at the centre",
        "Pocket parks between the clusters",
        "Playgrounds throughout",
        "Town Centre for retail and dining",
        "Landscaped walking trails",
        "Private garden with each townhouse",
        "Sports and community facilities",
        "On the Dubai to Al Ain road"
      ],
      "icons": [
        "Sun",
        "Waves",
        "Trees",
        "Flower2",
        "Store",
        "Bike",
        "TreePalm",
        "Users",
        "Building2"
      ]
    },
    "gallery": [
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/alana-hd/00-3-2x.webp",
        "alt": "The lagoon at Alana, The Valley, with the townhouses behind the palms"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/alana-hd/01-7-2x.webp",
        "alt": "Water running past the townhouses at Alana, The Valley"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/alana-hd/02-1-2x.webp",
        "alt": "Townhouses at Alana seen across the lagoon"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/alana-hd/03-8-2x.webp",
        "alt": "A walking path beside the lagoon at Alana, The Valley"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/alana-hd/04-10-2x.webp",
        "alt": "A timber deck at the lagoon edge at Alana"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/alana-hd/05-4-2x.webp",
        "alt": "The living and dining space inside an Alana townhouse"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/alana-hd/06-9-2x.webp",
        "alt": "The street frontage of a townhouse at Alana, The Valley"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/alana-hd/07-6-2x.webp",
        "alt": "A living room opening onto the terrace at Alana"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/alana-hd/08-5-2x.webp",
        "alt": "A bedroom at Alana looking out to the lagoon"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/alana-hd/09-featured-2x.webp",
        "alt": "The entrance to The Valley by Emaar"
      }
    ],
    "investment": {
      "heading": "Who this release is actually for.",
      "items": [
        {
          "title": "Families, not flippers",
          "text": "Three and four bedrooms with a garden and a school run."
        },
        {
          "title": "A small balance at handover",
          "text": "Ten percent at completion, not forty."
        },
        {
          "title": "Water at the centre",
          "text": "A lagoon and a beach, not a landscaped verge."
        },
        {
          "title": "Limited release",
          "text": "Stock closes it, so the list is worth asking for."
        }
      ],
      "icons": [
        "Users",
        "Wallet",
        "Waves",
        "CalendarClock"
      ]
    },
    "ctaLabel": "See available townhouses",
    "whatsappLabel": "Message on WhatsApp",
    "whatsappMessage": "Hi Binayah! 👋 I'm interested in the Alana launch offer at The Valley: 90% during construction, 10% at completion, on a 3 or 4-bedroom townhouse. Please send me what's available.",
    "valueProps": [
      [
        "A townhouse, not a unit in a tower",
        "The 90/10 turns up across Emaar's portfolio, so the plan is not the reason to choose this one. Alana is three and four-bedroom townhouses with their own gardens, around a lagoon. It is a different purchase with a different buyer behind it."
      ],
      [
        "Ten percent left at the end",
        "A 90/10 leaves a balance small enough that completion is administrative rather than a financing event. For a family moving in rather than an investor exiting, that is the more useful shape."
      ],
      [
        "The lagoon is the plan, not a feature",
        "The Valley is laid out around water and the Golden Beach, with pocket parks and playgrounds between the clusters. Alana sits on that, which is what the frontage is actually paying for."
      ],
      [
        "Stock closes it, not a date",
        "Emaar publishes a limited number of units with no deadline attached. That makes the useful question what is left in the release, rather than how long is left on a clock."
      ]
    ],
    "bodyParagraphs": [
      "Emaar's launch offer at Alana is a 90/10: ninety percent of the price across the construction period, and the last ten percent once construction reaches 100%. The plan is not what makes this release distinctive, because Emaar runs the same split elsewhere in its portfolio. What makes it distinctive is what the plan is attached to.",
      "Alana is three and four-bedroom townhouses in The Valley, Emaar's master community on the road out to Al Ain. The plan there is organised around water: a lagoon at the centre, a stretch Emaar calls the Golden Beach, and pocket parks and playgrounds threaded between the clusters, with a Town Centre for retail and dining. Each townhouse comes with its own garden. That is a family purchase, and it behaves differently from an apartment bought to let.",
      "The payment shape suits that buyer. A 90/10 asks for more during the build and leaves only a tenth at the end, so completion becomes an administrative step rather than a second financing round. An investor timing a resale before handover would rather defer more; a family that intends to move in generally would not. Neither is better in the abstract, and the honest question is which one you are.",
      "Emaar publishes a limited number of units and no closing date, so the release ends when the stock does rather than on a calendar. The offer page does not carry a price or a handover date; listings put a three-bedroom from AED 3.5 million with completion in Q2 2027, but the figures that bind are the ones in the sale and purchase agreement. The 4% DLD registration fee, trustee office and administration charges sit outside the plan and remain payable."
    ],
    "worked": {
      "heading": "The 90/10 on a AED 3.5M townhouse",
      "rows": [
        [
          "Published entry price",
          "AED 3,500,000"
        ],
        [
          "Paid during construction",
          "AED 3,150,000"
        ],
        [
          "Due at 100% completion",
          "AED 350,000"
        ],
        [
          "4% DLD registration fee",
          "AED 140,000"
        ],
        [
          "Compare: 60/40 balance at handover",
          "AED 1,400,000"
        ]
      ],
      "footnote": "Illustrative, based on the published starting price for a three-bedroom townhouse; figures are rounded. Emaar does not publish a price on the offer page, so confirm the current figure. The DLD registration fee, trustee office and administration charges are payable separately and are not covered by the plan. The last row compares against a typical 60/40, not an alternative Emaar offers here."
    },
    "faqs": [
      {
        "question": "What is the payment plan?",
        "answer": "90% during construction and 10% upon 100% construction completion. Emaar publishes it as a limited-time launch offer."
      },
      {
        "question": "What can I buy under it?",
        "answer": "A limited number of three and four-bedroom townhouses at Alana. The wider project includes larger layouts, but the launch offer names these two."
      },
      {
        "question": "How is this different from the Emaar Beachfront 90/10?",
        "answer": "The plan is identical; the asset is not. Beachfront is apartments and penthouses on a gated peninsula between Dubai Marina and Palm Jumeirah. Alana is townhouses with gardens in a master community built around a lagoon. Different buyer, different hold, different exit."
      },
      {
        "question": "What does it cost to get in?",
        "answer": "Listings put a three-bedroom townhouse from AED 3.5 million. Emaar does not publish a price on the offer page, so confirm the current figure before relying on it."
      },
      {
        "question": "When does it hand over?",
        "answer": "Emaar does not state a completion date on the offer page. Third-party listings say Q2 2027. The date recorded in your sale and purchase agreement is the one that counts."
      },
      {
        "question": "What is The Valley like?",
        "answer": "A master community on the Dubai to Al Ain road built around a lagoon and the Golden Beach, with pocket parks, playgrounds and a Town Centre for retail and dining."
      },
      {
        "question": "When does the offer end?",
        "answer": "Emaar states a limited number of units rather than an end date, so availability is what closes it."
      },
      {
        "question": "Are the DLD fees included?",
        "answer": "No. The 4% Dubai Land Department registration fee, trustee office charges and administration fees are payable separately."
      }
    ],
    "disclaimer": "Terms are set by Emaar Properties and apply to eligible units at Alana, The Valley, subject to availability and to Emaar's terms and conditions. The 90/10 plan is published as a limited-time launch offer on a limited number of units; prices, availability and payment terms change without notice. Emaar does not publish a starting price or a handover date on its offer page; figures quoted here come from third-party listings and are indicative only. The 4% DLD registration fee, trustee office and administration charges are payable separately and are not covered by the plan. Worked figures are illustrative and are not financial advice or an offer to sell. Confirm price, layout, the full payment schedule and the completion date in writing, including the schedule recorded in the sale and purchase agreement, before committing. Binayah Properties is a licensed Dubai real estate brokerage.",
    "projectHref": "/project/alana-by-emaar-at-the-valley"
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
