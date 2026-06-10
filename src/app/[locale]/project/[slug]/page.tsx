import { notFound } from "next/navigation";
import ProjectDetailClient from "@/app/_clients/project/[slug]/ProjectDetailClient";
import { getProject } from "@/lib/api";
import { applyTranslation } from "@/lib/applyTranslation";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { canonical as makeCanonical } from "@/lib/site";

export const revalidate = 1800;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const project = applyTranslation(await getProject(slug), locale);
  if (!project) return {
    title: "Not Found",
    robots: { index: false, follow: false },
    alternates: { canonical: makeCanonical(locale, `/project/${slug}`) },
  };
  const seo = project.seo || {};

  const priceStr = project.startingPrice
    ? ` | From ${project.currency || "AED"} ${project.startingPrice < 1_000 ? `${project.startingPrice}M` : (project.startingPrice / 1_000_000).toFixed(1) + "M"}`
    : "";
  const communityStr = project.community ? ` | ${project.community}` : "";
  const titleFallback = `${project.name}${priceStr}${communityStr} | Binayah`;
  const descFallback = `${project.name} is an off-plan project${project.community ? ` in ${project.community}` : ""} by ${project.developerName || "a leading developer"} in Dubai.${project.startingPrice ? ` Starting from AED ${(project.startingPrice < 1_000 ? project.startingPrice * 1_000_000 : project.startingPrice).toLocaleString("en-AE")}.` : ""} Explore floor plans, payment plans and availability.`;

  return {
    title: seo.metaTitle || titleFallback,
    description: seo.metaDescription || descFallback,
    alternates: {
      canonical: seo.canonicalUrl || `/${locale}/project/${slug}`,
    },
    openGraph: {
      title: seo.ogTitle || seo.metaTitle || titleFallback,
      description: seo.ogDescription || seo.metaDescription || descFallback,
      // opengraph-image.tsx serves the dynamic branded OG image (price/completion/photo overlay).
      type: "website",
      url: `/${locale}/project/${slug}`,
      locale: locale === "ar" ? "ar_AE" : locale === "ru" ? "ru_RU" : locale === "zh" ? "zh_CN" : locale === "vi" ? "vi_VN" : "en_AE",
    },
    twitter: {
      card: "summary_large_image",
      title: seo.twitterTitle || seo.metaTitle || titleFallback,
      description: seo.twitterDescription || seo.metaDescription || descFallback,
    },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const project = applyTranslation(await getProject(slug), locale);
  if (!project) return notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://binayah.ae";
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: project.name,
    description: project.shortOverview || project.overview || undefined,
    url: `${siteUrl}/${locale}/project/${slug}`,
    ...(project.featuredImage ? { image: [project.featuredImage] } : {}),
    ...(project.startingPrice ? {
      offers: {
        "@type": "Offer",
        price: project.startingPrice < 1_000 ? project.startingPrice * 1_000_000 : project.startingPrice,
        priceCurrency: project.currency || "AED",
        availability: "https://schema.org/PreOrder",
      },
    } : {}),
    address: {
      "@type": "PostalAddress",
      ...(project.community ? { addressLocality: project.community } : {}),
      addressRegion: project.city || "Dubai",
      addressCountry: "AE",
    },
    ...(project.developerName ? {
      author: {
        "@type": "Organization",
        name: project.developerName,
      },
    } : {}),
    ...(project.latitude && project.longitude ? {
      geo: {
        "@type": "GeoCoordinates",
        latitude: project.latitude,
        longitude: project.longitude,
      },
    } : {}),
    ...(Array.isArray(project.amenities) && project.amenities.length > 0 ? {
      amenityFeature: project.amenities.map((a: string) => ({
        "@type": "LocationFeatureSpecification",
        name: a,
        value: true,
      })),
    } : {}),
    ...(Array.isArray(project.unitTypes) && project.unitTypes.length > 0 ? {
      numberOfBedrooms: project.unitTypes.join(", "),
    } : {}),
    ...(project.unitSizeMin && project.unitSizeMax ? {
      floorSize: {
        "@type": "QuantitativeValue",
        minValue: project.unitSizeMin,
        maxValue: project.unitSizeMax,
        unitCode: project.unitSizeUnit === "sqm" ? "MTK" : "FTK",
      },
    } : {}),
    ...(project.videoUrl ? {
      video: {
        "@type": "VideoObject",
        name: `${project.name} – Project Video`,
        description: project.shortOverview || `Video overview of ${project.name} by ${project.developerName || "developer"} in ${project.community || project.city || "Dubai"}.`,
        thumbnailUrl: project.videoThumbnail || project.featuredImage,
        contentUrl: project.videoUrl,
        uploadDate: project.createdAt || new Date().toISOString(),
      },
    } : {}),
    ...(project.seo?.metaKeywords?.length ? {
      keywords: Array.isArray(project.seo.metaKeywords)
        ? project.seo.metaKeywords.join(", ")
        : project.seo.metaKeywords,
    } : {}),
  };

  const localePrefix = locale === "en" ? "" : `/${locale}`;
  const breadcrumbs = [
    { name: "Home", href: `${localePrefix}/` },
    { name: "Off-Plan", href: `${localePrefix}/off-plan` },
    { name: project.name, href: `${localePrefix}/project/${slug}` },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BreadcrumbJsonLd items={breadcrumbs} />
      <ProjectDetailClient serverProject={project} />
    </>
  );
}
