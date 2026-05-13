import { notFound } from "next/navigation";
import ProjectDetailClient from "@/app/project/[slug]/ProjectDetailClient";
import { getProject } from "@/lib/api";
import { applyTranslation } from "@/lib/applyTranslation";

export const revalidate = 1800;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const project = applyTranslation(await getProject(slug), locale);
  if (!project) return { title: "Not Found" };
  const seo = project.seo || {};

  const priceStr = project.startingPrice
    ? ` | From ${project.currency || "AED"} ${project.startingPrice < 1_000 ? `${project.startingPrice}M` : (project.startingPrice / 1_000_000).toFixed(1) + "M"}`
    : "";
  const communityStr = project.community ? ` | ${project.community}` : "";
  const titleFallback = `${project.name}${priceStr}${communityStr} | Binayah`;
  const descFallback = project.shortOverview ||
    `${project.name} is an off-plan project${project.community ? ` in ${project.community}` : ""} by ${project.developerName || "a leading developer"} in Dubai.${project.startingPrice ? ` Starting from ${project.currency || "AED"} ${(project.startingPrice / 1_000_000).toFixed(1)}M.` : ""} Explore floor plans, payment plans and availability.`;

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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: project.name,
    description: project.shortOverview || project.overview || undefined,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://binayah.ae"}/${locale}/project/${slug}`,
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
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProjectDetailClient serverProject={project} />
    </>
  );
}
