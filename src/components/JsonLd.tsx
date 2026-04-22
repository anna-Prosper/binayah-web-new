export function OrganizationJsonLd({ nonce }: { nonce?: string }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Binayah Properties",
    alternateName: "Binayah Real Estate",
    url: "https://binayah.com",
    logo: "https://binayah.com/assets/binayah-logo.png",
    image: "https://binayah.com/assets/dubai-hero.webp",
    description:
      "Dubai's trusted property partner. Find luxury homes, off-plan investments, and expert property management services.",
    telephone: "+971549988811",
    email: "info@binayah.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Marasi Drive",
      addressLocality: "Business Bay",
      addressRegion: "Dubai",
      addressCountry: "AE",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 25.1855,
      longitude: 55.2628,
    },
    sameAs: [
      "https://www.instagram.com/binayahproperties/",
      "https://www.facebook.com/binayahproperties",
      "https://www.youtube.com/@binayahproperties",
      "https://www.linkedin.com/company/binayah-properties",
    ],
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "09:00",
      closes: "21:00",
    },
    priceRange: "AED 500,000 - AED 50,000,000+",
    areaServed: {
      "@type": "City",
      name: "Dubai",
      addressCountry: "AE",
    },
  };

  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
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
      item: `https://binayah.com${item.href}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function ReviewJsonLd({
  reviews,
  nonce,
}: {
  reviews: { author: string; reviewBody: string; ratingValue: number }[];
  nonce?: string;
}) {
  const avg =
    reviews.reduce((sum, r) => sum + r.ratingValue, 0) / reviews.length;

  const data = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Binayah Properties",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: avg.toFixed(1),
      bestRating: "5",
      ratingCount: reviews.length.toString(),
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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
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
    url: `https://binayah.com${url}`,
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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
