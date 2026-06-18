import { notFound } from "next/navigation";
import { canonical as makeCanonical, altLangs } from "@/lib/site";
import { getProject } from "@/lib/api";
import { applyTranslation } from "@/lib/applyTranslation";
import { sanitizeDescriptions } from "@/lib/sanitize";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { getNonce } from "@/lib/nonce";
import ProjectDetailClient from "@/app/_clients/project/[slug]/ProjectDetailClient";

export const revalidate = 1800;

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const project = sanitizeDescriptions(applyTranslation(await getProject(slug), locale));
  if (!project) notFound();

  const name = String(project.name || "Project");
  const comm = project.community ? ` in ${project.community}` : "";
  const dev  = project.developerName ? ` by ${project.developerName}` : "";
  const dp   = project.downPayment ? ` with ${project.downPayment}% down payment` : "";
  const title = `${name} Payment Plan${comm} | Binayah`;
  const desc  = `View the full payment plan for ${name}${dev}${comm}${dp}. Milestone breakdown, starting price, DLD fees and buyer costs for this Dubai off-plan project.`;
  const path  = `/project/${slug}/payment-plan`;

  return {
    title,
    description: desc,
    alternates:  { canonical: makeCanonical(locale, path), languages: altLangs(path) },
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
  const parentLabel = isRent ? "Rent" : isReady ? "Buy" : "Off-Plan";
  const parentHref  = isRent ? "/rent" : isReady ? "/buy" : "/off-plan";
  const lp = locale === "en" ? "" : `/${locale}`;

  const breadcrumbs = [
    { name: "Home",          href: `${lp}/` },
    { name: parentLabel,     href: `${lp}${parentHref}` },
    { name: project.name,    href: `${lp}/project/${slug}` },
    { name: "Payment Plan",  href: `${lp}/project/${slug}/payment-plan` },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type":    "RealEstateListing",
    name:        `${project.name} — Payment Plan`,
    url:         `${process.env.NEXT_PUBLIC_SITE_URL || "https://binayah.ae"}/${locale}/project/${slug}/payment-plan`,
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
