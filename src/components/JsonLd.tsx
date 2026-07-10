// JSON.stringify does not escape </script> sequences, which can break out of the
// script tag if a DB field contains that string. Replace < to be safe.
function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function ArticleJsonLd({
  headline,
  description,
  url,
  imageUrl,
  datePublished,
  dateModified,
  authorName = "Binayah Properties",
  wordCount,
  locale = "en",
  nonce,
}: {
  headline: string;
  description: string;
  url: string;
  imageUrl?: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
  wordCount?: number;
  locale?: string;
  nonce?: string;
}) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@type": "Organization", name: authorName, url: "https://www.binayah.ae" },
    publisher: {
      "@type": "Organization",
      name: "Binayah Properties",
      url: "https://www.binayah.ae",
      logo: { "@type": "ImageObject", url: "https://www.binayah.ae/assets/binayah-logo.png" },
    },
    datePublished,
    dateModified: dateModified ?? datePublished,
    ...(imageUrl ? { image: { "@type": "ImageObject", url: imageUrl } } : {}),
    ...(wordCount ? { wordCount } : {}),
    inLanguage: locale,
    isPartOf: { "@type": "WebSite", name: "Binayah Properties", url: "https://www.binayah.ae" },
  };

  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  );
}

export function OrganizationJsonLd({ nonce }: { nonce?: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": ["RealEstateAgent", "LocalBusiness"],
    name: "Binayah Properties",
    alternateName: "Binayah Real Estate",
    url: "https://www.binayah.ae",
    logo: "https://www.binayah.ae/assets/binayah-logo.png",
    image: "https://www.binayah.ae/assets/dubai-hero.webp",
    description:
      "Dubai's trusted property partner since 2007. Find luxury homes, off-plan investments, and expert property management services.",
    telephone: "+971549988811",
    email: "info@binayah.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Mezzanine Floor, Liberty Building, Al Quoz 3, Sheikh Zayed Road",
      addressLocality: "Al Quoz",
      addressRegion: "Dubai",
      addressCountry: "AE",
    },
    geo: {
      "@type": "GeoCoordinates",
      // Approximate — Liberty Building, Al Quoz 3, Sheikh Zayed Road. Verify pin.
      latitude: 25.1466,
      longitude: 55.2295,
    },
    foundingDate: "2007",
    numberOfEmployees: { "@type": "QuantitativeValue", value: 50 },
    sameAs: [
      "https://www.instagram.com/dubai_realty",
      "https://www.facebook.com/BinayahRealEstateLLC",
      "https://www.youtube.com/@binayahproperties",
      "https://www.linkedin.com/company/binayah-real-estate",
      "https://binayah.ru",
    ],
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "09:00",
      closes: "21:00",
    },
    priceRange: "AED 500,000 - AED 50,000,000+",
    areaServed: [
      { "@type": "City", name: "Dubai", addressCountry: "AE" },
      { "@type": "City", name: "Abu Dhabi", addressCountry: "AE" },
    ],
    // E-E-A-T signals for a YMYL (real-estate) entity: regulatory credential,
    // legal identity, expertise topics and a multilingual contact point.
    legalName: "Binayah Properties L.L.C",
    slogan: "Dubai's trusted property partner since 2007",
    foundingLocation: { "@type": "Place", name: "Dubai, United Arab Emirates" },
    knowsAbout: [
      "Dubai real estate",
      "Off-plan property investment",
      "Property management",
      "Dubai Land Department transactions",
      "Golden Visa",
      "Freehold property in Dubai",
      "Buy-to-let rental yields",
    ],
    // RERA broker registration (ORN) — the Dubai regulator's authorisation to
    // broker property. A core trust signal for a Dubai real-estate agency.
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "RERA Broker Registration (ORN)",
      identifier: "1162",
      recognizedBy: {
        "@type": "GovernmentOrganization",
        name: "Dubai Land Department — Real Estate Regulatory Agency (RERA)",
      },
    },
    identifier: { "@type": "PropertyValue", propertyID: "RERA ORN", value: "1162" },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+971549988811",
      contactType: "sales",
      areaServed: "AE",
      availableLanguage: ["English", "Arabic", "Russian", "French", "Chinese"],
    },
    hasMap: "https://maps.google.com/?q=Liberty+Building+Al+Quoz+3+Sheikh+Zayed+Road+Dubai",
  };

  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  );
}

export function WebSiteJsonLd({ nonce }: { nonce?: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Binayah Properties",
    alternateName: "Binayah Real Estate",
    url: "https://www.binayah.ae",
    // Enables Google's sitelinks search box for brand queries.
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://www.binayah.ae/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  );
}

export function BreadcrumbJsonLd({ items, nonce }: { items: { name: string; href: string }[]; nonce?: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.binayah.ae"}${item.href}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  );
}

export function FAQJsonLd({ faqs, nonce }: { faqs: { question: string; answer: string }[]; nonce?: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  );
}

export function ReviewJsonLd({
  reviews,
  nonce,
  overallRating,
  ratingCount,
}: {
  reviews: { author: string; reviewBody: string; ratingValue: number }[];
  nonce?: string;
  /** Real profile average (e.g. Google's 4.4) — preferred over the sampled avg. */
  overallRating?: number;
  /** Real total review count (e.g. Google's 149) — preferred over reviews.length. */
  ratingCount?: number;
}) {
  const avg =
    reviews.reduce((sum, r) => sum + r.ratingValue, 0) / reviews.length;

  const data = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Binayah Properties",
    // Same url as the main Organization node so Google consolidates the entity.
    url: "https://www.binayah.ae",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: (overallRating && overallRating > 0 ? overallRating : avg).toFixed(1),
      bestRating: "5",
      ratingCount: (ratingCount && ratingCount > 0 ? ratingCount : reviews.length).toString(),
    },
    review: reviews.map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.author },
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.ratingValue.toString(),
        bestRating: "5",
      },
      reviewBody: r.reviewBody,
    })),
  };

  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  );
}

/**
 * CollectionPage + ItemList for listing/landing pages (off-plan, buy, rent,
 * communities, type pages). Tells Google the page is a curated collection and
 * exposes the individual items as a structured, ordered list.
 */
export function CollectionPageJsonLd({
  name,
  description,
  url,
  items,
  nonce,
}: {
  name: string;
  description?: string;
  url: string;
  items: { url: string; name: string }[];
  nonce?: string;
}) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://www.binayah.ae";
  const abs = (u: string) => (u.startsWith("http") ? u : `${base}${u}`);
  if (!items || items.length === 0) return null;

  const data = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    ...(description ? { description } : {}),
    url: abs(url),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((it, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: abs(it.url),
        name: it.name,
      })),
    },
  };

  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  );
}

export function RealEstateListingJsonLd({
  name,
  description,
  image,
  price,
  currency = "AED",
  url,
  address,
  bedrooms,
  bathrooms,
  size,
  nonce,
}: {
  name: string;
  description: string;
  image: string;
  price: number;
  currency?: string;
  url: string;
  address: string;
  bedrooms?: number;
  bathrooms?: number;
  size?: number;
  nonce?: string;
}) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name,
    description,
    image,
    url: `https://www.binayah.ae${url}`,
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: currency,
      availability: "https://schema.org/InStock",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: address,
      addressRegion: "Dubai",
      addressCountry: "AE",
    },
  };

  if (bedrooms) data.numberOfRooms = bedrooms;
  if (bathrooms) data.numberOfBathroomsTotal = bathrooms;
  if (size) {
    data.floorSize = {
      "@type": "QuantitativeValue",
      value: size,
      unitCode: "FTK",
    };
  }

  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  );
}

// ── Agent Person schema ───────────────────────────────────────────────────
export function PersonJsonLd({
  name,
  url,
  jobTitle,
  image,
  email,
  telephone,
  description,
  languages,
  brn,
  sameAs,
  nonce,
}: {
  name: string;
  url: string;
  jobTitle?: string;
  image?: string;
  email?: string;
  telephone?: string;
  description?: string;
  languages?: string[];
  /** Real RERA Broker Registration Number, omitted when placeholder/blank. */
  brn?: string;
  sameAs?: string[];
  nonce?: string;
}) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    // An individual agent is a Person who works for the RealEstateAgent agency.
    "@type": "Person",
    "@id": `${url}#person`,
    name,
    url,
    worksFor: {
      "@type": "RealEstateAgent",
      name: "Binayah Properties",
      url: "https://www.binayah.ae",
    },
  };
  if (jobTitle) data.jobTitle = jobTitle;
  if (image) data.image = image;
  if (email) data.email = email;
  if (telephone) data.telephone = telephone;
  if (description) data.description = description;
  if (languages && languages.length) data.knowsLanguage = languages;
  if (sameAs && sameAs.length) data.sameAs = sameAs;
  if (brn) {
    data.hasCredential = {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "RERA Broker Registration (BRN)",
      identifier: brn,
      recognizedBy: {
        "@type": "GovernmentOrganization",
        name: "Dubai Land Department — Real Estate Regulatory Agency (RERA)",
      },
    };
    data.identifier = { "@type": "PropertyValue", propertyID: "RERA BRN", value: brn };
  }

  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  );
}
