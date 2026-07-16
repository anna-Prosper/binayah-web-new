import { notFound } from "next/navigation";
import { canonical as makeCanonical, altLangs } from "@/lib/site";
import { getProject } from "@/lib/api";
import { applyTranslation } from "@/lib/applyTranslation";
import { sanitizeDescriptions } from "@/lib/sanitize";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { getNonce } from "@/lib/nonce";
import { commIn, byDev, downPay, paymentPlanMeta, crumbParents, leafLabel } from "@/lib/project-subpage-i18n";
import ProjectDetailClient from "@/app/_clients/project/[slug]/ProjectDetailClient";

export const revalidate = 1800;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const project = sanitizeDescriptions(applyTranslation(await getProject(slug), locale));
  if (!project) notFound();

  const name = String(project.name || "Project");
  const comm = project.community ? commIn(locale, String(project.community)) : "";
  const dev  = project.developerName ? byDev(locale, String(project.developerName)) : "";
  const dp   = project.downPayment ? downPay(locale, project.downPayment) : "";
  const { title, desc } = paymentPlanMeta(locale, { name, comm, dev, dp });
  const path  = `/project/${slug}/payment-plan`;

  // Only index when the project has a real payment plan (details/steps/summary).
  // Otherwise the page is generic boilerplate — crawlable (follow) but noindex.
  const hasContent = !!(
    project.paymentPlanDetails ||
    (Array.isArray(project.paymentPlanSteps) && project.paymentPlanSteps.length > 0) ||
    (project.paymentPlanSummary && project.paymentPlanSummary !== "TBA")
  );

  return {
    title,
    description: desc,
    alternates: hasContent
      ? { canonical: makeCanonical(locale, path), languages: altLangs(path) }
      : { canonical: makeCanonical(locale, `/project/${slug}`) },
    openGraph:   { title, description: desc, url: makeCanonical(locale, path), type: "website" as const },
    twitter:     { card: "summary_large_image" as const, title, description: desc },
  };
}

export default async function PaymentPlanPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const project = sanitizeDescriptions(applyTranslation(await getProject(slug), locale));
  if (!project) return notFound();
  const nonce = await getNonce();

  const status  = String(project.status || "").toLowerCase();
  const isRent  = /rent/i.test(status);
  const isReady = /ready|complet/i.test(status);
  const cp = crumbParents(locale);
  const parentLabel = isRent ? cp.rent : isReady ? cp.buy : cp.offplan;
  const parentHref  = isRent ? "/rent" : isReady ? "/buy" : "/off-plan";
  const lp = locale === "en" ? "" : `/${locale}`;

  const breadcrumbs = [
    { name: cp.home,                           href: `${lp}/` },
    { name: parentLabel,                       href: `${lp}${parentHref}` },
    { name: project.name,                      href: `${lp}/project/${slug}` },
    { name: leafLabel(locale, "paymentPlan"),  href: `${lp}/project/${slug}/payment-plan` },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type":    "RealEstateListing",
    name:        `${project.name}, Payment Plan`,
    url:         `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.binayah.ae"}/${locale}/project/${slug}/payment-plan`,
    description: `Payment plan details for ${project.name}`,
    address: {
      "@type":        "PostalAddress",
      ...(project.community ? { addressLocality: project.community } : {}),
      addressRegion:  project.city || "Dubai",
      addressCountry: "AE",
    },
    ...(project.startingPrice ? {
      offers: {
        "@type":        "Offer",
        price:          project.startingPrice < 1_000 ? project.startingPrice * 1_000_000 : project.startingPrice,
        priceCurrency:  project.currency || "AED",
        availability:   "https://schema.org/PreOrder",
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
      <ProjectDetailClient serverProject={project} defaultTab="payment" />
    </>
  );
}
