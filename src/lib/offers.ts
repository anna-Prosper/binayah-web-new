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
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  /** 3–4 headline numbers rendered as the stat band under the hero. */
  highlights: OfferHighlight[];
  /** Payment-plan breakdown rendered as a horizontal timeline. Omit entirely
   *  to drop the section — some offers are better told without a staged rail. */
  timeline?: OfferTimelineStep[];
  /** Lead-in under the timeline heading. The default describes a front-loaded
   *  plan, which is wrong for an even split, so any non-20:80 structure should
   *  set its own. */
  timelineIntro?: string;
  /** "The offer in detail" bullet rows. */
  eligibility: OfferEligibility[];
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
    slug: "sobha-20-80-payment-plan",
    shortName: "Sobha 20:80",
    developer: "Sobha Realty",
    eyebrow: "Sobha payment plan",
    h1: "Sobha 20:80 Payment Plan: Pay 20% Now, 80% on Handover",
    subtitle:
      "Secure a Sobha home for a fifth of its value today and defer the balance until you collect the keys — with the 4% DLD registration fee waived.",
    heroImage:
      "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/offers/sobha-20-80-payment-plan-hero.webp",
    // Placeholder window — update both fields when the promotion actually runs.
    deadline: "2026-09-30T23:59:59+04:00",
    windowLabel: "Ends 30 September 2026",
    hideDeadline: true,
    metaTitle: "Sobha 20:80 Payment Plan | 20% Now, 80% on Handover + 4% DLD Waiver",
    metaDescription:
      "Pay 20% now and 80% on handover on selected Sobha homes above AED 5M, with the 4% DLD fee waived and 20% NOC on resale. Check which units qualify.",
    keywords:
      "Sobha 20:80 payment plan, Sobha 80 20 payment plan, Sobha Realty offer, DLD waiver Dubai, post-handover payment plan Dubai, Sobha Sanctuary villas, off-plan payment plan Dubai, Dubai property offer",
    highlights: [
      { value: "20%", label: "Payable now", detail: "Booking plus early instalments" },
      { value: "80%", label: "On handover", detail: "Deferred until you take possession" },
      { value: "4%", label: "DLD fee waived", detail: "Worth AED 200,000 on a AED 5M home" },
      { value: "20%", label: "NOC on resale", detail: "On selected promotional units" },
    ],
    eligibility: [
      { label: "Eligible price band", value: "Properties from AED 5 million" },
      { label: "Property types", value: "Villas, twin-villas and larger apartments" },
      { label: "Included incentives", value: "4% DLD waiver + 20% NOC on resale" },
      { label: "Availability", value: "Selected promotional units, subject to live inventory" },
    ],
    valueProps: [
      [
        "A materially lower entry point",
        "A typical construction-linked plan asks for 40–60% before you ever hold the keys. Collapsing that into 20% upfront changes what you need liquid on day one, and keeps the rest of your capital working elsewhere until completion.",
      ],
      [
        "The DLD waiver is real money",
        "Dubai Land Department registration is normally 4% of the purchase price, payable at the point of sale. At the AED 5M eligibility floor that waiver is worth roughly AED 200,000 — and it scales with the value of the home.",
      ],
      [
        "Flexibility if your plans change",
        "The 20% NOC on resale for selected units makes it easier to reposition the asset before completion, rather than being locked in until handover.",
      ],
    ],
    bodyParagraphs: [
      "A 20:80 plan is one of the most buyer-friendly structures in off-plan real estate. Instead of spreading payments across a long ladder of construction milestones, it front-loads a single 20% commitment and pushes the remaining balance to completion.",
      "That distinction matters most at the premium end of the market. On a AED 5 million home, a conventional plan can require well over AED 2 million before handover. Under this structure the same purchase opens at AED 1 million, with the 4% DLD fee — normally another AED 200,000 — waived entirely.",
      "It is worth separating this promotion from Sobha's standard lineup. The developer also runs everyday possession-linked plans, including 20:80 and 40:60 structures, on selected advanced-construction projects. What defines this offer is the combination of the deferred structure, the fee waiver and the resale NOC on qualifying units.",
      "Eligible inventory is limited and specific qualifying units depend on live availability, so the practical first step is confirming which homes qualify.",
    ],
    worked: {
      heading: "What this looks like on a AED 5M home",
      rows: [
        ["Purchase price", "AED 5,000,000"],
        ["Payable now (20%)", "AED 1,000,000"],
        ["Deferred to handover (80%)", "AED 4,000,000"],
        ["DLD registration fee (4%)", "AED 200,000 — waived"],
        ["Effective day-one outlay", "AED 1,000,000"],
      ],
      footnote:
        "Illustrative only. Figures exclude agency, trustee and mortgage-registration costs where applicable.",
    },
    faqs: [
      {
        question: "What exactly is the Sobha 20:80 payment plan?",
        answer:
          "You pay 20% of the purchase price upfront — booking plus early instalments, typically within 90 days of reservation — and the remaining 80% only when the property is completed and ready for handover. There are no construction-linked instalments in between.",
      },
      {
        question: "Which properties qualify for this offer?",
        answer:
          "Selected Sobha homes priced from AED 5 million, spanning villas, twin-villas and larger apartments. Qualifying units depend on live inventory, so availability should be confirmed before you commit.",
      },
      {
        question: "How much is the 4% DLD waiver actually worth?",
        answer:
          "The Dubai Land Department charges 4% of the purchase price to register a transfer. On a AED 5 million property that is AED 200,000, and it scales proportionally on higher-value homes. Under this promotion that fee is waived on qualifying units.",
      },
      {
        question: "Can I resell before handover?",
        answer:
          "Selected promotional units include a 20% NOC on resale, which makes it easier to transfer the property before completion. The specific terms depend on the unit and the developer's approval.",
      },
      {
        question: "Is this the same as Sobha's standard payment plans?",
        answer:
          "No. Sobha runs standard possession-linked plans, including 20:80 and 40:60 structures, on selected projects year-round. This is a separate time-limited promotion that pairs the deferred structure with the DLD waiver and resale NOC.",
      },
      {
        question: "Is the 20:80 plan available on every Sobha property?",
        answer:
          "No. It applies to selected units above AED 5 million, subject to availability and developer approval. Send us your budget and we will confirm which homes currently qualify.",
      },
    ],
    disclaimer:
      "Terms are set by the developer and apply to selected units only, subject to availability and developer approval. Figures shown are illustrative and do not constitute financial advice or an offer to sell. Confirm all terms in writing before committing. Binayah Properties is a licensed Dubai brokerage.",
  },
];

export function getOffer(slug: string): Offer | undefined {
  return OFFERS.find((o) => o.slug === slug);
}

/** Shown when an offer has no published end date. */
export const DEFAULT_WINDOW_LABEL = "Limited time offer";

/** True when this offer has a real, parseable end date. */
export function hasDeadline(offer: { deadline?: string }): boolean {
  return Number.isFinite(new Date(offer.deadline ?? "").getTime());
}

/** True when the promotion window has closed. An offer with no deadline never
 *  expires — `new Date("")` is NaN, so the finite check below is false. */
export function isExpired(offer: { deadline: string }, now: Date = new Date()): boolean {
  const end = new Date(offer.deadline).getTime();
  return Number.isFinite(end) && now.getTime() > end;
}
