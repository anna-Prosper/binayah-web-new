import { notFound } from "next/navigation";
import { canonical as makeCanonical, altLangs, OG_LOCALE } from "@/lib/site";
import { getProject } from "@/lib/api";
import { applyTranslation } from "@/lib/applyTranslation";
import { sanitizeDescriptions } from "@/lib/sanitize";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { getNonce } from "@/lib/nonce";
import { getCommunityStats } from "@/lib/market";
import { commIn, byDev, locationMeta, crumbParents, leafLabel } from "@/lib/project-subpage-i18n";
import ProjectDetailClient from "@/app/_clients/project/[slug]/ProjectDetailClient";

export const revalidate = 1800;

// Opt into ISR. Without generateStaticParams a [slug] route is fully dynamic
// (private, no-store) regardless of `revalidate` — so every crawl hit was a
// cold, uncached render + live API fetch (~1.5-2s TTFB). Returning [] prerenders
// nothing at build while making every slug ISR-cached on-demand, matching the
// parent /project/[slug]/page.tsx.
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const project = sanitizeDescriptions(applyTranslation(await getProject(slug), locale));
  if (!project) notFound();

  const name = String(project.name || "Project");
  const comm = project.community ? commIn(locale, String(project.community)) : "";
  const dev  = project.developerName ? byDev(locale, String(project.developerName)) : "";
  const area = String(project.community || project.city || "Dubai");
  const { title, desc } = locationMeta(locale, { name, comm, dev, area });
  const path  = `/project/${slug}/location`;

  // Only index when there's a real location write-up. Otherwise the page is
  // generic template prose + market boilerplate — crawlable (follow) but noindex.
  const hasContent = !!(
    (project.locationDescription && String(project.locationDescription).trim()) ||
    (Array.isArray(project.nearbyAttractions) && project.nearbyAttractions.length > 0)
  );

  return {
    title,
    description: desc,
    alternates: hasContent
      ? { canonical: makeCanonical(locale, path), languages: altLangs(path) }
      : { canonical: makeCanonical(locale, `/project/${slug}`) },
    openGraph:   {
      locale: OG_LOCALE[locale] ?? "en_AE", title, description: desc, url: makeCanonical(locale, path), type: "website" as const },
    twitter:     { card: "summary_large_image" as const, title, description: desc },
  };
}

export default async function LocationPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const project = sanitizeDescriptions(applyTranslation(await getProject(slug), locale));
  if (!project) return notFound();
  const nonce = await getNonce();

  // Real community market stats (avg PPSF / yield) enrich the location SEO copy.
  const seoStats = project.community ? await getCommunityStats(String(project.community)) : null;

  const status  = String(project.status || "").toLowerCase();
  const isRent  = /rent/i.test(status);
  const isReady = /ready|complet/i.test(status);
  const cp = crumbParents(locale);
  const parentLabel = isRent ? cp.rent : isReady ? cp.buy : cp.offplan;
  const parentHref  = isRent ? "/rent" : isReady ? "/buy" : "/off-plan";
  const lp = locale === "en" ? "" : `/${locale}`;

  const breadcrumbs = [
    { name: cp.home,                        href: `${lp}/` },
    { name: parentLabel,                    href: `${lp}${parentHref}` },
    { name: project.name,                   href: `${lp}/project/${slug}` },
    { name: leafLabel(locale, "location"),  href: `${lp}/project/${slug}/location` },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type":    "RealEstateListing",
    name:        `${project.name}, Location`,
    url:         `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.binayah.ae"}/${locale}/project/${slug}/location`,
    description: `Location and neighbourhood guide for ${project.name}`,
    address: {
      "@type":        "PostalAddress",
      ...(project.community ? { addressLocality: project.community } : {}),
      addressRegion:  project.city || "Dubai",
      addressCountry: "AE",
    },
    ...(project.latitude && project.longitude ? {
      geo: { "@type": "GeoCoordinates", latitude: project.latitude, longitude: project.longitude },
    } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <BreadcrumbJsonLd items={breadcrumbs} />
      <ProjectDetailClient serverProject={project} defaultTab="location" seoStats={seoStats} />
    </>
  );
}
