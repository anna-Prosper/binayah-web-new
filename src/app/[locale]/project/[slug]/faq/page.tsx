import { notFound } from "next/navigation";
import { canonical as makeCanonical, altLangs, OG_LOCALE } from "@/lib/site";
import { getProject } from "@/lib/api";
import { applyTranslation } from "@/lib/applyTranslation";
import { sanitizeDescriptions } from "@/lib/sanitize";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { getNonce } from "@/lib/nonce";
import { commIn, byDev, faqMeta, crumbParents, leafLabel } from "@/lib/project-subpage-i18n";
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

  const name  = String(project.name || "Project");
  const comm  = project.community ? commIn(locale, String(project.community)) : "";
  const dev   = project.developerName ? byDev(locale, String(project.developerName)) : "";
  const { title, desc } = faqMeta(locale, { name, comm, dev });
  const path  = `/project/${slug}/faq`;

  // Only index when the project has real DB FAQs. Otherwise the page is the
  // generic fallback Q&A (boilerplate shared across projects) — keep it
  // crawlable (follow) but out of the index, like the [searchSlug] matrix.
  const hasContent = ((project.faqs as Array<{ question?: string }> | null) || []).some(f => f?.question?.trim());

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

export default async function FaqPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
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

  // Mirror the FAQ logic from ProjectDetailClient so JSON-LD matches what's rendered
  const dbFaqs = ((project.faqs as Array<{ question: string; answer: string }> | null) || []).filter(f => f.question?.trim());
  const faqs = dbFaqs.length > 0 ? dbFaqs : [
    { question: `What is the starting price of ${project.name}?`, answer: project.startingPrice ? `${project.name} starts from ${project.currency || "AED"} ${(project.startingPrice < 1_000 ? project.startingPrice * 1_000_000 : project.startingPrice).toLocaleString("en-AE")}. Prices vary by unit type and floor. Contact us for the latest pricing and availability.` : `Please contact our team for the current pricing of ${project.name}. We'll share the latest price list and available units.` },
    { question: `What floor plans are available at ${project.name}?`, answer: `${project.name} offers ${Array.isArray(project.unitTypes) && project.unitTypes.length > 0 ? project.unitTypes.join(", ") : "a range of unit types"}. Detailed floor plans with dimensions are available on request, contact us via WhatsApp or the inquiry form above.` },
    { question: `Who is the developer of ${project.name}?`, answer: project.developerName ? `${project.name} is developed by ${project.developerName}, a leading real estate developer in Dubai.` : `Please contact our team for developer information about ${project.name}.` },
    { question: `When is the handover date for ${project.name}?`, answer: project.completionDate ? `The expected handover date for ${project.name} is ${project.completionDate}. Timelines are subject to construction progress and regulatory approvals.` : `Please contact our team for the latest handover timeline for ${project.name}.` },
    { question: `What is the payment plan for ${project.name}?`, answer: project.paymentPlanSummary && project.paymentPlanSummary !== "TBA" ? project.paymentPlanSummary : `${project.name} offers a flexible payment plan designed for both end-users and investors, typically including a down payment on booking, installments during construction, and the balance on handover. Contact us for the full schedule.` },
    { question: `Is ${project.name} eligible for UAE Golden Visa?`, answer: `Yes, purchasing a property at ${project.name} valued at AED 2 million or above qualifies for the UAE Golden Visa, granting 10-year renewable residency. Our team can guide you through the application process.` },
    { question: `Where is ${project.name} located?`, answer: project.community ? `${project.name} is located in ${project.community}, ${project.city || "Dubai"}, ${project.country || "UAE"}.` : `${project.name} is located in ${project.city || "Dubai"}, UAE. Contact us for detailed location and transport information.` },
    { question: "Is mortgage financing available?", answer: "Yes, mortgage financing is available through major UAE banks for both residents and non-residents. Typical loan-to-value ratios range from 50-80% depending on residency status. We can connect you with our banking partners for pre-approval." },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(f => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  const breadcrumbs = [
    { name: cp.home,                   href: `${lp}/` },
    { name: parentLabel,               href: `${lp}${parentHref}` },
    { name: project.name,              href: `${lp}/project/${slug}` },
    { name: leafLabel(locale, "faq"),  href: `${lp}/project/${slug}/faq` },
  ];

  return (
    <>
      {/* Only emit FAQPage schema when the page is self-canonical (real DB FAQs).
          When there are no DB FAQs the metadata canonicals to the parent project,
          so emitting rich-result schema on a declared-non-canonical page would be
          contradictory — the boilerplate Q&A still renders for users. */}
      {dbFaqs.length > 0 && (
        <script
          type="application/ld+json"
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
        />
      )}
      <BreadcrumbJsonLd items={breadcrumbs} />
      <ProjectDetailClient serverProject={project} defaultTab="faq" />
    </>
  );
}
