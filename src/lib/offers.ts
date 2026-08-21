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
  /** Photo strip rendered as a mosaic with a click-through lightbox. `alt` text
   *  is English-only presentation copy, not offer content, so it isn't
   *  translated per locale. */
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
    "dayCountEyebrow": true,
    "h1": "Ultra-Luxury Sobha Home: Only 20% Before Handover",
    "subtitle": "Ultra-luxury from a Tier 1 developer, for a fifth of your own money.",
    "heroImage": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/sobha-20-80-hero-villa.webp",
    "deadline": "2026-08-23T23:59:59+04:00",
    "windowLabel": "Ends Sunday 23 August 2026",
    "hideDeadline": false,
    "explainer": {
      "heading": "The 20:80 plan is back, across all five Sobha communities",
      "highlight": "The last time this plan ran, Sobha sold over AED 1 billion of property in two days. This round is open wider still: there is no minimum requirement to buy a 5 million dirham unit.",
      "body": [
        "For four days only, from 20 to 23 August 2026, Sobha's 20:80 payment plan is open again across every one of its Dubai and Siniya Island communities: Elwood, Sanctuary, Central, Siniya Island and Downtown Umm Al Quwain. Pay just 20% of the price while it's being built, defer the remaining 80% to handover, then resell or mortgage the unit once it completes, often against a value that has already moved on from what you paid.",
        "Entry starts from AED 1.8 million for a one-bedroom at Sobha Central, and the same 20:80 structure runs straight through the rest of the range: apartments, townhouses and villas across all five projects qualify, not just the entry-level units."
      ]
    },
    "metaTitle": "Sobha 20:80 Payment Plan from AED 1.8M | 20% Now, 80% on Handover",
    "metaDescription": "Own a Sobha home from AED 1.8M: 20% during construction, 80% on handover, across five communities. Up to 4% DLD waived. Closes 23 August. Speak to Binayah.",
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
        "detail": "Lowest 20:80 entry, a one-bed at Sobha Central"
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
        "label": "Communities",
        "value": "All five: Elwood, Sanctuary, Central, Siniya Island and Downtown Umm Al Quwain."
      },
      {
        "label": "Entry price",
        "value": "From AED 1.8M for a one-bedroom at Sobha Central, though apartments, townhouses and villas across all five projects qualify too."
      },
      {
        "label": "Payment structure",
        "value": "20% across three instalments, 80% on handover."
      },
      {
        "label": "Incentives",
        "value": "DLD registration fee waivers of up to 4%, two-year service charge waivers, a furniture voucher on Elwood, and the registration fee waived outright on Siniya Island and Downtown Umm Al Quwain."
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
        "value": "Permitted at completion."
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
        "terms": "Courtyard & Garden villas: 20:80, 2% DLD waiver, 2-year service charge waiver. Estate villas: 20:80 and a 4% DLD waiver.",
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
        "terms": "1-beds from AED 1.8M: 20:80, 2% DLD waiver, 2-year service charge waiver. 2 & 3-beds and retail: 20:80 and a 4% DLD waiver.",
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
        "Beach-style lagoons",
        "Lazy rivers",
        "Zen gardens",
        "Meditation lawns",
        "Co-working spaces",
        "Community hubs",
        "Pet therapy gardens",
        "Farmers' market-style spaces",
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
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/sobha-sanctuary-at-dubailand/gallery/sobha-sanctuary-at-dubailand-gallery_13-hd.webp",
        "alt": "Aerial view of the Sobha Sanctuary masterplan in Dubailand"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/sobha-sanctuary-at-dubailand/gallery/sobha-sanctuary-at-dubailand-gallery_11-hd.webp",
        "alt": "Beach-style swimming lagoon at Sobha Sanctuary"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/sobha-sanctuary-at-dubailand/sobha-sanctuary-at-dubailand-featured-hd.webp",
        "alt": "Kayaking on the lagoon beneath the waterfall at Sobha Sanctuary"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/sobha-sanctuary-at-dubailand/gallery/sobha-sanctuary-at-dubailand-gallery_2-hd.webp",
        "alt": "Zen garden and water feature at Sobha Sanctuary"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/sobha-sanctuary-at-dubailand/gallery/sobha-sanctuary-at-dubailand-gallery_3-hd.webp",
        "alt": "Central park and lake at Sobha Sanctuary"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/sobha-sanctuary-at-dubailand/gallery/sobha-sanctuary-at-dubailand-gallery_8-hd.webp",
        "alt": "Meditation and yoga lawn at Sobha Sanctuary"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/sobha-sanctuary-at-dubailand/gallery/sobha-sanctuary-at-dubailand-gallery_10-hd.webp",
        "alt": "Pet therapy garden and dog run at Sobha Sanctuary"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/sobha-sanctuary-at-dubailand/gallery/sobha-sanctuary-at-dubailand-gallery_14-hd.webp",
        "alt": "Dining and retail promenade at Sobha Sanctuary"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/sobha-sanctuary-at-dubailand/gallery/sobha-sanctuary-at-dubailand-gallery_12-hd.webp",
        "alt": "Sobha Sanctuary Mall at dusk"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/sobha-sanctuary-at-dubailand/gallery/sobha-sanctuary-at-dubailand-gallery_9-hd.webp",
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
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/the-serene-at-sobha-central-by-sobha-group/gallery/the-serene-at-sobha-central-by-sobha-group-gallery_3-hd.webp",
        "alt": "Sports pitch and parkland between the towers at Sobha Central"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/the-serene-at-sobha-central-by-sobha-group/gallery/the-serene-at-sobha-central-by-sobha-group-gallery_5-hd.webp",
        "alt": "Elevated parkland and pool terraces at Sobha Central"
      },
      {
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/the-pinnacle-at-sobha-central/gallery/5.webp",
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
        "src": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/gallery-siniya-2.webp",
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
          "text": "Sobha designs, builds and delivers in-house."
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
          "title": "Long-term value",
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
        "A one-bedroom at Sobha Central opens the 20:80 structure at AED 1.8 million, the lowest way into this campaign. The same deferred split then scales all the way up through apartments, townhouses and the Estate villas at Sanctuary."
      ],
      [
        "AED 360,000 secures an AED 1.8M home",
        "Twenty per cent is all that leaves your pocket before handover: AED 360,000 on an AED 1.8 million property, staged as 2% today, 8% within 7 days and 10% within 15 days. The remaining AED 1.44 million is deferred until the unit is ready."
      ],
      [
        "Resell or mortgage at completion",
        "The unit can be resold or mortgaged once it completes, by which point it has had the full construction period to appreciate. Sobha properties have historically gained 20 to 50% in value by handover, depending on unit type."
      ]
    ],
    "bodyParagraphs": [
      "Sobha's 20:80 payment plan is open again for four days, from 20 to 23 August 2026. The structure is the same across every participating community (20% across the construction period and 80% on handover), but the incentives layered on top differ by project and, in two cases, by unit type within the same project. We place the booking, handle the paperwork and secure the developer approval on your behalf.",
      "The number that matters most is the entry price: AED 1.8 million for a one-bedroom at Sobha Central. That is the cheapest way into the 20:80 structure in this campaign, and it puts a deferred-payment Sobha home within reach of buyers who would have assumed this kind of plan was reserved for the villa end of the market. The same 20:80 split then runs right across all five participating projects.",
      "The waivers are worth reading closely. Elwood, the Courtyard and Garden villas at Sanctuary, and one-bedroom apartments at Central carry a 2% DLD waiver; the Estate villas at Sanctuary and the two- and three-bedroom apartments and retail units at Central carry the full 4%. Siniya Island and Downtown Umm Al Quwain go further and waive the registration fee outright. Elwood adds a 2% furniture voucher, and both Sanctuary's Courtyard and Garden villas and Central's one-beds add a two-year service charge waiver.",
      "The terms are held by action inside the window, not by intent. A unit must be booked or PR-approved with the 2% booking amount paid during the offer period, and the benefits are extended on payment of 10% along with the applicable registration fee and execution of the Booking Form. The offer does not apply to cancellations, swaps, upgrades, downgrades or re-bookings, so it is worth confirming the exact position on any unit already under discussion."
    ],
    "worked": {
      "heading": "What it takes to secure a AED 1.8M one-bed at Sobha Central",
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
      "footnote": "Figures shown on the AED 1.8M entry price for a one-bedroom at Sobha Central."
    },
    "faqs": [
      {
        "question": "When does the Sobha 20:80 payment plan close?",
        "answer": "Sunday 23 August 2026. To hold the terms, the unit has to be booked or PR-approved with the 2% booking amount paid before then. Talk to us early: we place the booking, handle the Booking Form and the developer approval, and represent you through to handover."
      },
      {
        "question": "What is the cheapest unit on the 20:80 plan?",
        "answer": "AED 1.8 million, for a one-bedroom apartment at Sobha Central. That is the entry point for the campaign; the same 20:80 structure then runs up through apartments, townhouses and villas across the other four projects."
      },
      {
        "question": "Which unit types qualify?",
        "answer": "Apartments, townhouses, retail units and villas. Sobha Central covers one, two and three-bedroom apartments plus retail; Sanctuary covers Courtyard, Garden and Estate villas; Elwood, Siniya Island and Downtown Umm Al Quwain each carry their own inventory. Message us on WhatsApp and we will send you the current list."
      },
      {
        "question": "Can I resell or mortgage before I pay the 80%?",
        "answer": "The unit can be resold or mortgaged at completion, once the construction period has run. Sobha properties have historically appreciated 20 to 50% by handover depending on unit type, so the deferred balance is often settled against a higher valuation than the purchase price."
      },
      {
        "question": "How much of the DLD fee is waived?",
        "answer": "It depends on the project and the unit type. Sobha Elwood, the Courtyard and Garden villas at Sanctuary, and one-bedroom apartments at Central carry a 2% DLD waiver. The Estate villas at Sanctuary and the two- and three-bedroom apartments and retail at Central carry 4%. Sobha Siniya Island and Downtown Umm Al Quwain waive the registration fee in full."
      },
      {
        "question": "What do I have to pay to lock the offer in?",
        "answer": "A 2% booking amount during the offer period, with the unit booked or PR-approved. The benefits are then extended on payment of 10% plus the applicable registration fee and execution of the Booking Form."
      },
      {
        "question": "Which projects are included?",
        "answer": "Five: Sobha Elwood, Sobha Sanctuary (Courtyard and Garden villas, and Estate villas), Sobha Central (one-bedroom apartments, and two- and three-bedroom apartments plus retail), Sobha Siniya Island, and Downtown Umm Al Quwain."
      },
      {
        "question": "Can I apply this to a unit I have already booked?",
        "answer": "No. The offer does not apply to cancellations, swaps, upgrades, downgrades or re-bookings. If you already have a unit under discussion, message us on WhatsApp and we will confirm exactly where it stands."
      }
    ],
    "disclaimer": "Terms are set by Sobha Realty and apply to selected units and projects only, subject to availability and developer approval. Waivers and vouchers vary by project and unit type as set out above. Figures shown are illustrative and do not constitute financial advice or an offer to sell. The offer does not apply to cancellations, swaps, upgrades, downgrades or re-bookings. Confirm all terms in writing before committing. Binayah Properties is a licensed Dubai brokerage."
  },
  {
    "slug": "damac-lagoons-riverside-1950-offer",
    "shortName": "DAMAC from AED 1,950/mo",
    "developer": "DAMAC Properties",
    "eyebrow": "DAMAC waterfront offer",
    "h1": "DAMAC Waterfront Homes from AED 1,950 a Month: 4% DLD Waiver, 4% Discount and a 50/50 Plan",
    "subtitle": "Own a branded waterfront home in DAMAC Lagoons or DAMAC Riverside from AED 1,950 a month, with the 4% DLD fee covered, 4% off the price and half the balance deferred to handover.",
    "heroImage": "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/properties/portofino-townhouse-villas-in-damac-lagoons/featured.webp",
    "deadline": "",
    "windowLabel": "Limited time offer",
    "hideDeadline": false,
    "metaTitle": "DAMAC Waterfront Homes from AED 1,950/Month | 4% DLD Waiver + 50/50 Plan",
    "metaDescription": "Branded DAMAC waterfront homes in Lagoons and Riverside from AED 1,950 a month, with a 4% DLD fee waiver, a 4% price discount and a 50/50 payment plan. Check which units qualify.",
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

/** Live "Ends <weekday>, N days only" label for `dayCountEyebrow` offers,
 *  recomputed on every request rather than baked into the stored `eyebrow`
 *  string, so a "4 days only" badge doesn't keep saying that after the
 *  window has shrunk. Falls back to the stored `eyebrow` otherwise. */
export function computeEyebrow(offer: Offer, now: Date = new Date()): string {
  if (!offer.dayCountEyebrow || !hasDeadline(offer)) return offer.eyebrow;
  const end = new Date(offer.deadline);
  const diffDays = Math.ceil((end.getTime() - now.getTime()) / 86_400_000);
  const weekday = end.toLocaleDateString("en-US", { weekday: "long", timeZone: "Asia/Dubai" });
  if (diffDays <= 0) return "Ends today";
  if (diffDays === 1) return `Ends ${weekday}, 1 day only`;
  return `Ends ${weekday}, ${diffDays} days only`;
}

/** True when the promotion window has closed. An offer with no deadline never
 *  expires — `new Date("")` is NaN, so the finite check below is false. */
export function isExpired(offer: { deadline: string }, now: Date = new Date()): boolean {
  const end = new Date(offer.deadline).getTime();
  return Number.isFinite(end) && now.getTime() > end;
}
