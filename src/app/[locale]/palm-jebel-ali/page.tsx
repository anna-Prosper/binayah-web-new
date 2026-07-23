import type { Metadata } from "next";
import { BreadcrumbJsonLd, FAQJsonLd } from "@/components/JsonLd";
import { canonical as makeCanonical, altLangs, OG_LOCALE } from "@/lib/site";
import { getNonce } from "@/lib/nonce";
import PalmJebelAliClient from "@/app/_clients/palm-jebel-ali/PalmJebelAliClient";

export const revalidate = 86400;

const OG_IMG = "https://binayah-media-456051253184-us-east-1-an.s3.us-east-1.amazonaws.com/showcase-images/palm-jebel-ali/hero-aerial.png";

const META_TITLE = "Palm Jebel Ali | Nakheel's Second Palm Island, Villas from AED 18.5M | Binayah";
const META_DESC =
  "Palm Jebel Ali by Nakheel: 16 fronds, 110km of new coastline, twice the size of Palm Jumeirah. Beachfront villas from AED 18.5M, Palm Central apartments from AED 2.7M. 80/20 payment plan. Off-plan access via Binayah Properties.";

// English-only showcase, not translated content, so we don't advertise
// hreflang alternates for locales that would just re-serve this same English copy.
const NON_EN_LOCALES = ["ru", "ar", "zh", "vi", "he", "fr"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: META_TITLE,
    description: META_DESC,
    alternates: {
      canonical: makeCanonical(locale, "/palm-jebel-ali"),
      languages: altLangs("/palm-jebel-ali", NON_EN_LOCALES),
    },
    openGraph: {
      locale: OG_LOCALE[locale] ?? "en_AE",
      title: META_TITLE,
      description: META_DESC,
      type: "website",
      url: makeCanonical(locale, "/palm-jebel-ali"),
      siteName: "Binayah Properties",
      images: [{ url: OG_IMG, width: 1344, height: 768, alt: "Aerial view of Palm Jebel Ali, Dubai's second palm island" }],
    },
    twitter: {
      card: "summary_large_image",
      title: META_TITLE,
      description: META_DESC,
      images: [OG_IMG],
    },
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  };
}

const SCHEMA_ARTICLE = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Palm Jebel Ali, Nakheel's Second Palm Island Guide",
  description: META_DESC,
  image: OG_IMG,
  author: { "@type": "Organization", name: "Binayah Properties", url: "https://www.binayah.ae" },
  publisher: {
    "@type": "Organization",
    name: "Binayah Properties",
    logo: { "@type": "ImageObject", url: "https://www.binayah.ae/assets/binayah-logo.svg" },
  },
  datePublished: "2026-07-23",
  dateModified: "2026-07-23",
};

const FAQS_FOR_SCHEMA = [
  {
    question: "What is Palm Jebel Ali?",
    answer:
      "A new palm-shaped island development by Nakheel off Dubai's southern coast, roughly twice the size of Palm Jumeirah, comprising 16 fronds across 7 islands.",
  },
  {
    question: "How much does it cost to buy at Palm Jebel Ali?",
    answer:
      "Beachfront villas start from AED 18.5 million; apartments and townhouses at Palm Central start from AED 2.7 million, depending on release phase and unit.",
  },
  {
    question: "What is the payment plan?",
    answer:
      "Launch inventory has typically followed an 80/20 structure, 20% on booking, 60% during construction, 20% on handover, though terms vary by release.",
  },
  {
    question: "When is handover?",
    answer:
      "Villas are phased in across multiple fronds under active construction. Palm Central apartments and townhouses are scheduled from 2028, with later phases through 2030.",
  },
  {
    question: "Is Palm Jebel Ali really bigger than Palm Jumeirah?",
    answer: "Yes, the master plan is roughly double the footprint, adding around 110km of new coastline to Dubai.",
  },
  {
    question: "Can foreign buyers own freehold here?",
    answer:
      "Yes, Palm Jebel Ali falls within Dubai's designated freehold zones, open to foreign ownership like Palm Jumeirah and other Nakheel master communities.",
  },
];

export default async function PalmJebelAliPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const nonce = await getNonce();
  const localePrefix = locale === "en" ? "" : `/${locale}`;

  const breadcrumbs = [
    { name: "Home", href: `${localePrefix}/` },
    { name: "Areas", href: `${localePrefix}/areas` },
    { name: "Palm Jebel Ali", href: `${localePrefix}/palm-jebel-ali` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA_ARTICLE).replace(/</g, "\\u003c") }}
      />
      <BreadcrumbJsonLd items={breadcrumbs} nonce={nonce} />
      <FAQJsonLd faqs={FAQS_FOR_SCHEMA} nonce={nonce} />
      <PalmJebelAliClient />
    </>
  );
}
