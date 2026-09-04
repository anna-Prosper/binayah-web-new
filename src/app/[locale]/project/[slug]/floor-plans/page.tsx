import { notFound } from "next/navigation";
import { canonical as makeCanonical, altLangs, OG_LOCALE } from "@/lib/site";
import { getProject } from "@/lib/api";
import { applyTranslation } from "@/lib/applyTranslation";
import { sanitizeDescriptions } from "@/lib/sanitize";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { getNonce } from "@/lib/nonce";
import { getCommunityStats } from "@/lib/market";
import { commIn, byDev, floorPlansMeta, crumbParents, leafLabel } from "@/lib/project-subpage-i18n";
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

  const name    = String(project.name || "Project");
  const comm    = project.community ? commIn(locale, String(project.community)) : "";
  const dev     = project.developerName ? byDev(locale, String(project.developerName)) : "";
  const unitStr = Array.isArray(project.unitTypes) && project.unitTypes.length
    ? project.unitTypes.join(", ")
    : "studio to penthouse";
  const { title, desc } = floorPlansMeta(locale, { name, comm, dev, unitStr });
  const path  = `/project/${slug}/floor-plans`;

  return {
    title,
    description: desc,
    // Always noindex: measured against the parent /project/{slug} this page is a
    // ~84-90% word-for-word duplicate — the parent already renders the floor-plan
    // section and the unit-size range, and everything unique here is template SEO
    // prose. `follow` keeps the internal links crawlable, and the canonical stays
    // SELF-referencing — a noindex page that canonicals elsewhere sends
    // contradictory signals.
    robots: { index: false, follow: true },
    alternates: { canonical: makeCanonical(locale, path), languages: altLangs(path) },
    openGraph:   {
      locale: OG_LOCALE[locale] ?? "en_AE", title, description: desc, url: makeCanonical(locale, path), type: "website" as const },
    twitter:     { card: "summary_large_image" as const, title, description: desc },
  };
}

export default async function FloorPlansPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const project = sanitizeDescriptions(applyTranslation(await getProject(slug), locale));
  if (!project) return notFound();
  const nonce = await getNonce();

  // Community PPSF → indicative price per layout in the floor-plans SEO copy.
  const seoStats = project.community ? await getCommunityStats(String(project.community)) : null;

  const status  = String(project.status || "").toLowerCase();
  const isRent  = /rent/i.test(status);
  const isReady = /ready|complet/i.test(status);
  const cp = crumbParents(locale);
  const parentLabel = isRent ? cp.rent : isReady ? cp.buy : cp.offplan;
  const parentHref  = isRent ? "/rent" : isReady ? "/buy" : "/off-plan";
  const lp = locale === "en" ? "" : `/${locale}`;

  const breadcrumbs = [
    { name: cp.home,                          href: `${lp}/` },
    { name: parentLabel,                      href: `${lp}${parentHref}` },
    { name: project.name,                     href: `${lp}/project/${slug}` },
    { name: leafLabel(locale, "floorPlans"),  href: `${lp}/project/${slug}/floor-plans` },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type":    "RealEstateListing",
    name:        `${project.name}, Floor Plans`,
    url:         `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.binayah.ae"}/${locale}/project/${slug}/floor-plans`,
    description: `Floor plans and unit configurations for ${project.name}`,
    address: {
      "@type":        "PostalAddress",
      ...(project.community ? { addressLocality: project.community } : {}),
      addressRegion:  project.city || "Dubai",
      addressCountry: "AE",
    },
    ...(project.unitSizeMin ? {
      floorSize: {
        "@type":   "QuantitativeValue",
        minValue:  project.unitSizeMin,
        maxValue:  project.unitSizeMax,
        unitCode:  "FTK",
      },
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
      <ProjectDetailClient serverProject={project} defaultTab="floor-plans" seoStats={seoStats} />
    </>
  );
}
